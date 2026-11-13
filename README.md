# Business Data Reporter

A browser-based starter application for loading product, customer, and order CSV files. The first milestone focuses on the upload interface, CSV parsing, basic schema validation, and data previews.

## Run locally

Because the JavaScript uses ES modules, serve the project through a local web server instead of opening `index.html` directly.

For example, with Python installed:

```bash
python -m http.server 8000
```

Then open [http://localhost:8000](http://localhost:8000).

Papa Parse is imported from jsDelivr as an ES module. An internet connection is required to load that dependency.

## Expected CSV columns

| File | Required columns |
| --- | --- |
| Products | `product_id`, `product_name`, `category`, `price` |
| Customers | `customer_id`, `customer_name`, `location` |
| Orders | `order_id`, `customer_id`, `product_id`, `quantity`, `order_date` |

Column names are matched case-insensitively after trimming whitespace. Extra columns are allowed. Rows with blank required values are retained and flagged as warnings.

## Project structure

- `index.html` — upload interface and results area.
- `css/styles.css` — responsive layout and visual styling.
- `js/app.js` — connects the interface, file selection, validation, and previews.
- `js/csvLoader.js` — reads CSV files in the browser and parses them with Papa Parse.
- `js/dataValidator.js` — checks required columns and flags incomplete rows.

## Current behavior and assumptions

- Three separate CSV files are required: products, customers, and orders.
- Each file must be a non-empty `.csv` text file and no larger than 10 MB.
- Data is processed in the browser; there is no backend, database, login, or server-side upload.
- This milestone checks the file structure and required columns. It does not yet join records, validate ID relationships, calculate revenue, or generate management reports.
- The app expects the column names above. A future column-mapping step can support different source-system naming conventions.
- Files are held in page memory only and are cleared when the user resets the interface or closes/reloads the page.

## Next milestone

Add data normalization and relationship checks across the three files, then calculate core metrics such as revenue, order count, average order value, and product/category performance before building charts and report exports.

# ChatGPT Conversation
https://chatgpt.com/share/6af72e5b-aef0-83e9-9758-ffa355e7e78c
