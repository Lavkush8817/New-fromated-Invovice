/** @format */

// ═══ Application State ═══
let currentView = 'dashboard';
let currentFormType = 'invoice'; // 'invoice', 'quotation', 'bill'
let activeRecentTab = 'all';
let activeDocsTab = 'all';
let pendingDeleteId = null;

// Initial Mock Data from Reference Image
const initialDocuments = [
  {
    id: "INV-2026-058",
    type: "invoice",
    customer: "ABC Traders",
    customerDetails: "ABC Traders\nGSTIN: 23ABCDE1234F1Z0\nMain Street, Singrauli",
    amount: 25640.00,
    date: "11 Jul 2026",
    rawDate: "2026-07-11",
    status: "Paid",
    ref: "EE/VJ/APRL-2024/58",
    warranty: "WARRANTY: One Year only. Warranty claim will be made only on manufacturing default.",
    cgstRate: 9,
    sgstRate: 9,
    items: [
      { desc: "VAJRA ROCK BREAKER HD+ WITH PIPELINE AND ACCESSORIES", hsn: "8431", qty: 1, price: 21728.81 }
    ]
  },
  {
    id: "QTN-2026-034",
    type: "quotation",
    customer: "XYZ Enterprises",
    customerDetails: "XYZ Enterprises\nGSTIN: 23XYZAB9876C1Z9\nIndustrial Area, Singrauli",
    amount: 18350.00,
    date: "10 Jul 2026",
    rawDate: "2026-07-10",
    status: "Pending",
    ref: "EE/VJ/APRL-2024/34",
    warranty: "WARRANTY: One Year only. Warranty claim will be made only on manufacturing default.",
    cgstRate: 9,
    sgstRate: 9,
    items: [
      { desc: "SPARE PARTS KIT AND REPAIR SERVICES", hsn: "8431", qty: 1, price: 15550.85 }
    ]
  },
  {
    id: "BIL-2026-034",
    type: "bill",
    customer: "Sharma Suppliers",
    customerDetails: "Sharma Suppliers\nGSTIN: 23SHARM5544K1ZX\nWaidhan, Singrauli",
    amount: 12450.00,
    date: "09 Jul 2026",
    rawDate: "2026-07-09",
    status: "Paid",
    ref: "EE/VJ/APRL-2024/12",
    warranty: "WARRANTY: One Year only. Warranty claim will be made only on manufacturing default.",
    cgstRate: 9,
    sgstRate: 9,
    items: [
      { desc: "HYDRAULIC OIL AND FITTINGS SUPPLY", hsn: "3819", qty: 1, price: 10550.85 }
    ]
  },
  {
    id: "INV-2026-057",
    type: "invoice",
    customer: "PQR Industries",
    customerDetails: "PQR Industries\nGSTIN: 23PQRIN7766D1ZY\nMorwa, Singrauli",
    amount: 7890.00,
    date: "09 Jul 2026",
    rawDate: "2026-07-09",
    status: "Paid",
    ref: "EE/VJ/APRL-2024/57",
    warranty: "WARRANTY: One Year only. Warranty claim will be made only on manufacturing default.",
    cgstRate: 9,
    sgstRate: 9,
    items: [
      { desc: "ANNUAL MAINTENANCE SERVICE CHARGES", hsn: "9987", qty: 1, price: 6686.44 }
    ]
  },
  {
    id: "QTN-2026-033",
    type: "quotation",
    customer: "Kumar & Sons",
    customerDetails: "Kumar & Sons\nGSTIN: 23KUMAR1122H1ZP\nSector 2, Singrauli",
    amount: 9200.00,
    date: "08 Jul 2026",
    rawDate: "2026-07-08",
    status: "Draft",
    ref: "EE/VJ/APRL-2024/33",
    warranty: "WARRANTY: One Year only. Warranty claim will be made only on manufacturing default.",
    cgstRate: 9,
    sgstRate: 9,
    items: [
      { desc: "VALVES AND COUPLINGS SPARES", hsn: "8481", qty: 1, price: 7796.61 }
    ]
  }
];

// Base stats from reference image offset
const baseStats = {
  total: 126,
  invoice: 58,
  quotation: 34,
  bill: 34
};

// ═══ Initialize Application ═══
document.addEventListener("DOMContentLoaded", () => {
  // Set current date in top header
  setCurrentDate();
  
  // Render Dashboard stats and tables
  renderAll();

  // Setup Event Listeners
  setupNavigation();
  setupResponsiveSidebar();
  setupActionButtons();
  setupSearchAndFilters();
  setupModal();
  
  // Run initial Lucide icon rendering
  lucide.createIcons();
});

// Set formatted date in header
function setCurrentDate() {
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  const dateEl = document.getElementById("header-date");
  if (dateEl) {
    dateEl.innerText = new Date().toLocaleDateString('en-US', options);
  }
}

// ═══ Navigation & View Toggling ═══
function setupNavigation() {
  const menuButtons = document.querySelectorAll(".menu-item[data-view]");
  menuButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      const viewId = btn.getAttribute("data-view");
      
      // Update sidebar active state
      menuButtons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      
      // Switch view
      if (viewId === 'invoices') {
        switchView('documents-view');
        setDocsTab('invoice');
      } else if (viewId === 'quotations') {
        switchView('documents-view');
        setDocsTab('quotation');
      } else if (viewId === 'bills') {
        switchView('documents-view');
        setDocsTab('bill');
      } else if (viewId === 'dashboard') {
        switchView('dashboard-view');
      } else {
        switchView(`${viewId}-view`);
      }
      
      // Close sidebar drawer on mobile
      closeMobileSidebar();
    });
  });

  // Welcome stats click handlers
  const statCards = document.querySelectorAll(".summary-card");
  statCards.forEach(card => {
    card.addEventListener("click", () => {
      const filter = card.getAttribute("data-filter");
      switchView('documents-view');
      setDocsTab(filter);
      
      // Sync sidebar active menu item
      const menuButtons = document.querySelectorAll(".menu-item[data-view]");
      menuButtons.forEach(b => {
        b.classList.remove("active");
        if (filter === 'all' && b.getAttribute("data-view") === 'dashboard') b.classList.add("active");
        else if (filter === 'invoice' && b.getAttribute("data-view") === 'invoices') b.classList.add("active");
        else if (filter === 'quotation' && b.getAttribute("data-view") === 'quotations') b.classList.add("active");
        else if (filter === 'bill' && b.getAttribute("data-view") === 'bills') b.classList.add("active");
      });
    });
  });

  // "View All Documents" button handler
  const viewAllBtn = document.getElementById("view-all-docs-btn");
  if (viewAllBtn) {
    viewAllBtn.addEventListener("click", () => {
      switchView('documents-view');
      setDocsTab('all');
      
      // Update sidebar highlight
      const menuButtons = document.querySelectorAll(".menu-item[data-view]");
      menuButtons.forEach(b => b.classList.remove("active"));
      const dbBtn = document.querySelector(".menu-item[data-view='dashboard']");
      if (dbBtn) dbBtn.classList.add("active");
    });
  }

  // Back to Dashboard from Invoice Editor
  const backBtn = document.getElementById("back-to-dashboard-btn");
  if (backBtn) {
    backBtn.addEventListener("click", () => {
      switchView('dashboard-view');
      
      // Update sidebar highlight
      const menuButtons = document.querySelectorAll(".menu-item[data-view]");
      menuButtons.forEach(b => b.classList.remove("active"));
      const dbBtn = document.querySelector(".menu-item[data-view='dashboard']");
      if (dbBtn) dbBtn.classList.add("active");
    });
  }
}

function switchView(viewId) {
  currentView = viewId;
  const sections = document.querySelectorAll(".view-section");
  sections.forEach(sec => {
    if (sec.id === viewId) {
      sec.style.display = "block";
    } else {
      sec.style.display = "none";
    }
  });
  
  // Re-run lucide to render any icons in dynamically displayed sections
  lucide.createIcons();
}

function setDocsTab(tabName) {
  activeDocsTab = tabName;
  const docTabs = document.querySelectorAll("#documents-tabs .tab-btn");
  docTabs.forEach(btn => {
    if (btn.getAttribute("data-tab") === tabName) {
      btn.classList.add("active");
    } else {
      btn.classList.remove("active");
    }
  });
  
  // Re-render documents table
  renderDocumentsTable();
}

// ═══ Responsive Sidebar Toggle ═══
function setupResponsiveSidebar() {
  const hamburger = document.getElementById("hamburger-btn");
  const sidebar = document.getElementById("sidebar");
  const overlay = document.getElementById("sidebar-overlay");
  
  if (hamburger && sidebar && overlay) {
    hamburger.addEventListener("click", () => {
      sidebar.classList.add("active");
      overlay.classList.add("active");
    });
    
    overlay.addEventListener("click", () => {
      closeMobileSidebar();
    });
  }
}

function closeMobileSidebar() {
  const sidebar = document.getElementById("sidebar");
  const overlay = document.getElementById("sidebar-overlay");
  if (sidebar && overlay) {
    sidebar.classList.remove("active");
    overlay.classList.remove("active");
  }
}

// ═══ Document Actions (Create, Edit, Print, Delete) ═══
function setupActionButtons() {
  // Click handler for Quick Action cards
  const createDocBtns = document.querySelectorAll(".create-doc-btn");
  createDocBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      const type = btn.getAttribute("data-type");
      openNewDocumentForm(type);
    });
  });
}

function openNewDocumentForm(type) {
  currentFormType = type;
  
  // Update header text in Form
  const labelEl = document.getElementById("form-type-label");
  const h2El = document.querySelector("#invoice-view #h2");
  let typeLabel = "TAX INVOICE";
  if (type === 'quotation') typeLabel = "QUOTATION";
  if (type === 'bill') typeLabel = "BILL";
  
  if (labelEl) labelEl.innerText = typeLabel;
  if (h2El) h2El.innerText = typeLabel;
  
  // Clear form inputs
  document.getElementById("ref").value = "";
  document.getElementById("date").value = new Date().toISOString().split("T")[0];
  document.getElementById("customer-info").value = "";
  document.getElementById("Warranty").value = "WARRANTY: One Year only. Warranty claim will be made only on manufacturing default.";
  document.getElementById("cgstRate").value = 9;
  document.getElementById("sgstRate").value = 9;
  
  // Set new dynamic document number
  const nextNum = getNextDocumentNumber(type);
  document.getElementById("docNo").value = nextNum;
  
  // Clear items table to 1 empty row
  const table = document.getElementById("quotation-body");
  table.innerHTML = "";
  
  let row = table.insertRow(-1);
  let c1 = row.insertCell(0);
  let c2 = row.insertCell(1);
  let c3 = row.insertCell(2);
  let c4 = row.insertCell(3);
  let c5 = row.insertCell(4);
  let c6 = row.insertCell(5);
  
  c1.innerText = 1;
  c2.contentEditable = true;
  c2.innerText = "";
  c3.contentEditable = true;
  c3.innerText = "";
  c4.contentEditable = true;
  c4.innerText = "0";
  c5.contentEditable = true;
  c5.innerText = "0";
  c6.className = "totalAmount";
  c6.innerText = "0.00";
  
  c4.oninput = calculateTotal;
  c5.oninput = calculateTotal;
  
  calculateTotal();
  switchView('invoice-view');
}

function getNextDocumentNumber(type) {
  let allDocs = getAllDocuments();
  let prefix = 'INV';
  if (type === 'quotation') prefix = 'QTN';
  if (type === 'bill') prefix = 'BIL';
  
  let maxNum = 0;
  allDocs.forEach(doc => {
    if (doc.type === type) {
      // Extract number from format PREFIX-YYYY-NNN (e.g. INV-2026-058)
      const parts = doc.id.split('-');
      if (parts.length >= 3) {
        const num = parseInt(parts[2]);
        if (!isNaN(num) && num > maxNum) {
          maxNum = num;
        }
      }
    }
  });
  
  const currentYear = new Date().getFullYear();
  const nextNumString = String(maxNum + 1).padStart(3, '0');
  return `${prefix}-${currentYear}-${nextNumString}`;
}

// ═══ Save Document ═══
function saveCurrentDocument() {
  const docId = document.getElementById("docNo").value.trim() || ("DOC-" + Date.now());
  const type = currentFormType;
  const ref = document.getElementById("ref").value.trim();
  const dateVal = document.getElementById("date").value;
  const customer = document.getElementById("customer-info").value.trim();
  const warranty = document.getElementById("Warranty").value.trim();
  const cgstRate = parseFloat(document.getElementById("cgstRate").value) || 0;
  const sgstRate = parseFloat(document.getElementById("sgstRate").value) || 0;
  const grandTotal = parseFloat(document.getElementById("grandTotal").innerText) || 0;
  
  // Extract items
  const items = [];
  const table = document.getElementById("quotation-body");
  const rows = table.getElementsByTagName("tr");
  for (let i = 0; i < rows.length; i++) {
    const cells = rows[i].getElementsByTagName("td");
    if (cells.length >= 6) {
      items.push({
        desc: cells[1].innerText.trim(),
        hsn: cells[2].innerText.trim(),
        qty: parseFloat(cells[3].innerText.trim()) || 0,
        price: parseFloat(cells[4].innerText.trim()) || 0
      });
    }
  }
  
  // Extract customer name
  let customerName = "Unknown Customer";
  if (customer) {
    // Take first line, clean up prompt text
    customerName = customer.split("\n")[0].replace("Enter Customer Details:", "").trim();
    if (!customerName) {
      customerName = "Unnamed Customer";
    }
  }
  
  const doc = {
    id: docId,
    type: type,
    customer: customerName,
    customerDetails: customer,
    amount: grandTotal,
    date: dateVal ? formatDate(dateVal) : formatDate(new Date()),
    rawDate: dateVal || new Date().toISOString().split("T")[0],
    ref: ref,
    warranty: warranty,
    cgstRate: cgstRate,
    sgstRate: sgstRate,
    status: "Saved",
    items: items
  };
  
  let userDocs = JSON.parse(localStorage.getItem('user_documents') || '[]');
  const existingIndex = userDocs.findIndex(d => d.id === docId);
  if (existingIndex > -1) {
    // Preserve existing status
    doc.status = userDocs[existingIndex].status || "Saved";
    userDocs[existingIndex] = doc;
  } else {
    userDocs.unshift(doc);
  }
  
  localStorage.setItem('user_documents', JSON.stringify(userDocs));
  
  showToast("Document saved successfully!", "success");
  
  // Refresh data and switch view
  renderAll();
  switchView('dashboard-view');
  
  // Rehighlight Dashboard sidebar
  const menuButtons = document.querySelectorAll(".menu-item[data-view]");
  menuButtons.forEach(b => b.classList.remove("active"));
  const dbBtn = document.querySelector(".menu-item[data-view='dashboard']");
  if (dbBtn) dbBtn.classList.add("active");
}

function loadDocument(docId) {
  let allDocs = getAllDocuments();
  let doc = allDocs.find(d => d.id === docId);
  if (!doc) return;
  
  currentFormType = doc.type;
  
  // Update header labels
  const labelEl = document.getElementById("form-type-label");
  const h2El = document.querySelector("#invoice-view #h2");
  let typeLabel = "TAX INVOICE";
  if (doc.type === 'quotation') typeLabel = "QUOTATION";
  if (doc.type === 'bill') typeLabel = "BILL";
  
  if (labelEl) labelEl.innerText = typeLabel;
  if (h2El) h2El.innerText = typeLabel;
  
  // Fill inputs
  document.getElementById("docNo").value = doc.id;
  document.getElementById("ref").value = doc.ref || "";
  document.getElementById("date").value = doc.rawDate || "";
  document.getElementById("customer-info").value = doc.customerDetails || doc.customer;
  document.getElementById("Warranty").value = doc.warranty || "";
  document.getElementById("cgstRate").value = doc.cgstRate !== undefined ? doc.cgstRate : 9;
  document.getElementById("sgstRate").value = doc.sgstRate !== undefined ? doc.sgstRate : 9;
  
  // Populate items
  const table = document.getElementById("quotation-body");
  table.innerHTML = "";
  
  if (doc.items && doc.items.length > 0) {
    doc.items.forEach((item, index) => {
      let row = table.insertRow(-1);
      let c1 = row.insertCell(0);
      let c2 = row.insertCell(1);
      let c3 = row.insertCell(2);
      let c4 = row.insertCell(3);
      let c5 = row.insertCell(4);
      let c6 = row.insertCell(5);
      
      c1.innerText = index + 1;
      c2.contentEditable = true;
      c2.innerText = item.desc;
      c3.contentEditable = true;
      c3.innerText = item.hsn;
      c4.contentEditable = true;
      c4.innerText = item.qty;
      c5.contentEditable = true;
      c5.innerText = item.price;
      c6.className = "totalAmount";
      c6.innerText = (item.qty * item.price).toFixed(2);
      
      c4.oninput = calculateTotal;
      c5.oninput = calculateTotal;
    });
  } else {
    // Empty default row
    let row = table.insertRow(-1);
    let c1 = row.insertCell(0);
    let c2 = row.insertCell(1);
    let c3 = row.insertCell(2);
    let c4 = row.insertCell(3);
    let c5 = row.insertCell(4);
    let c6 = row.insertCell(5);
    
    c1.innerText = 1;
    c2.contentEditable = true;
    c2.innerText = "";
    c3.contentEditable = true;
    c3.innerText = "";
    c4.contentEditable = true;
    c4.innerText = "0";
    c5.contentEditable = true;
    c5.innerText = "0";
    c6.className = "totalAmount";
    c6.innerText = "0.00";
    
    c4.oninput = calculateTotal;
    c5.oninput = calculateTotal;
  }
  
  calculateTotal();
  switchView('invoice-view');
}

function printDocument(docId) {
  loadDocument(docId);
  setTimeout(() => {
    window.print();
  }, 150);
}

function deleteDocument(docId) {
  pendingDeleteId = docId;
  const modal = document.getElementById("confirm-modal");
  if (modal) {
    modal.classList.add("show");
  }
}

// ═══ Search & Tab Filter Listeners ═══
function setupSearchAndFilters() {
  // Global search input listener (top header)
  const globalSearch = document.getElementById("global-search");
  if (globalSearch) {
    globalSearch.addEventListener("input", (e) => {
      const q = e.target.value.trim().toLowerCase();
      if (q.length > 0) {
        // If not already in documents view, switch
        if (currentView !== 'documents-view') {
          switchView('documents-view');
          
          // De-select active menus
          const menuButtons = document.querySelectorAll(".menu-item[data-view]");
          menuButtons.forEach(b => b.classList.remove("active"));
        }
        
        // Populate the documents view search box
        const docSearch = document.getElementById("documents-search");
        if (docSearch) {
          docSearch.value = e.target.value;
        }
        
        renderDocumentsTable();
      }
    });
    
    // Keyboard shortcut ⌘ K or Ctrl K to focus search
    window.addEventListener("keydown", (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        globalSearch.focus();
      }
    });
  }

  // Documents view search input listener
  const docSearch = document.getElementById("documents-search");
  if (docSearch) {
    docSearch.addEventListener("input", (e) => {
      // Sync global search input
      const globalSearch = document.getElementById("global-search");
      if (globalSearch) {
        globalSearch.value = e.target.value;
      }
      renderDocumentsTable();
    });
  }

  // Dashboard Recent tabs filter clicks
  const recentTabs = document.querySelectorAll("#recent-tabs .tab-btn");
  recentTabs.forEach(btn => {
    btn.addEventListener("click", () => {
      recentTabs.forEach(t => t.classList.remove("active"));
      btn.classList.add("active");
      activeRecentTab = btn.getAttribute("data-tab");
      renderRecentTable();
    });
  });

  // Documents page tabs filter clicks
  const docTabs = document.querySelectorAll("#documents-tabs .tab-btn");
  docTabs.forEach(btn => {
    btn.addEventListener("click", () => {
      docTabs.forEach(t => t.classList.remove("active"));
      btn.classList.add("active");
      activeDocsTab = btn.getAttribute("data-tab");
      renderDocumentsTable();
    });
  });
}

// ═══ Data Retrieval Helpers ═══
function getAllDocuments() {
  let userDocs = JSON.parse(localStorage.getItem('user_documents') || '[]');
  let deletedInitial = JSON.parse(localStorage.getItem('deleted_initial_documents') || '[]');
  
  // Filter initial documents to exclude deleted ones
  let filteredInitial = initialDocuments.filter(d => !deletedInitial.includes(d.id));
  
  // Combine user documents and filtered initial documents
  return [...userDocs, ...filteredInitial];
}

// ═══ Render Logic ═══
function renderAll() {
  updateStats();
  renderRecentTable();
  renderDocumentsTable();
}

function updateStats() {
  let allDocs = getAllDocuments();
  
  let stats = {
    total: allDocs.length,
    invoice: allDocs.filter(d => d.type === 'invoice').length,
    quotation: allDocs.filter(d => d.type === 'quotation').length,
    bill: allDocs.filter(d => d.type === 'bill').length
  };

  // Update elements
  document.getElementById("stat-total").innerText = stats.total;
  document.getElementById("stat-invoices").innerText = stats.invoice;
  document.getElementById("stat-quotations").innerText = stats.quotation;
  document.getElementById("stat-bills").innerText = stats.bill;
}

function renderRecentTable() {
  const container = document.getElementById("recent-documents-body");
  if (!container) return;
  
  let docs = getAllDocuments();
  
  // Filter by tab selection
  if (activeRecentTab !== 'all') {
    docs = docs.filter(d => d.type === activeRecentTab);
  }
  
  // Take top 5
  const recentDocs = docs.slice(0, 5);
  
  // Render rows
  if (recentDocs.length === 0) {
    container.innerHTML = `<tr><td colspan="7" style="text-align: center; color: var(--text-muted);">No documents found</td></tr>`;
    return;
  }
  
  container.innerHTML = recentDocs.map(doc => `
    <tr>
      <td><span class="doc-link" onclick="loadDocument('${doc.id}')">${doc.id}</span></td>
      <td><span class="badge-type ${doc.type}">${capitalizeFirst(doc.type)}</span></td>
      <td>${doc.customer}</td>
      <td>₹ ${doc.amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
      <td>${doc.date}</td>
      <td><span class="badge-status ${doc.status.toLowerCase()}">${doc.status}</span></td>
      <td>
        <div class="table-actions">
          <button class="action-icon-btn" onclick="loadDocument('${doc.id}')" title="View Document">
            <i data-lucide="eye"></i>
          </button>
          <button class="action-icon-btn" onclick="printDocument('${doc.id}')" title="Print">
            <i data-lucide="printer"></i>
          </button>
          <div class="dropdown-wrapper">
            <button class="action-icon-btn dropdown-trigger" onclick="toggleDropdown(event, '${doc.id}')" title="More Options">
              <i data-lucide="more-vertical"></i>
            </button>
            <div class="dropdown-menu" id="dropdown-${doc.id}">
              <button class="dropdown-item delete-item" onclick="deleteDocument('${doc.id}'); event.stopPropagation();">
                <i data-lucide="trash-2"></i> Delete
              </button>
            </div>
          </div>
        </div>
      </td>
    </tr>
  `).join('');
  
  lucide.createIcons();
}

function renderDocumentsTable() {
  const container = document.getElementById("all-documents-body");
  if (!container) return;
  
  let docs = getAllDocuments();
  
  // Filter by tab selection
  if (activeDocsTab !== 'all') {
    docs = docs.filter(d => d.type === activeDocsTab);
  }
  
  // Filter by search query
  const query = document.getElementById("documents-search")?.value.trim().toLowerCase() || "";
  if (query.length > 0) {
    docs = docs.filter(d => 
      d.id.toLowerCase().includes(query) || 
      d.customer.toLowerCase().includes(query)
    );
  }
  
  // Render rows
  if (docs.length === 0) {
    container.innerHTML = `<tr><td colspan="7" style="text-align: center; color: var(--text-muted);">No documents found</td></tr>`;
    return;
  }
  
  container.innerHTML = docs.map(doc => `
    <tr>
      <td><span class="doc-link" onclick="loadDocument('${doc.id}')">${doc.id}</span></td>
      <td><span class="badge-type ${doc.type}">${capitalizeFirst(doc.type)}</span></td>
      <td>${doc.customer}</td>
      <td>₹ ${doc.amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
      <td>${doc.date}</td>
      <td><span class="badge-status ${doc.status.toLowerCase()}">${doc.status}</span></td>
      <td>
        <div class="table-actions">
          <button class="action-icon-btn" onclick="loadDocument('${doc.id}')" title="View Document">
            <i data-lucide="eye"></i>
          </button>
          <button class="action-icon-btn" onclick="printDocument('${doc.id}')" title="Print">
            <i data-lucide="printer"></i>
          </button>
          <div class="dropdown-wrapper">
            <button class="action-icon-btn dropdown-trigger" onclick="toggleDropdown(event, '${doc.id}')" title="More Options">
              <i data-lucide="more-vertical"></i>
            </button>
            <div class="dropdown-menu" id="dropdown-${doc.id}">
              <button class="dropdown-item delete-item" onclick="deleteDocument('${doc.id}'); event.stopPropagation();">
                <i data-lucide="trash-2"></i> Delete
              </button>
            </div>
          </div>
        </div>
      </td>
    </tr>
  `).join('');
  
  lucide.createIcons();
}

// ═══ Form Helpers ═══
function capitalizeFirst(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

function formatDate(dateString) {
  const d = new Date(dateString);
  const day = d.getDate();
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const month = months[d.getMonth()];
  const year = d.getFullYear();
  return `${day} ${month} ${year}`;
}

// ═══ CORE INVOICE CALCULATION FORMULAS (PRESERVED) ═══
function calculateTotal() {
  let table = document.getElementById("quotation-body");
  if (!table) return;
  
  let rows = table.getElementsByTagName("tr");
  let subTotal = 0;

  for (let i = 0; i < rows.length; i++) {
    let cells = rows[i].getElementsByTagName("td");
    if (cells.length >= 6) {
      let quantity = parseFloat(cells[3].textContent.trim()) || 0;
      let unitPrice = parseFloat(cells[4].textContent.trim()) || 0;
      let amount = quantity * unitPrice;

      cells[5].innerText = amount.toFixed(2);
      subTotal += amount;
    }
  }

  document.getElementById("subTotal").innerText = subTotal.toFixed(2);

  let cgstRate = parseFloat(document.getElementById("cgstRate").value) || 0;
  let sgstRate = parseFloat(document.getElementById("sgstRate").value) || 0;

  let cgstAmount = (subTotal * cgstRate) / 100;
  let sgstAmount = (subTotal * sgstRate) / 100;
  let totalTaxAmount = cgstAmount + sgstAmount;

  let cgstAmountEl = document.getElementById("cgstAmount");
  if (cgstAmountEl) cgstAmountEl.innerText = cgstAmount.toFixed(2);

  let sgstAmountEl = document.getElementById("sgstAmount");
  if (sgstAmountEl) sgstAmountEl.innerText = sgstAmount.toFixed(2);

  let grandTotal = subTotal + totalTaxAmount;
  document.getElementById("grandTotal").innerText = grandTotal.toFixed(2);

  let amountInWordsEl = document.getElementById("amountInWords");
  if (amountInWordsEl) {
    amountInWordsEl.innerText = numberToWords(grandTotal).toUpperCase() + " RUPEES ONLY";
  }
}

function addRow() {
  let table = document.getElementById("quotation-body");
  if (!table) return;
  
  let newRow = table.insertRow(-1);
  let rowCount = table.rows.length;

  let cell1 = newRow.insertCell(0);
  let cell2 = newRow.insertCell(1);
  let c3 = newRow.insertCell(2);
  let cell4 = newRow.insertCell(3);
  let cell5 = newRow.insertCell(4);
  let cell6 = newRow.insertCell(5);

  cell1.innerText = rowCount;
  cell2.contentEditable = true;
  cell2.innerText = "";
  c3.contentEditable = true;
  c3.innerText = "";
  cell4.contentEditable = true;
  cell4.innerText = "0";
  cell5.contentEditable = true;
  cell5.innerText = "0";
  cell6.innerText = "0.00";
  cell6.className = "totalAmount";

  cell4.oninput = calculateTotal;
  cell5.oninput = calculateTotal;
}

function removeRow() {
  let table = document.getElementById("quotation-body");
  if (!table) return;
  
  let rowCount = table.rows.length;
  if (rowCount > 1) {
    table.deleteRow(rowCount - 1);
    calculateTotal();
  }
}

function numberToWords(num) {
  const a = [
    "", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten",
    "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen"
  ];
  const b = [
    "", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"
  ];
  const g = ["", "thousand", "million", "billion", "trillion"];

  if (typeof num !== "number" || isNaN(num)) return "";

  let words = [];
  let numStr = num.toFixed(2);
  let numArr = numStr.split(".");

  let integerPart = parseInt(numArr[0]);
  let decimalPart = numArr[1] ? parseInt(numArr[1]) : 0;

  if (integerPart === 0) words.push("zero");

  let groupIndex = 0;
  while (integerPart > 0) {
    let group = integerPart % 1000;
    if (group !== 0) {
      let groupWords = [];
      if (group > 99) {
        groupWords.push(a[Math.floor(group / 100)]);
        groupWords.push("hundred");
        group %= 100;
      }
      if (group > 19) {
        groupWords.push(b[Math.floor(group / 10)]);
        group %= 10;
      }
      if (group > 0) {
        groupWords.push(a[group]);
      }
      groupWords.push(g[groupIndex]);
      words.unshift(groupWords.filter(w => w !== "").join(" "));
    }
    integerPart = Math.floor(integerPart / 1000);
    groupIndex++;
  }

  let result = words.join(" ");

  if (decimalPart > 0) {
    let decWords = [];
    if (decimalPart > 19) {
      decWords.push(b[Math.floor(decimalPart / 10)]);
      if (decimalPart % 10 > 0) decWords.push(a[decimalPart % 10]);
    } else {
      decWords.push(a[decimalPart]);
    }
    result += " and " + decWords.join(" ") + " paise";
  }

  return result;
}

// ═══ Custom Modal, Toast, and Dropdown Helpers ═══

function setupModal() {
  const cancelBtn = document.getElementById("confirm-cancel-btn");
  const deleteBtn = document.getElementById("confirm-delete-btn");
  const modal = document.getElementById("confirm-modal");

  if (cancelBtn && modal) {
    cancelBtn.addEventListener("click", () => {
      modal.classList.remove("show");
      pendingDeleteId = null;
    });
  }

  if (deleteBtn && modal) {
    deleteBtn.addEventListener("click", () => {
      if (pendingDeleteId) {
        const docId = pendingDeleteId;
        let userDocs = JSON.parse(localStorage.getItem('user_documents') || '[]');
        const userIndex = userDocs.findIndex(d => d.id === docId);
        
        if (userIndex > -1) {
          userDocs.splice(userIndex, 1);
          localStorage.setItem('user_documents', JSON.stringify(userDocs));
        } else {
          let deletedInitial = JSON.parse(localStorage.getItem('deleted_initial_documents') || '[]');
          deletedInitial.push(docId);
          localStorage.setItem('deleted_initial_documents', JSON.stringify(deletedInitial));
        }
        
        showToast(`${docId} has been deleted.`, 'error');
        renderAll();
      }
      modal.classList.remove("show");
      pendingDeleteId = null;
    });
  }

  // Click on modal background overlay closes modal
  if (modal) {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        modal.classList.remove("show");
        pendingDeleteId = null;
      }
    });
  }

  // Global click listener to close dropdowns
  document.addEventListener("click", () => {
    const dropdowns = document.querySelectorAll(".dropdown-menu");
    dropdowns.forEach(d => d.classList.remove("show"));
  });
}

function showToast(message, type = 'success') {
  const container = document.getElementById("toast-container");
  if (!container) return;

  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;

  let icon = 'info';
  if (type === 'success') icon = 'check-circle';
  if (type === 'error') icon = 'alert-triangle';

  toast.innerHTML = `
    <i data-lucide="${icon}"></i>
    <span>${message}</span>
  `;

  container.appendChild(toast);
  lucide.createIcons();

  // Anim in
  setTimeout(() => toast.classList.add("show"), 10);

  // Anim out & remove
  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => {
      toast.remove();
    }, 300);
  }, 3000);
}

function toggleDropdown(event, docId) {
  event.stopPropagation();
  const dropdown = document.getElementById(`dropdown-${docId}`);
  
  // Close any other open dropdowns
  const dropdowns = document.querySelectorAll(".dropdown-menu");
  dropdowns.forEach(d => {
    if (d.id !== `dropdown-${docId}`) {
      d.classList.remove("show");
    }
  });

  if (dropdown) {
    dropdown.classList.toggle("show");
  }
}
