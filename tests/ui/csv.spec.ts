import fs from 'node:fs'
import { expect, test, type Page, type APIResponse, type Download } from '@playwright/test'
import { login } from './helpers'

// Spec 005: exportación de las vacas filtradas y serialización independiente.
// AC3 exige comillas en todos los campos, incluidos los encabezados.
// Las pruebas restauran el fixture después de cada caso.

type EstadoUI = {
  vacas: Record<string, unknown>[]
  toros: Record<string, unknown>[]
  crias: Record<string, unknown>[]
  reprod: Record<string, unknown>[]
  partos: Record<string, unknown>[]
}

const estadoFixture: EstadoUI = (() => {
  const fixture: EstadoUI = { vacas: [], toros: [], crias: [], reprod: [], partos: [] }
  ;[['Luna', 'Vacía'], ['Estrella', 'Preñada'], ['Paloma', 'Preñada']].forEach(([nombre, estado], i) => {
    fixture.vacas.push({ id: `V-00${i + 1}`, nombre, raza: 'Angus', fechaNacimiento: '2020-01-01', peso: '500', estado, ultimoParto: '', proximoParto: '', partos: 0, observaciones: '', padre: '', madre: '' })
  })
  ;[['Fuerte', 'Activo'], ['Titán', 'En cuarentena'], ['Zeus', 'Inactivo']].forEach(([nombre, estado], i) => {
    fixture.toros.push({ id: `T-00${i + 1}`, nombre, raza: 'Angus', fechaNacimiento: '2019-01-01', peso: '700', estado, observaciones: '' })
  })
  ;[['Lucero', 'Hembra', 'Saludable'], ['Trueno', 'Macho', 'En observación'], ['Nube', 'Hembra', 'Enfermo']].forEach(([nombre, sexo, estado], i) => {
    fixture.crias.push({ id: `C-00${i + 1}`, nombre, sexo, fechaNacimiento: '2025-01-01', madre: '', padre: '', peso: '40', estado, fechaDestete: '2025-08-01', observaciones: '' })
  })
  return fixture
})()

const ENCABEZADOS = ['Código', 'Nombre', 'Raza', 'Nacimiento', 'Peso (kg)', 'Estado', 'Último parto', 'Próximo parto', 'Partos'] as const
const LINEA_ENCABEZADOS = '"Código","Nombre","Raza","Nacimiento","Peso (kg)","Estado","Último parto","Próximo parto","Partos"'

const vaca = (index: number, cambios: Record<string, unknown> = {}) => ({ ...estadoFixture.vacas[index], ...cambios })

const putState = async (page: Page, state: EstadoUI): Promise<APIResponse> => {
  const { csrf } = await (await page.request.get('/api/session')).json()
  return page.request.put('/api/state', { headers: { 'X-CSRF-Token': csrf }, data: state })
}

const getState = async (page: Page): Promise<EstadoUI> => (await (await page.request.get('/api/state')).json() as { state: EstadoUI }).state

// ─── Localizadores de VacasScreen ──────────────────────────────────────────────
const exportarBtn = (page: Page) => page.getByRole('button', { name: 'Exportar CSV' })
const buscarVaca = (page: Page) => page.getByLabel('Buscar', { exact: true })
const filtroEstado = (page: Page) => page.getByRole('combobox', { name: 'Estado', exact: true })

const irVacas = async (page: Page) => {
  await login(page)
  await page.getByRole('button', { name: 'Vacas', exact: true }).click()
  await expect(buscarVaca(page)).toBeVisible()
}

// ─── Lectura de la descarga ────────────────────────────────────────────────────
const descargarCsv = async (page: Page, accion: () => Promise<void>): Promise<{ nombre: string; bytes: Buffer }> => {
  const pendiente = page.waitForEvent('download')
  await accion()
  const descarga: Download = await pendiente
  const bytes = fs.readFileSync(await descarga.path())
  return { nombre: descarga.suggestedFilename(), bytes }
}

const sinBom = (bytes: Buffer): { tieneBom: boolean; texto: string } => {
  const tieneBom = bytes[0] === 0xef && bytes[1] === 0xbb && bytes[2] === 0xbf
  return { tieneBom, texto: bytes.toString('utf8').replace(/^\uFEFF/, '') }
}

// Parser de pruebas: tolera comillas dobles internas y separadores CRLF/LF;
// descarta, si existiera, una fila final vacía (no parte del contrato).
const parsearCsv = (texto: string): string[][] => {
  const filas: string[][] = []
  let fila: string[] = []
  let campo = ''
  let entreComillas = false
  for (let i = 0; i < texto.length; i++) {
    const c = texto[i]
    if (entreComillas) {
      if (c === '"') { if (texto[i + 1] === '"') { campo += '"'; i++ } else entreComillas = false } else campo += c
      continue
    }
    if (c === '"') { entreComillas = true; continue }
    if (c === ',') { fila.push(campo); campo = ''; continue }
    if (c === '\r') { if (texto[i + 1] === '\n') i++; fila.push(campo); filas.push(fila); fila = []; campo = ''; continue }
    if (c === '\n') { fila.push(campo); filas.push(fila); fila = []; campo = ''; continue }
    campo += c
  }
  if (campo !== '' || fila.length) { fila.push(campo); filas.push(fila) }
  if (filas.length && filas[filas.length - 1].length === 1 && filas[filas.length - 1][0] === '') filas.pop()
  return filas
}

const filaPorCodigo = (filas: string[][], codigo: string) => filas.find(f => f[0] === codigo)

const FILA_LUNA = ['V-001', 'Luna', 'Angus', '2020-01-01', '500', 'Vacía', '', '', '0'] as string[]
const FILA_ESTRELLA = ['V-002', 'Estrella', 'Angus', '2020-01-01', '500', 'Preñada', '', '', '0'] as string[]
const FILA_PALOMA = ['V-003', 'Paloma', 'Angus', '2020-01-01', '500', 'Preñada', '', '', '0'] as string[]

// ─── AC1: botón Exportar CSV (texto visible, teclado) y encabezados exactos ────
test('AC1: Exportar CSV es visible, accesible por Tab/Enter y descarga vacas.csv con la fila de encabezados exacta', async ({ page }) => {
  await irVacas(page)
  const boton = exportarBtn(page)
  await expect(boton).toBeVisible()
  await expect(boton).toHaveText('Exportar CSV')

  // accesible por teclado: desde la búsqueda se alcanza con Tab y descarga con Enter
  await buscarVaca(page).focus()
  let alcanzado = false
  for (let i = 0; i < 30 && !alcanzado; i++) {
    await page.keyboard.press('Tab')
    alcanzado = await boton.evaluate((el: HTMLElement) => el === document.activeElement)
  }
  expect(alcanzado).toBe(true)
  const porTeclado = await descargarCsv(page, () => page.keyboard.press('Enter'))
  expect(porTeclado.nombre).toBe('vacas.csv')
  const limpioTeclado = sinBom(porTeclado.bytes)
  expect(limpioTeclado.tieneBom).toBe(true)
  expect(limpioTeclado.texto.split('\r\n')[0]).toBe(LINEA_ENCABEZADOS)

  // el click también descarga
  const porClick = await descargarCsv(page, () => boton.click())
  expect(porClick.nombre).toBe('vacas.csv')
  expect(sinBom(porClick.bytes).texto.split('\r\n')[0]).toBe(LINEA_ENCABEZADOS)
})

// ─── AC2: solo visibles, mismo orden; ceros y vacíos en su columna ─────────────
test('AC2: exporta solo las vacas visibles tras búsqueda y filtro, en su orden, conservando ceros y campos vacíos', async ({ page }) => {
  await irVacas(page)

  // sin filtros: 3 filas, el orden del estado; partos 0 y fechas vacías conservan su columna
  const sinFiltros = await descargarCsv(page, () => exportarBtn(page).click())
  expect(parsearCsv(sinBom(sinFiltros.bytes).texto)).toEqual([[...ENCABEZADOS], FILA_LUNA, FILA_ESTRELLA, FILA_PALOMA])

  // filtro por estado: solo las Preñadas, mismo orden relativo
  await filtroEstado(page).selectOption('Preñada')
  const prenadas = await descargarCsv(page, () => exportarBtn(page).click())
  expect(parsearCsv(sinBom(prenadas.bytes).texto)).toEqual([[...ENCABEZADOS], FILA_ESTRELLA, FILA_PALOMA])

  // búsqueda + filtro combinados: solo V-003
  await buscarVaca(page).fill('paloma')
  const soloPaloma = await descargarCsv(page, () => exportarBtn(page).click())
  expect(parsearCsv(sinBom(soloPaloma.bytes).texto)).toEqual([[...ENCABEZADOS], FILA_PALOMA])
})

// ─── AC2: botón deshabilitado sin vacas (el afterEach restaura el fixture) ─────
test('AC2: con la lista de vacas vacía el botón Exportar CSV está deshabilitado', async ({ page }) => {
  await irVacas(page)
  // preparación: PUT con la lista de vacas vacía; si falla es error de preparación, no de la app
  expect((await putState(page, { ...estadoFixture, vacas: [] })).status()).toBe(200)
  await page.reload()
  await page.getByRole('button', { name: 'Vacas', exact: true }).click()
  await expect(exportarBtn(page)).toBeDisabled()
})

// ─── AC3: BOM, CRLF, entrecomillado, acentos/comas/saltos de línea ─────────────
test('AC3: el archivo usa BOM UTF-8 y CRLF, entrecomilla todos los campos y conserva acentos, comas, comillas y saltos de línea', async ({ page }) => {
  await irVacas(page)
  // preparación: un nombre que exige entrecomillado; si el PUT falla es de preparación
  expect((await putState(page, { ...estadoFixture, vacas: [vaca(0, { nombre: 'Órtega,\r\n"La Quitada"' }), vaca(1), vaca(2)] })).status()).toBe(200)
  await page.reload()
  await page.getByRole('button', { name: 'Vacas', exact: true }).click()

  const { bytes } = await descargarCsv(page, () => exportarBtn(page).click())
  const { tieneBom, texto } = sinBom(bytes)
  expect(tieneBom).toBe(true)
  // separadores de fila: ningún \n desligado de su \r
  let desnudos = 0
  for (let i = 0; i < texto.length; i++) if (texto[i] === '\n' && texto[i - 1] !== '\r') desnudos += 1
  expect(desnudos).toBe(0)
  // el campo con coma, comillas y salto de línea va entre comillas y duplica sus comillas internas
  expect(texto).toContain('"Órtega,\r\n""La Quitada"""')

  const filas = parsearCsv(texto)
  expect(filas[0]).toEqual([...ENCABEZADOS])
  expect(filaPorCodigo(filas, 'V-001')).toEqual(['V-001', 'Órtega,\r\n"La Quitada"', 'Angus', '2020-01-01', '500', 'Vacía', '', '', '0'])
  filas.slice(1).forEach(fila => expect(fila).toHaveLength(9))
})

// ─── AC4: neutralización de fórmulas con apóstrofo ─────────────────────────────
test('AC4: los valores que empiezan por = + - @ tab CR (o con espacios antes del indicador) se prefijan con apóstrofo', async ({ page }) => {
  await irVacas(page)
  // preparación: nombres/razas con indicadores de fórmula; si el PUT falla es de preparación
  expect((await putState(page, {
    ...estadoFixture,
    vacas: [
      vaca(0, { nombre: '=SUMA(B1:B2)', raza: '\rInicio' }),
      vaca(1, { nombre: '+Incremento', raza: '\tTabular' }),
      vaca(2, { nombre: '@Dominio', raza: '  =Filtrada' }),
    ],
  })).status()).toBe(200)
  await page.reload()
  await page.getByRole('button', { name: 'Vacas', exact: true }).click()

  const { bytes } = await descargarCsv(page, () => exportarBtn(page).click())
  const texto = sinBom(bytes).texto
  const filas = parsearCsv(texto)

  // valor lógico de cada celda: el apóstrofo precede al valor completo
  expect(filaPorCodigo(filas, 'V-001')).toEqual(['V-001', "'=SUMA(B1:B2)", "'\rInicio", '2020-01-01', '500', 'Vacía', '', '', '0'])
  expect(filaPorCodigo(filas, 'V-002')).toEqual(['V-002', "'+Incremento", "'\tTabular", '2020-01-01', '500', 'Preñada', '', '', '0'])
  expect(filaPorCodigo(filas, 'V-003')).toEqual(['V-003', "'@Dominio", "'  =Filtrada", '2020-01-01', '500', 'Preñada', '', '', '0'])

  // a nivel de bytes: con tab, CR o espacios iniciales el campo queda entrecomillado tras el prefijo
  expect(texto).toContain("'=SUMA(B1:B2)")
  expect(texto).toContain("'+Incremento")
  expect(texto).toContain("'@Dominio")
  expect(texto).toContain("\"'\rInicio\"")
  expect(texto).toContain("\"'\tTabular\"")
  expect(texto).toContain("\"'  =Filtrada\"")
})

// ─── AC5: descarga local, sin red externa ni PUT ───────────────────────────────
test('AC5: la exportación no envía datos a servicios externos ni produce PUT /api/state', async ({ page }) => {
  await irVacas(page)

  let escrituras = 0
  let externas = 0
  page.on('request', req => {
    let url: URL
    try { url = new URL(req.url()) } catch { return }
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return
    if (!['127.0.0.1', 'localhost'].includes(url.hostname)) { externas += 1; return }
    if (req.method() === 'PUT' && url.pathname === '/api/state') escrituras += 1
  })

  await filtroEstado(page).selectOption('Preñada')
  const { nombre, bytes } = await descargarCsv(page, () => exportarBtn(page).click())
  expect(nombre).toBe('vacas.csv')
  expect(parsearCsv(sinBom(bytes).texto).length - 1).toBe(2)

  await page.waitForLoadState('networkidle')
  await page.waitForTimeout(300)
  expect(escrituras).toBe(0)
  expect(externas).toBe(0)
})

// ─── AC6: la exportación no modifica el estado persistido ──────────────────────
test('AC6: la exportación no modifica el estado persistido (comparación antes y después)', async ({ page }) => {
  await irVacas(page)
  const inicial = await getState(page)
  expect(inicial).toEqual(estadoFixture)

  let escrituras = 0
  page.on('request', req => {
    const url = new URL(req.url())
    if (req.method() === 'PUT' && url.pathname === '/api/state') escrituras += 1
  })

  await buscarVaca(page).fill('estrella')
  await filtroEstado(page).selectOption('Preñada')
  const { bytes } = await descargarCsv(page, () => exportarBtn(page).click())
  expect(parsearCsv(sinBom(bytes).texto)).toEqual([[...ENCABEZADOS], FILA_ESTRELLA])

  await page.waitForLoadState('networkidle')
  await page.waitForTimeout(300)
  expect(escrituras).toBe(0)
  expect(await getState(page)).toEqual(inicial)
})

test('AC2: sin coincidencias el botón Exportar CSV queda deshabilitado', async ({ page }) => {
  await irVacas(page)
  await buscarVaca(page).fill('NO-EXISTE')
  await expect(exportarBtn(page)).toBeDisabled()
  expect(await getState(page)).toEqual(estadoFixture)
})

// Serialización pura: resultados esperados independientes del helper.
test.describe('serializeCsv de src/csv.ts (sin navegador)', () => {
  const serializar = async (filas: (readonly unknown[])[]) => (await import('../../src/csv')).serializeCsv(filas)

  test('AC1/AC3: encabezados y campos entre comillas, BOM y CRLF', async () => {
    expect(await serializar([
      [...ENCABEZADOS],
      ['V-001', 'Luna', 'Angus', '2020-01-01', '500', 'Vacía', '', '', 0],
    ])).toBe('\uFEFF' + LINEA_ENCABEZADOS + '\r\n' + '"V-001","Luna","Angus","2020-01-01","500","Vacía","","","0"')
  })

  test('AC3: duplica comillas internas y conserva comas y saltos de línea', async () => {
    expect(await serializar([['Órtega,\r\n"La Quitada"', '0', '']])).toBe('\uFEFF"Órtega,\r\n""La Quitada""","0",""')
  })

  test('AC2: ceros y campos vacíos conservan su columna y sus comillas', async () => {
    expect(await serializar([['a', 0, '', 1]])).toBe('\uFEFF"a","0","","1"')
    expect(await serializar([['', '', ''], ['x', '0', '']])).toBe('\uFEFF"","",""\r\n"x","0",""')
  })

  test('AC4: prefija los indicadores de fórmula y conserva los valores inofensivos', async () => {
    expect(await serializar([['=SUMA(B1:B2)', '+300', '-25', '@Finca']])).toBe("\uFEFF\"'=SUMA(B1:B2)\",\"'+300\",\"'-25\",\"'@Finca\"")
    expect(await serializar([['\tMacroA', '\rBloque', '  =Resta']])).toBe("\uFEFF\"'\tMacroA\",\"'\rBloque\",\"'  =Resta\"")
    expect(await serializar([['x=y', '5+6', 'a@b']])).toBe('\uFEFF"x=y","5+6","a@b"')
  })

  test('AC3/AC6: conserva LF y CRLF dentro de campos sin mutar las filas', async () => {
    const filas = [['línea1\nlínea2', '0'], ['dos\r\ntres', 'a"b']]
    const antes = JSON.parse(JSON.stringify(filas))
    expect(await serializar(filas)).toBe('\uFEFF"línea1\nlínea2","0"\r\n"dos\r\ntres","a""b"')
    expect(filas).toEqual(antes)
  })
})

test.afterEach(async ({ page }, info) => {
  // Restaura el fixture de tests/ui_fixture.py pase lo que pase (los demás specs dependen de él).
  let salida = await putState(page, estadoFixture)
  if (salida.status() === 401) {
    // El test pudo fallar antes del login; autentica y reintenta.
    await login(page)
    salida = await putState(page, estadoFixture)
  }
  expect(salida.status()).toBe(200)
  if (info.status !== 'passed') console.log(`[csv] estado fixture restaurado tras "${info.title}"`)
})
