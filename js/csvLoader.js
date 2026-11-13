import Papa from "https://cdn.jsdelivr.net/npm/papaparse@5.4.1/+esm";

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;

export async function loadCsvFile(file) {
  if (!file) throw new Error("Choose a CSV file first.");
  if (!file.name.toLowerCase().endsWith(".csv")) {
    throw new Error("The selected file must have a .csv extension.");
  }
  if (file.size === 0) throw new Error("The selected file is empty.");
  if (file.size > MAX_FILE_SIZE_BYTES) {
    throw new Error("File is larger than the 10 MB starter limit.");
  }

  const text = await file.text();
  if (text.includes("\u0000")) {
    throw new Error("The file appears to contain binary data, not a text CSV.");
  }

  return new Promise((resolve, reject) => {
    Papa.parse(text, {
      header: true,
      skipEmptyLines: "greedy",
      transformHeader: (header) => header.trim(),
      complete: (results) => {
        if (results.errors.length) {
          const firstError = results.errors[0];
          reject(new Error(`CSV parsing issue on row ${(firstError.row ?? 0) + 1}: ${firstError.message}`));
          return;
        }
        const headers = results.meta.fields ?? [];
        if (!headers.length) {
          reject(new Error("No column headers were found in the CSV."));
          return;
        }
        resolve({ headers, rows: results.data, fileName: file.name });
      },
      error: (error) => reject(new Error(error.message || "Unable to read this CSV file."))
    });
  });
}
