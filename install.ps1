$ErrorActionPreference = 'Stop'
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Error 'Node.js 20+ required. Download from https://nodejs.org/'
    exit 1
}
& node (Join-Path $PSScriptRoot 'bin/antigravity-lean.mjs') wizard @args
exit $LASTEXITCODE
