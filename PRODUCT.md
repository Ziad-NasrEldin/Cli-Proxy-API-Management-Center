# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

The owner inspects pooled coding-provider accounts through API Hub on their private Tailscale network.

## Product Purpose

Make each account's remaining capacity, subscription and reset times clear at a glance, with working quota refresh and reset actions.

## Capabilities and Constraints

The dashboard uses CLIProxyAPI's v8 Management API. Keep hash routing, authentication, provider-specific quota behavior and single-file deployment. A provider may have up to ten accounts. The owner chose 1920 × 1080 as the desktop target; five accounts should fit without scrolling. Smaller screens must remain readable and responsive.

## Brand Commitments

Use the existing API Hub logo from the local EasyCLIProxyAPI project. Support light and dark themes. Minimal text, clear account identities, explicit remaining/used semantics, distinct weekly and five-hour windows, visible resets and subscription types. Never clip important text.

## Evidence on Hand

Five supplied quota-dashboard reference images, the installed dashboard, five local Codex accounts, eight local Antigravity accounts and the API Hub branding assets.

## Product Principles

- Identity and meaning before decoration.
- Show actual provider data; unknown is not zero.
- Keep essential comparisons in the first viewport.
- Put secondary detail behind a deliberate disclosure.
