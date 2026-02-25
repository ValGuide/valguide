#!/usr/bin/env bash
# Tests for generate-changelog.sh
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
SCRIPT="$SCRIPT_DIR/generate-changelog.sh"

PASS=0
FAIL=0

assert_contains() {
  local desc=$1 output=$2 expected=$3
  if echo "$output" | grep -qF "$expected"; then
    PASS=$((PASS + 1))
    echo "  ✅ $desc"
  else
    echo "  ❌ FAIL: $desc"
    echo "     Expected to contain: $expected"
    FAIL=$((FAIL + 1))
  fi
}

assert_not_contains() {
  local desc=$1 output=$2 unexpected=$3
  if echo "$output" | grep -qF "$unexpected"; then
    echo "  ❌ FAIL: $desc"
    echo "     Expected NOT to contain: $unexpected"
    FAIL=$((FAIL + 1))
  else
    PASS=$((PASS + 1))
    echo "  ✅ $desc"
  fi
}

# ─── Test 1: Basic categorization ───
echo "Test 1: Basic categorization"
INPUT="feat: add new feature ([abc1234](https://example.com/commit/abc))
fix: resolve crash on startup ([def5678](https://example.com/commit/def))
docs: update README ([ghi9012](https://example.com/commit/ghi))"

OUTPUT=$(echo "$INPUT" | bash "$SCRIPT")
assert_contains "has features section" "$OUTPUT" "### ✨ Features"
assert_contains "has feat commit" "$OUTPUT" "add new feature"
assert_contains "has fixes section" "$OUTPUT" "### 🐛 Fixes"
assert_contains "has fix commit" "$OUTPUT" "resolve crash on startup"
assert_contains "has docs section" "$OUTPUT" "### 📖 Docs"
assert_contains "has docs commit" "$OUTPUT" "update README"
echo ""

# ─── Test 2: [build xxx] commits are excluded ───
echo "Test 2: [build xxx] commits are excluded from Other"
INPUT="feat: add feature ([abc1234](https://example.com/commit/abc))
[build studio] ([29345b1a](https://example.com/commit/293))
[build app] ([44556677](https://example.com/commit/445))
[build admin] ([88990011](https://example.com/commit/889))"

OUTPUT=$(echo "$INPUT" | bash "$SCRIPT")
assert_not_contains "[build studio] excluded" "$OUTPUT" "[build studio]"
assert_not_contains "[build app] excluded" "$OUTPUT" "[build app]"
assert_not_contains "[build admin] excluded" "$OUTPUT" "[build admin]"
assert_not_contains "no Other section" "$OUTPUT" "### 📝 Other"
assert_contains "feat still present" "$OUTPUT" "add feature"
echo ""

# ─── Test 3: Scoped commits ───
echo "Test 3: Scoped conventional commits"
INPUT="feat(auth): add login flow ([aaa1111](https://example.com/commit/aaa))
fix(ui): button alignment ([bbb2222](https://example.com/commit/bbb))
chore(deps): bump dependencies ([ccc3333](https://example.com/commit/ccc))"

OUTPUT=$(echo "$INPUT" | bash "$SCRIPT")
assert_contains "scoped feat" "$OUTPUT" "add login flow"
assert_contains "scoped fix" "$OUTPUT" "button alignment"
assert_contains "chores section" "$OUTPUT" "### 🔧 Chores"
assert_contains "scoped chore" "$OUTPUT" "bump dependencies"
echo ""

# ─── Test 4: Breaking changes ───
echo "Test 4: Breaking changes"
INPUT="feat!: redesign API ([aaa1111](https://example.com/commit/aaa))
fix(db)!: change schema ([bbb2222](https://example.com/commit/bbb))"

OUTPUT=$(echo "$INPUT" | bash "$SCRIPT")
assert_contains "breaking section" "$OUTPUT" "### 💥 Breaking Changes"
assert_contains "breaking feat" "$OUTPUT" "redesign API"
assert_contains "breaking fix" "$OUTPUT" "change schema"
echo ""

# ─── Test 5: Uncategorized commits go to Other ───
echo "Test 5: Uncategorized commits go to Other"
INPUT="feat: a feature ([aaa1111](https://example.com/commit/aaa))
some random commit message ([zzz9999](https://example.com/commit/zzz))"

OUTPUT=$(echo "$INPUT" | bash "$SCRIPT")
assert_contains "has Other section" "$OUTPUT" "### 📝 Other"
assert_contains "uncategorized commit" "$OUTPUT" "some random commit message"
echo ""

# ─── Test 6: Unknown prefixes get their own section ───
echo "Test 6: Unknown prefixes get their own section"
INPUT="release: v1.0.0 ([aaa1111](https://example.com/commit/aaa))
release: v1.1.0 ([bbb2222](https://example.com/commit/bbb))"

OUTPUT=$(echo "$INPUT" | bash "$SCRIPT")
assert_contains "unknown prefix heading" "$OUTPUT" "### Release"
assert_contains "release commit 1" "$OUTPUT" "v1.0.0"
assert_contains "release commit 2" "$OUTPUT" "v1.1.0"
echo ""

# ─── Test 7: All known prefixes ───
echo "Test 7: All known conventional commit types"
INPUT="perf: faster queries ([a](https://x/a))
refactor: clean up code ([b](https://x/b))
test: add unit tests ([c](https://x/c))
build: update webpack ([d](https://x/d))
ci: fix pipeline ([e](https://x/e))
style: format code ([f](https://x/f))
revert: undo change ([g](https://x/g))
plan: roadmap update ([h](https://x/h))"

OUTPUT=$(echo "$INPUT" | bash "$SCRIPT")
assert_contains "perf section" "$OUTPUT" "### ⚡ Performance"
assert_contains "refactor section" "$OUTPUT" "### ♻️ Refactors"
assert_contains "tests section" "$OUTPUT" "### 🧪 Tests"
assert_contains "build section" "$OUTPUT" "### 🏗️ Build"
assert_contains "ci section" "$OUTPUT" "### 👷 CI"
assert_contains "style section" "$OUTPUT" "### 🎨 Style"
assert_contains "revert section" "$OUTPUT" "### ⏪ Reverts"
assert_contains "plan section" "$OUTPUT" "### 📋 Plan"
echo ""

# ─── Test 8: Empty input ───
echo "Test 8: Empty input produces no output"
OUTPUT=$(echo "" | bash "$SCRIPT")
assert_contains "empty output" "EMPTY${OUTPUT}EMPTY" "EMPTYEMPTY"
echo ""

# ─── Test 9: [build xxx] with various app names ───
echo "Test 9: [build xxx] exclusion with various names"
INPUT="[build studio] ([aaa](https://x/a))
[build app] ([bbb](https://x/b))
[build admin] ([ccc](https://x/c))
[build docs] ([ddd](https://x/d))
[build links] ([eee](https://x/e))
[build storybook] ([fff](https://x/f))
[build www] ([ggg](https://x/g))"

OUTPUT=$(echo "$INPUT" | bash "$SCRIPT")
assert_not_contains "no studio" "$OUTPUT" "[build studio]"
assert_not_contains "no app" "$OUTPUT" "[build app]"
assert_not_contains "no admin" "$OUTPUT" "[build admin]"
assert_not_contains "no docs" "$OUTPUT" "[build docs]"
assert_not_contains "no links" "$OUTPUT" "[build links]"
assert_not_contains "no storybook" "$OUTPUT" "[build storybook]"
assert_not_contains "no www" "$OUTPUT" "[build www]"
# With all lines excluded, there should be no output sections
assert_not_contains "no sections at all" "$OUTPUT" "###"
echo ""

# ─── Test 10: [build xxx] with multi-word and comma-separated app names ───
echo "Test 10: [build xxx] variants are excluded"
INPUT="[build all] ([aaa](https://x/a))
[build studio www] ([bbb](https://x/b))
[build studio,www] ([ccc](https://x/c))
[build studio, www, admin] ([ddd](https://x/d))
[build app,studio,admin,docs] ([eee](https://x/e))
feat: real feature ([fff](https://x/f))"

OUTPUT=$(echo "$INPUT" | bash "$SCRIPT")
assert_not_contains "[build all] excluded" "$OUTPUT" "[build all]"
assert_not_contains "[build studio www] excluded" "$OUTPUT" "[build studio www]"
assert_not_contains "[build studio,www] excluded" "$OUTPUT" "[build studio,www]"
assert_not_contains "[build studio, www, admin] excluded" "$OUTPUT" "[build studio, www, admin]"
assert_not_contains "[build app,studio,admin,docs] excluded" "$OUTPUT" "[build app,studio,admin,docs]"
assert_contains "real feature still present" "$OUTPUT" "real feature"
assert_not_contains "no Other section" "$OUTPUT" "### 📝 Other"
echo ""

# ─── Results ───
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Results: $PASS passed, $FAIL failed"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
[ "$FAIL" -eq 0 ]
