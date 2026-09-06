# Changelog

All notable changes to InvoiceInspector are documented in this file.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [Unreleased]

### Added
- Due-date and currency filters, due-date column and sorting, and overdue totals in all five languages.
- Filtered CSV/JSON exports across all pages and an invoice register with one row per invoice.
- Versioned JSON backups for the complete local invoice collection, with a safe merge restore for browser or device changes.
- Optional self-hosted Go sync server with per-user tokens, shared or separate workspaces, ETag conflict protection and browser controls for explicit upload/download.
- Configurable sync-server storage: preserve the full backup JSON or retain only its invoice data array.
- Optional PDF attachment storage directly in the backend, excluded from all browser persistence and protected against conflicting replacement files.
- Server capability endpoint and client-side sync configuration panel, including opt-in automatic PDF transfer and a single-file JSON server configuration.
- Business workflow browser tests covering IndexedDB persistence, currency totals, due dates, export contents and pagination.
- Accessible line-item search with result counts in German, English, French, Italian and Spanish; printing and exports retain all items.
- Browser regression tests for CII, UBL Invoice/CreditNote, amount handling, search, printing and translations.
- `CONTRIBUTING.md` with contributor guidelines
- `CHANGELOG.md` (this file)
- OpenGraph, canonical URL, license and publiccode discovery meta tags in
  `index.html`
- `landingURL`, `features`, maintainer contact and `genericName` for all
  languages in `publiccode.yml`
- Self-contained inline QR Code encoder (ISO/IEC 18004, byte mode, all
  versions and ECC levels) replacing the external `qrcode@1.5.1` CDN
  dependency. EPC SEPA QR generation now works fully offline.

### Changed
- Build line-item rows in a document fragment and cache searchable text.
- Preserve unit-price precision in parsed data and include price base quantities.
- Removed the redundant `<script src=".../pdf.worker.min.js">` tag in
  `index.html`. The worker is already instantiated by PDF.js via
  `GlobalWorkerOptions.workerSrc`, so the extra script tag was downloading
  the ~1 MB worker a second time without serving any purpose.
- Reduced third-party CDN dependencies from three (`pdf.min.js`,
  `pdf.worker.min.js`, `qrcode.min.js`) to one (`pdf.min.js`).
- Refreshed visible standards references across the UI, documentation and
  public metadata to the current released baselines: ZUGFeRD 2.4 / Factur-X
  1.0.8, XRechnung 3.0.x, Peppol BIS Billing 3.0, UBL 2.1/2.3 and
  EN 16931-1:2026.

### Fixed
- Keep outstanding totals separate by currency; exclude credit notes, detected duplicates, zero amounts and completed records.
- Validate calendar dates before overdue classification and put missing due dates last when sorting.
- Avoid stale asynchronous collection renders overwriting newer filter results.
- Add spreadsheet formula escaping, UTF-8 BOM and price-base quantities to CSV exports.
- Preserve CII zero totals and declared line net amounts instead of always recomputing price × quantity.
- Account for price base quantities when falling back to calculated CII/UBL line totals.
- Display tax-exclusive net totals while validating lines against the separate line-total amount.
- Reject malformed numeric strings instead of accepting numeric prefixes in `parseAmount`.
- Recognize PDF files by extension when their MIME type is absent.
- License badge in `README.en.md` corrected from MIT to GPL-2.0
- Misplaced root-level `genericName` in `publiccode.yml` moved into each
  language description block
- Missing `genericName` added for French (`fr`) and Italian (`it`) descriptions
  in `publiccode.yml`

## [1.0.0] – 2026-02-28

### Added
- Initial stable release
- Client-side ZUGFeRD / Factur-X PDF parsing via PDF.js
- XRechnung and EN 16931 CII XML parsing
- UBL invoice detection with fallback XML display
- Four-language UI: German, English, French, Italian
- Dark mode support (respects `prefers-color-scheme`)
- EPC QR code generation for SEPA payments
- Local invoice collection with IndexedDB / LocalStorage fallback
- Multi-format export: XML, PDF, JSON, CSV
- IBAN checksum validation
- `publiccode.yml` for EU Open Source Solutions Catalogue compatibility
