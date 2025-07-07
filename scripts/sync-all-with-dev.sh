#!/usr/bin/env bash
set -euo pipefail

# 1) make sure we're up-to-date
git fetch origin

# 2) loop over every local branch except master & dev
for branch in $(git for-each-ref --format='%(refname:short)' refs/heads/ | grep -Ev '^(master|dev)$'); do
  echo "→ Updating branch: $branch"
  git checkout "$branch"
  # merge dev in (or rebase if you prefer)
  git merge dev --no-edit
  # push the updated branch back to origin
  git push origin "$branch"
done

# 3) go back to dev
git checkout dev
echo "✅ All branches (except master) are now merged with dev."
