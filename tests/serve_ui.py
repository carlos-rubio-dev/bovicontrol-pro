"""Servidor de pruebas UI con SQLite temporal y registros sintéticos."""
import os
import sys
import tempfile
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
with tempfile.TemporaryDirectory() as directory:
    os.environ['DATABASE_URL'] = 'sqlite:///' + (Path(directory) / 'ui.db').as_posix()
    os.environ['SECRET_KEY'] = 'ui-test-only-secret'
    os.environ['CLOUD_MODE'] = '0'
    from app import app, db
    from ui_fixture import state
    client = app.test_client()
    csrf = client.get('/api/session').json['csrf']
    created = client.post('/api/setup', json={'email': 'ui@example.test', 'password': 'test-password-ui'}, headers={'X-CSRF-Token': csrf})
    assert created.status_code == 200
    saved = client.put('/api/state', json=state, headers={'X-CSRF-Token': created.json['csrf']})
    assert saved.status_code == 200, saved.json
    try:
        app.run(host='127.0.0.1', port=5018, debug=False, use_reloader=False)
    finally:
        with app.app_context():
            db.session.remove()
            db.engine.dispose()
