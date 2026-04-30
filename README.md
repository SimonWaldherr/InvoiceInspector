# InvoiceInspector

[![DOI](https://zenodo.org/badge/900334942.svg)](https://doi.org/10.5281/zenodo.15257729) 
[![Available on openCode.de](https://img.shields.io/badge/available%20on-openCode.de-blue)](https://gitlab.opencode.de/simonwaldherr/InvoiceInspector) 
![Digital Sovereignty](https://img.shields.io/badge/digital-sovereignty-blue) 
[![GitHub License](https://img.shields.io/github/license/SimonWaldherr/InvoiceInspector)](LICENSE) 
[![GitHub release](https://img.shields.io/github/release/SimonWaldherr/InvoiceInspector.svg)](https://github.com/SimonWaldherr/InvoiceInspector/releases) 
[![GitHub Sponsors](https://img.shields.io/github/sponsors/SimonWaldherr?label=sponsor%20me)](https://github.com/sponsors/SimonWaldherr) 


Deutsche Version | [English Version](README.en.md)

Ein leichtgewichtiger, clientseitiger Web-Viewer für elektronische Rechnungen mit Unterstützung für ZUGFeRD, XRechnung, UBL, Peppol BIS, EN 16931 und weitere Standards.

InvoiceInspector ist eng mit dem Projekt
[SimonWaldherr/InvoiceGenerator](https://github.com/SimonWaldherr/InvoiceGenerator)
verknüpft. Den zugehörigen ZUGFeRD-Rechnungsgenerator können Sie hier direkt im
Browser testen:
https://simonwaldherr.github.io/InvoiceGenerator/

## Demo

[![Watch the video](https://img.youtube.com/vi/Qyn5-ZxSHXo/maxresdefault.jpg)](https://youtu.be/Qyn5-ZxSHXo)

## Funktionsumfang

### Vollständige Rechnungsanalyse

- **Rechnungsinformationen**: Nummer, Typ, Datum, Fälligkeitsdatum, Bestellnummer
- **Verkäufer/Käufer Details**: Name, Adresse, Kontaktdaten, Steuer-ID, Handelsregister
- **Zahlungsinformationen**: IBAN, BIC, Zahlungsart, Zahlungsziel, alle Beträge
- **Detaillierte Positionen**: Mit Einheiten, Steuersätzen und Berechnungen

### Datenschutz und Sicherheit

- **100% clientseitig**: Keine Datenübertragung an Server
- **Keine Installation**: Läuft direkt im Browser
- **Offline-fähig**: Funktioniert ohne Internetverbindung
- **Open Source**: Vollständig transparenter Code

### Erweiterte Funktionen

- **Statistik-Dashboard**: Überblick über Positionen und Summen
- **Multi-Format Export**: XML, PDF, JSON, CSV
- **Responsive Design**: Optimiert für Desktop und Mobile
- **Dark Mode**: Automatische Erkennung der Systemeinstellungen
- **Mehrsprachig**: Deutsch und Englisch
- **Loading-Anzeigen**: Benutzerfreundliche Verarbeitungshinweise

### Technische Merkmale

- **PDF-Extraktion**: Automatische XML-Extraktion aus ZUGFeRD-PDFs
- **Robuste XML-Parsing**: Unterstützung verschiedener Namespaces
- **Fehlerbehandlung**: Detaillierte Fehlermeldungen
- **Barrierefreiheit**: Semantisches HTML und ARIA-Labels

## Verwendung

1. **Öffnen Sie** `index.html` in Ihrem Browser
2. **Ziehen Sie** eine ZUGFeRD-PDF oder XRechnung-XML in die Drop-Zone oder klicken zum Auswählen
3. **Betrachten Sie** die automatisch extrahierten und strukturierten Daten
4. **Exportieren Sie** die Daten in verschiedenen Formaten

### Unterstützte Dateiformate

- **ZUGFeRD PDF/A-3** (alle Profile: MINIMUM, BASIC WL, BASIC, COMFORT, EXTENDED)
- **XRechnung XML** (alle Versionen)
- **EN 16931 kompatible XML-Dateien**
- **Factur-X** (französischer ZUGFeRD-Standard)
- **UBL 2.x / Peppol BIS Billing 3.0 XML** (Invoice und CreditNote)

## Getestete Beispiele

Umfangreiche Tests mit Beispielen aus [github.com/ZUGFeRD/corpus](https://github.com/ZUGFeRD/corpus).

## Rechtliche Hinweise

### Offizielles Elster-Tool

Es gibt inzwischen ein offizielles Tool auf [elster.de](https://www.elster.de/eportal/e-rechnung).
Während ich sehr gerne auf dieses offizielle Tool hinweisen und es ausdrücklich empfehlen möchte, tue ich dies mit erheblichen Vorbehalten:

**Einschränkungen des offiziellen Tools:**

1. **Datenübertragung**: Die Daten werden zum Elster-Server hochgeladen (anstatt direkt im Browser ausgewertet zu werden).
2. **Keine Garantie**: Das offizielle Tool weist ebenfalls darauf hin, dass es keine ordnungsgemäße Funktionalität oder korrekte Extraktion der angezeigten Daten garantieren kann.

### Haftungsausschluss

- **Keine Gewähr** für Richtigkeit, Vollständigkeit oder Rechtskonformität.
- **Keine Haftung** für Schäden oder Verluste aus der Nutzung.
- **Nutzerverantwortung** für korrekte Verarbeitung und Prüfung der Daten.

### Warum eine einzelne HTML-Datei?

- **Einfache Bereitstellung**: Nur eine Datei kopieren.
- **Keine Abhängigkeiten**: Läuft ohne zusätzliche Assets.
- **Hohe Portabilität**: Funktioniert auf jedem Webserver.
- **Offline-fähig**: Keine externen Ressourcen erforderlich.

## Integration

### Einbettung in ein Web-Portal

Kopieren Sie `index.html` in Ihr Projekt oder stellen Sie die Datei über einen
beliebigen Webserver bereit. Serverseitige Anforderungen gibt es keine. Für den
Intranet-Einsatz genügt ein interner Webserver.

### iframe-Einbettung

```html
<iframe src="https://simonwaldherr.github.io/InvoiceInspector/"
        width="100%" height="800" title="InvoiceInspector"></iframe>
```

### Direktlink zur Live-Demo

```
https://simonwaldherr.github.io/InvoiceInspector/
```

## Beitragen

Beiträge in Form von Bugmeldungen, Ideen oder Pull Requests sind willkommen.
Bitte lesen Sie zuerst die [Beitragsrichtlinien](CONTRIBUTING.md).

## Lizenz

Dieses Projekt steht unter der [GNU General Public License v2.0](LICENSE).

## Links

- **Repository**: [github.com/SimonWaldherr/InvoiceInspector](https://github.com/SimonWaldherr/InvoiceInspector)
- **OpenCode.de**: [opencode.de – InvoiceInspector](https://gitlab.opencode.de/simonwaldherr/InvoiceInspector)
- **Live-Demo**: [simonwaldherr.github.io/InvoiceInspector](https://simonwaldherr.github.io/InvoiceInspector/)
- **Issues**: [GitHub Issues](https://github.com/SimonWaldherr/InvoiceInspector/issues)
- **Releases**: [GitHub Releases](https://github.com/SimonWaldherr/InvoiceInspector/releases)
- **ZUGFeRD Standard**: [ferd-net.de](https://www.ferd-net.de/)
- **XRechnung**: [xeinkauf.de](https://xeinkauf.de/xrechnung/)
- **EN 16931**: [fnfe-mpe.org](https://fnfe-mpe.org/factur-x/)

## Autor

Simon Waldherr

- Website: [simonwaldherr.de](https://simonwaldherr.de)
- GitHub: [@SimonWaldherr](https://github.com/SimonWaldherr)
