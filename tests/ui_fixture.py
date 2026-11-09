"""Datos completos para probar búsquedas, exportaciones y filtros."""
state = {'vacas': [], 'toros': [], 'crias': [], 'reprod': [], 'partos': []}
for i, (name, status) in enumerate([('Luna', 'Vacía'), ('Estrella', 'Preñada'), ('Paloma', 'Preñada')], 1):
    state['vacas'].append(dict(id=f'V-00{i}', nombre=name, raza='Angus', fechaNacimiento='2020-01-01', peso='500', estado=status, ultimoParto='', proximoParto='', partos=0, observaciones='', padre='', madre=''))
for i, (name, status) in enumerate([('Fuerte', 'Activo'), ('Titán', 'En cuarentena'), ('Zeus', 'Inactivo')], 1):
    state['toros'].append(dict(id=f'T-00{i}', nombre=name, raza='Angus', fechaNacimiento='2019-01-01', peso='700', estado=status, observaciones=''))
for i, (name, sex, status) in enumerate([('Lucero', 'Hembra', 'Saludable'), ('Trueno', 'Macho', 'En observación'), ('Nube', 'Hembra', 'Enfermo')], 1):
    state['crias'].append(dict(id=f'C-00{i}', nombre=name, sexo=sex, fechaNacimiento='2025-01-01', madre='', padre='', peso='40', estado=status, fechaDestete='2025-08-01', observaciones=''))
