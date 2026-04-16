---
title: "i18n Tooling"
---

Scripts for managing translation keys in ValGuide.

## Type Safety

Translation keys are type-checked at compile time via `packages/core/i18n/global.d.ts`:

```typescript
import type en from './messages/en.json'

type Messages = typeof en

declare module 'use-intl' {
  interface AppConfig {
    Messages: Messages
  }
}
```

This provides:
- **Autocomplete** for translation keys in your editor
- **Compile-time errors** when using non-existent keys
- **Refactoring support** when renaming keys

Run `val type-check` to catch missing keys before runtime.

## Commands

| Command | Description |
|---------|-------------|
| `pnpm i18n:check` | Validate locale files are in sync |
| `pnpm i18n:unused` | Find unused translation keys |
| `pnpm i18n:prune --dry-run` | Preview keys that would be removed |
| `pnpm i18n:prune` | Remove unused keys from all locales |

## Validating Locale Files

```bash
pnpm i18n:check
```

Validates that all locale files are in sync:

- **Missing keys**: Reports keys in `en.json` that are missing from other locales (`de.json`, `rm.json`)
- **Extra keys**: Warns about keys in other locales that don't exist in `en.json`
- **Duplicate keys**: Detects duplicate keys within the same file (which JSON silently overwrites)

Run this in CI to ensure translations stay consistent across locales.

## Finding Unused Keys

```bash
pnpm i18n:unused
```

Scans the codebase using AST parsing (ts-morph) and reports translation keys that aren't used anywhere.

## Removing Unused Keys

```bash
pnpm i18n:prune --dry-run  # Preview changes
pnpm i18n:prune            # Remove unused keys
```

Removes unused keys from all locale files (`en.json`, `de.json`, `rm.json`). **Always run with `--dry-run` first** to review what will be deleted.

## How It Works

The scripts use ts-morph for AST parsing to accurately detect key usage:

1. Finds all files using `useTranslations` or `getTranslations`
2. Tracks namespace bindings: `const t = useTranslations('namespace')`
3. Detects key usage: `t('key')`, `t.rich('key')`, etc.
4. Handles ternary expressions in both namespaces and keys
5. Supports `// i18n-used-keys` comments for dynamic keys

### Detected Patterns

```typescript
// ✅ Simple namespace + key
const t = useTranslations('tours')
t('title')  // → guides.title

// ✅ Ternary namespace
const t = useTranslations(isLogin ? 'login' : 'signup')
t('welcome')  // → login.welcome, signup.welcome

// ✅ Ternary key
t(isActive ? 'active' : 'inactive')  // → both keys detected

// ✅ Method variants
t.rich('richKey', { ... })
t.markup('markupKey')
```

## Marking Dynamic Keys as Used

For keys that can't be statically detected (variables, template literals), add a comment:

```typescript
// i18n-used-keys: guide.previewCard.draft, guide.previewCard.published
const t = useTranslations('tour.previewCard')

// This variable-based usage would otherwise be missed
{t(status)}  // status is 'draft' | 'published'
```

The comment must use fully-qualified keys (including namespace).

## Limitations

- **Template literals**: `t(\`prefix.${variable}\`)` won't be detected
- **Variable keys**: `t(someVariable)` won't be detected (use `i18n-used-keys` comment)
- **Indirect references**: Keys passed through multiple variables won't be traced

Always review the `--dry-run` output before pruning.

## Best Practices

1. **Run `i18n:check` in CI** to catch missing translations early
2. **Run `i18n:unused` periodically** to find dead keys
3. **Always use `--dry-run` first** before pruning
4. **Add `i18n-used-keys` comments** when using dynamic keys
5. **Run `val type-check`** after pruning to verify no used keys were removed
