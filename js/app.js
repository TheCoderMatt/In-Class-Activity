import { loadCsvFile } from "./csvLoader.js";
import { validateDataset } from "./dataValidator.js";

const fileInput = document.querySelector("#csv-files");
const resetButton = document.querySelector("#reset-button");
const overallStatus = document.querySelector("#overall-status");
const resultsContainer = document.querySelector("#results");

let uploadedDatasets = [];

function setOverallStatus(message, type = "") {
  overallStatus.textContent = message;
  overallStatus.className = `overall-status ${type}`.trim();
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[character]);
}

function renderDataset(dataset) {
  const { fileName, headers, rows, validation } = dataset;
  const previewRows = rows.slice(0, 5);
  const headerHtml = headers.map((header) => `<th scope="col">${escapeHtml(header)}</th>`).join("");
  const bodyHtml = previewRows.map((row) =>
    `<tr>${headers.map((header) => `<td>${escapeHtml(row[header])}</td>`).join("")}</tr>`
  ).join("");

  return `
    <article class="dataset-card">
      <div class="dataset-heading">
        <div>
          <h3>${escapeHtml(fileName)}</h3>
          <p class="dataset-meta">${rows.length.toLocaleString()} rows · ${headers.length.toLocaleString()} columns</p>
        </div>
        <span class="dataset-badge">CSV parsed</span>
      </div>
      <p class="column-list"><strong>Columns:</strong> ${headers.map(escapeHtml).join(", ")}</p>
      <div class="table-wrap">
        <table>
          <thead><tr>${headerHtml}</tr></thead>
          <tbody>${bodyHtml}</tbody>
        </table>
      </div>
      ${rows.length > 5 ? '<p class="muted preview-note">Showing the first 5 rows.</p>' : ""}
      ${validation.warnings.map((warning) => `<p class="file-status">${escapeHtml(warning)}</p>`).join("")}
    </article>`;
}

function renderResults() {
  if (!uploadedDatasets.length) {
    resultsContainer.className = "results-empty";
    resultsContainer.textContent = "Your file summaries and data previews will appear here after you choose files.";
    return;
  }

  const totalRows = uploadedDatasets.reduce((sum, dataset) => sum + dataset.rows.length, 0);
  const totalColumns = uploadedDatasets.reduce((sum, dataset) => sum + dataset.headers.length, 0);
  resultsContainer.className = "";
  resultsContainer.innerHTML = `
    <div class="result-summary">
      <div class="summary-card"><span>Files loaded</span><strong>${uploadedDatasets.length.toLocaleString()}</strong></div>
      <div class="summary-card"><span>Total rows</span><strong>${totalRows.toLocaleString()}</strong></div>
      <div class="summary-card"><span>Total columns</span><strong>${totalColumns.toLocaleString()}</strong></div>
    </div>
    <div class="dataset-list">${uploadedDatasets.map(renderDataset).join("")}</div>
  `;
}

async function handleFileSelection(event) {
  const selectedFiles = Array.from(event.currentTarget.files ?? []);
  if (!selectedFiles.length) return;

  uploadedDatasets = [];
  renderResults();
  resetButton.disabled = false;
  setOverallStatus(`Reading ${selectedFiles.length} selected file(s)…`);

  const failures = [];
  for (const file of selectedFiles) {
    try {
      const parsed = await loadCsvFile(file);
      const validation = validateDataset(parsed);
      if (!validation.valid) {
        failures.push(`${file.name}: ${validation.errors.join(" ")}`);
        continue;
      }
      uploadedDatasets.push({ ...parsed, validation });
    } catch (error) {
      failures.push(`${file.name}: ${error.message}`);
    }
  }

  renderResults();
  const loadedCount = uploadedDatasets.length;
  if (failures.length) {
    setOverallStatus(
      `Loaded ${loadedCount} of ${selectedFiles.length} file(s). ${failures.join(" ")}`,
      loadedCount ? "" : "error"
    );
  } else {
    setOverallStatus(`Successfully loaded and previewed ${loadedCount} CSV file(s).`, "success");
  }
}

function resetApplication() {
  uploadedDatasets = [];
  fileInput.value = "";
  resetButton.disabled = true;
  renderResults();
  setOverallStatus("No files selected yet.");
}

fileInput.addEventListener("change", handleFileSelection);
resetButton.addEventListener("click", resetApplication);
