import { test, expect } from '@playwright/test'
import { login } from './helpers'

test('la aplicación carga los registros de la cuenta', async ({ page }) => {
  await login(page)
  await page.getByRole('button', { name: 'Vacas', exact: true }).click()
  await expect(page.getByRole('cell', { name: 'Luna', exact: true })).toBeVisible()
  await expect(page.getByRole('status')).toContainText('3 de 3')
})
