import { loadCsvFile } from "./csvLoader.js";
import { validateDataset } from "./dataValidator.js";

const datasetNames = ["products", "customers", "orders"];
const uploadedData = Object.fromEntries(datasetNames.map((name) => [name, null]));

const processButton = document.querySelector("#process-button");
const resetButton = document.querySelector("#reset-button");
const overallStatus = document.querySelector("#overall-status");
const resultsContainer = document.querySelector("#results");

function setOverallStatus(message, type = "") {
  overallStatus.textContent = message;
  overallStatus.className = `overall-status ${type}`.trim();
}

function updateProcessButton() {
  processButton.disabled = !datasetNames.every((name) => uploadedData[name]?.validation?.valid);
}

function updateFileStatus(datasetName, message, type = "") {
  const status = document.querySelector(`#${datasetName}-status`);
  status.textContent = message;
  status.className = `file-status ${type}`.trim();
}

async function handleFileSelection(event) {
  const input = event.currentTarget;
  const datasetName = input.dataset.dataset;
  const file = input.files?.[0];

  uploadedData[datasetName] = null;
  document.querySelector(`#${datasetName}-file-name`).textContent = file?.name ?? "No file selected";
  resultsContainer.className = "results-empty";
  resultsContainer.textContent = "Select all three valid files, then process them to see previews.";
  updateProcessButton();

  if (!file) {
    updateFileStatus(datasetName, "Waiting for file");
    return;
  }

  updateFileStatus(datasetName, "Reading and checking file…");
  try {
    const parsed = await loadCsvFile(file);
    const validation = validateDataset(datasetName, parsed);
    if (!validation.valid) {
      updateFileStatus(datasetName, validation.errors.join(" "), "error");
      setOverallStatus(`The ${datasetName} file needs attention.`, "error");
      return;
    }

    uploadedData[datasetName] = { ...parsed, validation };
    const warningText = validation.warnings.length ? ` · ${validation.warnings.length} warning(s)` : "";
    updateFileStatus(datasetName, `Valid · ${validation.rowCount} rows${warningText}`, "success");
    setOverallStatus(`${datasetName[0].toUpperCase() + datasetName.slice(1)} file validated.`);
  } catch (error) {
    updateFileStatus(datasetName, error.message, "error");
    setOverallStatus(error.message, "error");
  }
  updateProcessButton();
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[character]);
}

function renderPreview(datasetName, data) {
  const previewRows = data.rows.slice(0, 5);
  const headers = data.headers;
  const headerHtml = headers.map((header) => `<th scope="col">${escapeHtml(header)}</th>`).join("");
  const bodyHtml = previewRows.map((row) =>
    `<tr>${headers.map((header) => `<td>${escapeHtml(row[header])}</td>`).join("")}</tr>`
  ).join("");

  return `
    <div class="preview-block">
      <h3>${datasetName[0].toUpperCase() + datasetName.slice(1)} · ${data.rows.length.toLocaleString()} rows</h3>
      <div class="table-wrap">
        <table>
          <thead><tr>${headerHtml}</tr></thead>
          <tbody>${bodyHtml}</tbody>
        </table>
      </div>
      ${data.rows.length > 5 ? '<p class="muted">Showing the first 5 rows.</p>' : ""}
      ${data.validation.warnings.map((warning) => `<p class="file-status error">${escapeHtml(warning)}</p>`).join("")}
    </div>`;
}

function processUploadedFiles() {
  const totalRows = datasetNames.reduce((sum, name) => sum + uploadedData[name].rows.length, 0);
  const summary = datasetNames.map((name) => `
    <div class="summary-card">
      <span>${name[0].toUpperCase() + name.slice(1)} rows</span>
      <strong>${uploadedData[name].rows.length.toLocaleString()}</strong>
    </div>`).join("");

  resultsContainer.className = "";
  resultsContainer.innerHTML = `
    <div class="result-summary">
      ${summary}
      <div class="summary-card"><span>Total rows loaded</span><strong>${totalRows.toLocaleString()}</strong></div>
    </div>
    ${datasetNames.map((name) => renderPreview(name, uploadedData[name])).join("")}
  `;
  setOverallStatus("All three CSV files were parsed and passed the required-column checks.", "success");
}

function resetApplication() {
  datasetNames.forEach((name) => {
    uploadedData[name] = null;
    document.querySelector(`#${name}-file`).value = "";
    document.querySelector(`#${name}-file-name`).textContent = "No file selected";
    updateFileStatus(name, "Waiting for file");
  });
  resultsContainer.className = "results-empty";
  resultsContainer.textContent = "Your file summaries and data previews will appear here after processing.";
  setOverallStatus("Upload all three files to begin.");
  updateProcessButton();
}

datasetNames.forEach((name) => {
  document.querySelector(`#${name}-file`).addEventListener("change", handleFileSelection);
});
processButton.addEventListener("click", processUploadedFiles);
resetButton.addEventListener("click", resetApplication);
