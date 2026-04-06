import type { Page } from '@playwright/test'

export async function uiLogin(page: Page, email: string, password: string) {
  await page.goto('/login')
  await page.locator('#email').fill(email)
  await page.locator('#password').fill(password)
  await page.getByRole('button', { name: 'Sign In' }).click()
  // login server action redirects to /
  await page.waitForURL('**/')
}

