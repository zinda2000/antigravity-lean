#!/bin/sh
set -eu
if ! command -v node >/dev/null 2>&1; then
  echo "Node.js 20+ required. Download from https://nodejs.org/" >&2
  exit 1
fi
LEAN_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
exec node "$LEAN_DIR/bin/antigravity-lean.mjs" wizard "$@"
