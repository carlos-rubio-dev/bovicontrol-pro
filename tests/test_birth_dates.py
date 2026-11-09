"""Fechas de nacimiento válidas: fechaNacimiento futura rechazada, estimadas futuras permitidas."""
import copy
import os
import sys
import tempfile
import unittest
from datetime import date, timedelta
from pathlib import Path


def main():
    with tempfile.TemporaryDirectory() as directory:
        os.environ['DATABASE_URL'] = 'sqlite:///' + (Path(directory) / 'state.db').as_posix()
        os.environ['SECRET_KEY'] = 'isolated-birth-date-tests'
        os.environ['CLOUD_MODE'] = '0'
        sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
        from app import app, db

        class BirthDateValidationTest(unittest.TestCase):
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
                self.hoy = date.today().isoformat()
                self.manana = (date.today() + timedelta(days=1)).isoformat()
                self.state = {
                    'vacas': [{'id': 'V-001', 'nombre': 'Luna', 'raza': 'Angus', 'fechaNacimiento': '2020-01-01', 'estado': 'Vacía'}],
                    'toros': [{'id': 'T-001', 'nombre': 'Fuerte', 'raza': 'Angus', 'fechaNacimiento': '2019-01-01', 'estado': 'Activo'}],
                    'crias': [{'id': 'C-001', 'nombre': 'Lucero', 'fechaNacimiento': '2025-01-01', 'sexo': 'Hembra', 'estado': 'Saludable', 'madre': 'V-001'}],
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

            def assert_birth_date_error(self, state, collection):
                """AC2: error con colección, registro 1 y campo fechaNacimiento; GET conserva el estado guardado."""
                response = self.put(state)
                self.assertEqual(response.status_code, 400)
                error = response.json.get('error')
                self.assertIsInstance(error, str)
                self.assertTrue(error)
                self.assertIn(f'{collection}, registro 1', error)
                self.assertIn('"fechaNacimiento"', error)
                self.assertIn('no puede ser posterior a la fecha actual', error)
                self.assertEqual(self.client.get('/api/state').json['state'], copy.deepcopy(self.state))

            def test_future_birth_date_is_rejected_in_each_collection(self):
                # AC1: una fechaNacimiento posterior a hoy se rechaza con HTTP 400 en vacas, toros y crías.
                for collection in ('vacas', 'toros', 'crias'):
                    with self.subTest(collection=collection):
                        state = copy.deepcopy(self.state)
                        state[collection][0]['fechaNacimiento'] = self.manana
                        self.assert_rejected(state)

            def test_future_birth_date_error_identifies_field_and_preserves_state(self):
                # AC2: el error menciona la colección, "registro 1" y "fechaNacimiento";
                # el GET posterior devuelve el estado anterior íntegro (deepcopy del fixture persistido).
                for collection in ('vacas', 'toros', 'crias'):
                    with self.subTest(collection=collection):
                        state = copy.deepcopy(self.state)
                        state[collection][0]['fechaNacimiento'] = self.manana
                        self.assert_birth_date_error(state, collection)

            def test_today_and_leap_day_birth_dates_are_accepted(self):
                # AC3: hoy del servidor y la fecha bisiesta 2024-02-29 se aceptan, con round-trip de GET.
                for collection in ('vacas', 'toros', 'crias'):
                    for fecha in (self.hoy, '2024-02-29'):
                        with self.subTest(collection=collection, fechaNacimiento=fecha):
                            state = copy.deepcopy(self.state)
                            state[collection][0]['fechaNacimiento'] = fecha
                            self.assertEqual(self.put(state).status_code, 200)
                            self.assertEqual(self.client.get('/api/state').json['state'], state)

            def test_editing_existing_animal_rejects_future_birth_date(self):
                # AC4: editar un registro ya guardado con fechaNacimiento futura se rechaza
                # y el GET conserva el estado válido guardado.
                for collection in ('vacas', 'toros', 'crias'):
                    with self.subTest(collection=collection):
                        self.assertEqual(self.put(self.state).status_code, 200)
                        self.assertEqual(self.client.get('/api/state').json['state'], copy.deepcopy(self.state))
                        state = copy.deepcopy(self.state)
                        state[collection][0]['fechaNacimiento'] = self.manana
                        self.assert_rejected(state)

            def test_future_proximo_parto_and_fecha_destete_are_still_allowed(self):
                # AC5: proximoParto futuro en la vaca y fechaDestete futuro en la cría siguen siendo válidos.
                state = copy.deepcopy(self.state)
                state['reprod'] = []
                state['partos'] = []
                state['vacas'][0]['proximoParto'] = self.manana
                state['crias'][0]['fechaDestete'] = self.manana
                self.assertEqual(self.put(state).status_code, 200)
                self.assertEqual(self.client.get('/api/state').json['state'], state)

        try:
            result = unittest.TextTestRunner(verbosity=2).run(unittest.defaultTestLoader.loadTestsFromTestCase(BirthDateValidationTest))
        finally:
            with app.app_context():
                db.session.remove()
                db.engine.dispose()
        return 0 if result.wasSuccessful() else 1


if __name__ == '__main__':
    raise SystemExit(main())
