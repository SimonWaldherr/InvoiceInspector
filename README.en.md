# InvoiceInspector

[![DOI](https://zenodo.org/badge/900334942.svg)](https://doi.org/10.5281/zenodo.15257729)
[![License: GPL v2](https://img.shields.io/badge/License-GPL%20v2-blue.svg)](https://www.gnu.org/licenses/old-licenses/gpl-2.0.en.html)
[![GitHub release](https://img.shields.io/github/release/SimonWaldherr/InvoiceInspector.svg)](https://github.com/SimonWaldherr/InvoiceInspector/releases)
[![GitHub stars](https://img.shields.io/github/stars/SimonWaldherr/InvoiceInspector.svg)](https://github.com/SimonWaldherr/InvoiceInspector/stargazers)

A lightweight, client-side web viewer for electronic invoices with support for current ZUGFeRD, Factur-X, XRechnung, UBL, Peppol BIS, and EN 16931 specifications.

[Deutsche Version](README.md) | English Version

InvoiceInspector is closely related to the
[SimonWaldherr/InvoiceGenerator](https://github.com/SimonWaldherr/InvoiceGenerator)
project. You can try the associated ZUGFeRD invoice generator directly in your
browser:
https://simonwaldherr.github.io/InvoiceGenerator/

## Demo

[![Demo on YouTube](https://img.youtube.com/vi/OcTL1rdS2Uk/0.jpg)](https://www.youtube.com/watch?v=OcTL1rdS2Uk)

## Features

### Complete invoice analysis

- **Invoice Information**: Number, type, date, due date, order number
- **Seller/Buyer Details**: Name, address, contact information, tax ID, commercial register
- **Payment Information**: IBAN, BIC, payment method, payment terms, all amounts
- **Detailed Line Items**: With units, tax rates, and calculations

### Privacy and security

- **100% client-side**: No data transmission to servers
- **No installation**: Runs directly in the browser
- **Offline capable**: Works without internet connection
- **Open Source**: Fully transparent code

### Advanced features

- **Statistics Dashboard**: Overview of line items and totals
- **Multi-format Export**: XML, PDF, JSON, CSV
- **Responsive Design**: Optimized for desktop and mobile
- **Dark Mode**: Automatic system preference detection
- **Multilingual**: German and English
- **Loading Indicators**: User-friendly processing feedback

### Technical aspects

- **PDF Extraction**: Automatic XML extraction from ZUGFeRD PDFs
- **Robust XML Parsing**: Support for various namespaces
- **Error Handling**: Detailed error messages
- **Accessibility**: Semantic HTML and ARIA labels

## Usage

1. **Open** `index.html` in your browser
2. **Drag** a ZUGFeRD/Factur-X PDF or an XRechnung, UBL, or Peppol BIS XML into the drop zone or click to select
3. **View** the automatically extracted and structured data
4. **Export** the data in various formats

### Supported file formats

- **ZUGFeRD 2.4 PDF/A-3** (profiles: MINIMUM, BASIC WL, BASIC, EN 16931, EXTENDED)
- **Factur-X 1.0.8** (French counterpart to ZUGFeRD 2.4)
- **XRechnung XML** (current production 3.0.x line; 4.0 not yet production-ready)
- **EN 16931** compatible XML/CII files (reference baseline: EN 16931-1:2026)
- **Peppol BIS Billing 3.0 XML** (current 3.0 release stream on UBL 2.1 syntax)
- **UBL 2.1 / 2.3 XML** (Invoice and CreditNote)

### Standards baseline (status: 2026-04)

- **ZUGFeRD**: 2.4
- **Factur-X**: 1.0.8
- **XRechnung**: 3.0.x in production, 4.0 announced
- **Peppol BIS Billing**: 3.0
- **UBL**: 2.3 as the current OASIS release; Peppol BIS uses UBL 2.1
- **EN 16931**: EN 16931-1:2026

## Tested examples

Extensive testing with examples from [github.com/ZUGFeRD/corpus](https://github.com/ZUGFeRD/corpus).

## Legal notes

### Official Elster Tool

There is now an official tool available at [elster.de](https://www.elster.de/eportal/e-rechnung).
While I would very much like to direct attention to this official tool and explicitly recommend it, I do so with considerable reservations:

**Limitations of the official tool:**

1. **Data upload**: Data is uploaded to the Elster server (instead of being processed directly in the browser).
2. **No guarantee**: The official tool also notes that it cannot guarantee proper functionality or accurate extraction of displayed data.

### Disclaimer

- **No warranty** for accuracy, completeness, or legal compliance.
- **No liability** for damages or losses resulting from use.
- **User responsibility** for correct processing and verification of data.

### Why a single HTML file?

- **Easy deployment**: Just copy one file.
- **No dependencies**: Runs without additional assets.
- **High portability**: Works on any web server.
- **Offline capable**: No external resources required.

## Integration

### Embedding in a web portal

Copy `index.html` into your project or serve it from any web server. The file
has no server-side requirements. For intranet use, host it on your internal
server.

### iframe embedding

```html
<iframe src="https://simonwaldherr.github.io/InvoiceInspector/"
        width="100%" height="800" title="InvoiceInspector"></iframe>
```

### Direct link to the live demo

```
https://simonwaldherr.github.io/InvoiceInspector/
```

### Automated validation (headless)

The tool runs entirely in the browser. For server-side or CI validation of
e-invoices, use a headless browser (e.g. Playwright / Puppeteer) or pair it
with a dedicated XML validation library.

## Contributing

Bug reports, feature ideas, and pull requests are welcome. Please open an
[issue](https://github.com/SimonWaldherr/InvoiceInspector/issues) first for
larger changes to discuss the approach. See [CONTRIBUTING.md](CONTRIBUTING.md)
for detailed guidelines.

## License

This project is licensed under the [GNU General Public License v2.0](LICENSE).

## Links

- **Repository**: [github.com/SimonWaldherr/InvoiceInspector](https://github.com/SimonWaldherr/InvoiceInspector)
- **OpenCode.de**: [opencode.de – InvoiceInspector](https://gitlab.opencode.de/simonwaldherr/InvoiceInspector)
- **Live Demo**: [simonwaldherr.github.io/InvoiceInspector](https://simonwaldherr.github.io/InvoiceInspector/)
- **Issues**: [GitHub Issues](https://github.com/SimonWaldherr/InvoiceInspector/issues)
- **Releases**: [GitHub Releases](https://github.com/SimonWaldherr/InvoiceInspector/releases)
- **ZUGFeRD Standard**: [ferd-net.de](https://www.ferd-net.de/)
- **XRechnung**: [xeinkauf.de](https://xeinkauf.de/xrechnung/)
- **EN 16931**: [fnfe-mpe.org](https://fnfe-mpe.org/factur-x/)

## Author

Simon Waldherr

- Website: [simonwaldherr.de](https://simonwaldherr.de)
- GitHub: [@SimonWaldherr](https://github.com/SimonWaldherr)
