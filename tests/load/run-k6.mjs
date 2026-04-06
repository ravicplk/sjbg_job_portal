import { spawnSync } from 'node:child_process'

const baseUrl = process.argv[2] || 'http://localhost:3000'

// Check if k6 exists
const whereCmd = process.platform === 'win32' ? 'where' : 'which'
const check = spawnSync(whereCmd, ['k6'], { stdio: 'ignore', shell: true })

if (check.status !== 0) {
  console.log('[load] k6 is not installed; skipping load smoke test.')
  console.log('[load] Install k6 to enable: https://k6.io/docs/get-started/installation/')
  process.exit(0)
}

const result = spawnSync(
  'k6',
  ['run', '-e', `BASE_URL=${baseUrl}`, 'tests/load/smoke-jobs.js'],
  { stdio: 'inherit', shell: true }
)

process.exit(result.status ?? 1)

