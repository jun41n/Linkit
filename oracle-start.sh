#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")"

export PORT=8031
pnpm install
pnpm run export:web
pnpm run oracle
