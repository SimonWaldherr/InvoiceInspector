# InvoiceInspector

[![DOI](https://zenodo.org/badge/900334942.svg)](https://doi.org/10.5281/zenodo.15257729)  

A lightweight web-based viewer for electronic invoices, supporting ZUGFeRD, XRechnung, EN 16931, and more.

[![Demo on YouTube](https://img.youtube.com/vi/OcTL1rdS2Uk/0.jpg)](https://www.youtube.com/watch?v=OcTL1rdS2Uk)

I have used the following examples to test: [github.com/ZUGFeRD/corpus](https://github.com/ZUGFeRD/corpus).

Luckily there is now an official tool on [elster.de](https://www.elster.de/eportal/e-rechnung).
While I would very much like to direct attention to this official tool and explicitly recommend it, I do so with considerable hesitation.
Unfortunately, the official tool has two major flaws:

1. The data is uploaded to the Elster server (instead of being evaluated directly in the browser, as with my tool).
2. The official tool also notes that it cannot guarantee proper functionality or the accurate extraction of the displayed data.
