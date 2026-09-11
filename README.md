# InvoiceInspector

[![DOI](https://zenodo.org/badge/900334942.svg)](https://doi.org/10.5281/zenodo.15257729) 
[![Available on openCode.de](https://img.shields.io/badge/available%20on-openCode.de-blue)](https://gitlab.opencode.de/simonwaldherr/InvoiceInspector) 
![Digital Sovereignty](https://img.shields.io/badge/digital-sovereignty-blue) 
[![GitHub License](https://img.shields.io/github/license/SimonWaldherr/InvoiceInspector)](LICENSE) 
[![GitHub release](https://img.shields.io/github/release/SimonWaldherr/InvoiceInspector.svg)](https://github.com/SimonWaldherr/InvoiceInspector/releases) 
[![GitHub Sponsors](https://img.shields.io/github/sponsors/SimonWaldherr?label=sponsor%20me)](https://github.com/sponsors/SimonWaldherr) 


Deutsche Version | [English Version](README.en.md)

Ein leichtgewichtiger, clientseitiger Web-Viewer für elektronische Rechnungen mit Unterstützung für aktuellen ZUGFeRD-, Factur-X-, XRechnung-, UBL-, Peppol-BIS- und EN-16931-Spezifikationen.

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

- **Positionssuche**: Positionen nach Nummer, Produkt, Beschreibung, Notiz oder Einheit filtern, mit Trefferanzeige in allen fünf UI-Sprachen. Druck und Export enthalten weiterhin alle Positionen.
- **Präzisere Betragsverarbeitung**: Ausgewiesene Positionssummen, Preisbasismengen und Nullbeträge werden berücksichtigt; der Nettogesamtbetrag wird getrennt von der Positionssumme verarbeitet.
- **Statistik-Dashboard**: Überblick über Positionen und Summen
- **Multi-Format Export**: XML, PDF, JSON, CSV
- **Responsive Design**: Optimiert für Desktop und Mobile
- **Dark Mode**: Automatische Erkennung der Systemeinstellungen
- **Mehrsprachig**: Deutsch und Englisch
- **Loading-Anzeigen**: Benutzerfreundliche Verarbeitungshinweise

### Praktische Arbeit mit der Rechnungssammlung

Aktivieren Sie **Rechnungen lokal merken**, um Ihre importierten Rechnungen zu
verwalten. Die Sammlung bietet:

- **Übersichtliche Oberfläche**: Kennzahlen vor der Suche, aufklappbare Bereiche für weitere Filter, Exporte und Sicherungen sowie angepasste Hell-/Dunkeldarstellung auf Desktop und Mobilgeräten.
- **Schnellfilter**: Mit einem Klick alle, offene, überfällige, in den nächsten sieben Tagen fällige Rechnungen oder Duplikate anzeigen. Schnellfilter setzen die übrigen Such- und Filterbedingungen zurück.
- **Mehrfachauswahl**: Einzelne Rechnungen, eine Tabellenseite oder alle Treffer auswählen. Die Auswahl bleibt beim Seitenwechsel erhalten; durch Filter ausgeblendete Rechnungen werden aus der Auswahl entfernt. Beim Neuladen wird die Auswahl zurückgesetzt.
- **Sammelaktionen**: Den Status ausgewählter Rechnungen gemeinsam ändern oder die Auswahl als JSON bzw. Rechnungsjournal (CSV) exportieren. Kommentare bleiben bei Statusänderungen erhalten.
- **Fälligkeitsfilter**: offene Zahlbeträge, überfällige Rechnungen, heute bis in
  sieben Tagen fällige Rechnungen und offene Vorgänge ohne gültiges Fälligkeitsdatum.
- **Fälligkeitssortierung und Währungsfilter**: offene und überfällige Summen werden
  je Originalwährung angezeigt. Beglichene/erledigte, stornierte und abgeschlossene
  Reklamationen sowie Gutschriften und erkannte Duplikate sind aus diesen Summen
  ausgeschlossen. Es erfolgt keine Währungsumrechnung oder Verrechnung von Gutschriften.
- **Rechnungsjournal (Treffer)**: CSV mit einer Zeile pro Rechnung, unter anderem
  Rechnungsnummer, Typ, Fälligkeit, Lieferant, Bestellreferenz, Beträgen, Status,
  Duplikatverweis, IBAN und Kommentar. Anders als beim Positionsexport werden
  Rechnungssummen nicht für jede Position wiederholt.
- **Gezielte Exporte**: CSV- und JSON-Exporte aller gefilterten Treffer, unabhängig
  von der aktuellen Tabellenseite. Suche auch nach Bestellreferenz oder IBAN.
- **Tabellenkalkulation**: CSV mit UTF-8-BOM, sprachabhängigem Trennzeichen und
  Schutz vor der Interpretation von Textfeldern als Formeln. Positionsexporte
  enthalten auch die Preisbasismenge.
- **Sicherung und Wiederherstellung**: Ein versioniertes JSON-Backup enthält die
  gesamte lokale Sammlung samt Status und Kommentaren. Beim Wiederherstellen wird
  zusammengeführt: neue Rechnungen werden ergänzt, gleiche Kennungen aktualisiert.

Die Filter bleiben im Browser gespeichert. Ohne angegebenen Zahlbetrag verwendet
die Übersicht den Bruttobetrag; sie berechnet keine Zahlungszuordnungen.
Das Rechnungsjournal ist ein allgemeiner CSV-Export, kein DATEV-Buchungsstapel.

### Optionaler Sync-Server

Die Anwendung bleibt ohne Konfiguration vollständig lokal. Für eine eigene
Synchronisierung zwischen Browsern oder Geräten enthält das Repository einen
kleinen Go-Sync-Server. Er speichert Sicherungen je Buchhaltungsbereich und
wertet keine einzelnen Rechnungsfelder aus.

```sh
export INVOICEINSPECTOR_SYNC_TOKEN="ein-langes-zufaelliges-geheimnis"
go run ./cmd/sync-server
```

Der Server lauscht standardmäßig nur auf `127.0.0.1:8787` und verlangt ein Token
mit mindestens 24 Zeichen. In der Sammlung lassen sich unter **Optionaler
Sync-Server** die Adresse und das persönliche Token eintragen, danach kann die
Sammlung explizit hoch- oder heruntergeladen werden. Der Download wird wie eine
Wiederherstellung zusammengeführt. ETags verhindern ein versehentliches
Überschreiben einer zwischenzeitlich geänderten Server-Sicherung.

Für mehrere Buchhaltungsmitarbeiter wird eine Benutzerdatei verwendet. Personen
im gleichen `workspace` arbeiten an derselben Sammlung; andere Workspaces sind
getrennt gespeichert. Jedes Token muss eindeutig und geheim sein:

```json
{
  "users": [
    {"id": "anna", "token": "mindestens-24-zeichen-langes-token-anna", "workspace": "buchhaltung"},
    {"id": "ben", "token": "mindestens-24-zeichen-langes-token-ben", "workspace": "buchhaltung"},
    {"id": "clara", "token": "mindestens-24-zeichen-langes-token-clara", "workspace": "tochterfirma"}
  ]
}
```

```sh
go run ./cmd/sync-server --users-file ./sync-users.json --storage-mode data
```

Für einen einfachen vollständigen Serverbetrieb lässt sich alles in einer Datei
konfigurieren; Adresse, Datenpfad, Origin, Speichermodus und PDF-Option können
bei Bedarf weiterhin per Flag oder Umgebungsvariable überschrieben werden:

```json
{
  "address": "127.0.0.1:8787",
  "dataDir": "./data",
  "allowedOrigin": "https://rechnungen.example.org",
  "storageMode": "data",
  "pdfSync": true,
  "users": [
    {"id": "anna", "token": "mindestens-24-zeichen-langes-token-anna", "workspace": "buchhaltung"}
  ]
}
```

```sh
go run ./cmd/sync-server --config ./sync-server.json
```

Die UI zeigt nach **Verbindung prüfen** die aktive Serverkonfiguration an und
deaktiviert die PDF-Option automatisch, wenn `pdfSync` ausgeschaltet ist. Über
**PDFs beim Import direkt im Backend speichern** wird eine importierte PDF nach
dem Auslesen direkt an den Server übertragen. Die Datei wird dabei nie in
IndexedDB, LocalStorage oder einem JSON-Backup gespeichert.

`--storage-mode full` (Standard) bewahrt die vollständige JSON-Sicherungsdatei
einschließlich Metadaten. `--storage-mode data` speichert nur deren
`invoices`-Array und erstellt beim Abruf wieder eine kompatible Sicherung. Beide
Modi speichern die bereits vom Browser erzeugte Sammlung. Bei aktivierter
PDF-Option werden importierte PDFs direkt und ausschließlich im Backend
gespeichert; im Browser bleiben sie nur während des aktuellen Imports im
Arbeitsspeicher. Ein PDF wird nur einmal je Rechnungs-ID gespeichert; erneutes
Hochladen desselben Inhalts ist sicher, abweichender Inhalt erzeugt einen
Konflikt statt die vorhandene Datei zu überschreiben. XML-Quelldateien werden
nicht separat synchronisiert. Bei einem ETag-Konflikt muss zuerst
heruntergeladen und zusammengeführt werden, bevor erneut hochgeladen wird.

Für den Betrieb über mehrere Geräte sollte der Server hinter HTTPS und einer
Firewall bzw. einem Reverse Proxy laufen, zum Beispiel mit
`INVOICEINSPECTOR_SYNC_ADDR=127.0.0.1:8787` und einem TLS-terminierenden Proxy.
`INVOICEINSPECTOR_SYNC_ALLOWED_ORIGIN` kann auf die URL des Viewers begrenzt
werden; standardmäßig erlaubt der Dienst Browserzugriffe von allen Origins, die
weiterhin das Token benötigen. Die Sicherungsdatei liegt standardmäßig in
`./data` und ist auf dem Server **nicht zusätzlich verschlüsselt**. Der Betreiber
hat daher für Datenträgerverschlüsselung, Zugriffsschutz und starke, geheime
Tokens zu sorgen. Die Benutzerdatei enthält Tokens im Klartext und muss ebenso
mit restriktiven Dateirechten geschützt werden.

### Technische Merkmale

- **PDF-Extraktion**: Automatische XML-Extraktion aus ZUGFeRD-PDFs
- **Robuste XML-Parsing**: Unterstützung verschiedener Namespaces
- **Fehlerbehandlung**: Detaillierte Fehlermeldungen
- **Barrierefreiheit**: Semantisches HTML und ARIA-Labels

## Verwendung

1. **Öffnen Sie** `index.html` in Ihrem Browser
2. **Ziehen Sie** eine ZUGFeRD-/Factur-X-PDF oder eine XRechnung-, UBL- bzw. Peppol-BIS-XML in die Drop-Zone oder klicken zum Auswählen
3. **Betrachten Sie** die automatisch extrahierten und strukturierten Daten
4. **Exportieren Sie** die Daten in verschiedenen Formaten

### Unterstützte Dateiformate

- **ZUGFeRD 2.4 PDF/A-3** (Profile: MINIMUM, BASIC WL, BASIC, EN 16931, EXTENDED)
- **Factur-X 1.0.8** (französisches Pendant zu ZUGFeRD 2.4)
- **XRechnung XML** (aktuelle produktive 3.0.x-Linie; 4.0 noch nicht produktiv)
- **EN 16931** kompatible XML-/CII-Dateien (Referenzstand: EN 16931-1:2026)
- **Peppol BIS Billing 3.0 XML** (aktueller 3.0-Release-Zweig auf UBL-2.1-Basis)
- **UBL 2.1 / 2.3 XML** (Invoice und CreditNote)

### Referenzstand der unterstützten Normen (Stand: 2026-04)

- **ZUGFeRD**: 2.4
- **Factur-X**: 1.0.8
- **XRechnung**: 3.0.x produktiv, 4.0 angekündigt
- **Peppol BIS Billing**: 3.0
- **UBL**: 2.3 als aktuelle OASIS-Version; Peppol BIS nutzt UBL 2.1
- **EN 16931**: EN 16931-1:2026

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
