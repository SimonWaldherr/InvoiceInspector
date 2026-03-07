# Contributing to InvoiceInspector

Thank you for your interest in contributing to InvoiceInspector! Contributions
in the form of bug reports, feature requests, translations, and pull requests
are welcome.

## Getting started

InvoiceInspector is a **single-file** web application (`index.html`). There is
no build step, no package manager, and no server-side component. Open the file
directly in a browser and you're done.

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
