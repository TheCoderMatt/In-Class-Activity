# Business Data Reporter

A browser-based starter application for uploading and inspecting CSV datasets. It is intentionally dataset-agnostic: users can upload files from different business domains without having to rename their files or conform to a predefined set of column names.

## Run locally

Because the JavaScript uses ES modules, serve the project through a local web server instead of opening `index.html` directly.

For example, with Python installed:

```bash
python -m http.server 8000
```

Then open [http://localhost:8000](http://localhost:8000).

Papa Parse is imported from jsDelivr as an ES module. An internet connection is required to load that dependency.

## Uploading files

- Use the single **Choose CSV files** control to select one or multiple CSV files.
- Each selected file is treated as an independent dataset and parsed automatically.
- The application displays each file's name, row count, column count, column names, and a preview of up to five rows.
- No particular filenames, dataset categories, or business column names are required.

## Validation rules

The generic validator checks only whether a file:
- Is a non-empty CSV text file no larger than 10 MB.
- Contains at least one named column header.
- Has unique column names (case-insensitive comparison).
- Contains at least one data row.

It does not require fields such as `product_id`, `customer_id`, `order_date`, or any other business-specific column. The uploaded data is not transformed into a particular business model at this stage.

## Project structure

- `index.html` — generic multi-file upload interface and results area.
- `css/styles.css` — responsive layout and visual styling.
- `js/app.js` — handles file selection, parsing workflow, summaries, and previews.
- `js/csvLoader.js` — reads CSV files in the browser and parses them with Papa Parse.
- `js/dataValidator.js` — performs schema-agnostic structural checks.

## Current assumptions and limitations

- CSV is the supported input format; Excel workbooks and other file types are not supported yet.
- Each file is limited to 10 MB in this starter version.
- Data is processed in the browser; there is no backend, database, login, or server-side upload.
- Files are held in page memory only and are cleared when the user resets the interface or closes/reloads the page.
- CSV files are treated as separate datasets. The app does not yet infer relationships, identify metrics, join datasets, or generate reports.
- The browser needs an internet connection to load Papa Parse from the CDN.

## Next milestone

Introduce a dataset-inspection and configuration step that helps users describe what each uploaded file represents and identify relationships between files. Analytics should be based on the actual uploaded data and user-confirmed field mappings rather than assumptions about fixed dataset types or column names.
