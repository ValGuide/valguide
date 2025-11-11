/**
 * ESLint rule to enforce i18n usage and prevent hardcoded strings in JSX
 * Inspired by @bigbinary/eslint-plugin-neeto
 */

const WHITELISTED_PROPS = new Set([
  'className',
  'classNames',
  'key',
  'id',
  'data-testid',
  'type',
  'name',
  'role',
  'aria-label',
  'htmlFor',
  'accept',
  'rel',
  'target',
  'method',
  'as',
  'variant',
  'size',
])

const BLACKLISTED_PROPS = new Set([
  'label',
  'title',
  'description',
  'placeholder',
  'alt',
  'aria-description',
  'content',
])

/** @type {import('eslint').Rule.RuleModule} */
export const noHardcodedStrings = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Enforce i18n usage instead of hardcoded strings',
      category: 'Best Practices',
      recommended: false,
    },
    messages: {
      hardcodedString:
        'Hardcoded string "{{text}}" should be translated using useTranslations or getTranslations from next-intl',
    },
    schema: [],
  },
  create(context) {
    return {
      JSXText(node) {
        const text = node.value.trim()
        // Ignore empty strings and strings with only whitespace
        if (!text) return

        // Only flag strings that contain a space (likely to be user-facing text)
        if (text.includes(' ')) {
          context.report({
            node,
            messageId: 'hardcodedString',
            data: { text: text.substring(0, 50) },
          })
        }
      },
      JSXAttribute(node) {
        if (node.value && node.value.type === 'Literal' && typeof node.value.value === 'string') {
          const propName = node.name.name
          const text = node.value.value.trim()

          // Skip empty strings
          if (!text) return

          // Skip whitelisted props
          if (WHITELISTED_PROPS.has(propName)) return

          // Always flag blacklisted props
          if (BLACKLISTED_PROPS.has(propName)) {
            context.report({
              node: node.value,
              messageId: 'hardcodedString',
              data: { text: text.substring(0, 50) },
            })
            return
          }

          // For other props, only flag if contains space
          if (text.includes(' ')) {
            context.report({
              node: node.value,
              messageId: 'hardcodedString',
              data: { text: text.substring(0, 50) },
            })
          }
        }
      },
    }
  },
}
