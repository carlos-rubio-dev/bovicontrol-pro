"""Referencias de reprod y partos dentro de PUT /api/state (spec 002).

Pruebas previas al código de producción: los casos marcados con AC1/AC2/AC3
deben fallar (rojo) hasta que se implemente la validación de referencias.
AC5 conserva comportamientos que ya son correctos.
"""
import copy
import os
import sys
import tempfile
import unittest
from pathlib import Path


def main():
    with tempfile.TemporaryDirectory() as directory:
        os.environ['DATABASE_URL'] = 'sqlite:///' + (Path(directory) / 'state.db').as_posix()
        os.environ['SECRET_KEY'] = 'isolated-state-reference-tests'
        os.environ['CLOUD_MODE'] = '0'
        sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
        from app import app, db

        class StateReferencesTest(unittest.TestCase):
            def setUp(self):
                with app.app_context():
                    db.session.remove()
                    db.drop_all()
                    db.create_all()
                self.client = app.test_client()
                token = self.client.get('/api/session').json['csrf']
                response = self.client.post('/api/setup', json={
                    'email': 'admin@example.test', 'password': 'local-test-password',
                }, headers={'X-CSRF-Token': token})
                self.assertEqual(response.status_code, 200)
                self.headers = {'X-CSRF-Token': response.json['csrf']}
                self.vaca = {'id': 'V-001', 'nombre': 'Luna', 'raza': 'Angus',
                             'fechaNacimiento': '2020-01-01', 'estado': 'Vacía'}
                self.cria = {'id': 'C-001', 'nombre': 'Lucero', 'fechaNacimiento': '2025-01-01',
                             'sexo': 'Hembra', 'estado': 'Saludable', 'madre': 'V-001'}
                self.reprod = {'id': 'R-001', 'vacaId': 'V-001', 'toroId': 'T-001', 'fecha': '2026-01-01'}
                self.parto = {'id': 'P-001', 'vacaId': 'V-001', 'fecha': '2025-01-01'}
                self.state = {
                    'vacas': [self.vaca],
                    'toros': [{'id': 'T-001', 'nombre': 'Fuerte', 'raza': 'Angus',
                               'fechaNacimiento': '2019-01-01', 'estado': 'Activo'}],
                    'crias': [self.cria],
                    'partos': [dict(self.parto)],
                    'reprod': [dict(self.reprod)],
                }
                self.assertEqual(self.put(self.state).status_code, 200)

            def put(self, state):
                return self.client.put('/api/state', json=state, headers=self.headers)

            def assert_reference_rejected(self, state, collection, position, field):
                """AC3: 400 con colección, posición y campo, y estado persistido intacto."""
                response = self.put(state)
                self.assertEqual(response.status_code, 400)
                error = response.json.get('error')
                self.assertIsInstance(error, str)
                self.assertIn(f'{collection}, registro {position}', error)
                self.assertIn(f'"{field}"', error)
                self.assertEqual(self.client.get('/api/state').json['state'], self.state)

            def second_session(self):
                """Crea y autentica una segunda cuenta con su propio cliente."""
                response = self.client.post('/api/users', json={
                    'email': 'second@example.test', 'password': 'second-test-password',
                }, headers=self.headers)
                self.assertEqual(response.status_code, 201)
                second = app.test_client()
                token = second.get('/api/session').json['csrf']
                login = second.post('/api/login', json={
                    'email': 'second@example.test', 'password': 'second-test-password',
                }, headers={'X-CSRF-Token': token})
                self.assertEqual(login.status_code, 200)
                return second, {'X-CSRF-Token': login.json['csrf']}

            # ── Regresión ──────────────────────────────────────────────────────
            def test_valid_complete_state_round_trip(self):
                self.assertEqual(self.client.get('/api/state').json['state'], self.state)
                self.assertEqual(self.put(self.state).status_code, 200)

            # ── AC1: toda reprod apunta a vaca y toro del mismo payload ───────
            def test_new_reprod_with_unknown_cow_is_rejected(self):
                state = copy.deepcopy(self.state)
                state['reprod'].append({'id': 'R-002', 'vacaId': 'V-999', 'toroId': 'T-001', 'fecha': '2026-02-01'})
                self.assert_reference_rejected(state, 'reprod', 2, 'vacaId')

            def test_new_reprod_with_unknown_bull_is_rejected(self):
                state = copy.deepcopy(self.state)
                state['reprod'].append({'id': 'R-002', 'vacaId': 'V-001', 'toroId': 'T-999', 'fecha': '2026-02-01'})
                self.assert_reference_rejected(state, 'reprod', 2, 'toroId')

            def test_saved_reprod_survives_without_its_cow_in_payload(self):
                # AC1 clave: R-001 ya estaba guardado y su vaca sale del payload → 400.
                state = copy.deepcopy(self.state)
                state['vacas'] = []
                state['crias'] = []
                state['partos'] = []
                self.assert_reference_rejected(state, 'reprod', 1, 'vacaId')

            def test_saved_reprod_survives_without_its_bull_in_payload(self):
                # AC1 clave: R-001 ya estaba guardado y su toro sale del payload → 400.
                state = copy.deepcopy(self.state)
                state['toros'] = []
                state['reprod'][0]['toroId'] = 'T-999'
                self.assert_reference_rejected(state, 'reprod', 1, 'toroId')

            # ── AC2: partos apuntan a vaca existente; criaId válido o vacío ────
            def test_parto_with_unknown_cow_is_rejected(self):
                state = copy.deepcopy(self.state)
                state['partos'][0]['vacaId'] = 'V-999'
                self.assert_reference_rejected(state, 'partos', 1, 'vacaId')

            def test_parto_with_unknown_cria_is_rejected(self):
                state = copy.deepcopy(self.state)
                state['partos'][0]['criaId'] = 'C-999'
                self.assert_reference_rejected(state, 'partos', 1, 'criaId')

            def test_parto_with_empty_cria_id_is_allowed(self):
                state = copy.deepcopy(self.state)
                state['partos'][0]['criaId'] = ''
                self.assertEqual(self.put(state).status_code, 200)
                self.assertEqual(self.client.get('/api/state').json['state'], state)

            def test_parto_without_cria_id_is_allowed(self):
                state = copy.deepcopy(self.state)
                self.assertEqual(self.put(state).status_code, 200)
                self.assertEqual(self.client.get('/api/state').json['state'], state)

            # ── AC3: ubicación del error y estado intacto ─────────────────────
            def test_rejection_reports_location_and_keeps_state(self):
                state = copy.deepcopy(self.state)
                state['partos'][0]['vacaId'] = 'V-999'
                self.assert_reference_rejected(state, 'partos', 1, 'vacaId')
                state = copy.deepcopy(self.state)
                state['reprod'].append({'id': 'R-002', 'vacaId': 'V-999', 'toroId': 'T-001', 'fecha': '2026-02-01'})
                self.assert_reference_rejected(state, 'reprod', 2, 'vacaId')

            # ── AC5: eliminar animal sin historial sigue permitido ────────────
            def test_deleting_cow_together_with_linked_events_is_allowed(self):
                # El mismo payload elimina V-001 y también R-001/P-001: sin huérfanas.
                state = copy.deepcopy(self.state)
                state['vacas'] = []
                state['crias'] = []
                state['reprod'] = []
                state['partos'] = []
                state['toros'] = [{'id': 'T-002', 'nombre': 'Otro', 'raza': 'Angus',
                                   'fechaNacimiento': '2019-06-01', 'estado': 'Activo'}]
                self.assertEqual(self.put(state).status_code, 200)
                self.assertEqual(self.client.get('/api/state').json['state'], state)

            def test_deleting_cria_without_linked_birth_is_allowed(self):
                state = copy.deepcopy(self.state)
                state['crias'] = []
                self.assertEqual(self.put(state).status_code, 200)
                self.assertEqual(self.client.get('/api/state').json['state'], state)

            def test_deleting_toro_with_reprod_removed_in_same_payload_is_allowed(self):
                state = copy.deepcopy(self.state)
                state['toros'] = []
                state['reprod'] = []
                self.assertEqual(self.put(state).status_code, 200)
                self.assertEqual(self.client.get('/api/state').json['state'], state)

            # ── AC6: la comprobación usa solo la cuenta autenticada ───────────
            def test_other_account_data_is_not_used_for_reference_check(self):
                second, headers = self.second_session()
                empty = {'vacas': [], 'toros': [], 'crias': [], 'reprod': [], 'partos': []}
                self.assertEqual(second.get('/api/state').json['state'], empty)
                own = {**empty, 'vacas': [{'id': 'V-100', 'nombre': 'Otra finca', 'raza': 'Angus',
                                           'fechaNacimiento': '2020-01-01', 'estado': 'Vacía'}]}
                self.assertEqual(second.put('/api/state', json=own, headers=headers).status_code, 200)
                # R-100 apunta a V-001/T-001, que existen SOLO en la primera cuenta:
                # no deben usarse para validar el payload de la segunda.
                other = {**own, 'partos': [{'id': 'P-100', 'vacaId': 'V-001', 'fecha': '2025-06-01'}]}
                response = second.put('/api/state', json=other, headers=headers)
                self.assertEqual(response.status_code, 400)
                self.assertIn('partos, registro 1', response.json['error'])
                self.assertIn('"vacaId"', response.json['error'])
                invasive = {**own, 'reprod': [{'id': 'R-100', 'vacaId': 'V-001', 'toroId': 'T-001', 'fecha': '2026-02-01'}]}
                response = second.put('/api/state', json=invasive, headers=headers)
                self.assertEqual(response.status_code, 400)
                self.assertIn('reprod, registro 1', response.json['error'])
                self.assertEqual(second.get('/api/state').json['state'], own)
                self.assertEqual(self.client.get('/api/state').json['state'], self.state)

        try:
            result = unittest.TextTestRunner(verbosity=2).run(unittest.defaultTestLoader.loadTestsFromTestCase(StateReferencesTest))
        finally:
            with app.app_context():
                db.session.remove()
                db.engine.dispose()
        return 0 if result.wasSuccessful() else 1


if __name__ == '__main__':
    raise SystemExit(main())
