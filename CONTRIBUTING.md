# Contributing to InvoiceInspector

Thank you for your interest in contributing to InvoiceInspector! Contributions
in the form of bug reports, feature requests, translations, and pull requests
are welcome.

## Getting started

InvoiceInspector is primarily a **single-file** web application (`index.html`).
There is no frontend build step or package manager: open the file directly in a
browser and you're done. The optional sync server in `cmd/sync-server` requires
Go 1.22 or newer, but has no third-party dependencies.

```bash
git clone https://github.com/SimonWaldherr/InvoiceInspector.git
cd InvoiceInspector
# Open in your browser
open index.html          # macOS
xdg-open index.html      # Linux
start index.html         # Windows
```

## Reporting issues

1. Search [existing issues](https://github.com/SimonWaldherr/InvoiceInspector/issues)
   first.
2. If not found, open a new issue and include:
   - A short description of the problem.
   - Steps to reproduce (ideally with a minimal test file).
   - The browser and OS version you are using.
   - Any error messages from the browser console.

## Submitting pull requests

1. Fork the repository and create a feature branch:
   ```
   git checkout -b feature/your-feature
   ```
2. Make your changes in `index.html` (and documentation files as needed).
3. Test your changes in at least two browsers (e.g. Firefox and Chrome).
4. Keep the single-file design — do not introduce build steps or external
   assets unless strictly necessary.
5. Open a pull request against the `main` branch and describe your changes.

## Adding or improving translations

The UI strings live in the `LABELS` object inside `index.html`. To add or
correct a translation:

1. Find the relevant language key (`de`, `en`, `fr`, `it`).
2. Add or update the string values.
3. Test the language by clicking the corresponding language button in the UI.
4. If adding a new language, also update `publiccode.yml` (`availableLanguages`)
   and the language button list in the HTML.

## Code style

- Keep JavaScript in **strict mode** (`"use strict"`).
- Use `const`/`let`; avoid `var`.
- Keep functions small and focused.
- Prefer `escapeHtml()` for all user-visible string interpolation to avoid XSS.

## License

By submitting a contribution you agree that your code will be licensed under
the [GNU General Public License v2.0](LICENSE).

## Browser regression tests

The application still has no build step or runtime package dependency. The
optional test runner requires Node.js, Playwright, and installed Chrome and Edge:

```bash
node tests/regression.cjs
node tests/business.cjs
node tests/workspace.cjs
node tests/invoice-view.cjs
node tests/import.cjs
# To run a single installed browser:
BROWSER_CHANNELS=chrome node tests/regression.cjs
```

Make `playwright` available through your development environment or `NODE_PATH`.
Tests use synthetic invoices and block external requests. They cover CII and UBL
Invoice/CreditNote parsing, zero totals, declared versus calculated line amounts,
price bases, precision, search, printing and the five UI languages.

Business tests additionally exercise the collection using synthetic records in an
isolated browser profile: due-date/currency filtering, currency totals, persisted
settings, sorting, all-pages exports, and actual CSV/JSON downloads.

Workspace tests cover selection across pages, selected exports, bulk status updates,
comment preservation, persistence, filter changes, storage failures, all five UI
languages and responsive light/dark layouts. Set `SCREENSHOT_DIR` to save screenshots.

Invoice-view tests cover summary values, source availability, XML downloads,
keyboard navigation, close/restore, language changes, missing fields, malformed
XML, responsive themes and print behavior.

Import tests exercise mixed batches, format rejection, persistence before
completion, duplicate identities, original-source preservation, repeated file
selection, cancellation, concurrent import protection, all five languages,
storage failures, older collection keys and PDF resource cleanup. Parsers remain
synchronous; the import controller owns collection persistence.

## Optional sync-server tests

The self-hosted sync server is tested with the Go standard-library test runner:

```bash
go test ./...
go vet ./...
```

Keep it intentionally small: it accepts a token-protected JSON backup, never
parses invoice fields, and must retain its HTTPS/CORS, size-limit, atomic-write,
workspace isolation, and ETag conflict guarantees. PDF attachments are stored
only on the backend, remain immutable per invoice ID, and are covered by the
same token and workspace boundary.
