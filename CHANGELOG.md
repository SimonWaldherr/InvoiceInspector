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
