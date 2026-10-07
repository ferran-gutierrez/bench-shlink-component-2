---
name: Local timezone visit date filters
description: Visit date interval filters (Today, Yesterday, Last N days) and interval preselection must use the user's local calendar day boundaries instead of UTC, with regression tests that pass on UTC CI.
targets:
  - src/utils/dates/helpers/dateIntervals.ts
  - test/utils/dates/helpers/dateIntervals.test.ts
---

# Local timezone visit date filters

Visit statistics screens resolve preset date intervals through `intervalToDateRange` and preselect an interval from the latest visit via `dateToMatchingInterval` in `src/utils/dates/helpers/dateIntervals.ts`. Those helpers currently truncate days with UTC (`getUTC*` day fields), which shifts Today, Yesterday, and Last N days for users outside UTC and misaligns fallback intervals when visits load.

## Requirements

- **REQ-1** When `intervalToDateRange('today')` runs, `startDate` is the start of the current local calendar day and `endDate` is the end of the current local calendar day (inclusive), using the same local timezone as the runtime `Date` object (the user's browser timezone in production).
  `[@test] ../test/utils/dates/helpers/dateIntervals.test.ts`

- **REQ-2** When `intervalToDateRange('yesterday')` runs, the range covers the full previous local calendar day from its local start through its local end (inclusive).
  `[@test] ../test/utils/dates/helpers/dateIntervals.test.ts`

- **REQ-3** For each of `last7Days`, `last30Days`, `last90Days`, `last180Days`, and `last365Days`, `intervalToDateRange` returns a range from local start of the calendar day exactly N days before today through local end of today (inclusive), matching the existing inclusive “last N days including today” semantics but with local day boundaries.
  `[@test] ../test/utils/dates/helpers/dateIntervals.test.ts`

- **REQ-4** `dateToMatchingInterval` classifies a visit timestamp into the same preset intervals using the local day boundaries defined in REQ-1 through REQ-3 (most specific matching interval first, then `all` when none match).
  `[@test] ../test/utils/dates/helpers/dateIntervals.test.ts`

- **REQ-5** When the effective local timezone is UTC, `intervalToDateRange` and `dateToMatchingInterval` produce the same ranges and interval labels as before this change for fixed reference instants (UTC users see no behavior change).
  `[@test] ../test/utils/dates/helpers/dateIntervals.test.ts`

- **REQ-6** On dates when daylight saving time starts or ends in `America/Los_Angeles`, local Today and Last 7 days ranges still align to local calendar dates (23/25-hour civil days do not shift the calendar labels).
  `[@test] ../test/utils/dates/helpers/dateIntervals.test.ts`

- **REQ-7** Regression (America/Los_Angeles): with the clock fixed at 2024-06-14 10:00 in `America/Los_Angeles`, `intervalToDateRange('today')` includes a visit at 2024-06-14 09:00 local and excludes a visit at 2024-06-13 20:00 local; a visit at 2024-06-14 18:00 local is included in Today and excluded from Yesterday.
  `[@test] ../test/utils/dates/helpers/dateIntervals.test.ts`

- **REQ-8** Regression (Pacific/Auckland): with the clock fixed at 2024-06-15 08:00 in `Pacific/Auckland`, `intervalToDateRange('today')` and `intervalToDateRange('yesterday')` use Auckland local midnights, not UTC midnights (a visit shortly after local midnight on the 15th falls under Today, not Yesterday).
  `[@test] ../test/utils/dates/helpers/dateIntervals.test.ts`

- **REQ-9** With the same fixed clocks as REQ-7, `dateToMatchingInterval` maps the latest visit timestamps from those examples to `today` or `yesterday` consistently with the ranges in REQ-7 (covering visit-load interval preselection).
  `[@test] ../test/utils/dates/helpers/dateIntervals.test.ts`

## Assumptions

- Local timezone means the JavaScript environment’s local timezone (`Date` getters / `date-fns` `startOfDay` and `endOfDay`), which matches end users running the Shlink web client in their browser.
- Non-UTC regression tests (REQ-6 through REQ-9) run in Vitest browser mode on CI (UTC host) by overriding the browser’s effective timezone inside the test file (for example Playwright/CDP timezone emulation or an explicit IANA timezone parameter on internal day-boundary helpers exposed only for tests), without editing protected config files under `contract.paths.checkDefinitions`.
- “Last N days” remains inclusive of today and starts at local midnight on the calendar day N days before today, preserving current product semantics aside from the UTC-to-local boundary fix.
- Fixing REQ-1 through REQ-4 in `dateIntervals.ts` is sufficient for visit filters and `fallbackToInterval` preselection; no separate visits reducer changes are required unless tests prove otherwise.
- No new npm dependencies are required; existing `date-fns` helpers already imported in `dateIntervals.ts` are preferred over adding timezone libraries.
