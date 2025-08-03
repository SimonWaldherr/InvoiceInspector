# InvoiceInspector 📄⚡

[![DOI](https://zenodo.org/badge/900334942.svg)](https://doi.org/10.5281/zenodo.15257729)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![GitHub release](https://img.shields.io/github/release/SimonWaldherr/InvoiceInspector.svg)](https://github.com/SimonWaldherr/InvoiceInspector/releases)
[![GitHub stars](https://img.shields.io/github/stars/SimonWaldherr/InvoiceInspector.svg)](https://github.com/SimonWaldherr/InvoiceInspector/stargazers)

Ein leichtgewichtiger, clientseitiger Web-Viewer für elektronische Rechnungen mit Unterstützung für ZUGFeRD, XRechnung, EN 16931 und weitere Standards.

## 🎥 Demo

[![Watch the video](https://img.youtube.com/vi/Qyn5-ZxSHXo/maxresdefault.jpg)](https://youtu.be/Qyn5-ZxSHXo)

## ✨ Features

### 📋 **Vollständige Rechnungsanalyse**

- **Rechnungsinformationen**: Nummer, Typ, Datum, Fälligkeitsdatum, Bestellnummer
- **Verkäufer/Käufer Details**: Name, Adresse, Kontaktdaten, Steuer-ID, Handelsregister
- **Zahlungsinformationen**: IBAN, BIC, Zahlungsart, Zahlungsziel, alle Beträge
- **Detaillierte Positionen**: Mit Einheiten, Steuersätzen und Berechnungen

### 🔒 **Datenschutz & Sicherheit**

- **100% clientseitig**: Keine Datenübertragung an Server
- **Keine Installation**: Läuft direkt im Browser
- **Offline-fähig**: Funktioniert ohne Internetverbindung
- **Open Source**: Vollständig transparenter Code

### 📊 **Erweiterte Funktionen**

- **Statistik-Dashboard**: Überblick über Positionen und Summen
- **Multi-Format Export**: XML, PDF, JSON, CSV
- **Responsive Design**: Optimiert für Desktop und Mobile
- **Dark Mode**: Automatische Erkennung der Systemeinstellungen
- **Mehrsprachig**: Deutsch und Englisch
- **Loading-Anzeigen**: Benutzerfreundliche Verarbeitungshinweise

### 🔧 **Technische Features**

- **PDF-Extraktion**: Automatische XML-Extraktion aus ZUGFeRD-PDFs
- **Robuste XML-Parsing**: Unterstützung verschiedener Namespaces
- **Fehlerbehandlung**: Detaillierte Fehlermeldungen
- **Barrierefreiheit**: Semantisches HTML und ARIA-Labels

## 🚀 Verwendung

1. **Öffnen Sie** `index.html` in Ihrem Browser
2. **Ziehen Sie** eine ZUGFeRD-PDF oder XRechnung-XML in die Drop-Zone oder klicken zum Auswählen
3. **Betrachten Sie** die automatisch extrahierten und strukturierten Daten
4. **Exportieren Sie** die Daten in verschiedenen Formaten

### Unterstützte Dateiformate

- **ZUGFeRD PDF/A-3** (alle Profile: MINIMUM, BASIC WL, BASIC, COMFORT, EXTENDED)
- **XRechnung XML** (alle Versionen)
- **EN 16931 kompatible XML-Dateien**
- **Factur-X** (französischer ZUGFeRD-Standard)

## 🔍 Getestete Beispiele

Umfangreiche Tests mit Beispielen aus [github.com/ZUGFeRD/corpus](https://github.com/ZUGFeRD/corpus).

## ⚖️ Rechtliche Hinweise

### Offizielles Elster-Tool

Es gibt inzwischen ein offizielles Tool auf [elster.de](https://www.elster.de/eportal/e-rechnung).
Während ich sehr gerne auf dieses offizielle Tool hinweisen und es ausdrücklich empfehlen möchte, tue ich dies mit erheblichen Vorbehalten:

**Probleme des offiziellen Tools:**

1. 📤 **Datenübertragung**: Die Daten werden zum Elster-Server hochgeladen (anstatt direkt im Browser ausgewertet zu werden)
2. ⚠️ **Keine Garantie**: Das offizielle Tool weist ebenfalls darauf hin, dass es keine ordnungsgemäße Funktionalität oder korrekte Extraktion der angezeigten Daten garantieren kann

### Haftungsausschluss

- ⚠️ **Keine Gewähr** für Richtigkeit, Vollständigkeit oder Rechtskonformität
- 🚫 **Keine Haftung** für Schäden oder Verluste aus der Nutzung
- 👤 **Nutzerverantwortung** für korrekte Verarbeitung und Prüfung der Daten

### Warum All-in-One?

- **Einfache Bereitstellung**: Nur eine Datei kopieren
- **Keine Abhängigkeiten**: Läuft ohne zusätzliche Assets
- **Maximale Portabilität**: Funktioniert auf jedem Webserver
- **Offline-fähig**: Keine externen Ressourcen erforderlich

## 🤝 Beitragen

Ich freue mich über Beiträge! 

## 📄 Lizenz

Dieses Projekt steht unter der [MIT-Lizenz](LICENSE).

## 🔗 Links

- **Repository**: [github.com/SimonWaldherr/InvoiceInspector](https://github.com/SimonWaldherr/InvoiceInspector)
- **Issues**: [GitHub Issues](https://github.com/SimonWaldherr/InvoiceInspector/issues)
- **Releases**: [GitHub Releases](https://github.com/SimonWaldherr/InvoiceInspector/releases)
- **ZUGFeRD Standard**: [ferd-net.de](https://www.ferd-net.de/)
- **XRechnung**: [xeinkauf.de](https://xeinkauf.de/xrechnung/)

## 👨‍💻 Autor

Simon Waldherr

- Website: [simonwaldherr.de](https://simonwaldherr.de)
- GitHub: [@SimonWaldherr](https://github.com/SimonWaldherr)

