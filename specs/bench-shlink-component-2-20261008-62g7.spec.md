---
name: Browser redirect rule conditions
description: Support creating, editing, and displaying browser-based redirect rule conditions when the Shlink server is 5.1.0 or newer.
targets:
  - src/utils/features.ts
  - src/redirect-rules/helpers/RedirectRuleModal.tsx
  - src/redirect-rules/helpers/RedirectRuleCard.tsx
  - test/utils/features.test.ts
  - test/redirect-rules/helpers/RedirectRuleModal.test.tsx
  - test/redirect-rules/helpers/RedirectRuleCard.test.tsx
---

- **REQ-1** The `browserRedirectConditions` server feature is registered in `supportedFeatures` with minimum version `5.1.0`, included in the feature map returned by `getFeaturesForVersion`, and enabled for server version `5.1.0` but disabled for `5.0.0`.
  `[@test] ../test/utils/features.test.ts`

- **REQ-2** In the redirect rule modal, when `browserRedirectConditions` is disabled via `FeaturesProvider`, the condition type select does not list a `Browser` option even when `dateRedirectConditions` and other version-gated condition types are enabled.
  `[@test] ../test/redirect-rules/helpers/RedirectRuleModal.test.tsx`

- **REQ-3** When `browserRedirectConditions` is enabled together with all other redirect condition features, the condition type select lists `Browser` as the last option, immediately after `After date` (for example, with every feature flag on, the option labels end with `…, Before date, After date, Browser`).
  `[@test] ../test/redirect-rules/helpers/RedirectRuleModal.test.tsx`

- **REQ-4** When the condition type is `browser`, the modal shows a select labelled `Browser:` whose options appear in this order with the given labels and values: Google Chrome (`chrome`), Mozilla Firefox (`firefox`), Microsoft Edge (`edge`), Safari (`safari`), Opera (`opera`), Android browser (`android_browser`).
  `[@test] ../test/redirect-rules/helpers/RedirectRuleModal.test.tsx`

- **REQ-5** Submitting the redirect rule modal with a browser condition persists `{ type: 'browser', matchValue: 'firefox', matchKey: null }` when Mozilla Firefox is selected (and not when another type such as `device` is chosen instead).
  `[@test] ../test/redirect-rules/helpers/RedirectRuleModal.test.tsx`

- **REQ-6** Opening the redirect rule modal to edit a rule whose conditions include `{ type: 'browser', matchValue: 'safari', matchKey: null }` shows the `Browser:` select with `safari` selected so the user can change it.
  `[@test] ../test/redirect-rules/helpers/RedirectRuleModal.test.tsx`

- **REQ-7** On a redirect rule card, a browser condition with `matchValue` `chrome` is rendered as the text `Browser is chrome` (using the stored match value, not the human-readable browser label).
  `[@test] ../test/redirect-rules/helpers/RedirectRuleCard.test.tsx`

## Assumptions

- Switching a condition to type `browser` starts with `matchValue: null` and `matchKey: null` until the user picks a browser, matching other select-based condition types such as device and country.
- The rule card always displays the raw API `matchValue` (for example `chrome`), consistent with the request example `Browser is chrome`.
- The `@shlinkio/shlink-js-sdk` api-contract exposes `browser` as a valid `ShlinkRedirectConditionType`; if the dependency version on the branch does not yet include it, bumping `@shlinkio/shlink-js-sdk` in `package.json` is in scope when required for type-checking.
- No changes to protected config files, CI definitions, or unrelated redirect-rule behaviour are required beyond wiring the new feature flag and UI paths listed in `targets`.
