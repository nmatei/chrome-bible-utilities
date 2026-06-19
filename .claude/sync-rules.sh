#!/bin/bash
# Keeps CLAUDE.md and .github/copilot-instructions.md in sync.
# The file passed as $1 is the source of truth; all others are overwritten to match it.
# (This repo does not use Cursor; add a CURSOR target + case below if that ever changes.)

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
CLAUDE="$ROOT/CLAUDE.md"
COPILOT="$ROOT/.github/copilot-instructions.md"

CHANGED="${1:-}"

# Determine the source file (the one that was just edited)
case "$CHANGED" in
  *CLAUDE.md)              SOURCE="$CLAUDE" ;;
  *copilot-instructions*)  SOURCE="$COPILOT" ;;
  *)
    echo "sync-rules: unknown changed file '$CHANGED', skipping sync" >&2
    exit 0
    ;;
esac

if [ ! -f "$SOURCE" ]; then
  echo "sync-rules: source file not found: $SOURCE" >&2
  exit 1
fi

for TARGET in "$CLAUDE" "$COPILOT"; do
  if [ "$TARGET" != "$SOURCE" ]; then
    cp "$SOURCE" "$TARGET"
    echo "sync-rules: synced $(basename "$SOURCE") → $(basename "$TARGET")"
  fi
done
