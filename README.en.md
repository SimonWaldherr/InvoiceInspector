# InvoiceInspector 📄⚡

[![DOI](https://zenodo.org/badge/900334942.svg)](https://doi.org/10.5281/zenodo.15257729)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![GitHub release](https://img.shields.io/github/release/SimonWaldherr/InvoiceInspector.svg)](https://github.com/SimonWaldherr/InvoiceInspector/releases)
[![GitHub stars](https://img.shields.io/github/stars/SimonWaldherr/InvoiceInspector.svg)](https://github.com/SimonWaldherr/InvoiceInspector/stargazers)

A lightweight, client-side web viewer for electronic invoices with support for ZUGFeRD, XRechnung, EN 16931, and other standards.

[🇩🇪 Deutsche Version](README.md) | 🇺🇸 English Version

## 🎥 Demo

[![Demo on YouTube](https://img.youtube.com/vi/OcTL1rdS2Uk/0.jpg)](https://www.youtube.com/watch?v=OcTL1rdS2Uk)

## ✨ Features

### 📋 **Complete Invoice Analysis**

- **Invoice Information**: Number, type, date, due date, order number
- **Seller/Buyer Details**: Name, address, contact information, tax ID, commercial register
- **Payment Information**: IBAN, BIC, payment method, payment terms, all amounts
- **Detailed Line Items**: With units, tax rates, and calculations

### 🔒 **Privacy & Security**

- **100% client-side**: No data transmission to servers
- **No installation**: Runs directly in the browser
- **Offline capable**: Works without internet connection
- **Open Source**: Fully transparent code

### 📊 **Advanced Features**

- **Statistics Dashboard**: Overview of line items and totals
- **Multi-format Export**: XML, PDF, JSON, CSV
- **Responsive Design**: Optimized for desktop and mobile
- **Dark Mode**: Automatic system preference detection
- **Multilingual**: German and English
- **Loading Indicators**: User-friendly processing feedback

### 🔧 **Technical Features**

- **PDF Extraction**: Automatic XML extraction from ZUGFeRD PDFs
- **Robust XML Parsing**: Support for various namespaces
- **Error Handling**: Detailed error messages
- **Accessibility**: Semantic HTML and ARIA labels

## 🚀 Usage

1. **Open** `index.html` in your browser
2. **Drag** a ZUGFeRD PDF or XRechnung XML into the drop zone or click to select
3. **View** the automatically extracted and structured data
4. **Export** the data in various formats

### Supported File Formats

- **ZUGFeRD PDF/A-3** (all profiles: MINIMUM, BASIC WL, BASIC, COMFORT, EXTENDED)
- **XRechnung XML** (all versions)
- **EN 16931 compatible XML files**
- **Factur-X** (French ZUGFeRD standard)

## 🔍 Tested Examples

Extensive testing with examples from [github.com/ZUGFeRD/corpus](https://github.com/ZUGFeRD/corpus).

## ⚖️ Legal Notes

### Official Elster Tool

There is now an official tool available at [elster.de](https://www.elster.de/eportal/e-rechnung).
While I would very much like to direct attention to this official tool and explicitly recommend it, I do so with considerable reservations:

**Issues with the official tool:**

1. 📤 **Data Upload**: Data is uploaded to the Elster server (instead of being processed directly in the browser)
2. ⚠️ **No Guarantee**: The official tool also notes that it cannot guarantee proper functionality or accurate extraction of displayed data

### Disclaimer

- ⚠️ **No Warranty** for accuracy, completeness, or legal compliance
- 🚫 **No Liability** for damages or losses resulting from use
- 👤 **User Responsibility** for correct processing and verification of data

### Why All-in-One?

- **Easy Deployment**: Just copy one file
- **No Dependencies**: Runs without additional assets
- **Maximum Portability**: Works on any web server
- **Offline Capable**: No external resources required

## 📄 License

This project is licensed under the [MIT License](LICENSE).

## 🔗 Links

- **Repository**: [github.com/SimonWaldherr/InvoiceInspector](https://github.com/SimonWaldherr/InvoiceInspector)
- **Issues**: [GitHub Issues](https://github.com/SimonWaldherr/InvoiceInspector/issues)
- **Releases**: [GitHub Releases](https://github.com/SimonWaldherr/InvoiceInspector/releases)
- **ZUGFeRD Standard**: [ferd-net.de](https://www.ferd-net.de/)
- **XRechnung**: [xeinkauf.de](https://xeinkauf.de/xrechnung/)

## 👨‍💻 Author

Simon Waldherr

- Website: [simonwaldherr.de](https://simonwaldherr.de)
- GitHub: [@SimonWaldherr](https://github.com/SimonWaldherr)
