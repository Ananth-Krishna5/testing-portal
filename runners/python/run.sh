#!/usr/bin/env bash
set -euo pipefail
if [[ "${SIMULATE_FAILURE:-false}" == "true" ]]; then
  python - <<'PY'
import json, os
print(json.dumps({"tests":[
  {"name":"python: security scan","status":"failed","durationMs":5000,"error":"Simulated failure"},
  {"name":"python: cleanup","status":"passed","durationMs":10},
]}))
PY
  exit 1
fi
pytest -q --json-report --json-report-file=/tmp/report.json && cat /tmp/report.json || true
