#!/bin/bash
# Keeps agent skills in sync between Claude Code and GitHub Copilot / VS Code.
# Both tools use the SAME SKILL.md format (https://code.visualstudio.com/docs/agent-customization/agent-skills),
# so the files are byte-identical. The file passed as $1 is the source of truth; it is
# copied to the mirror location. Skill name <name> must match its parent directory in both.
#
#   Claude:  .claude/skills/<name>/SKILL.md
#   Copilot: .github/skills/<name>/SKILL.md

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
CHANGED="${1:-}"

# Derive "<name>/SKILL.md" so we can map between the two skill roots.
case "$CHANGED" in
  *.claude/skills/*/SKILL.md)
    REL="${CHANGED##*.claude/skills/}"
    SOURCE="$ROOT/.claude/skills/$REL"
    TARGET="$ROOT/.github/skills/$REL"
    ;;
  *.github/skills/*/SKILL.md)
    REL="${CHANGED##*.github/skills/}"
    SOURCE="$ROOT/.github/skills/$REL"
    TARGET="$ROOT/.claude/skills/$REL"
    ;;
  *)
    echo "sync-skills: '$CHANGED' is not a skill SKILL.md, skipping" >&2
    exit 0
    ;;
esac

if [ ! -f "$SOURCE" ]; then
  echo "sync-skills: source not found: $SOURCE" >&2
  exit 1
fi

mkdir -p "$(dirname "$TARGET")"
cp "$SOURCE" "$TARGET"
echo "sync-skills: synced $REL ($SOURCE → $TARGET)"
