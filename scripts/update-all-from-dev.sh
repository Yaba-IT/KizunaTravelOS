#!/usr/bin/env bash
set -euo pipefail

git fetch origin

for branch in $(git for-each-ref --format='%(refname:short)' refs/heads/ | grep -Ev '^(master|dev)$'); do
  echo "→ Update branch '$branch' from origin/dev"
  git checkout "$branch"
  git pull origin dev --no-edit   # merge origin/dev
  git push origin "$branch"
done

git checkout dev
echo "✅ All branches (unless master) have been merged with origin/dev."
