"""Copia las cuentas y registros locales a una base remota vacía.

Uso: DATABASE_URL=... python migrate_to_cloud.py --apply
Sin --apply solo muestra cantidades. Nunca muestra contraseñas ni registros.
"""
import argparse
import json
import os
import sqlite3
from pathlib import Path

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--apply', action='store_true', help='Escribir en la base remota')
parser.add_argument('--source', type=Path, default=Path(__file__).resolve().parent / 'instance' / 'bovicontrol.db')
args = parser.parse_args()
if not args.source.is_file():
    parser.error('No se encontró la base SQLite local.')

with sqlite3.connect(str(args.source)) as source:
    source.row_factory = sqlite3.Row
    users = [dict(row) for row in source.execute('SELECT id,email,password_hash,is_admin,active FROM user ORDER BY id')]
    states = [dict(row) for row in source.execute('SELECT user_id,payload FROM app_state ORDER BY user_id')]

print(f'Origen: {len(users)} cuentas y {len(states)} conjuntos de registros.')
if not users or not any(user['is_admin'] for user in users):
    parser.error('La base local no contiene una cuenta administradora.')
if not args.apply:
    print('Revisión lista. Usa --apply para migrar a TiDB Cloud.')
    raise SystemExit(0)
if not os.getenv('DATABASE_URL', '').startswith('mysql+pymysql://'):
    parser.error('DATABASE_URL debe apuntar a la base MySQL-compatible de TiDB Cloud.')

from app import app, db, User, AppState

with app.app_context():
    if User.query.first() or AppState.query.first():
        parser.error('La base de destino ya tiene datos. No se ha sobrescrito nada.')
    for row in users:
        db.session.add(User(**row))
    db.session.flush()
    for row in states:
        db.session.add(AppState(user_id=row['user_id'], payload=json.loads(row['payload'])))
    db.session.commit()
    if User.query.count() != len(users) or AppState.query.count() != len(states):
        raise RuntimeError('Las cantidades no coinciden después de la migración.')
    print('Migración completada y verificada por cantidad de cuentas y registros.')
