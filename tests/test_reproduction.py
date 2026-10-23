"""Regresión: una vaca no puede tener dos montas pendientes."""
import os
import sys
import tempfile
import unittest
from pathlib import Path

with tempfile.TemporaryDirectory() as temporary_db_dir:
    os.environ['DATABASE_URL'] = 'sqlite:///' + (Path(temporary_db_dir) / 'check.db').as_posix()
    sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
    from app import app, db

    class ReproductionRulesTest(unittest.TestCase):
        def test_second_bull_is_blocked_until_birth(self):
            client = app.test_client()
            csrf = client.get('/api/session').json['csrf']
            created = client.post('/api/setup', json={'email': 'check@example.com', 'password': 'test-password'}, headers={'X-CSRF-Token': csrf})
            self.assertEqual(created.status_code, 200)
            csrf = created.json['csrf']
            headers = {'X-CSRF-Token': csrf}
            cow = {'id': 'V-001', 'nombre': 'Luna', 'estado': 'Vacía', 'proximoParto': '', 'ultimoParto': '', 'partos': 0}
            bulls = [{'id': 'T-001', 'estado': 'Activo'}, {'id': 'T-002', 'estado': 'Activo'}]
            state = {'vacas': [cow], 'toros': bulls, 'crias': [], 'reprod': [], 'partos': []}
            self.assertEqual(client.put('/api/state', json=state, headers=headers).status_code, 200)

            first = {'id': 'R-001', 'vacaId': 'V-001', 'toroId': 'T-001', 'fecha': '2026-01-01', 'fechaParto': '2026-10-11'}
            state['reprod'] = [first]
            state['vacas'] = [{**cow, 'estado': 'Preñada', 'proximoParto': first['fechaParto']}]
            self.assertEqual(client.put('/api/state', json=state, headers=headers).status_code, 200)

            second = {'id': 'R-002', 'vacaId': 'V-001', 'toroId': 'T-002', 'fecha': '2026-02-01', 'fechaParto': '2026-11-11'}
            state['reprod'] = [first, second]
            self.assertEqual(client.put('/api/state', json=state, headers=headers).status_code, 400)
            self.assertEqual(len(client.get('/api/state').json['state']['reprod']), 1)

            state['reprod'] = [first]
            state['partos'] = [{'id': 'P-001', 'vacaId': 'V-001', 'fecha': '2026-10-11'}]
            state['vacas'] = [{**cow, 'estado': 'Lactando', 'ultimoParto': '2026-10-11', 'partos': 1}]
            self.assertEqual(client.put('/api/state', json=state, headers=headers).status_code, 200)
            second['fecha'] = '2026-10-22'
            state['reprod'] = [first, second]
            state['vacas'] = [{**state['vacas'][0], 'estado': 'Preñada', 'proximoParto': second['fechaParto']}]
            self.assertEqual(client.put('/api/state', json=state, headers=headers).status_code, 200)

    unittest.main(exit=False)
    with app.app_context():
        db.session.remove()
        db.engine.dispose()
