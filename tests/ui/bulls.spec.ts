import { expect, test, type Page, type APIResponse } from '@playwright/test'
import { login } from './helpers'

// Spec 003: filtro de toros por estado en TorosScreen (src/App.tsx).
// El fixture de tests/ui_fixture.py ya siembra vía serve_ui.py:
// Fuerte (T-001, Activo), Titán (T-002, En cuarentena), Zeus (T-003, Inactivo).
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

const irToros = async (page: Page) => {
  await page.getByRole('button', { name: 'Toros', exact: true }).click()
}

const selectorEstado = (page: Page) => page.getByRole('combobox', { name: 'Estado del toro' })
const buscarToro = (page: Page) => page.getByLabel('Buscar toro')
const limpiar = (page: Page) => page.getByRole('button', { name: 'Limpiar filtros' })

test('AC1: la pantalla Toros tiene el selector Estado del toro con sus opciones exactas', async ({ page }) => {
  await login(page)
  await irToros(page)
  const selector = selectorEstado(page)
  await expect(selector).toBeVisible()
  await expect(selector.locator('option')).toHaveText(['Todos los estados', 'Activo', 'En cuarentena', 'Inactivo'])
})

test('AC2: búsqueda y estado se combinan ignorando mayúsculas y espacios', async ({ page }) => {
  await login(page)
  await irToros(page)

  // búsqueda con mayúsculas y espacios: coincide con Fuerte
  await buscarToro(page).fill('  fuerte ')
  await expect(page.getByRole('row').filter({ hasText: 'Fuerte' })).toHaveCount(1)
  await expect(page.getByRole('row').filter({ hasText: 'Titán' })).toHaveCount(0)
  await expect(page.getByRole('row').filter({ hasText: 'Zeus' })).toHaveCount(0)

  // búsqueda por código
  await buscarToro(page).fill('T-003')
  await expect(page.getByRole('row').filter({ hasText: 'Zeus' })).toHaveCount(1)

  // combinado: En cuarentena + 'titán' → solo Titán
  await buscarToro(page).fill('')
  await selectorEstado(page).selectOption('En cuarentena')
  await buscarToro(page).fill('titán')
  await expect(page.getByRole('row').filter({ hasText: 'Titán' })).toHaveCount(1)
  await expect(page.getByRole('row').filter({ hasText: 'Fuerte' })).toHaveCount(0)

  // el selector excluye el texto → 0 resultados
  await selectorEstado(page).selectOption('Inactivo')
  await expect(page.getByRole('row').filter({ hasText: 'Titán' })).toHaveCount(0)
  await expect(page.getByRole('row').filter({ hasText: 'Fuerte' })).toHaveCount(0)
  await expect(page.getByRole('row').filter({ hasText: 'Zeus' })).toHaveCount(0)
})

test('AC3: Limpiar filtros vacía por click y con teclado, y el contador cuenta visibles', async ({ page }) => {
  await login(page)
  await irToros(page)

  // filtrar con ambos controles
  await buscarToro(page).fill('Fuerte')
  await selectorEstado(page).selectOption('En cuarentena')
  await expect(page.getByRole('status')).toHaveText(/Mostrando 0 de 3 registros/)

  // limpiar por click
  await limpiar(page).click()
  await expect(buscarToro(page)).toHaveValue('')
  await expect(selectorEstado(page).locator('option:checked')).toHaveText('Todos los estados')
  await expect(page.getByRole('status')).toHaveText(/Mostrando 3 de 3 registros/)

  // limpiar con teclado: Enter tras el foco
  await buscarToro(page).fill('Zeus')
  await selectorEstado(page).selectOption('Activo')
  await limpiar(page).focus()
  await page.keyboard.press('Enter')
  await expect(buscarToro(page)).toHaveValue('')
  await expect(selectorEstado(page).locator('option:checked')).toHaveText('Todos los estados')

  // contador correcto tras filtrar de nuevo
  await selectorEstado(page).selectOption('Inactivo')
  await expect(page.getByRole('status')).toHaveText(/Mostrando 1 de 3 registros/)
})

test('AC4: sin coincidencias muestra el mensaje específico de filtros', async ({ page }) => {
  await login(page)
  await irToros(page)

  // con la lista poblada y sin filtros no aparece el mensaje de filtros
  await expect(page.getByText('Ningún toro coincide con los filtros')).toHaveCount(0)
  await expect(page.getByRole('status')).toHaveText(/Mostrando 3 de 3 registros/)

  // filtros que no coinciden: toros > 0 pero visibles 0
  await buscarToro(page).fill('Zeus')
  await selectorEstado(page).selectOption('Activo')
  await expect(page.getByText(/Ningún toro coincide con los filtros/i)).toBeVisible()
  await expect(page.getByRole('status')).toHaveText(/Mostrando 0 de 3 registros/)
})

test.describe('AC5: filtro y búsqueda por teclado y controles acomodados a 700 px', () => {
  test.use({ viewport: { width: 700, height: 800 } })

    test('teclado y distribución a 700 px', async ({ page }) => {
      await login(page)
      await irToros(page)

      // teclado: escribir en la búsqueda, cambiar el select con flechas, limpiar con Enter
      const busqueda = buscarToro(page)
      await busqueda.focus()
      await page.keyboard.type('fuerte')
      const selector = selectorEstado(page)
      await selector.focus()
      await page.keyboard.press('ArrowDown') // pasa a 'Activo'
      await expect(page.getByRole('row').filter({ hasText: 'Fuerte' })).toHaveCount(1)
      await expect(page.getByRole('row').filter({ hasText: 'Titán' })).toHaveCount(0)
      await limpiar(page).focus()
      await page.keyboard.press('Enter')
      await expect(busqueda).toHaveValue('')
      await expect(selector.locator('option:checked')).toHaveText('Todos los estados')

      // a 700 px de ancho los controles de la cabecera caben en el viewport
      for (const control of [busqueda, selector, limpiar(page), page.getByRole('button', { name: 'Nuevo toro' })]) {
        const caja = await control.boundingBox()
        expect(caja).toBeTruthy()
        expect(caja!.x).toBeGreaterThanOrEqual(0)
        expect(caja!.x + caja!.width).toBeLessThanOrEqual(700)
      }

      // la tabla tiene desplazamiento horizontal propio
      const desplazable = await page.getByRole('table').evaluate((tabla: HTMLElement) => {
        let el: HTMLElement | null = tabla.parentElement
        while (el) {
          if (/(auto|scroll)/.test(getComputedStyle(el).overflowX) && el.scrollWidth > el.clientWidth) return true
          el = el.parentElement
        }
        return false
      })
      expect(desplazable).toBe(true)
    })
  })

test('AC6: filtrar y limpiar no envían PUT ni cambian el estado persistido', async ({ page }) => {
  await login(page)
  const inicial = ((await (await page.request.get('/api/state')).json()) as { state: EstadoUI }).state
  await irToros(page)

  let escrituras = 0
  page.on('request', req => {
    if (req.method() === 'PUT' && new URL(req.url()).pathname === '/api/state') escrituras += 1
  })

  // filtrar, limpiar y volver a filtrar
  await page.getByLabel('Buscar toro').fill('Zeus')
  await selectorEstado(page).selectOption('Inactivo')
  await expect(page.getByRole('row').filter({ hasText: 'Zeus' })).toHaveCount(1)
  await limpiar(page).click()
  await expect(page.getByRole('status')).toHaveText(/Mostrando 3 de 3 registros/)
  await selectorEstado(page).selectOption('En cuarentena')
  await expect(page.getByRole('row').filter({ hasText: 'Titán' })).toHaveCount(1)

  await page.waitForLoadState('networkidle')
  await page.waitForTimeout(300)
  expect(escrituras).toBe(0)

  // el estado guardado sigue siendo el del fixture
  const final = ((await (await page.request.get('/api/state')).json()) as { state: EstadoUI }).state
  expect(final).toEqual(estadoFixture)
})

test.afterEach(async ({ page }, info) => {
  // Restaura el fixture de ui_fixture.py pase lo que pase (baseline.spec.ts depende de él).
  let salida = await putState(page, estadoFixture)
  if (salida.status() === 401) {
    // El test pudo fallar antes del login; autentica y reintenta.
    await login(page)
    salida = await putState(page, estadoFixture)
  }
  expect(salida.status()).toBe(200)
  if (info.status !== 'passed') console.log(`[bulls] estado fixture restaurado tras "${info.title}"`)
})
