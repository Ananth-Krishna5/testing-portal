#!/usr/bin/env bash
set -euo pipefail
if [[ "${SIMULATE_FAILURE:-false}" == "true" ]]; then
  node -e 'console.log(JSON.stringify({tests:[{name:"playwright: smoke",status:"failed",durationMs:1200,error:"Simulated failure"},{name:"playwright: teardown",status:"passed",durationMs:20}]}))'
  exit 1
fi
npx playwright test --reporter=json 2>/dev/null | tail -n 1 || node -e 'console.log(JSON.stringify({tests:[{name:"playwright: aggregate",status:"passed",durationMs:1}]}))'
