import { expect, test, type Page, type APIResponse } from '@playwright/test'
import { login } from './helpers'

// AC4 (spec 002): la pantalla no debe enviar una escritura que quite un animal
// con historial vinculado; en cambio debe mostrar un mensaje en español y
// mantener el animal visible y persistido.

const ownState = {
  vacas: [{ id: 'V-001', nombre: 'Florencia', raza: 'Angus', fechaNacimiento: '2020-01-01', estado: 'Vacía' }],
  toros: [{ id: 'T-001', nombre: 'Torbellino', raza: 'Angus', fechaNacimiento: '2019-01-01', estado: 'Activo' }],
  crias: [{ id: 'C-001', nombre: 'Luz', fechaNacimiento: '2025-01-01', sexo: 'Hembra', estado: 'Saludable', madre: 'V-001' }],
  partos: [{ id: 'P-001', vacaId: 'V-001', criaId: 'C-001', fecha: '2025-01-01' }],
  reprod: [{ id: 'R-001', vacaId: 'V-001', toroId: 'T-001', fecha: '2026-01-01' }],
}

// Restaura el estado de tests/ui_fixture.py (3 vacas/3 toros/3 crías, sin
// reprod/partos) para no alterar lo que baseline.spec.ts espera al sembrar el
// servidor con fresh TEMP db.
// (Cada corrida de Playwright arranca serve_ui.py con una base nueva y ya siembra
// el fixture, pero restauramos dentro de la misma corrida si este test corre
// antes del baseline.)
const estadoFixture = (() => {
  const fixture = { vacas: [], toros: [], crias: [], reprod: [], partos: [] } as Record<string, Record<string, unknown>[]>
  ;([['Luna', 'Vacía'], ['Estrella', 'Preñada'], ['Paloma', 'Preñada']] as const).forEach(([name, status], i) => {
    fixture.vacas.push({ id: `V-00${i + 1}`, nombre: name, raza: 'Angus', fechaNacimiento: '2020-01-01', peso: '500', estado: status, ultimoParto: '', proximoParto: '', partos: 0, observaciones: '', padre: '', madre: '' })
  })
  ;([['Fuerte', 'Activo'], ['Titán', 'En cuarentena'], ['Zeus', 'Inactivo']] as const).forEach(([name, status], i) => {
    fixture.toros.push({ id: `T-00${i + 1}`, nombre: name, raza: 'Angus', fechaNacimiento: '2019-01-01', peso: '700', estado: status, observaciones: '' })
  })
  ;([['Lucero', 'Hembra', 'Saludable'], ['Trueno', 'Macho', 'En observación'], ['Nube', 'Hembra', 'Enfermo']] as const).forEach(([name, sex, status], i) => {
    fixture.crias.push({ id: `C-00${i + 1}`, nombre: name, sexo: sex, fechaNacimiento: '2025-01-01', madre: '', padre: '', peso: '40', estado: status, fechaDestete: '2025-08-01', observaciones: '' })
  })
  return fixture as unknown as typeof ownState
})()

const putState = async (page: Page, state: typeof ownState): Promise<APIResponse> => {
  const { csrf } = await (await page.request.get('/api/session')).json()
  return page.request.put('/api/state', { headers: { 'X-CSRF-Token': csrf }, data: state })
}

test('AC4: bloquea eliminar animales con historial vinculado y mantiene el animal', async ({ page }) => {
  await login(page)
  // Estado propio con historial: R-001 (V-001/T-001) y P-001 (V-001/C-001).
  const preparado = await putState(page, ownState)
  expect(preparado.status()).toBe(200)
  await page.reload()
  await page.getByRole('button', { name: 'Vacas', exact: true }).waitFor()
  await page.waitForLoadState('networkidle')

  let escrituras = 0
  page.on('request', req => {
    if (req.method() === 'PUT' && new URL(req.url()).pathname === '/api/state') escrituras += 1
  })
  await page.waitForTimeout(200) // el guardado inicial de la carga ya terminó (networkidle)

  const dialogo = (texto: string) =>
    page.locator('div.fixed.inset-0').filter({ hasText: texto }).first()

  // 1) vaca con reproducción y parto
  await page.getByRole('button', { name: 'Vacas', exact: true }).click()
  await page.getByRole('row').filter({ hasText: 'Florencia' }).getByTitle('Eliminar').click()
  await dialogo('¿Eliminar esta vaca?').getByRole('button', { name: 'Eliminar', exact: true }).click()
  await expect(page.getByRole('alert')).toBeVisible()
  await expect(page.getByRole('alert')).toHaveText(/No se puede eliminar una vaca con reproducciones o partos registrados/)
  await expect(page.getByRole('cell', { name: 'Florencia', exact: true })).toBeVisible()
  await page.waitForTimeout(400)
  expect(escrituras).toBe(0)

  // 2) toro con reproducción
  escrituras = 0
  await page.getByRole('button', { name: 'Toros', exact: true }).click()
  await page.getByRole('row').filter({ hasText: 'Torbellino' }).getByTitle('Eliminar').click()
  await dialogo('¿Eliminar este toro?').getByRole('button', { name: 'Eliminar', exact: true }).click()
  await expect(page.getByRole('alert')).toBeVisible()
  await expect(page.getByRole('alert')).toHaveText(/No se puede eliminar un toro con reproducciones registradas/)
  await expect(page.getByRole('cell', { name: 'Torbellino', exact: true })).toBeVisible()
  await page.waitForTimeout(400)
  expect(escrituras).toBe(0)

  // 3) cría vinculada a parto (tarjeta en "Crías")
  escrituras = 0
  await page.getByRole('button', { name: 'Crías', exact: true }).click()
  const tarjeta = page.locator('div.bg-white.rounded-xl').filter({ hasText: 'Luz' }).first()
  await tarjeta.getByRole('button').last().click()
  await dialogo('¿Eliminar esta cría?').getByRole('button', { name: 'Eliminar', exact: true }).click()
  await expect(page.getByRole('alert')).toBeVisible()
  await expect(page.getByRole('alert')).toHaveText(/No se puede eliminar una cría vinculada a un parto registrado/)
  await expect(page.getByText('Luz', { exact: true })).toBeVisible()
  await page.waitForTimeout(400)
  expect(escrituras).toBe(0)

  // Persistencia: el GET sigue conteniendo los tres animales.
  const estado = (await (await page.request.get('/api/state')).json()) as { state: typeof ownState }
  expect(estado.state.vacas.map(v => v.id)).toContain('V-001')
  expect(estado.state.toros.map(t => t.id)).toContain('T-001')
  expect(estado.state.crias.map(c => c.id)).toContain('C-001')
  expect(estado.state).toEqual(ownState)
})


test('AC4: una vaca con solo parto tampoco se elimina', async ({ page }) => {
  await login(page)
  const state = { ...ownState, reprod: [] }
  expect((await putState(page, state)).status()).toBe(200)
  await page.reload()
  await page.getByRole('button', { name: 'Vacas', exact: true }).click()
  await page.waitForLoadState('networkidle')
  let writes = 0
  page.on('request', request => {
    if (request.method() === 'PUT' && new URL(request.url()).pathname === '/api/state') writes++
  })
  await page.getByRole('row').filter({ hasText: 'Florencia' }).getByTitle('Eliminar').click()
  await page.locator('div.fixed.inset-0').filter({ hasText: '¿Eliminar esta vaca?' }).getByRole('button', { name: 'Eliminar', exact: true }).click()
  await expect(page.getByRole('alert')).toHaveText(/No se puede eliminar una vaca con reproducciones o partos registrados/)
  await expect(page.getByRole('cell', { name: 'Florencia', exact: true })).toBeVisible()
  await page.waitForTimeout(500)
  expect(writes).toBe(0)
  expect((await (await page.request.get('/api/state')).json()).state).toEqual(state)
})

for (const animal of [
  { screen: 'Vacas', collection: 'vacas', name: 'Florencia', question: '¿Eliminar esta vaca?' },
  { screen: 'Toros', collection: 'toros', name: 'Torbellino', question: '¿Eliminar este toro?' },
  { screen: 'Crías', collection: 'crias', name: 'Luz', question: '¿Eliminar esta cría?' },
] as const) {
  test(`AC5: permite eliminar sin historial en ${animal.screen}`, async ({ page }) => {
    await login(page)
    const state = { ...ownState, reprod: [], partos: [] }
    expect((await putState(page, state)).status()).toBe(200)
    await page.reload()
    await page.getByRole('button', { name: animal.screen, exact: true }).click()
    if (animal.collection === 'crias') {
      await page.locator('div.bg-white.rounded-xl').filter({ hasText: animal.name }).first().getByRole('button').last().click()
    } else {
      await page.getByRole('row').filter({ hasText: animal.name }).getByTitle('Eliminar').click()
    }
    const response = page.waitForResponse(r => r.request().method() === 'PUT' && new URL(r.url()).pathname === '/api/state')
    await page.locator('div.fixed.inset-0').filter({ hasText: animal.question }).getByRole('button', { name: 'Eliminar', exact: true }).click()
    expect((await response).status()).toBe(200)
    await expect(page.getByText(animal.name, { exact: true })).toHaveCount(0)
    const persisted = (await (await page.request.get('/api/state')).json()).state
    expect(persisted).toEqual({ ...state, [animal.collection]: [] })
  })
}

test('AC4: el guardado pendiente no borra el mensaje de eliminación bloqueada', async ({ page }) => {
  await login(page)
  expect((await putState(page, ownState)).status()).toBe(200)
  let release: (() => Promise<void>) | undefined
  let captured!: () => void
  const pending = new Promise<void>(resolve => { captured = resolve })
  await page.route('**/api/state', async route => {
    if (route.request().method() === 'PUT' && !release) {
      release = () => route.continue()
      captured()
      return
    }
    await route.continue()
  })
  await page.reload({ waitUntil: 'domcontentloaded' })
  await page.getByRole('button', { name: 'Vacas', exact: true }).click()
  await pending
  await page.getByRole('row').filter({ hasText: 'Florencia' }).getByTitle('Eliminar').click()
  await page.locator('div.fixed.inset-0').filter({ hasText: '¿Eliminar esta vaca?' }).getByRole('button', { name: 'Eliminar', exact: true }).click()
  await expect(page.getByRole('alert')).toHaveText(/No se puede eliminar una vaca/)
  const response = page.waitForResponse(r => r.request().method() === 'PUT' && new URL(r.url()).pathname === '/api/state')
  await release!()
  expect((await response).status()).toBe(200)
  await page.waitForTimeout(150)
  await expect(page.getByRole('alert')).toHaveText(/No se puede eliminar una vaca/)
  expect((await (await page.request.get('/api/state')).json()).state).toEqual(ownState)
})

test.afterEach(async ({ page }, info) => {
  // Restaura el fixture de ui_fixture.py pase lo que pase en las aserciones.
  await putState(page, estadoFixture)
  if (info.status !== 'passed') console.log(`[references] estado fixture restaurado tras "${info.title}"`)
})
