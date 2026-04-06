import { test, expect } from '@playwright/test'
import { uiLogin } from './helpers/auth'

test('home page loads and shows job list area', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByText('Jobs inside the Twin Cities Catholic business community')).toBeVisible()
})

test('job detail page loads from the first job card', async ({ page }) => {
  await page.goto('/')
  const firstJobLink = page.locator('a[href^="/jobs/"]').first()
  await expect(firstJobLink).toBeVisible()
  await firstJobLink.click()
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
})

test('seeker can reach dashboard after login (env-based test account)', async ({ page }) => {
  const email = process.env.E2E_SEEKER_EMAIL
  const password = process.env.E2E_SEEKER_PASSWORD
  test.skip(!email || !password, 'Set E2E_SEEKER_EMAIL and E2E_SEEKER_PASSWORD to run this test')

  await uiLogin(page, email!, password!)
  await page.goto('/dashboard')
  await expect(page.getByText('My Dashboard')).toBeVisible()
})

test('employer can reach employer dashboard after login (env-based test account)', async ({ page }) => {
  const email = process.env.E2E_EMPLOYER_EMAIL
  const password = process.env.E2E_EMPLOYER_PASSWORD
  test.skip(!email || !password, 'Set E2E_EMPLOYER_EMAIL and E2E_EMPLOYER_PASSWORD to run this test')

  await uiLogin(page, email!, password!)
  await page.goto('/employer/dashboard')
  await expect(page.getByText('Employer Dashboard')).toBeVisible()
})

test('admin dashboard loads (env-based test account)', async ({ page }) => {
  const email = process.env.E2E_ADMIN_EMAIL
  const password = process.env.E2E_ADMIN_PASSWORD
  test.skip(!email || !password, 'Set E2E_ADMIN_EMAIL and E2E_ADMIN_PASSWORD to run this test')

  await uiLogin(page, email!, password!)
  await page.goto('/admin/dashboard')
  await expect(page.getByText('Total Users')).toBeVisible()
})

