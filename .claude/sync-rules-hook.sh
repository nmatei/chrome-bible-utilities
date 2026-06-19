#!/bin/bash
# PostToolUse hook: syncs IDE rule files and skills when any of them is edited.
# Claude Code passes tool info as JSON on stdin.

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"

# Parse file_path from stdin JSON (tool_input.file_path)
FILE=$(python3 -c "
import sys, json
try:
    d = json.load(sys.stdin)
    print(d.get('tool_input', {}).get('file_path', ''))
except Exception:
    print('')
" 2>/dev/null || true)

case "$FILE" in
  *CLAUDE.md|*copilot-instructions*)
    bash "$ROOT/.claude/sync-rules.sh" "$FILE"
    ;;
  *.claude/skills/*/SKILL.md|*.github/skills/*/SKILL.md)
    bash "$ROOT/.claude/sync-skills.sh" "$FILE"
    ;;
esac
