import { expect, test, type Page, type APIResponse } from '@playwright/test'
import { login } from './helpers'

// Spec 004: filtros de crías por sexo y salud en CriasScreen (src/App.tsx).
// El fixture de tests/ui_fixture.py ya siembra vía serve_ui.py:
// Lucero (C-001, Hembra, Saludable), Trueno (C-002, Macho, En observación), Nube (C-003, Hembra, Enfermo).
// Estas pruebas no deben modificar el estado; si algo cambia, afterEach lo restaura.

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

const putState = async (page: Page, state: EstadoUI): Promise<APIResponse> => {
  const { csrf } = await (await page.request.get('/api/session')).json()
  return page.request.put('/api/state', { headers: { 'X-CSRF-Token': csrf }, data: state })
}

const irCrias = async (page: Page) => {
  await page.getByRole('button', { name: 'Crías', exact: true }).click()
}

const buscarCria = (page: Page) => page.getByLabel('Buscar cría')
const selectorSexo = (page: Page) => page.getByRole('combobox', { name: 'Sexo' })
const selectorSalud = (page: Page) => page.getByRole('combobox', { name: 'Estado de salud' })
const limpiar = (page: Page) => page.getByRole('button', { name: 'Limpiar filtros' })

// Hay otros role="status" en la app (Vacas/Toros y el mensaje de guardado): acota al contador.
const contador = (page: Page) => page.getByRole('status').filter({ hasText: /Mostrando/ })

test('AC1: la pantalla Crías tiene etiquetas visibles y selectores con sus opciones exactas', async ({ page }) => {
  await login(page)
  await irCrias(page)

  await expect(buscarCria(page)).toBeVisible()
  const sexo = selectorSexo(page)
  await expect(sexo).toBeVisible()
  const salud = selectorSalud(page)
  await expect(salud).toBeVisible()

  await expect(sexo.locator('option')).toHaveText(['Todos', 'Macho', 'Hembra'])
  await expect(salud.locator('option')).toHaveText(['Todos', 'Saludable', 'En observación', 'Enfermo'])
})

test('AC2: búsqueda, sexo y salud se combinan con AND ignorando mayúsculas y espacios', async ({ page }) => {
  await login(page)
  await irCrias(page)

  // búsqueda con mayúsculas y espacios sobrantes: solo Lucero
  await buscarCria(page).fill('  luceRO ')
  await expect(page.getByText('Lucero', { exact: true })).toHaveCount(1)
  await expect(page.getByText('Trueno', { exact: true })).toHaveCount(0)
  await expect(page.getByText('Nube', { exact: true })).toHaveCount(0)
  await expect(contador(page)).toHaveText(/Mostrando 1 de 3 registros/)

  // búsqueda por código, en minúsculas
  await buscarCria(page).fill('c-002')
  await expect(page.getByText('Trueno', { exact: true })).toHaveCount(1)
  await expect(page.getByText('Lucero', { exact: true })).toHaveCount(0)
  await expect(page.getByText('Nube', { exact: true })).toHaveCount(0)

  // sexo solo: Todas las hembras
  await buscarCria(page).fill('')
  await selectorSexo(page).selectOption('Hembra')
  await expect(page.getByText('Lucero', { exact: true })).toHaveCount(1)
  await expect(page.getByText('Nube', { exact: true })).toHaveCount(1)
  await expect(page.getByText('Trueno', { exact: true })).toHaveCount(0)

  // AND: Hembra + Saludable → solo Lucero
  await selectorSalud(page).selectOption('Saludable')
  await expect(page.getByText('Lucero', { exact: true })).toHaveCount(1)
  await expect(page.getByText('Nube', { exact: true })).toHaveCount(0)

  // AND exclusión: texto que coincide + sexo que excluye → 0 resultados
  await buscarCria(page).fill('Trueno')
  await selectorSexo(page).selectOption('Macho')
  await selectorSalud(page).selectOption('Enfermo')
  await expect(page.getByText('Trueno', { exact: true })).toHaveCount(0)
  await expect(page.getByText('Lucero', { exact: true })).toHaveCount(0)
  await expect(page.getByText('Nube', { exact: true })).toHaveCount(0)
  await expect(contador(page)).toHaveText(/Mostrando 0 de 3 registros/)
})

test('AC3: Limpiar filtros restablece los tres controles por click y teclado, y el contador cuenta visibles', async ({ page }) => {
  await login(page)
  await irCrias(page)

  // filtrar con los tres controles
  await buscarCria(page).fill('Lucero')
  await selectorSexo(page).selectOption('Macho')
  await expect(contador(page)).toHaveText(/Mostrando 0 de 3 registros/)

  // limpiar por click
  await limpiar(page).click()
  await expect(buscarCria(page)).toHaveValue('')
  await expect(selectorSexo(page).locator('option:checked')).toHaveText('Todos')
  await expect(selectorSalud(page).locator('option:checked')).toHaveText('Todos')
  await expect(contador(page)).toHaveText(/Mostrando 3 de 3 registros/)

  // limpiar con teclado: Enter tras el foco
  await buscarCria(page).fill('Nube')
  await selectorSexo(page).selectOption('Hembra')
  await selectorSalud(page).selectOption('Enfermo')
  await expect(contador(page)).toHaveText(/Mostrando 1 de 3 registros/)
  await limpiar(page).focus()
  await page.keyboard.press('Enter')
  await expect(buscarCria(page)).toHaveValue('')
  await expect(selectorSexo(page).locator('option:checked')).toHaveText('Todos')
  await expect(selectorSalud(page).locator('option:checked')).toHaveText('Todos')
  await expect(page.getByText('Nube', { exact: true })).toHaveCount(1)

  // contador correcto tras filtrar de nuevo
  await selectorSalud(page).selectOption('En observación')
  await expect(contador(page)).toHaveText(/Mostrando 1 de 3 registros/)
})

test('AC4: sin coincidencias muestra el mensaje específico de filtros', async ({ page }) => {
  await login(page)
  await irCrias(page)

  // con la lista poblada y sin filtros no aparece el mensaje de filtros
  await expect(page.getByText(/Ninguna cría coincide con los filtros/i)).toHaveCount(0)
  await expect(contador(page)).toHaveText(/Mostrando 3 de 3 registros/)

  // filtros que no coinciden: crías > 0 pero visibles 0
  await buscarCria(page).fill('Trueno')
  await selectorSexo(page).selectOption('Hembra')
  await expect(page.getByText(/Ninguna cría coincide con los filtros/i)).toBeVisible()
  await expect(contador(page)).toHaveText(/Mostrando 0 de 3 registros/)
})

test.describe('AC5: filtros por teclado y controles acomodados a 700 px', () => {
  test.use({ viewport: { width: 700, height: 800 } })

  test('teclado y distribución a 700 px', async ({ page }) => {
    await login(page)
    await irCrias(page)

    // teclado: escribir en la búsqueda, cambiar el select con flechas, limpiar con Enter
    const busqueda = buscarCria(page)
    await busqueda.focus()
    await page.keyboard.type('trueno')
    const sexo = selectorSexo(page)
    await sexo.focus()
    await page.keyboard.press('ArrowDown') // pasa a 'Macho'
    await expect(page.getByText('Trueno', { exact: true })).toHaveCount(1)
    await expect(page.getByText('Lucero', { exact: true })).toHaveCount(0)
    await expect(page.getByText('Nube', { exact: true })).toHaveCount(0)
    await limpiar(page).focus()
    await page.keyboard.press('Enter')
    await expect(busqueda).toHaveValue('')
    await expect(sexo.locator('option:checked')).toHaveText('Todos')
    await expect(selectorSalud(page).locator('option:checked')).toHaveText('Todos')

    // a 700 px los controles caben en el viewport y no se solapan
    const controles = [busqueda, sexo, selectorSalud(page), limpiar(page), page.getByRole('button', { name: 'Registrar cría' })]
    const cajas = []
    for (const control of controles) {
      const caja = await control.boundingBox()
      expect(caja).toBeTruthy()
      expect(caja!.x).toBeGreaterThanOrEqual(0)
      expect(caja!.x + caja!.width).toBeLessThanOrEqual(700)
      cajas.push(caja!)
    }
    for (let i = 0; i < cajas.length; i++) {
      for (let j = i + 1; j < cajas.length; j++) {
        const a = cajas[i]
        const b = cajas[j]
        const solapanVertical = a.y < b.y + b.height && b.y < a.y + a.height
        const solapanHorizontal = a.x < b.x + b.width && b.x < a.x + a.width
        expect(solapanVertical && solapanHorizontal).toBe(false)
      }
    }

    // las tarjetas se adaptan: sin desbordamiento horizontal del documento
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth)
    expect(scrollWidth).toBeLessThanOrEqual(700)
  })
})

test('AC6: filtrar y limpiar no envían PUT ni cambian el estado persistido', async ({ page }) => {
  await login(page)
  const inicial = ((await (await page.request.get('/api/state')).json()) as { state: EstadoUI }).state
  expect(inicial).toEqual(estadoFixture)
  await irCrias(page)

  let escrituras = 0
  page.on('request', req => {
    if (req.method() === 'PUT' && new URL(req.url()).pathname === '/api/state') escrituras += 1
  })

  // filtrar, limpiar y volver a filtrar
  await buscarCria(page).fill('Lucero')
  await selectorSexo(page).selectOption('Hembra')
  await expect(contador(page)).toHaveText(/Mostrando 1 de 3 registros/)
  await limpiar(page).click()
  await expect(contador(page)).toHaveText(/Mostrando 3 de 3 registros/)
  await selectorSalud(page).selectOption('Enfermo')
  await expect(page.getByText('Nube', { exact: true })).toHaveCount(1)

  await page.waitForLoadState('networkidle')
  await page.waitForTimeout(300)
  expect(escrituras).toBe(0)

  // el estado guardado sigue siendo el del fixture
  const final = ((await (await page.request.get('/api/state')).json()) as { state: EstadoUI }).state
  expect(final).toEqual(estadoFixture)
})

test('AC4: una lista inicialmente vacía muestra ausencia de registros', async ({ page }) => {
  await login(page)
  expect((await putState(page, { ...estadoFixture, crias: [] })).status()).toBe(200)
  await page.reload()
  await irCrias(page)
  await expect(page.getByText(/No hay crías registradas/i)).toBeVisible()
  await expect(contador(page)).toHaveText(/Mostrando 0 de 0 registros/)
  await expect(page.getByText(/Ninguna cría coincide con los filtros/i)).toHaveCount(0)
})

test.afterEach(async ({ page }, info) => {
  // Restaura el fixture de ui_fixture.py pase lo que pase (baseline.spec.ts y references.spec.ts dependen de él).
  let salida = await putState(page, estadoFixture)
  if (salida.status() === 401) {
    // El test pudo fallar antes del login; autentica y reintenta.
    await login(page)
    salida = await putState(page, estadoFixture)
  }
  expect(salida.status()).toBe(200)
  if (info.status !== 'passed') console.log(`[calves] estado fixture restaurado tras "${info.title}"`)
})
