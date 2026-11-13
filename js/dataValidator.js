export const DATASET_SCHEMAS = {
  products: ["product_id", "product_name", "category", "price"],
  customers: ["customer_id", "customer_name", "location"],
  orders: ["order_id", "customer_id", "product_id", "quantity", "order_date"]
};

function normalizeHeader(header) {
  return String(header).trim().toLowerCase();
}

export function validateDataset(datasetName, parsedData) {
  const requiredColumns = DATASET_SCHEMAS[datasetName];
  if (!requiredColumns) {
    return { valid: false, errors: ["Unknown dataset type."] };
  }

  const normalizedHeaders = parsedData.headers.map(normalizeHeader);
  const duplicateHeaders = normalizedHeaders.filter((header, index) =>
    normalizedHeaders.indexOf(header) !== index
  );

  const errors = [];
  if (duplicateHeaders.length) {
    errors.push(`Duplicate column name(s): ${[...new Set(duplicateHeaders)].join(", ")}.`);
  }

  const missingColumns = requiredColumns.filter((column) => !normalizedHeaders.includes(column));
  if (missingColumns.length) {
    errors.push(`Missing required column(s): ${missingColumns.join(", ")}.`);
  }

  if (!parsedData.rows.length) {
    errors.push("The CSV contains headers but no data rows.");
  }

  if (errors.length) return { valid: false, errors };

  const rowsWithMissingValues = parsedData.rows.reduce((count, row) => {
    const hasMissingRequiredValue = requiredColumns.some((column) => {
      const actualHeader = parsedData.headers[normalizedHeaders.indexOf(column)];
      return String(row[actualHeader] ?? "").trim() === "";
    });
    return count + (hasMissingRequiredValue ? 1 : 0);
  }, 0);

  const warnings = rowsWithMissingValues
    ? [`${rowsWithMissingValues} row(s) have blank required values. They are retained for review.`]
    : [];

  return {
    valid: true,
    errors: [],
    warnings,
    rowCount: parsedData.rows.length,
    columns: parsedData.headers
  };
}
