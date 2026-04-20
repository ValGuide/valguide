---
title: "Platform Abstractions"
---

ValGuide should remain deployable across hosting providers, Postgres providers, object storage providers, and image delivery providers. Cloudflare is an implementation option, not a product-level dependency.

## Rule

Product code and feature code must depend on provider-neutral interfaces. Vendor-specific code belongs in explicit adapter modules.

## Current Boundaries

- KV access goes through the shared key-value abstractions in `packages/core/features/platform/`
- Object storage goes through the shared storage abstractions in `packages/core/features/storage/`
- Image delivery and asset URL generation go through the shared asset abstractions in `packages/core/features/assets/`

## What To Avoid

- Direct `cloudflare:*` runtime imports in feature modules
- Direct use of `KVNamespace` or other vendor runtime bindings in business logic
- Embedding provider branching in multiple call sites instead of one shared abstraction
- Introducing new vendor-specific environment variable names when a neutral name fits the concern

## What To Do Instead

- Add or extend a shared interface first
- Put provider-specific code behind a named adapter
- Keep fallback compatibility only where migration requires it
- Treat Docker or generic Node hosting as a first-class target when making runtime decisions

## Migration Direction

When touching storage, asset delivery, caching, or runtime code, prefer moving the code further toward the shared abstraction instead of adding another direct Cloudflare dependency.
