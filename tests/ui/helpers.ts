import { expect, type Page } from '@playwright/test'

export async function login(page: Page) {
  const session = await page.request.get('/api/session')
  const { csrf } = await session.json()
  const response = await page.request.post('/api/login', {
    headers: { 'X-CSRF-Token': csrf },
    data: { email: 'ui@example.test', password: 'test-password-ui' },
  })
  expect(response.ok()).toBeTruthy()
  await page.goto('/')
  await expect(page.getByRole('button', { name: 'Vacas', exact: true })).toBeVisible()
  await page.waitForLoadState('networkidle')
}
