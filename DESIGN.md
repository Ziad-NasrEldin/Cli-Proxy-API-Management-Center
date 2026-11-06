---
name: API Hub
description: Warm neutral management UI with a compact account quota ledger.
colors:
  primary: "#8b8680"
  light-page: "#faf9f5"
  light-surface: "#f0eee8"
  light-hover: "#e9e6df"
  light-text: "#2d2a26"
  light-secondary-text: "#6d6760"
  light-border: "#e3e1db"
  dark-page: "#151412"
  dark-surface: "#1d1b18"
  dark-hover: "#262320"
  dark-text: "#f6f4f1"
  dark-secondary-text: "#c9c3bb"
  dark-border: "#3a3530"
  success: "#10b981"
  quota-medium-light: "#e0aa14"
  quota-medium-dark: "#ffd862"
  danger: "#c65746"
typography:
  identity:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif"
    fontSize: "15px"
    fontWeight: 650
    lineHeight: 1.45
  quota-value:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif"
    fontSize: "27px"
    fontWeight: 650
    lineHeight: 1
    letterSpacing: "-0.025em"
  quota-label:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif"
    fontSize: "13px"
    fontWeight: 600
    lineHeight: 1.4
  metadata:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif"
    fontSize: "12px"
    lineHeight: 1.4
rounded:
  sm: "4px"
  md: "8px"
  lg: "12px"
  full: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
  2xl: "48px"
components:
  button-primary:
    rounded: "{rounded.md}"
    padding: "10px 14px"
  button-secondary:
    rounded: "{rounded.md}"
    padding: "10px 14px"
  button-ghost:
    rounded: "{rounded.md}"
    padding: "10px 14px"
  input:
    rounded: "{rounded.md}"
    padding: "10px 12px"
  card:
    rounded: "{rounded.lg}"
    padding: "{spacing.lg}"
---

# Design System: API Hub

## Overview

**Creative North Star: "Account ledger"** (descriptive shorthand for the implemented quota surface).

API Hub retains its existing logo and warm neutral light/dark themes. The quota surface uses a compact account ledger: identity, capacity and actions remain easy to compare, with secondary information disclosed on demand. This is a record of the implemented existing-theme design, not a newly selected brand identity.

**Key Characteristics:**

- Warm neutral surfaces with restrained borders.
- Full account identities and explicit quota semantics.
- Compact desktop rows that stack on smaller screens.

## Colors

Warm grays frame the interface in both themes. The frontmatter records resolved light/dark values; implementation uses the semantic custom properties in `src/styles/themes.scss`. The existing white theme remains a neutral variant.

- **Primary:** muted warm gray for shared controls; the quota refresh button instead inverts primary text and page background.
- **Semantic:** emerald indicates available capacity, amber flags reduced capacity, and terracotta marks low capacity or errors. Provider color stays in existing icons.
- **Neutral:** page, surface, hover, text and border roles change together across themes. Use secondary text for metadata, never the faintest text token for essential quota information.

**The Meaning Before Color Rule.** Label remaining capacity and each time window explicitly; color supplements the numbers.

## Typography

The incumbent system sans stack supplies interface text; no new display family was introduced. Quota values and reset times use tabular numerals. Shared count badges use the existing monospace stack.

The quota page title is compact (26–30px, weight 700), followed by account identities, numerical values, window labels and metadata using the frontmatter roles. On phones, quota values reduce to 25px. These are operational data roles, not a promotional display scale.

**The Full Identity Rule.** Account identifiers wrap instead of truncating. Keep the subscription beside the provider metadata.

## Layout

The quota page uses one bordered ledger rather than detached cards. Desktop rows place identity, quota windows and actions in three columns; windows distribute into available width. Five accounts fit the specified 1920 × 1080 viewport with details collapsed; larger sets scroll normally.

At 1200px and below, rows use two columns and move actions beneath quotas. At 760px and below, identity, windows and actions stack. Windows remain two columns below 600px and become one below 340px. Provider tabs scroll horizontally; search and sorting wrap. Shared spacing follows the frontmatter scale, with tighter local gaps for metadata.

## Elevation & Depth

Ledger rows are flat, separated by fine borders. Expanded detail panels use the alternate surface tone. Existing shared cards retain a subtle theme shadow; floating shell controls use stronger shadows. The refresh action gains a shadow on hover. Do not apply that elevated treatment to every account row.

## Shapes

Shared controls use gently rounded corners, with larger corners on containing surfaces and fully rounded count badges. The ledger has a single outer boundary; thin, softly rounded quota tracks sit inside rows. Preserve the existing API Hub logo asset rather than redrawing it.

## Components

- **Buttons:** shared primary, secondary and ghost variants use theme variables. Quota reset and refresh controls use compact outlined actions, visible focus outlines and disabled opacity. On phones their minimum height increases to 40px.
- **Inputs:** shared fields use a thin border and a focus ring. The quota search uses a quiet page-tone background and a focus-within outline.
- **Navigation and counts:** provider tabs use an active underline, stronger text and small pill counts. Brand colors belong to provider icons.
- **Account ledger:** identity and plan remain visible alongside every account. Each quota window contains its label, remaining value, track, reset countdown and exact date/time. Missing observations read unavailable. Group names distinguish provider model families where needed.
- **Disclosure and feedback:** Details reveals secondary balances, source data and grants. The reset timeline is a separate disclosure. Reset feedback appears in the action area and spans its desktop action columns, independent of the collapsed details.
- **Motion:** short hover and press feedback follows existing motion tokens; reduced-motion overrides suppress the quota control transforms and spinner animation. Quota bars change without a width transition.

## Do's and Don'ts

### Do:

- Do use the existing API Hub logo and theme variables.
- Do show five-hour and weekly limits separately, with countdown and exact reset time when reported.
- Do keep action feedback visible beside actions while secondary grant details stay collapsed.

### Don't:

- Don't substitute zero for unavailable provider data.
- Don't clip account identities, quota labels or reset times.
- Don't promote provider colors into competing page backgrounds.
