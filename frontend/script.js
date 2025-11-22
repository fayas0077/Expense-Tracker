// ==========================
// GLOBAL STATE & SELECTORS
// ==========================
const expenseForm = document.getElementById("expenseForm");
const tableBody = document.getElementById("expenseTableBody");
const totalAmountEl = document.getElementById("totalAmount");
const expenseCountLabel = document.getElementById("expenseCountLabel");
const dateInput = document.getElementById("date");

// expenses page
const searchTextEl = document.getElementById("searchText");
const filterCategoryEl = document.getElementById("filterCategory");
const filterFromEl = document.getElementById("filterFrom");
const filterToEl = document.getElementById("filterTo");
const expensesFullBody = document.getElementById("expensesFullTableBody");
const expensesCountSummary = document.getElementById("expensesCountSummary");
const expensesTotalSummary = document.getElementById("expensesTotalSummary");
const btnClearFilters = document.getElementById("btnClearFilters");
const btnExportCsv = document.getElementById("btnExportCsv");
const btnClearAll = document.getElementById("btnClearAll");

// analytics summary
const summaryThisMonth = document.getElementById("summaryThisMonth");
const summaryAverage = document.getElementById("summaryAverage");
const summaryCount = document.getElementById("summaryCount");
const summaryTopCategory = document.getElementById("summaryTopCategory");

// settings
const themeToggle = document.getElementById("themeToggle");
const btnResetData = document.getElementById("btnResetData");

// sidebar buttons
const btnDashboard = document.getElementById("btnDashboard");
const btnExpenses = document.getElementById("btnExpenses");
const btnAnalytics = document.getElementById("btnAnalytics");
const btnSettings = document.getElementById("btnSettings");

// pages
const sectionDashboard = document.getElementById("sectionDashboard");
const sectionExpenses = document.getElementById("sectionExpenses");
const sectionAnalytics = document.getElementById("sectionAnalytics");
const sectionSettings = document.getElementById("sectionSettings");

let expenses = []; // main data store

// charts
let categoryChart = null;
let monthlyChart = null;
let categoryPieChart = null;

// ==========================
// INIT
// ==========================
document.addEventListener("DOMContentLoaded", () => {
  setToday();
  initCategoryBarChart();
  initAnalyticsCharts();
  initSidebarNavigation();
  initSettings();
});

// default date
function setToday() {
  if (!dateInput) return;
  const today = new Date().toISOString().split("T")[0];
  dateInput.value = today;
}

// ==========================
// ADD EXPENSE (FORM SUBMIT)
// ==========================
if (expenseForm) {
  expenseForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const title = document.getElementById("title").value.trim();
    const amountValue = document.getElementById("amount").value;
    const amount = parseFloat(amountValue);
    const category = document.getElementById("category").value;
    const date = dateInput.value || new Date().toISOString().split("T")[0];

    if (!title || isNaN(amount) || amount <= 0) {
      alert("Please enter a valid title and amount greater than 0.");
      return;
    }

    const expense = {
      id: Date.now(),
      title,
      amount,
      category,
      date
    };

    expenses.push(expense);
    renderRecentTable();
    updateTotalsAndAnalytics();
    expenseForm.reset();
    setToday();
  });
}

// ==========================
// RENDER RECENT TABLE
// ==========================
function renderRecentTable() {
  if (!tableBody) return;

  if (expenses.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="5" class="empty-state">
          No expenses added yet. Start tracking your spending. 💸
        </td>
      </tr>
    `;
    expenseCountLabel.textContent = "0 items";
    return;
  }

  tableBody.innerHTML = "";
  // show last 6 expenses (most recent first)
  const recent = [...expenses].sort((a, b) => b.id - a.id).slice(0, 6);

  recent.forEach((exp) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${escapeHtml(exp.title)}</td>
      <td>${capitalize(exp.category)}</td>
      <td>${formatDate(exp.date)}</td>
      <td class="amount-cell">₹${exp.amount.toFixed(2)}</td>
      <td>
        <button class="btn-danger" onclick="deleteExpense(${exp.id})">Delete</button>
      </td>
    `;
    tableBody.appendChild(tr);
  });

  expenseCountLabel.textContent =
    expenses.length === 1 ? "1 item" : `${expenses.length} items`;
}

// ==========================
// TOTAL + ANALYTICS WRAPPER
// ==========================
function updateTotalsAndAnalytics() {
  updateTotal();
  updateCategoryBarChart();
  renderFullExpensesTable();
  updateAnalyticsSummary();
  updateAnalyticsCharts();
}

// total spent
function updateTotal() {
  const total = expenses.reduce((sum, item) => sum + item.amount, 0);
  totalAmountEl.textContent = total.toFixed(2);
}

// ==========================
// DELETE EXPENSE
// ==========================
function deleteExpense(id) {
  expenses = expenses.filter((e) => e.id !== id);
  renderRecentTable();
  updateTotalsAndAnalytics();
}
window.deleteExpense = deleteExpense;

// ==========================
// CATEGORY BAR CHART (Dashboard)
// ==========================
function initCategoryBarChart() {
  const ctx = document.getElementById("categoryChart").getContext("2d");

  categoryChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: ["Food", "Transport", "Shopping", "Bills", "Entertainment", "Other"],
      datasets: [
        {
          label: "Amount by Category (₹)",
          data: [0, 0, 0, 0, 0, 0],
          backgroundColor: [
            "#22c55e",
            "#22d3ee",
            "#a855f7",
            "#f97316",
            "#eab308",
            "#38bdf8"
          ],
          borderWidth: 1.5,
          borderRadius: 6
        }
      ]
    },
    options: {
      plugins: {
        legend: {
          labels: { color: "#e5e7eb" }
        }
      },
      scales: {
        x: {
          ticks: { color: "#cbd5e1" },
          grid: { color: "rgba(55, 65, 81, 0.4)" }
        },
        y: {
          beginAtZero: true,
          ticks: { color: "#cbd5e1" },
          grid: { color: "rgba(55, 65, 81, 0.4)" }
        }
      }
    }
  });
}

// helper to get category totals
function getCategoryTotals() {
  const totals = {
    food: 0,
    transport: 0,
    shopping: 0,
    bills: 0,
    entertainment: 0,
    other: 0
  };

  expenses.forEach((exp) => {
    if (totals.hasOwnProperty(exp.category)) {
      totals[exp.category] += exp.amount;
    }
  });

  return totals;
}

function updateCategoryBarChart() {
  if (!categoryChart) return;
  const totals = getCategoryTotals();
  categoryChart.data.datasets[0].data = [
    totals.food,
    totals.transport,
    totals.shopping,
    totals.bills,
    totals.entertainment,
    totals.other
  ];
  categoryChart.update();
}

// ==========================
// FULL EXPENSES PAGE TABLE + FILTERING
// ==========================
function applyFilters() {
  const search = searchTextEl.value.trim().toLowerCase();
  const filterCategory = filterCategoryEl.value;
  const from = filterFromEl.value ? new Date(filterFromEl.value) : null;
  const to = filterToEl.value ? new Date(filterToEl.value) : null;

  return expenses.filter((exp) => {
    let ok = true;

    if (search && !exp.title.toLowerCase().includes(search)) ok = false;
    if (filterCategory !== "all" && exp.category !== filterCategory) ok = false;

    const d = new Date(exp.date);
    if (from && d < from) ok = false;
    if (to && d > to) ok = false;

    return ok;
  });
}

function renderFullExpensesTable() {
  if (!expensesFullBody) return;

  const filtered = applyFilters();

  if (filtered.length === 0) {
    expensesFullBody.innerHTML = `
      <tr><td colspan="4" class="empty-state">No expenses match the filters.</td></tr>
    `;
    expensesCountSummary.textContent = "0 expenses";
    expensesTotalSummary.textContent = "Total: ₹0.00";
    return;
  }

  expensesFullBody.innerHTML = "";

  filtered
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .forEach((exp) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${escapeHtml(exp.title)}</td>
        <td>${capitalize(exp.category)}</td>
        <td>${formatDate(exp.date)}</td>
        <td class="amount-cell">₹${exp.amount.toFixed(2)}</td>
      `;
      expensesFullBody.appendChild(tr);
    });

  const total = filtered.reduce((s, e) => s + e.amount, 0);
  expensesCountSummary.textContent =
    filtered.length === 1 ? "1 expense" : `${filtered.length} expenses`;
  expensesTotalSummary.textContent = `Total: ₹${total.toFixed(2)}`;
}

// filter events
if (searchTextEl) {
  ["input", "change"].forEach((ev) =>
    searchTextEl.addEventListener(ev, () => renderFullExpensesTable())
  );
}
if (filterCategoryEl) {
  filterCategoryEl.addEventListener("change", renderFullExpensesTable);
}
if (filterFromEl) {
  filterFromEl.addEventListener("change", renderFullExpensesTable);
}
if (filterToEl) {
  filterToEl.addEventListener("change", renderFullExpensesTable);
}

if (btnClearFilters) {
  btnClearFilters.addEventListener("click", () => {
    searchTextEl.value = "";
    filterCategoryEl.value = "all";
    filterFromEl.value = "";
    filterToEl.value = "";
    renderFullExpensesTable();
  });
}

// Export CSV
if (btnExportCsv) {
  btnExportCsv.addEventListener("click", () => {
    if (expenses.length === 0) {
      alert("No expenses to export.");
      return;
    }

    const filtered = applyFilters();
    if (filtered.length === 0) {
      alert("No expenses match the filters.");
      return;
    }

    const header = ["Title", "Category", "Date", "Amount (INR)"];
    const rows = filtered.map((e) => [
      e.title,
      capitalize(e.category),
      formatDate(e.date),
      e.amount.toFixed(2)
    ]);

    const csvContent =
      [header, ...rows].map((row) => row.map(escapeCsv).join(",")).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "expenses.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  });
}

// Clear all expenses
if (btnClearAll) {
  btnClearAll.addEventListener("click", () => {
    if (!confirm("Are you sure you want to clear ALL expenses?")) return;
    expenses = [];
    renderRecentTable();
    updateTotalsAndAnalytics();
  });
}

// ==========================
// ANALYTICS: SUMMARY + CHARTS
// ==========================
function initAnalyticsCharts() {
  // monthly line chart
  const mctx = document.getElementById("monthlyChart").getContext("2d");
  monthlyChart = new Chart(mctx, {
    type: "line",
    data: {
      labels: [],
      datasets: [
        {
          label: "Monthly spending (₹)",
          data: [],
          borderColor: "#22c55e",
          backgroundColor: "rgba(34, 197, 94, 0.2)",
          borderWidth: 2,
          tension: 0.3,
          fill: true
        }
      ]
    },
    options: {
      plugins: { legend: { labels: { color: "#e5e7eb" } } },
      scales: {
        x: { ticks: { color: "#cbd5e1" }, grid: { color: "rgba(55,65,81,0.4)" } },
        y: { ticks: { color: "#cbd5e1" }, grid: { color: "rgba(55,65,81,0.4)" } }
      }
    }
  });

  // category pie chart
  const pctx = document.getElementById("categoryPieChart").getContext("2d");
  categoryPieChart = new Chart(pctx, {
    type: "pie",
    data: {
      labels: ["Food", "Transport", "Shopping", "Bills", "Entertainment", "Other"],
      datasets: [
        {
          data: [0, 0, 0, 0, 0, 0],
          backgroundColor: [
            "#22c55e",
            "#22d3ee",
            "#a855f7",
            "#f97316",
            "#eab308",
            "#38bdf8"
          ],
          borderWidth: 1
        }
      ]
    },
    options: {
      plugins: { legend: { labels: { color: "#e5e7eb" } } }
    }
  });
}

// summary at top of analytics page
function updateAnalyticsSummary() {
  const total = expenses.reduce((s, e) => s + e.amount, 0);
  const count = expenses.length;
  const average = count ? total / count : 0;

  // this month total
  const now = new Date();
  const thisMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
    2,
    "0"
  )}`;
  let thisMonthTotal = 0;

  const categoryTotals = getCategoryTotals();

  expenses.forEach((e) => {
    const d = new Date(e.date);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    if (key === thisMonthKey) thisMonthTotal += e.amount;
  });

  summaryThisMonth.textContent = `₹${thisMonthTotal.toFixed(2)}`;
  summaryAverage.textContent = `₹${average.toFixed(2)}`;
  summaryCount.textContent = count.toString();

  // top category
  let topCat = "–";
  let maxVal = 0;
  Object.entries(categoryTotals).forEach(([cat, val]) => {
    if (val > maxVal) {
      maxVal = val;
      topCat = capitalize(cat);
    }
  });
  summaryTopCategory.textContent = maxVal > 0 ? topCat : "–";
}

// update analytics charts (monthly + pie)
function updateAnalyticsCharts() {
  if (!monthlyChart || !categoryPieChart) return;

  // monthly totals
  const monthTotals = {};
  expenses.forEach((e) => {
    const d = new Date(e.date);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    monthTotals[key] = (monthTotals[key] || 0) + e.amount;
  });

  const keys = Object.keys(monthTotals).sort();
  const labels = keys.map((k) => {
    const [y, m] = k.split("-");
    const d = new Date(Number(y), Number(m) - 1, 1);
    return d.toLocaleDateString("en-IN", { month: "short", year: "2-digit" });
  });
  const data = keys.map((k) => monthTotals[k].toFixed(2));

  monthlyChart.data.labels = labels;
  monthlyChart.data.datasets[0].data = data;
  monthlyChart.update();

  // pie chart (reuse category totals)
  const totals = getCategoryTotals();
  categoryPieChart.data.datasets[0].data = [
    totals.food,
    totals.transport,
    totals.shopping,
    totals.bills,
    totals.entertainment,
    totals.other
  ];
  categoryPieChart.update();
}

// ==========================
// SIDEBAR NAVIGATION
// ==========================
function initSidebarNavigation() {
  function setActivePage(pageName) {
    // pages
    sectionDashboard.classList.remove("page-active");
    sectionExpenses.classList.remove("page-active");
    sectionAnalytics.classList.remove("page-active");
    sectionSettings.classList.remove("page-active");

    if (pageName === "dashboard") sectionDashboard.classList.add("page-active");
    if (pageName === "expenses") sectionExpenses.classList.add("page-active");
    if (pageName === "analytics") sectionAnalytics.classList.add("page-active");
    if (pageName === "settings") sectionSettings.classList.add("page-active");

    // nav active class
    document.querySelectorAll(".nav-item").forEach((btn) =>
      btn.classList.remove("active")
    );
    if (pageName === "dashboard") btnDashboard.classList.add("active");
    if (pageName === "expenses") btnExpenses.classList.add("active");
    if (pageName === "analytics") btnAnalytics.classList.add("active");
    if (pageName === "settings") btnSettings.classList.add("active");
  }

  btnDashboard.addEventListener("click", () => setActivePage("dashboard"));
  btnExpenses.addEventListener("click", () => {
    setActivePage("expenses");
    renderFullExpensesTable();
  });
  btnAnalytics.addEventListener("click", () => {
    setActivePage("analytics");
    updateAnalyticsSummary();
    updateAnalyticsCharts();
  });
  btnSettings.addEventListener("click", () => setActivePage("settings"));
}

// ==========================
// SETTINGS (THEME + RESET)
// ==========================
function initSettings() {
  if (themeToggle) {
    themeToggle.addEventListener("change", (e) => {
      document.body.classList.toggle("light-theme", e.target.checked);
    });
  }

  if (btnResetData) {
    btnResetData.addEventListener("click", () => {
      if (!confirm("This will clear all expense data in this browser. Continue?"))
        return;
      expenses = [];
      renderRecentTable();
      updateTotalsAndAnalytics();
    });
  }
}

// ==========================
// HELPERS
// ==========================
function formatDate(dateStr) {
  const d = new Date(dateStr);
  if (isNaN(d)) return dateStr;
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function capitalize(str) {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function escapeCsv(str) {
  const s = String(str);
  if (s.includes(",") || s.includes('"') || s.includes("\n")) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}
