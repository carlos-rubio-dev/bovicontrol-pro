import os
import secrets
from datetime import date, timedelta
from pathlib import Path

from dotenv import load_dotenv
from flask import Flask, jsonify, render_template, request, session, send_from_directory
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import timedelta as duration
from sqlalchemy import event, inspect, text as sql_text
from sqlalchemy.exc import IntegrityError, OperationalError
from sqlalchemy.engine import Engine
import sqlite3

BASE = Path(__file__).resolve().parent
load_dotenv(BASE / '.env')
app = Flask(__name__)
cloud_mode = os.getenv('CLOUD_MODE') == '1'
if cloud_mode and (not os.getenv('SECRET_KEY') or not os.getenv('DATABASE_URL')):
    raise RuntimeError('CLOUD_MODE requiere SECRET_KEY y DATABASE_URL.')
key = os.getenv('SECRET_KEY')
if not key:
    (BASE / 'instance').mkdir(exist_ok=True)
    key_file = BASE / 'instance' / 'secret.key'
    if not key_file.exists():
        key_file.write_text(secrets.token_hex(32), encoding='utf-8')
    key = key_file.read_text().strip()
app.config.update(SECRET_KEY=key,
    SQLALCHEMY_DATABASE_URI=os.getenv('DATABASE_URL', 'sqlite:///' + (BASE / 'instance' / 'bovicontrol.db').as_posix()),
    SQLALCHEMY_TRACK_MODIFICATIONS=False, SESSION_COOKIE_HTTPONLY=True,
    SQLALCHEMY_ENGINE_OPTIONS={'pool_pre_ping': True, 'pool_recycle': 1800},
    SESSION_COOKIE_SAMESITE='Lax', SESSION_COOKIE_SECURE=cloud_mode,
    PERMANENT_SESSION_LIFETIME=duration(days=30),
    MAX_CONTENT_LENGTH=1024 * 1024)
db = SQLAlchemy(app)

@event.listens_for(Engine, 'connect')
def sqlite_foreign_keys(connection, _):
    if isinstance(connection, sqlite3.Connection):
        connection.execute('PRAGMA foreign_keys=ON')

class Animal(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    tag = db.Column(db.String(50), unique=True, nullable=False)
    name = db.Column(db.String(100), nullable=False, default='')
    sex = db.Column(db.String(1), nullable=False)
    breed = db.Column(db.String(100), nullable=False, default='')
    born = db.Column(db.Date, nullable=False)
    mother_id = db.Column(db.Integer, db.ForeignKey('animal.id'))
    father_id = db.Column(db.Integer, db.ForeignKey('animal.id'))
    active = db.Column(db.Boolean, nullable=False, default=True)
    notes = db.Column(db.Text, nullable=False, default='')

class Breeding(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    cow_id = db.Column(db.Integer, db.ForeignKey('animal.id'), nullable=False)
    bull_id = db.Column(db.Integer, db.ForeignKey('animal.id'), nullable=False)
    day = db.Column(db.Date, nullable=False)
    due = db.Column(db.Date, nullable=False)
    status = db.Column(db.String(20), nullable=False, default='registrada')
    notes = db.Column(db.Text, nullable=False, default='')

class Birth(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    breeding_id = db.Column(db.Integer, db.ForeignKey('breeding.id'), unique=True, nullable=False)
    calf_id = db.Column(db.Integer, db.ForeignKey('animal.id'), unique=True, nullable=False)
    day = db.Column(db.Date, nullable=False)
    weaning = db.Column(db.Date, nullable=False)
    ready = db.Column(db.Date, nullable=False)
    weaned = db.Column(db.Boolean, nullable=False, default=False)
    notes = db.Column(db.Text, nullable=False, default='')

class Activity(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(150), nullable=False)
    day = db.Column(db.Date, nullable=False)
    done = db.Column(db.Boolean, nullable=False, default=False)

class Settings(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    farm = db.Column(db.String(100), nullable=False, default='Mi finca')
    gestation = db.Column(db.Integer, nullable=False, default=283)
    weaning = db.Column(db.Integer, nullable=False, default=210)
    recovery = db.Column(db.Integer, nullable=False, default=60)

class AppState(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    payload = db.Column(db.JSON, nullable=False)

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(254), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    is_admin = db.Column(db.Boolean, nullable=False, default=False)
    active = db.Column(db.Boolean, nullable=False, default=True)

def public_user(user):
    return dict(id=user.id, email=user.email, is_admin=user.is_admin, active=user.active)

def current_user():
    user = db.session.get(User, session.get('user_id')) if session.get('user_id') else None
    return user if user and user.active else None

def serialize(row):
    return {c.name: (getattr(row, c.name).isoformat() if isinstance(getattr(row, c.name), date) else getattr(row, c.name)) for c in row.__table__.columns}

def get(model, value):
    try:
        obj = db.session.get(model, int(value))
    except (TypeError, ValueError):
        raise ValueError('Selecciona un registro válido.')
    if obj is None:
        raise ValueError('El registro no existe.')
    return obj

def day(value, past=False):
    try:
        result = date.fromisoformat(value)
    except (ValueError, TypeError):
        raise ValueError('Ingresa una fecha válida.')
    if past and result > date.today():
        raise ValueError('La fecha de un registro ocurrido no puede ser futura.')
    return result

def short(data, key, maximum, required=False):
    value = str(data.get(key, '')).strip()
    if (required and not value) or len(value) > maximum:
        raise ValueError(f'El campo {key} es obligatorio o supera {maximum} caracteres.')
    return value

def animal_fields(data, obj=None):
    values = dict(tag=short(data, 'tag', 50, True), name=short(data, 'name', 100),
        sex=data.get('sex'), breed=short(data, 'breed', 100), born=day(data.get('born'), True),
        notes=short(data, 'notes', 2000))
    if values['sex'] not in ('H', 'M'):
        raise ValueError('Selecciona hembra o macho.')
    for key, sex in [('mother_id', 'H'), ('father_id', 'M')]:
        parent_id = data.get(key)
        values[key] = None
        if parent_id:
            parent = get(Animal, parent_id)
            if parent.sex != sex or parent.born >= values['born'] or (obj and parent.id == obj.id):
                raise ValueError('Los padres deben tener el sexo correspondiente y haber nacido antes que la cría.')
            values[key] = parent.id
    if obj:
        linked = (Breeding.query.filter((Breeding.cow_id == obj.id) | (Breeding.bull_id == obj.id)).first()
            or Animal.query.filter((Animal.mother_id == obj.id) | (Animal.father_id == obj.id)).first()
            or Birth.query.filter_by(calf_id=obj.id).first())
        if linked and any(getattr(obj, k) != values[k] for k in ('sex', 'born', 'mother_id', 'father_id')):
            raise ValueError('Este animal tiene historial vinculado. Su sexo, nacimiento y parentescos ya no se pueden modificar.')
    return values

@app.before_request
def csrf():
    if request.endpoint in {'data', 'create_animal', 'edit_animal', 'archive_animal',
                            'breeding', 'breeding_status', 'birth', 'wean',
                            'activity', 'activity_done', 'settings'}:
        return jsonify(error='Ruta no disponible.'), 404
    if request.path.startswith('/api/') and request.endpoint not in ('auth_session', 'login', 'setup'):
        if not current_user():
            return jsonify(error='Inicia sesión para continuar.'), 401
    if request.method in ('POST', 'PUT', 'PATCH', 'DELETE'):
        if not session.get('csrf') or request.headers.get('X-CSRF-Token') != session['csrf']:
            return jsonify(error='La sesión venció. Recarga la página.'), 403

@app.get('/api/session')
def auth_session():
    session.setdefault('csrf', secrets.token_hex(24))
    user = current_user()
    return jsonify(csrf=session['csrf'], authenticated=bool(user), user=public_user(user) if user else None,
                   setup=not cloud_mode and not bool(db.session.get(User, 1)),
                   initializing=cloud_mode and not bool(db.session.get(User, 1)))

@app.post('/api/setup')
def setup():
    if cloud_mode:
        return jsonify(error='La cuenta inicial debe migrarse desde la instalación local.'), 503
    if db.session.get(User, 1):
        return jsonify(error='La cuenta inicial ya existe.'), 409
    data = request.get_json(silent=True) or {}
    email = str(data.get('email', '')).strip().lower()
    password = str(data.get('password', ''))
    if '@' not in email or len(email) > 254 or len(password) < 8:
        return jsonify(error='Ingresa un correo válido y una contraseña de al menos 8 caracteres.'), 400
    user = User(id=1, email=email, password_hash=generate_password_hash(password), is_admin=True)
    db.session.add(user)
    db.session.commit()
    session.clear()
    session['user_id'] = user.id
    session['csrf'] = secrets.token_hex(24)
    session.permanent = bool(data.get('remember'))
    return jsonify(ok=True, csrf=session['csrf'], user=public_user(user))

@app.post('/api/login')
def login():
    data = request.get_json(silent=True) or {}
    user = User.query.filter_by(email=str(data.get('email', '')).strip().lower()).first()
    if not user or not user.active or not check_password_hash(user.password_hash, str(data.get('password', ''))):
        return jsonify(error='Correo o contraseña incorrectos.'), 401
    session.clear()
    session['user_id'] = user.id
    session['csrf'] = secrets.token_hex(24)
    session.permanent = bool(data.get('remember'))
    return jsonify(ok=True, csrf=session['csrf'], user=public_user(user))

@app.post('/api/logout')
def logout():
    session.clear()
    return jsonify(ok=True)

@app.get('/api/users')
def list_users():
    if not current_user().is_admin:
        return jsonify(error='Solo el administrador puede gestionar usuarios.'), 403
    return jsonify(users=[public_user(u) for u in User.query.order_by(User.email).all()])

@app.post('/api/users')
def create_user():
    if not current_user().is_admin:
        return jsonify(error='Solo el administrador puede gestionar usuarios.'), 403
    data = request.get_json(silent=True) or {}
    email = str(data.get('email', '')).strip().lower()
    password = str(data.get('password', ''))
    if '@' not in email or len(email) > 254 or len(password) < 8:
        return jsonify(error='Ingresa un correo válido y una contraseña de al menos 8 caracteres.'), 400
    user = User(email=email, password_hash=generate_password_hash(password), is_admin=False)
    db.session.add(user)
    db.session.commit()
    return jsonify(user=public_user(user)), 201

@app.patch('/api/users/<int:user_id>')
def update_user(user_id):
    if not current_user().is_admin:
        return jsonify(error='Solo el administrador puede gestionar usuarios.'), 403
    user = db.session.get(User, user_id)
    if not user:
        return jsonify(error='Usuario no encontrado.'), 404
    data = request.get_json(silent=True) or {}
    if 'active' in data:
        if user.id == current_user().id and not data['active']:
            return jsonify(error='No puedes desactivar tu propia cuenta.'), 400
        if not isinstance(data['active'], bool):
            return jsonify(error='Estado inválido.'), 400
        user.active = data['active']
    if 'password' in data:
        password = str(data['password'])
        if len(password) < 8:
            return jsonify(error='La contraseña debe tener al menos 8 caracteres.'), 400
        user.password_hash = generate_password_hash(password)
    db.session.commit()
    return jsonify(user=public_user(user))

@app.errorhandler(ValueError)
def bad_request(error):
    db.session.rollback()
    return jsonify(error=str(error)), 400

@app.errorhandler(IntegrityError)
def duplicate(error):
    db.session.rollback()
    return jsonify(error='El identificador ya existe o el registro está vinculado. Revisa los datos.'), 409

@app.errorhandler(OperationalError)
def database_unavailable(error):
    db.session.rollback()
    app.logger.error('Database operation failed: %s', error.__class__.__name__)
    return jsonify(error='No se pudo escribir en la base de datos. Comprueba que la carpeta instance tenga permiso de escritura y reinicia el servidor.'), 503

@app.get('/')
def index():
    session.setdefault('csrf', secrets.token_hex(24))
    return send_from_directory(BASE / 'static' / 'dist', 'index.html')

@app.get('/health')
def health():
    db.session.execute(sql_text('SELECT 1'))
    return jsonify(status='ok')

@app.get('/api/state')
def get_state():
    session.setdefault('csrf', secrets.token_hex(24))
    row = AppState.query.filter_by(user_id=current_user().id).first()
    return jsonify(state=row.payload if row else {'vacas': [], 'toros': [], 'crias': [], 'reprod': [], 'partos': []}, csrf=session['csrf'])

@app.put('/api/state')
def put_state():
    data = request.get_json(silent=True)
    if not isinstance(data, dict) or set(data) != {'vacas','toros','crias','reprod','partos'} or any(not isinstance(data[k], list) or len(data[k]) > 10000 for k in data):
        raise ValueError('El formato de datos no es válido.')
    row = AppState.query.filter_by(user_id=current_user().id).first()
    previous = row.payload if row else {'vacas': [], 'reprod': []}
    previous_ids = {r.get('id') for r in previous.get('reprod', []) if isinstance(r, dict)}
    old_cows = {v.get('id'): v for v in previous.get('vacas', []) if isinstance(v, dict)}
    cows = {v.get('id'): v for v in data['vacas'] if isinstance(v, dict)}
    bulls = {t.get('id'): t for t in data['toros'] if isinstance(t, dict)}
    known = [r for r in data['reprod'] if isinstance(r, dict) and r.get('id') in previous_ids]
    for breeding in data['reprod']:
        if not isinstance(breeding, dict):
            raise ValueError('El registro reproductivo no es válido.')
        if breeding.get('id') in previous_ids:
            continue
        cow_id, bull_id, breeding_day = breeding.get('vacaId'), breeding.get('toroId'), breeding.get('fecha')
        cow = cows.get(cow_id)
        bull = bulls.get(bull_id)
        try:
            date.fromisoformat(breeding_day)
        except (TypeError, ValueError):
            raise ValueError('La fecha de monta no es válida.')
        if not cow or not bull or bull.get('estado') != 'Activo':
            raise ValueError('Selecciona una vaca y un toro activo.')
        births = [p.get('fecha') for p in data['partos'] if isinstance(p, dict) and p.get('vacaId') == cow_id and isinstance(p.get('fecha'), str)]
        last_birth = max(births, default='')
        if breeding_day <= last_birth:
            raise ValueError('La monta debe ser posterior al último parto de la vaca.')
        if old_cows.get(cow_id, cow).get('estado') == 'Preñada' or any(
            r.get('vacaId') == cow_id and isinstance(r.get('fecha'), str) and r['fecha'] > last_birth for r in known
        ):
            raise ValueError('Esta vaca ya está preñada o tiene una reproducción pendiente.')
        known.append(breeding)
    if row is None:
        row = AppState(user_id=current_user().id, payload=data)
        db.session.add(row)
    else:
        row.payload = data
    db.session.commit()
    return jsonify(ok=True)

@app.get('/api/data')
def data():
    return jsonify(animals=[serialize(x) for x in Animal.query.order_by(Animal.tag).all()],
        breedings=[serialize(x) for x in Breeding.query.order_by(Breeding.day.desc()).all()],
        births=[serialize(x) for x in Birth.query.order_by(Birth.day.desc()).all()],
        activities=[serialize(x) for x in Activity.query.order_by(Activity.day).all()],
        settings=serialize(db.session.get(Settings, 1)), today=date.today().isoformat())

@app.post('/api/animals')
def create_animal():
    obj = Animal(**animal_fields(request.get_json()))
    db.session.add(obj)
    db.session.commit()
    return jsonify(serialize(obj)), 201

@app.put('/api/animals/<int:animal_id>')
def edit_animal(animal_id):
    obj = get(Animal, animal_id)
    for key, value in animal_fields(request.get_json(), obj).items():
        setattr(obj, key, value)
    db.session.commit()
    return jsonify(serialize(obj))

@app.post('/api/animals/<int:animal_id>/archive')
def archive_animal(animal_id):
    obj = get(Animal, animal_id)
    if obj.active and Breeding.query.filter((Breeding.cow_id == obj.id) | (Breeding.bull_id == obj.id), Breeding.status.in_(['registrada', 'confirmada'])).first():
        raise ValueError('Cierra los registros reproductivos pendientes antes de archivar el animal.')
    obj.active = not obj.active
    db.session.commit()
    return jsonify(serialize(obj))

@app.post('/api/breedings')
def breeding():
    data = request.get_json()
    cow, bull = get(Animal, data.get('cow_id')), get(Animal, data.get('bull_id'))
    when = day(data.get('day'), True)
    if cow.sex != 'H' or bull.sex != 'M' or not cow.active or not bull.active:
        raise ValueError('Selecciona una hembra y un macho activos.')
    if when <= max(cow.born, bull.born):
        raise ValueError('La monta debe ser posterior al nacimiento de los padres.')
    if Breeding.query.filter_by(cow_id=cow.id).filter(Breeding.status.in_(['registrada', 'confirmada'])).first():
        raise ValueError('La hembra ya tiene una reproducción pendiente.')
    previous = Birth.query.join(Breeding, Birth.breeding_id == Breeding.id).filter(Breeding.cow_id == cow.id).order_by(Birth.day.desc()).first()
    if previous and when <= previous.day:
        raise ValueError('La nueva monta debe ser posterior al último parto registrado.')
    cfg = db.session.get(Settings, 1)
    obj = Breeding(cow_id=cow.id, bull_id=bull.id, day=when, due=when + timedelta(days=cfg.gestation), notes=short(data, 'notes', 2000))
    db.session.add(obj)
    db.session.commit()
    return jsonify(serialize(obj)), 201

@app.post('/api/breedings/<int:record_id>/status')
def breeding_status(record_id):
    obj = get(Breeding, record_id)
    status = request.get_json().get('status')
    if obj.status not in ('registrada', 'confirmada') or status not in ('confirmada', 'cancelada'):
        raise ValueError('Este cambio de estado no está disponible.')
    obj.status = status
    db.session.commit()
    return jsonify(serialize(obj))

@app.post('/api/births')
def birth():
    data = request.get_json()
    pairing = get(Breeding, data.get('breeding_id'))
    when = day(data.get('day'), True)
    if pairing.status not in ('registrada', 'confirmada') or when <= pairing.day:
        raise ValueError('Selecciona una reproducción pendiente y una fecha posterior a la monta.')
    cfg = db.session.get(Settings, 1)
    calf_data = dict(data, born=when.isoformat(), mother_id=pairing.cow_id, father_id=pairing.bull_id)
    calf = Animal(**animal_fields(calf_data))
    db.session.add(calf)
    db.session.flush()
    obj = Birth(breeding_id=pairing.id, calf_id=calf.id, day=when,
        weaning=when + timedelta(days=cfg.weaning), ready=when + timedelta(days=cfg.recovery), notes=short(data, 'notes', 2000))
    db.session.add(obj)
    pairing.status = 'parto'
    db.session.commit()
    return jsonify(serialize(obj)), 201

@app.post('/api/births/<int:record_id>/wean')
def wean(record_id):
    obj = get(Birth, record_id)
    obj.weaned = True
    db.session.commit()
    return jsonify(serialize(obj))

@app.post('/api/activities')
def activity():
    data = request.get_json()
    obj = Activity(title=short(data, 'title', 150, True), day=day(data.get('day')))
    db.session.add(obj)
    db.session.commit()
    return jsonify(serialize(obj)), 201

@app.post('/api/activities/<int:record_id>/done')
def activity_done(record_id):
    obj = get(Activity, record_id)
    obj.done = not obj.done
    db.session.commit()
    return jsonify(serialize(obj))

@app.put('/api/settings')
def settings():
    data = request.get_json()
    cfg = db.session.get(Settings, 1)
    cfg.farm = short(data, 'farm', 100, True)
    for key in ('gestation', 'weaning', 'recovery'):
        try:
            value = int(data.get(key))
        except (TypeError, ValueError):
            raise ValueError('Los plazos deben ser números enteros.')
        if not 1 <= value <= 730:
            raise ValueError('Los plazos deben estar entre 1 y 730 días.')
        setattr(cfg, key, value)
    db.session.commit()
    return jsonify(serialize(cfg))

with app.app_context():
    db.create_all()
    if 'user_id' not in {column['name'] for column in inspect(db.engine).get_columns('app_state')}:
        with db.engine.begin() as connection:
            connection.execute(sql_text('ALTER TABLE app_state ADD COLUMN user_id INTEGER'))
            connection.execute(sql_text('UPDATE app_state SET user_id = 1 WHERE user_id IS NULL'))
    if db.session.get(Settings, 1) is None:
        db.session.add(Settings(id=1))
        db.session.commit()

if __name__ == '__main__':
    app.run(host='127.0.0.1', port=int(os.getenv('PORT', '5000')), debug=False)
