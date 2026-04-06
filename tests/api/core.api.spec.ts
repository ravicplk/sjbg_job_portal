import { test, expect } from '@playwright/test'

test('register API rejects invalid payload', async ({ request }) => {
  const res = await request.post('/api/auth/register', {
    data: { email: 'bad', password: '1', firstName: '', lastName: '', role: 'job_seeker' },
  })
  expect(res.status()).toBe(400)
  const body = await res.json()
  expect(body.error).toBeTruthy()
})

test('logout redirects to /login', async ({ request, baseURL }) => {
  const res = await request.post('/api/auth/logout', { maxRedirects: 0 })
  expect(res.status()).toBe(303)
  const location = res.headers()['location']
  expect(location).toContain('/login')
})

test('publish job endpoint returns 401 when not authenticated', async ({ request }) => {
  const res = await request.post('/api/employer/jobs/00000000-0000-0000-0000-000000000000/publish', { data: {} })
  expect(res.status()).toBe(401)
})

