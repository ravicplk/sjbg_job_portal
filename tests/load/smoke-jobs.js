import http from 'k6/http'
import { sleep, check } from 'k6'

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000'

export const options = {
  vus: 5,
  duration: '20s',
  thresholds: {
    http_req_failed: ['rate<0.01'],
    http_req_duration: ['p(95)<1000'],
  },
}

export default function () {
  const home = http.get(`${BASE_URL}/`)
  check(home, {
    'home status is 200': (r) => r.status === 200,
  })

  const login = http.get(`${BASE_URL}/login`)
  check(login, {
    'login status is 200': (r) => r.status === 200,
  })

  sleep(1)
}

