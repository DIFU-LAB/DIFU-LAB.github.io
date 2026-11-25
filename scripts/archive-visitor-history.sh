#!/usr/bin/env bash
# Invoked only by the trusted default-branch workflow. The archive is an
# independent Git branch; never force-push or replace an existing ledger.
set -euo pipefail
branch=visitor-history
archive="${RUNNER_TEMP:-/tmp}/seil-visitor-history-$$"
cleanup() { git worktree remove --force "$archive" >/dev/null 2>&1 || true; }
trap cleanup EXIT
if git ls-remote --exit-code --heads origin "refs/heads/$branch" >/dev/null; then
  git fetch --no-tags origin "refs/heads/$branch"
  git worktree add --detach "$archive" FETCH_HEAD
else
  status=$?
  if [[ "$status" != 2 ]]; then exit "$status"; fi
  git worktree add --detach --no-checkout "$archive" HEAD
  git -C "$archive" switch --orphan "$branch"
fi
node --experimental-strip-types scripts/visitor-history.mjs "$archive"
git -C "$archive" config user.name 'github-actions[bot]'
git -C "$archive" config user.email '41898282+github-actions[bot]@users.noreply.github.com'
git -C "$archive" add -- history.json visitor-history.json
if ! git -C "$archive" diff --cached --quiet; then
  git -C "$archive" commit -m "Archive visitor aggregates $(date -u +%F)"
  git -C "$archive" push origin "HEAD:refs/heads/$branch"
fi
# This file alone is passed to the Pages build. Raw archive data stays off Pages.
mkdir -p "${RUNNER_TEMP:-/tmp}/seil-visitor-public"
cp "$archive/visitor-history.json" "${RUNNER_TEMP:-/tmp}/seil-visitor-public/visitor-history.json"
