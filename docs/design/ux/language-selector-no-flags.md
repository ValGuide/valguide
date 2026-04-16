---
title: "Language Selector: Why We Don't Use Country Flags"
---

## Decision

ValGuide uses **text-only language names** (native + English) in language selectors — never country flag emojis.

## The Problem

It's tempting to use country flags (🇫🇷 🇩🇪 🇪🇸) as visual identifiers for languages. They're colourful, instantly recognisable, and easy to implement with emoji. But **countries are not languages**, and conflating the two creates real problems.

## Why Flags Don't Work for Languages

### 1. Languages span many countries

- Spanish is spoken in 20+ countries. Picking 🇪🇸 excludes Latin America.
- English could be 🇬🇧, 🇺🇸, 🇦🇺, 🇮🇳, or dozens of others.
- Arabic is used across the entire MENA region — 🇸🇦 represents only one country.
- Portuguese speakers in Brazil (🇧🇷) outnumber those in Portugal (🇵🇹) by 20:1.

### 2. Some languages have no country

- **Romansh** is a language of Switzerland, not a country.
- **Basque**, **Catalan**, **Welsh**, **Kurdish** — all are stateless languages with no sovereign flag.
- Assigning them a "host country" flag (e.g., Basque → 🇪🇸) is politically incorrect and can be offensive to speakers.

### 3. Political sensitivity

- Flags represent sovereignty and national identity — picking one can be interpreted as taking a political stance.
- Some territories and flags are actively contested.

### 4. Accessibility

- Screen readers announce flag emoji as "flag of Spain", not "Spanish" — confusing for visually impaired users.
- Emoji rendering varies across platforms and can appear inconsistent or broken in enterprise environments.

### 5. CMS context matters

Museum curators are performing a **correctness task** — adding translations to tours. Decorative visual cues that are sometimes wrong are a net-negative for confidence and trust.

## What We Do Instead

### Add Language Dialog

Each language row shows:

- **Native language name** as the primary label (e.g., "Français", "Deutsch", "日本語")
- **English name + locale code** as secondary text (e.g., "French (fr)")
- **Search** across both native and English names

### Locale Selector (trigger button)

- **Globe icon** — a neutral, universally understood symbol for "language"
- **English language name** as the label
- **Status badge** (Published / Draft / Empty) when applicable

## What Best-in-Class Apps Do

| App | Approach |
|-----|----------|
| **Crowdin** | Text-only language names, no flags |
| **Lokalise** | Text-only with locale codes |
| **Phrase** | Text-only with search |
| **Figma** | Text-only language list |
| **Notion** | Text-only, grouped by script |
| **Linear** | Text-only settings |

The industry consensus: flags are for **country/region selection** (e.g., shipping address), not language selection.

## When Flags Are Appropriate

Flags are fine when the selection is explicitly about a **country or region**, not a language:

- Shipping destination
- Phone number country code (we use this in `PhoneInput`)
- Tax/legal jurisdiction

## Implementation

- `getLocaleDisplayName(locale)` — returns English name (e.g., "French")
- `getLocaleNativeName(locale)` — returns native name (e.g., "Français")
- Both live in `apps/studio/src/features/tours/components/unified-locale-selector.tsx`

## References

- [W3C: Language tags and locale identifiers](https://www.w3.org/International/articles/language-tags/)
- [Unicode CLDR](https://cldr.unicode.org/) — the standard for locale display names
- [Why flags do not represent languages](https://www.flagsarenotlanguages.com/blog/why-flags-do-not-represent-languages/)
