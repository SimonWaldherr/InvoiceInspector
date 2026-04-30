# Changelog

All notable changes to InvoiceInspector are documented in this file.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [Unreleased]

### Added
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
