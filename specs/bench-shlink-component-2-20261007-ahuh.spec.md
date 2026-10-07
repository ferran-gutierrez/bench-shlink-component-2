---
name: Browser redirect rule conditions
description: Create, edit, and display browser-based redirect rule conditions gated by Shlink 5.1.0+
targets:
  - ../src/utils/features.ts
  - ../src/redirect-rules/helpers/RedirectRuleModal.tsx
  - ../src/redirect-rules/helpers/RedirectRuleCard.tsx
---

# Browser redirect rule conditions

Shlink 5.1.0 adds redirect rule conditions that match the visitor's browser. The redirect rules UI must support that condition type with the same version-gated server feature pattern used for other redirect conditions.

## Requirements

- **REQ-1** The `browserRedirectConditions` server feature is registered with minimum Shlink version `5.1.0`, so feature resolution enables it for server versions `5.1.0` and newer and disables it for older versions.
  `[@test] ../test/utils/features.test.ts`

- **REQ-2** When `browserRedirectConditions` is disabled, the redirect rule modal condition type selector does not offer a "Browser" option.
  `[@test] ../test/redirect-rules/helpers/RedirectRuleModal.test.tsx`

- **REQ-3** When `browserRedirectConditions` is enabled, the condition type selector lists "Browser" after every other supported condition type (including date conditions when those are enabled).
  `[@test] ../test/redirect-rules/helpers/RedirectRuleModal.test.tsx`

- **REQ-4** When the Browser condition type is selected, the modal shows a select labelled `Browser:` whose options are Google Chrome (`chrome`), Mozilla Firefox (`firefox`), Microsoft Edge (`edge`), Safari (`safari`), Opera (`opera`), and Android browser (`android_browser`).
  `[@test] ../test/redirect-rules/helpers/RedirectRuleModal.test.tsx`

- **REQ-5** Saving a redirect rule with a browser condition sends `{ type: 'browser', matchValue: '<selected browser value>', matchKey: null }` to the save handler.
  `[@test] ../test/redirect-rules/helpers/RedirectRuleModal.test.tsx`

- **REQ-6** Editing a redirect rule that already contains a browser condition opens the modal with that browser value selected in the Browser select.
  `[@test] ../test/redirect-rules/helpers/RedirectRuleModal.test.tsx`

- **REQ-7** On a redirect rule card, a browser condition is shown as `Browser is <matchValue>` (for example `Browser is chrome`), using the stored match value rather than the select label.
  `[@test] ../test/redirect-rules/helpers/RedirectRuleCard.test.tsx`

## Assumptions

- The `@shlinkio/shlink-js-sdk` API contract exposes `browser` as a valid `ShlinkRedirectConditionType`; if the current devDependency version lacks it, upgrading the devDependency (within existing peer dependency ranges) is acceptable to satisfy typing and tests.
- A new browser condition starts with `matchValue: null` until the user picks a browser, matching the placeholder pattern used for device type conditions (`- Select type -`).
- Switching an existing condition to Browser clears `matchKey` and resets `matchValue` to `null`, consistent with the modal's existing type-switch behaviour.
