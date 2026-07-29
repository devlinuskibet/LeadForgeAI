# Changelog

## [Phase 9] - 2026-07-29

### Added
- Real email delivery, tracking & analytics infrastructure.
- Added `opened_at` and `replied_at` timestamp columns to `EmailMessage`.
- Created `/api/emails/webhook/{provider_name}` webhook ingestion endpoint.
- Added automatic background simulation task (`simulate_email_events_task`) for delivery and open events.
- Updated Dashboard API to return live `emails_sent`, `emails_opened`, and `emails_replied` metrics.
- Added timeline visual status icons for `Delivered`, `Opened`, and `Replied` activity entries.
- Expanded company details API response to surface discovery & Google rating attributes.

### Fixed
- Resolved hardcoded `mockUuid` in `CompanyDetails.tsx` to bind properly to route ID parameters.
- Added safety check for `company.tags` mapping in frontend views.
