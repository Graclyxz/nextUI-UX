---
"@nextui-ux/react": minor
---

Establish the canonical variant contract: shared `intent` (default/secondary/outline/ghost/destructive) and `size` (sm/md/lg) vocabulary in an internal `variants` module. **BREAKING (pre-1.0):** the `variant` prop on `Button` and `Badge` is renamed to `intent`. Button gains the `secondary` intent; Badge gains the `ghost` intent.
