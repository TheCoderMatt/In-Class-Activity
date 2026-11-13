/**
 * Generic CSV validation.
 * No dataset names or required business columns are assumed.
 * A usable CSV must have at least one non-empty header and one data row.
 */
export function validateDataset(parsedData) {
  const headers = parsedData.headers.map((header) => String(header).trim());
  const normalizedHeaders = headers.map((header) => header.toLowerCase());
  const errors = [];
  const warnings = [];

  if (!headers.length || headers.every((header) => header === "")) {
    errors.push("The CSV must contain at least one column header.");
  }

  const blankHeaderCount = headers.filter((header) => header === "").length;
  if (blankHeaderCount) {
    errors.push(`${blankHeaderCount} column(s) have a blank header. Add a name to each column and upload the file again.`);
  }

  const duplicateHeaders = normalizedHeaders.filter((header, index) =>
    normalizedHeaders.indexOf(header) !== index
  );
  if (duplicateHeaders.length) {
    errors.push(`Duplicate column name(s): ${[...new Set(duplicateHeaders)].join(", ")}.`);
  }

  if (!parsedData.rows.length) {
    errors.push("The CSV contains headers but no data rows.");
  }

  if (errors.length) return { valid: false, errors, warnings };

  const emptyRows = parsedData.rows.filter((row) =>
    headers.every((header) => String(row[header] ?? "").trim() === "")
  ).length;

  if (emptyRows) {
    warnings.push(`${emptyRows} completely blank row(s) were skipped by the CSV parser.`);
  }

  return {
    valid: true,
    errors: [],
    warnings,
    rowCount: parsedData.rows.length,
    columns: headers
  };
}
