"""Validación de registros, persistencia y aislamiento con SQLite temporal."""
import copy
import os
import sys
import tempfile
import unittest
from pathlib import Path


def main():
    with tempfile.TemporaryDirectory() as directory:
        os.environ['DATABASE_URL'] = 'sqlite:///' + (Path(directory) / 'state.db').as_posix()
        os.environ['SECRET_KEY'] = 'isolated-state-validation-tests'
        os.environ['CLOUD_MODE'] = '0'
        sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
        from app import app, db

        class StateValidationTest(unittest.TestCase):
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
                self.state = {
                    'vacas': [{'id': 'V-001', 'nombre': 'Luna', 'estado': 'Vacía'}],
                    'toros': [{'id': 'T-001', 'estado': 'Activo'}],
                    'crias': [{'id': 'C-001', 'madre': 'V-001'}],
                    'partos': [{'id': 'P-001', 'vacaId': 'V-001', 'fecha': '2025-01-01'}],
                    'reprod': [{'id': 'R-001', 'vacaId': 'V-001', 'toroId': 'T-001', 'fecha': '2026-01-01'}],
                }
                self.assertEqual(self.put(self.state).status_code, 200)

            def put(self, state):
                return self.client.put('/api/state', json=state, headers=self.headers)

            def assert_rejected(self, state):
                response = self.put(state)
                self.assertEqual(response.status_code, 400)
                self.assertIsInstance(response.json.get('error'), str)
                self.assertTrue(response.json['error'])
                self.assertEqual(self.client.get('/api/state').json['state'], self.state)

            def test_valid_complete_state_round_trip(self):
                self.assertEqual(self.client.get('/api/state').json['state'], self.state)
                self.assertEqual(self.put(self.state).status_code, 200)

            def test_same_identifier_in_different_lists_is_allowed(self):
                state = copy.deepcopy(self.state)
                state['crias'][0]['id'] = state['vacas'][0]['id']
                self.assertEqual(self.put(state).status_code, 200)
                self.assertEqual(self.client.get('/api/state').json['state'], state)

            def test_non_object_records_in_every_collection(self):
                for collection in self.state:
                    for record in (None, 42, 'texto', [], True):
                        with self.subTest(collection=collection, record=record):
                            state = copy.deepcopy(self.state)
                            state[collection] = [record]
                            self.assert_rejected(state)

            def test_invalid_identifiers_in_every_collection(self):
                for collection in self.state:
                    for identifier in (None, 7, True, [], {}, '', '   ', ' V-001', 'V-001 ', '\tV-001'):
                        with self.subTest(collection=collection, identifier=identifier):
                            state = copy.deepcopy(self.state)
                            state[collection][0]['id'] = identifier
                            self.assert_rejected(state)
                    with self.subTest(collection=collection, missing_id=True):
                        state = copy.deepcopy(self.state)
                        del state[collection][0]['id']
                        self.assert_rejected(state)

            def test_duplicate_identifiers_in_every_collection(self):
                for collection in self.state:
                    with self.subTest(collection=collection):
                        state = copy.deepcopy(self.state)
                        state[collection].append(copy.deepcopy(state[collection][0]))
                        self.assert_rejected(state)

            def test_outer_contract_is_preserved(self):
                for state in ([], {}, {**self.state, 'extra': []}, {**self.state, 'vacas': {}}):
                    with self.subTest(state=state):
                        self.assert_rejected(state)

            def test_session_and_csrf_are_required(self):
                anonymous = app.test_client()
                self.assertEqual(anonymous.put('/api/state', json=self.state).status_code, 401)
                response = self.client.put('/api/state', json=self.state, headers={'X-CSRF-Token': 'incorrect'})
                self.assertEqual(response.status_code, 403)
                self.assertEqual(self.client.get('/api/state').json['state'], self.state)

            def test_users_remain_isolated_after_a_rejected_write(self):
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
                headers = {'X-CSRF-Token': login.json['csrf']}
                empty = {'vacas': [], 'toros': [], 'crias': [], 'reprod': [], 'partos': []}
                self.assertEqual(second.get('/api/state').json['state'], empty)
                own = {**empty, 'vacas': [{'id': 'V-001', 'nombre': 'Otra finca', 'estado': 'Vacía'}]}
                self.assertEqual(second.put('/api/state', json=own, headers=headers).status_code, 200)
                invalid = {**own, 'vacas': [{'id': ['V-001']}]}
                self.assertEqual(second.put('/api/state', json=invalid, headers=headers).status_code, 400)
                self.assertEqual(second.get('/api/state').json['state'], own)
                self.assertEqual(self.client.get('/api/state').json['state'], self.state)
                self.assert_rejected(invalid)
                self.assertEqual(second.get('/api/state').json['state'], own)

        try:
            result = unittest.TextTestRunner(verbosity=2).run(unittest.defaultTestLoader.loadTestsFromTestCase(StateValidationTest))
        finally:
            with app.app_context():
                db.session.remove()
                db.engine.dispose()
        return 0 if result.wasSuccessful() else 1


if __name__ == '__main__':
    raise SystemExit(main())
