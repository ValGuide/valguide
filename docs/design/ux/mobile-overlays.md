---
title: "Mobile Overlay Rules"
---

Use three overlay buckets on mobile:

1. Keep compact alerts for short confirm or cancel decisions with no meaningful input.
2. Use responsive bottom sheets for pickers, selectors, and lightweight forms with stable bottom actions when confirmation is required.
3. Use full-height mobile overlays for longer forms, typed confirmations, file handling, or device-heavy tasks.

Implementation rules:

- Use `ResponsiveDialog` for non-destructive editing and selection flows.
- Use `mobileVariant="sheet"` for tall bottom sheets.
- Use `mobileVariant="full-height"` for longer mobile tasks.
- Keep `AlertDialog` separate for desktop destructive confirmations.
- Do not convert immersive media or scanner experiences into shallow sheets.
