/**
 * TransitOps - Core Application Logic
 * Feature 3.1: Authentication & Role-Based Access Control (RBAC)
 */

// ==========================================================================
// Predefined User Credentials & RBAC Configurations
// ==========================================================================
const PREDEFINED_USERS = {
  "manager@transitops.com": {
    name: "Alex Mercer",
    role: "Fleet Manager",
    password: "manager123",
    avatar: "M",
    privileges: [
      "Full system administration & configuration",
      "CRUD operations on Vehicle Registry",
      "CRUD operations on Driver Management",
      "Create, dispatch, complete, or cancel trips",
      "Log, update, and close Maintenance Work Orders",
      "Record fuel consumption and operating expenses",
      "Generate Fleet ROI & Financial reports"
    ]
  },
  "driver@transitops.com": {
    name: "Marcus Vance",
    role: "Driver",
    password: "driver123",
    avatar: "D",
    privileges: [
      "View personal driver status & safety score",
      "Create new trip requests (Draft)",
      "Assign available vehicles and drivers",
      "Complete active trips (Log final odometer & fuel)"
    ]
  },
  "safety@transitops.com": {
    name: "Sarah Jenkins",
    role: "Safety Officer",
    password: "safety123",
    avatar: "S",
    privileges: [
      "Access Driver Management module",
      "Create and edit driver profiles",
      "Verify driver license validity & expiry dates",
      "Monitor and update driver safety scores"
    ]
  },
  "finance@transitops.com": {
    name: "Elena Rostova",
    role: "Financial Analyst",
    password: "finance123",
    avatar: "F",
    privileges: [
      "Access Dashboard & Financial metrics",
      "View vehicle registry acquisition costs",
      "Record fuel logs (liters, cost, date)",
      "Log operational expenses (tolls, spare parts)",
      "View Reports & Analytics (Fleet ROI, operational costs)"
    ]
  }
};

// ==========================================================================
// Default Database Seed Data (Mock Database)
// ==========================================================================
const DEFAULT_VEHICLES = [
  { registration: "VAN-01", name: "Ford Transit 350", type: "Van", capacity: 1200, odometer: 45000, cost: 32000, status: "Available", region: "North" },
  { registration: "VAN-02", name: "Mercedes Sprinter", type: "Van", capacity: 1500, odometer: 12000, cost: 45000, status: "On Trip", region: "South" },
  { registration: "TRK-03", name: "Volvo FH16", type: "Heavy Truck", capacity: 18000, odometer: 185000, cost: 110000, status: "Available", region: "East" },
  { registration: "TRK-04", name: "Scania R500", type: "Heavy Truck", capacity: 20000, odometer: 210000, cost: 125000, status: "In Shop", region: "Central" },
  { registration: "MDK-05", name: "Isuzu NPR", type: "Medium Truck", capacity: 5500, odometer: 85000, cost: 55000, status: "Available", region: "West" },
  { registration: "VAN-05", name: "Nissan NV2500", type: "Van", capacity: 500, odometer: 3200, cost: 28000, status: "Available", region: "North" },
  { registration: "LTK-06", name: "Toyota Hilux", type: "Light Truck", capacity: 1000, odometer: 95000, cost: 35000, status: "Retired", region: "South" }
];

const DEFAULT_DRIVERS = [
  { name: "Alex Johnson", license: "DL-98234", category: "Class A CDL", expiry: "2028-11-20", phone: "555-0199", safetyScore: 92, status: "Available" },
  { name: "Bob Miller", license: "DL-45612", category: "Class A CDL", expiry: "2027-04-15", phone: "555-0143", safetyScore: 88, status: "On Trip" },
  { name: "Charlie Smith", license: "DL-78901", category: "Class B CDL", expiry: "2026-09-10", phone: "555-0156", safetyScore: 95, status: "Available" },
  { name: "David Davis", license: "DL-34567", category: "Class C", expiry: "2025-12-05", phone: "555-0121", safetyScore: 78, status: "Suspended" },
  { name: "Emma Wilson", license: "DL-67890", category: "Class A CDL", expiry: "2026-03-22", phone: "555-0177", safetyScore: 90, status: "Available" }
];

const DEFAULT_TRIPS = [
  { id: "TRP-101", source: "Chicago Warehouse", destination: "Detroit Depot", vehicle: "VAN-02", driver: "Bob Miller", weight: 950, distance: 280, status: "Dispatched" },
  { id: "TRP-102", source: "Dallas Terminal", destination: "Houston Hub", vehicle: "VAN-01", driver: "Alex Johnson", weight: 1100, distance: 240, status: "Completed", finalOdometer: 45240, fuelConsumed: 32 },
  { id: "TRP-103", source: "Seattle Port", destination: "Portland Office", vehicle: "MDK-05", driver: "Emma Wilson", weight: 3500, distance: 175, status: "Draft" }
];

const DEFAULT_MAINTENANCE = [
  { id: "MNT-201", vehicle: "TRK-04", description: "Engine Oil & Filter Change", date: "2026-07-10", cost: 350, status: "Active" },
  { id: "MNT-202", vehicle: "VAN-01", description: "Brake Pad Replacement", date: "2026-06-15", cost: 480, status: "Closed" }
];

const DEFAULT_EXPENSES = [
  { id: "EXP-301", vehicle: "VAN-01", type: "Fuel", liters: 45, cost: 72, date: "2026-07-08", description: "Refuel at Shell" },
  { id: "EXP-302", vehicle: "VAN-01", type: "Toll", cost: 15, date: "2026-07-09", description: "I-90 Toll road" },
  { id: "EXP-303", vehicle: "VAN-02", type: "Fuel", liters: 32, cost: 54, date: "2026-07-11", description: "Refuel during TRP-101" }
];

// ==========================================================================
// Application State
// ==========================================================================
class AppState {
  constructor() {
    this.currentUser = null;
    this.simulatedRole = null; // Used when the user selects a role to test from the top bar
    this.theme = localStorage.getItem("transitops_theme") || "dark";
    this.logs = JSON.parse(localStorage.getItem("transitops_logs")) || [];

    // Core Entities (Load from local storage or set defaults)
    this.vehicles = JSON.parse(localStorage.getItem("transitops_vehicles")) || DEFAULT_VEHICLES;
    this.drivers = JSON.parse(localStorage.getItem("transitops_drivers")) || DEFAULT_DRIVERS;
    this.trips = JSON.parse(localStorage.getItem("transitops_trips")) || DEFAULT_TRIPS;
    this.maintenance = JSON.parse(localStorage.getItem("transitops_maintenance")) || DEFAULT_MAINTENANCE;
    this.expenses = JSON.parse(localStorage.getItem("transitops_expenses")) || DEFAULT_EXPENSES;

    // Filters state
    this.filters = {
      type: "",
      status: "",
      region: ""
    };

    // Seed vehicle documents metadata if not exist
    this.vehicles.forEach(v => {
      if (!v.documents) {
        v.documents = [
          { name: `${v.registration}_Registration.pdf`, type: "Registration", date: "2026-01-15", size: "124 KB", dataUrl: "data:application/pdf;base64,JVBERi0xLjQKJ..." },
          { name: `${v.registration}_Insurance_Policy.pdf`, type: "Insurance", date: "2026-02-10", size: "852 KB", dataUrl: "data:application/pdf;base64,JVBERi0xLjQKJ..." }
        ];
      }
    });

    // Save initial defaults if empty
    this.saveToStorage();
  }

  saveToStorage() {
    localStorage.setItem("transitops_vehicles", JSON.stringify(this.vehicles));
    localStorage.setItem("transitops_drivers", JSON.stringify(this.drivers));
    localStorage.setItem("transitops_trips", JSON.stringify(this.trips));
    localStorage.setItem("transitops_maintenance", JSON.stringify(this.maintenance));
    localStorage.setItem("transitops_expenses", JSON.stringify(this.expenses));
  }

  init() {
    // Setup Theme
    document.documentElement.setAttribute("data-theme", this.theme);
    this.updateThemeUI();

    // Check if session exists in localStorage
    const savedUserEmail = localStorage.getItem("transitops_session");
    if (savedUserEmail && PREDEFINED_USERS[savedUserEmail]) {
      const user = PREDEFINED_USERS[savedUserEmail];
      this.currentUser = { email: savedUserEmail, ...user };
      this.simulatedRole = user.role;
      
      document.getElementById("login-screen").classList.add("hidden");
      document.getElementById("app-layout").classList.remove("hidden");

      this.updateUserUI();
      this.applyRBACRules();
      this.renderLogs();
    }
    
    // Evaluate initial route based on authentication
    this.handleRouting();
  }

  handleRouting() {
    const hash = window.location.hash.replace("#", "");
    
    // 1. Authentication Guard: If not logged in, force login screen
    if (!this.currentUser) {
      if (window.location.hash !== "#login") {
        window.location.hash = "login";
      }
      this.showLogin();
      return;
    }

    // 2. Logged In: Redirection from login or empty hash to dashboard
    if (!hash || hash === "login") {
      window.location.hash = "dashboard";
      return;
    }

    // 3. Tab Availability & RBAC Check
    const tabLink = document.querySelector(`.nav-menu .nav-item[data-tab="${hash}"]`);
    if (tabLink) {
      const allowedRolesAttr = tabLink.getAttribute("data-roles");
      if (allowedRolesAttr) {
        const allowedRoles = allowedRolesAttr.split(",");
        if (!allowedRoles.includes(this.simulatedRole)) {
          this.addLog(`Access denied to section '${this.capitalizeFirstLetter(hash)}' for role '${this.simulatedRole}'.`);
          window.location.hash = "dashboard";
          return;
        }
      }
      this.switchTab(hash);
    } else if (hash === "dashboard") {
      this.switchTab("dashboard");
    } else {
      // Fallback for invalid hashes
      window.location.hash = "dashboard";
    }
  }

  addLog(action) {
    const time = new Date().toLocaleTimeString();
    const log = `[${time}] ${action}`;
    this.logs.unshift(log);
    if (this.logs.length > 50) this.logs.pop(); // Keep last 50 logs
    localStorage.setItem("transitops_logs", JSON.stringify(this.logs));
    this.renderLogs();
  }

  renderLogs() {
    const container = document.getElementById("rbac-system-logs");
    if (container) {
      container.innerHTML = this.logs.map(log => `<div class="log-line">${log}</div>`).join('');
    }
  }

  loginUser(email, log = true) {
    const user = PREDEFINED_USERS[email];
    if (!user) return false;

    this.currentUser = { email, ...user };
    this.simulatedRole = user.role;
    localStorage.setItem("transitops_session", email);

    if (log) {
      this.addLog(`User '${user.name}' logged in as '${user.role}'.`);
    }

    // Update UI elements
    document.getElementById("login-screen").classList.add("hidden");
    document.getElementById("app-layout").classList.remove("hidden");

    this.updateUserUI();
    this.applyRBACRules();
    this.renderLogs();
    
    // Redirect to target hash (if set and not login) or default to dashboard
    const currentHash = window.location.hash.replace("#", "");
    if (currentHash && currentHash !== "login") {
      this.handleRouting();
    } else {
      window.location.hash = "dashboard";
    }
    return true;
  }

  logout() {
    if (this.currentUser) {
      this.addLog(`User '${this.currentUser.name}' logged out.`);
      localStorage.removeItem("transitops_session");
      this.currentUser = null;
      this.simulatedRole = null;
      window.location.hash = "login";
    }
  }

  showLogin() {
    // Strictly enforce layout visibility
    document.getElementById("app-layout").classList.add("hidden");
    document.getElementById("login-screen").classList.remove("hidden");
    document.getElementById("login-form").reset();
    document.getElementById("login-error").classList.add("hidden");
  }


  updateUserUI() {
    if (!this.currentUser) return;

    // Sidebar Profile
    document.getElementById("user-avatar").innerText = this.currentUser.avatar;
    document.getElementById("user-avatar").style.backgroundColor = `var(--color-${this.currentUser.avatar.toLowerCase() === 'm' ? 'manager' : this.currentUser.avatar.toLowerCase() === 'd' ? 'driver' : this.currentUser.avatar.toLowerCase() === 's' ? 'safety' : 'finance'})`;
    document.getElementById("user-display-name").innerText = this.currentUser.name;
    document.getElementById("user-display-role").innerText = this.currentUser.email;

    // Header Role Info & Switcher
    const roleBadge = document.getElementById("role-status-badge");
    roleBadge.innerText = this.simulatedRole;
    roleBadge.className = `badge badge-${this.getRoleClassSuffix(this.simulatedRole)}`;

    // Set simulator dropdown selector to match
    document.getElementById("rbac-role-switcher").value = this.simulatedRole;
  }

  getRoleClassSuffix(role) {
    switch (role) {
      case "Fleet Manager": return "manager";
      case "Driver": return "driver";
      case "Safety Officer": return "safety";
      case "Financial Analyst": return "finance";
      default: return "manager";
    }
  }

  applyRBACRules() {
    const role = this.simulatedRole;
    const navItems = document.querySelectorAll(".nav-menu .nav-item");
    let currentActiveTab = null;

    navItems.forEach(item => {
      const allowedRolesAttr = item.getAttribute("data-roles");
      if (allowedRolesAttr) {
        const allowedRoles = allowedRolesAttr.split(",");
        const isAllowed = allowedRoles.includes(role);
        
        if (isAllowed) {
          item.classList.remove("hidden");
          item.classList.remove("disabled");
        } else {
          item.classList.add("hidden");
          item.classList.add("disabled");
          // If the disabled item was the active tab, we must switch away
          if (item.classList.contains("active")) {
            currentActiveTab = item.getAttribute("data-tab");
          }
        }
      } else {
        // Dashboard has no data-roles attribute, accessible to everyone
        item.classList.remove("hidden");
        item.classList.remove("disabled");
      }
    });

    // Enforce UI restrictions on registries based on role
    const isManager = role === "Fleet Manager";
    const managerOnlyElements = document.querySelectorAll(".nav-roles-manager-only");
    managerOnlyElements.forEach(el => {
      if (isManager) {
        el.classList.remove("hidden");
      } else {
        el.classList.add("hidden");
      }
    });

    // If active tab was disabled, fallback to dashboard
    if (currentActiveTab) {
      this.switchTab("dashboard");
    }

    // Update privileges panel on Dashboard
    this.renderPrivileges();

    // If currently on vehicles view, refresh list
    if (window.location.hash.replace("#", "") === "vehicles") {
      this.renderVehicles();
    } else if (window.location.hash.replace("#", "") === "drivers") {
      this.renderDrivers();
    } else if (window.location.hash.replace("#", "") === "trips") {
      this.renderTrips();
    } else if (window.location.hash.replace("#", "") === "maintenance") {
      this.renderMaintenance();
    } else if (window.location.hash.replace("#", "") === "expenses") {
      this.renderExpenses();
    } else if (window.location.hash.replace("#", "") === "reports") {
      this.renderReports();
    }
  }

  renderPrivileges() {
    const list = document.getElementById("role-privileges-list");
    const roleTitle = document.querySelector(".simulate-role-name");
    
    if (list && roleTitle) {
      roleTitle.innerText = this.simulatedRole;
      
      // Fetch privileges based on simulated role (matched from predefined users keys)
      let matchedPrivileges = [];
      for (let email in PREDEFINED_USERS) {
        if (PREDEFINED_USERS[email].role === this.simulatedRole) {
          matchedPrivileges = PREDEFINED_USERS[email].privileges;
          break;
        }
      }

      list.innerHTML = matchedPrivileges.map(priv => `<li>${priv}</li>`).join('');
    }
  }

  switchTab(tabId) {
    if (!this.currentUser) {
      this.showLogin();
      return;
    }

    // Hide all view sections
    const views = document.querySelectorAll(".view-section");
    views.forEach(view => view.classList.add("hidden"));

    // Show selected view section
    const targetView = document.getElementById(`view-${tabId}`);
    if (targetView) {
      targetView.classList.remove("hidden");
      
      // Update breadcrumb and sidebar active classes
      document.getElementById("current-view-title").innerText = this.capitalizeFirstLetter(tabId);
      
      const navItems = document.querySelectorAll(".nav-menu .nav-item");
      navItems.forEach(item => {
        if (item.getAttribute("data-tab") === tabId) {
          item.classList.add("active");
        } else {
          item.classList.remove("active");
        }
      });

      if (tabId === "dashboard") {
        this.updateDashboard();
      } else if (tabId === "vehicles") {
        this.renderVehicles();
      } else if (tabId === "drivers") {
        this.renderDrivers();
      } else if (tabId === "trips") {
        this.renderTrips();
      } else if (tabId === "maintenance") {
        this.renderMaintenance();
      } else if (tabId === "expenses") {
        this.renderExpenses();
      } else if (tabId === "reports") {
        this.renderReports();
      }

      this.addLog(`Switched view to '${this.capitalizeFirstLetter(tabId)}'.`);
    }
  }

  capitalizeFirstLetter(string) {
    if (string === "dashboard") return "Dashboard";
    if (string === "vehicles") return "Vehicle Registry";
    if (string === "drivers") return "Driver Management";
    if (string === "trips") return "Trip Management";
    if (string === "maintenance") return "Maintenance Log";
    if (string === "expenses") return "Fuel & Expenses";
    if (string === "reports") return "Reports & Analytics";
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  setSimulatedRole(role) {
    this.simulatedRole = role;
    this.addLog(`Access role simulated to '${role}'.`);
    this.updateUserUI();
    this.applyRBACRules();
    if (window.location.hash.replace("#", "") === "dashboard") {
      this.updateDashboard();
    }
  }

  toggleTheme() {
    this.theme = this.theme === "dark" ? "light" : "dark";
    localStorage.setItem("transitops_theme", this.theme);
    document.documentElement.setAttribute("data-theme", this.theme);
    this.updateThemeUI();
    this.addLog(`UI theme changed to '${this.theme}'.`);
  }

  updateThemeUI() {
    const sunIcon = document.querySelector(".sun-icon");
    const moonIcon = document.querySelector(".moon-icon");
    if (this.theme === "dark") {
      sunIcon.classList.remove("hidden");
      moonIcon.classList.add("hidden");
    } else {
      sunIcon.classList.add("hidden");
      moonIcon.classList.remove("hidden");
    }
  }

  updateDashboard() {
    if (!this.currentUser) return;

    // Filtered vehicles
    const filteredVehicles = this.vehicles.filter(v => {
      const matchType = !this.filters.type || v.type === this.filters.type;
      const matchStatus = !this.filters.status || v.status === this.filters.status;
      const matchRegion = !this.filters.region || v.region === this.filters.region;
      return matchType && matchStatus && matchRegion;
    });

    // Counts
    const availableVehicles = filteredVehicles.filter(v => v.status === "Available").length;
    const activeVehicles = filteredVehicles.filter(v => v.status === "On Trip").length;
    const maintenanceVehicles = filteredVehicles.filter(v => v.status === "In Shop").length;

    // Fleet Utilization (%)
    // Active fleet size = Available + On Trip
    const activeFleetSize = availableVehicles + activeVehicles;
    const utilization = activeFleetSize > 0 ? Math.round((activeVehicles / activeFleetSize) * 100) : 0;

    // Active Trips (Dispatched trips)
    // Filter trips by active vehicles
    const filteredRegs = new Set(filteredVehicles.map(v => v.registration));
    const activeTripsCount = this.trips.filter(t => t.status === "Dispatched" && filteredRegs.has(t.vehicle)).length;
    const pendingTripsCount = this.trips.filter(t => t.status === "Draft" && filteredRegs.has(t.vehicle)).length;

    // Drivers On Duty (Available + On Trip)
    const driversOnDutyCount = this.drivers.filter(d => d.status === "Available" || d.status === "On Trip").length;

    // Update DOM
    document.getElementById("kpi-utilization").innerText = `${utilization}%`;
    document.getElementById("utilization-progress").style.width = `${utilization}%`;
    document.getElementById("kpi-active-vehicles").innerText = activeVehicles;
    document.getElementById("kpi-available-vehicles").innerText = availableVehicles;
    document.getElementById("kpi-in-maintenance").innerText = maintenanceVehicles;
    document.getElementById("kpi-active-trips").innerText = activeTripsCount;
    document.getElementById("kpi-pending-trips").innerText = pendingTripsCount;
    document.getElementById("kpi-drivers-on-duty").innerText = driversOnDutyCount;

    // Redraw Canvas Charts
    this.drawFleetStatusChart(filteredVehicles);
    this.drawFleetFinanceChart(filteredVehicles);
  }

  handleFilterChange() {
    this.filters.type = document.getElementById("filter-type").value;
    this.filters.status = document.getElementById("filter-status").value;
    this.filters.region = document.getElementById("filter-region").value;
    
    this.addLog(`Filters changed - Type: "${this.filters.type || "All"}", Status: "${this.filters.status || "All"}", Region: "${this.filters.region || "All"}"`);
    this.updateDashboard();
  }

  resetFilters() {
    document.getElementById("filter-type").value = "";
    document.getElementById("filter-status").value = "";
    document.getElementById("filter-region").value = "";
    
    this.filters.type = "";
    this.filters.status = "";
    this.filters.region = "";
    
    this.addLog("Filters reset to default.");
    this.updateDashboard();
  }

  drawFleetStatusChart(filteredVehicles) {
    const canvas = document.getElementById("chart-fleet-status");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const width = canvas.width;
    const height = canvas.height;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Group statuses
    const counts = {
      "Available": 0,
      "On Trip": 0,
      "In Shop": 0,
      "Retired": 0
    };

    filteredVehicles.forEach(v => {
      if (counts[v.status] !== undefined) {
        counts[v.status]++;
      }
    });

    const total = filteredVehicles.length;
    if (total === 0) {
      ctx.fillStyle = "var(--text-secondary)";
      ctx.font = "14px Outfit, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("No matching vehicle data", width / 2, height / 2);
      return;
    }

    const colors = {
      "Available": { fill: "#10b981", label: "Available" },
      "On Trip": { fill: "#6366f1", label: "On Trip" },
      "In Shop": { fill: "#f59e0b", label: "In Shop" },
      "Retired": { fill: "#64748b", label: "Retired" }
    };

    // Draw Doughnut
    let startAngle = -Math.PI / 2;
    const centerX = width * 0.35;
    const centerY = height * 0.5;
    const outerRadius = Math.min(centerX, centerY) * 0.75;
    const innerRadius = outerRadius * 0.65;

    for (const status in counts) {
      const count = counts[status];
      if (count === 0) continue;

      const sliceAngle = (count / total) * 2 * Math.PI;

      ctx.beginPath();
      ctx.arc(centerX, centerY, outerRadius, startAngle, startAngle + sliceAngle);
      ctx.arc(centerX, centerY, innerRadius, startAngle + sliceAngle, startAngle, true);
      ctx.closePath();

      ctx.fillStyle = colors[status].fill;
      ctx.fill();

      startAngle += sliceAngle;
    }

    // Total count inside doughnut
    ctx.fillStyle = "var(--text-primary)";
    ctx.font = "bold 20px Outfit, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(total, centerX, centerY - 6);

    ctx.fillStyle = "var(--text-muted)";
    ctx.font = "600 9px Outfit, sans-serif";
    ctx.fillText("VEHICLES", centerX, centerY + 12);

    // Legend
    const legendX = width * 0.68;
    let legendY = height * 0.25;
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";

    for (const status in counts) {
      const count = counts[status];
      const percent = total > 0 ? Math.round((count / total) * 100) : 0;

      ctx.fillStyle = colors[status].fill;
      ctx.beginPath();
      if (ctx.roundRect) {
        ctx.roundRect(legendX, legendY - 6, 12, 12, 3);
      } else {
        ctx.rect(legendX, legendY - 6, 12, 12);
      }
      ctx.fill();

      ctx.fillStyle = "var(--text-primary)";
      ctx.font = "600 12px Outfit, sans-serif";
      ctx.fillText(`${colors[status].label}`, legendX + 18, legendY);

      ctx.fillStyle = "var(--text-secondary)";
      ctx.font = "12px Outfit, sans-serif";
      ctx.fillText(`${count} (${percent}%)`, legendX + 18, legendY + 14);

      legendY += 40;
    }
  }

  drawFleetFinanceChart(filteredVehicles) {
    const canvas = document.getElementById("chart-fleet-finance");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    const vehiclesToDisplay = filteredVehicles.slice(0, 5);
    if (vehiclesToDisplay.length === 0) {
      ctx.fillStyle = "var(--text-secondary)";
      ctx.font = "14px Outfit, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("No matching vehicle data", width / 2, height / 2);
      return;
    }

    const margin = { top: 35, right: 20, bottom: 40, left: 45 };
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    let maxValue = 50;
    vehiclesToDisplay.forEach(v => {
      const odoK = v.odometer / 1000;
      const costK = v.cost / 1000;
      if (odoK > maxValue) maxValue = odoK;
      if (costK > maxValue) maxValue = costK;
    });

    maxValue = Math.ceil(maxValue / 50) * 50;

    ctx.fillStyle = "var(--text-muted)";
    ctx.font = "10px Outfit, sans-serif";
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";
    const yTicks = 4;
    for (let i = 0; i <= yTicks; i++) {
      const val = (maxValue / yTicks) * i;
      const y = margin.top + chartHeight - (val / maxValue) * chartHeight;
      
      ctx.strokeStyle = "var(--border-color)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(margin.left, y);
      ctx.lineTo(margin.left + chartWidth, y);
      ctx.stroke();

      ctx.fillText(Math.round(val) + "k", margin.left - 8, y);
    }

    const groupWidth = chartWidth / vehiclesToDisplay.length;
    const barWidth = groupWidth * 0.3;
    const barSpacing = 4;

    vehiclesToDisplay.forEach((v, index) => {
      const groupX = margin.left + index * groupWidth;
      const centerX = groupX + groupWidth / 2;

      const odoK = v.odometer / 1000;
      const costK = v.cost / 1000;

      const odoHeight = (odoK / maxValue) * chartHeight;
      const costHeight = (costK / maxValue) * chartHeight;

      const odoY = margin.top + chartHeight - odoHeight;
      const costY = margin.top + chartHeight - costHeight;

      // Odometer (Blue)
      const odoGrad = ctx.createLinearGradient(0, odoY, 0, margin.top + chartHeight);
      odoGrad.addColorStop(0, "#38bdf8");
      odoGrad.addColorStop(1, "#0284c7");
      ctx.fillStyle = odoGrad;
      ctx.beginPath();
      if (ctx.roundRect) {
        ctx.roundRect(centerX - barWidth - barSpacing / 2, odoY, barWidth, odoHeight, [4, 4, 0, 0]);
      } else {
        ctx.rect(centerX - barWidth - barSpacing / 2, odoY, barWidth, odoHeight);
      }
      ctx.fill();

      // Cost (Pink)
      const costGrad = ctx.createLinearGradient(0, costY, 0, margin.top + chartHeight);
      costGrad.addColorStop(0, "#f472b6");
      costGrad.addColorStop(1, "#db2777");
      ctx.fillStyle = costGrad;
      ctx.beginPath();
      if (ctx.roundRect) {
        ctx.roundRect(centerX + barSpacing / 2, costY, barWidth, costHeight, [4, 4, 0, 0]);
      } else {
        ctx.rect(centerX + barSpacing / 2, costY, barWidth, costHeight);
      }
      ctx.fill();

      ctx.fillStyle = "var(--text-secondary)";
      ctx.font = "600 10px Outfit, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "top";
      ctx.fillText(v.registration, centerX, margin.top + chartHeight + 8);
    });

    ctx.strokeStyle = "var(--border-color)";
    ctx.beginPath();
    ctx.moveTo(margin.left, margin.top);
    ctx.lineTo(margin.left, margin.top + chartHeight);
    ctx.lineTo(margin.left + chartWidth, margin.top + chartHeight);
    ctx.stroke();

    // Visual Legend
    ctx.textAlign = "right";
    ctx.font = "600 9px Outfit, sans-serif";
    
    ctx.fillStyle = "#38bdf8";
    ctx.beginPath();
    ctx.arc(width - 125, margin.top - 15, 4, 0, 2 * Math.PI);
    ctx.fill();
    ctx.fillStyle = "var(--text-secondary)";
    ctx.fillText("Odometer (km)", width - 68, margin.top - 15);

    ctx.fillStyle = "#f472b6";
    ctx.beginPath();
    ctx.arc(width - 50, margin.top - 15, 4, 0, 2 * Math.PI);
    ctx.fill();
    ctx.fillStyle = "var(--text-secondary)";
    ctx.fillText("Cost ($)", width - 10, margin.top - 15);
  }

  renderVehicles() {
    const searchVal = document.getElementById("vehicle-search").value.toLowerCase().trim();
    const filterType = document.getElementById("vehicle-filter-type").value;
    const filterStatus = document.getElementById("vehicle-filter-status").value;
    const filterRegion = document.getElementById("vehicle-filter-region").value;
    const sortBy = document.getElementById("vehicle-sort-by").value;

    let filtered = this.vehicles.filter(v => {
      const matchesSearch = v.registration.toLowerCase().includes(searchVal) || 
                            v.name.toLowerCase().includes(searchVal);
      const matchesType = !filterType || v.type === filterType;
      const matchesStatus = !filterStatus || v.status === filterStatus;
      const matchesRegion = !filterRegion || v.region === filterRegion;

      return matchesSearch && matchesType && matchesStatus && matchesRegion;
    });

    // Sort
    if (sortBy === "odometer-asc") {
      filtered.sort((a, b) => a.odometer - b.odometer);
    } else if (sortBy === "odometer-desc") {
      filtered.sort((a, b) => b.odometer - a.odometer);
    } else if (sortBy === "capacity-desc") {
      filtered.sort((a, b) => b.capacity - a.capacity);
    } else if (sortBy === "cost-desc") {
      filtered.sort((a, b) => b.cost - a.cost);
    }

    const tbody = document.getElementById("vehicle-table-body");
    if (!tbody) return;

    const isManager = this.simulatedRole === "Fleet Manager";

    if (filtered.length === 0) {
      tbody.innerHTML = `<tr><td colspan="${isManager ? 9 : 8}" class="text-center" style="color: var(--text-muted); padding: 2rem;">No vehicles found matching filters.</td></tr>`;
      return;
    }

    tbody.innerHTML = filtered.map(v => {
      let badgeClass = "badge-driver"; // Available (green)
      if (v.status === "On Trip") badgeClass = "badge-manager"; // Blue
      else if (v.status === "In Shop") badgeClass = "badge-safety"; // Amber
      else if (v.status === "Retired") badgeClass = "badge-finance"; // Muted Pink

      const actionsHTML = isManager ? `
        <td class="actions-cell">
          <button class="btn btn-secondary btn-small btn-warning-small" onclick="app.openEditVehicleModal('${v.registration}')">Edit</button>
          <button class="btn btn-secondary btn-small" style="background: rgba(99, 102, 241, 0.15); color: #a5b4fc; border-color: rgba(99, 102, 241, 0.3);" onclick="app.openVehicleDocsModal('${v.registration}')">Docs</button>
          <button class="btn btn-danger btn-small" onclick="app.deleteVehicle('${v.registration}')">Delete</button>
        </td>
      ` : "";

      return `
        <tr>
          <td style="font-weight: 600; font-family: monospace;">${v.registration}</td>
          <td>${v.name}</td>
          <td>${v.type}</td>
          <td>${v.region}</td>
          <td>${v.capacity.toLocaleString()} kg</td>
          <td>${v.odometer.toLocaleString()} km</td>
          <td>$${v.cost.toLocaleString()}</td>
          <td><span class="badge ${badgeClass}">${v.status}</span></td>
          ${actionsHTML}
        </tr>
      `;
    }).join('');
  }

  openAddVehicleModal() {
    if (this.simulatedRole !== "Fleet Manager") return;
    
    document.getElementById("vehicle-form-mode").value = "add";
    document.getElementById("vehicle-old-reg").value = "";
    document.getElementById("vehicle-modal-title").innerText = "Register New Vehicle";
    
    const regInput = document.getElementById("vehicle-reg");
    regInput.value = "";
    regInput.disabled = false;
    
    document.getElementById("vehicle-name").value = "";
    document.getElementById("vehicle-type").value = "Van";
    document.getElementById("vehicle-region").value = "North";
    document.getElementById("vehicle-capacity").value = "";
    document.getElementById("vehicle-odometer").value = "";
    document.getElementById("vehicle-cost").value = "";
    document.getElementById("vehicle-status").value = "Available";

    document.getElementById("vehicle-form-error").classList.add("hidden");
    document.getElementById("vehicle-modal").classList.add("active");
  }

  openEditVehicleModal(reg) {
    if (this.simulatedRole !== "Fleet Manager") return;

    const vehicle = this.vehicles.find(v => v.registration === reg);
    if (!vehicle) return;

    document.getElementById("vehicle-form-mode").value = "edit";
    document.getElementById("vehicle-old-reg").value = reg;
    document.getElementById("vehicle-modal-title").innerText = "Edit Vehicle Details";

    const regInput = document.getElementById("vehicle-reg");
    regInput.value = vehicle.registration;
    regInput.disabled = true; // Registration number is unique/read-only on edit

    document.getElementById("vehicle-name").value = vehicle.name;
    document.getElementById("vehicle-type").value = vehicle.type;
    document.getElementById("vehicle-region").value = vehicle.region;
    document.getElementById("vehicle-capacity").value = vehicle.capacity;
    document.getElementById("vehicle-odometer").value = vehicle.odometer;
    document.getElementById("vehicle-cost").value = vehicle.cost;
    document.getElementById("vehicle-status").value = vehicle.status;

    document.getElementById("vehicle-form-error").classList.add("hidden");
    document.getElementById("vehicle-modal").classList.add("active");
  }

  closeVehicleModal() {
    document.getElementById("vehicle-modal").classList.remove("active");
    document.getElementById("vehicle-form").reset();
  }

  handleVehicleFormSubmit() {
    if (this.simulatedRole !== "Fleet Manager") return;

    const mode = document.getElementById("vehicle-form-mode").value;
    const oldReg = document.getElementById("vehicle-old-reg").value;
    const reg = document.getElementById("vehicle-reg").value.trim().toUpperCase();
    const name = document.getElementById("vehicle-name").value.trim();
    const type = document.getElementById("vehicle-type").value;
    const region = document.getElementById("vehicle-region").value;
    const capacity = parseInt(document.getElementById("vehicle-capacity").value);
    const odometer = parseInt(document.getElementById("vehicle-odometer").value);
    const cost = parseInt(document.getElementById("vehicle-cost").value);
    const status = document.getElementById("vehicle-status").value;

    const errorDiv = document.getElementById("vehicle-form-error");

    // Basic Validations
    if (!reg || !name) {
      errorDiv.innerText = "All fields are required.";
      errorDiv.classList.remove("hidden");
      return;
    }

    if (isNaN(capacity) || capacity <= 0) {
      errorDiv.innerText = "Maximum load capacity must be a positive number.";
      errorDiv.classList.remove("hidden");
      return;
    }

    if (isNaN(odometer) || odometer < 0) {
      errorDiv.innerText = "Odometer reading cannot be negative.";
      errorDiv.classList.remove("hidden");
      return;
    }

    if (isNaN(cost) || cost < 0) {
      errorDiv.innerText = "Acquisition cost cannot be negative.";
      errorDiv.classList.remove("hidden");
      return;
    }

    // Uniqueness Check for Registration
    if (mode === "add") {
      const exists = this.vehicles.some(v => v.registration === reg);
      if (exists) {
        errorDiv.innerText = `A vehicle with registration number '${reg}' already exists.`;
        errorDiv.classList.remove("hidden");
        return;
      }

      // Add new vehicle
      const newVehicle = { registration: reg, name, type, capacity, odometer, cost, status, region };
      this.vehicles.push(newVehicle);
      this.addLog(`Registered new vehicle: '${name}' (${reg}).`);
    } else if (mode === "edit") {
      const vehicleIndex = this.vehicles.findIndex(v => v.registration === oldReg);
      if (vehicleIndex === -1) {
        errorDiv.innerText = "Vehicle not found in database.";
        errorDiv.classList.remove("hidden");
        return;
      }

      // Update properties
      this.vehicles[vehicleIndex].name = name;
      this.vehicles[vehicleIndex].type = type;
      this.vehicles[vehicleIndex].region = region;
      this.vehicles[vehicleIndex].capacity = capacity;
      this.vehicles[vehicleIndex].odometer = odometer;
      this.vehicles[vehicleIndex].cost = cost;
      this.vehicles[vehicleIndex].status = status;

      this.addLog(`Updated vehicle details for registration: '${oldReg}'.`);
    }

    this.saveToStorage();
    this.renderVehicles();
    this.closeVehicleModal();
  }

  deleteVehicle(reg) {
    if (this.simulatedRole !== "Fleet Manager") return;

    if (confirm(`Are you sure you want to delete vehicle '${reg}'? This action cannot be undone.`)) {
      this.vehicles = this.vehicles.filter(v => v.registration !== reg);
      this.saveToStorage();
      this.addLog(`Deleted vehicle registration: '${reg}'.`);
      this.renderVehicles();
    }
  }

  renderDrivers() {
    const searchVal = document.getElementById("driver-search").value.toLowerCase().trim();
    const filterStatus = document.getElementById("driver-filter-status").value;
    const filterCategory = document.getElementById("driver-filter-category").value;
    const sortBy = document.getElementById("driver-sort-by").value;

    let filtered = this.drivers.filter(d => {
      const matchesSearch = d.name.toLowerCase().includes(searchVal) || 
                            d.license.toLowerCase().includes(searchVal);
      const matchesStatus = !filterStatus || d.status === filterStatus;
      const matchesCategory = !filterCategory || d.category === filterCategory;

      return matchesSearch && matchesStatus && matchesCategory;
    });

    // Sort
    if (sortBy === "safety-desc") {
      filtered.sort((a, b) => b.safetyScore - a.safetyScore);
    } else if (sortBy === "safety-asc") {
      filtered.sort((a, b) => a.safetyScore - b.safetyScore);
    } else if (sortBy === "expiry-asc") {
      filtered.sort((a, b) => new Date(a.expiry) - new Date(b.expiry));
    }

    const tbody = document.getElementById("driver-table-body");
    if (!tbody) return;

    if (filtered.length === 0) {
      tbody.innerHTML = `<tr><td colspan="8" class="text-center" style="color: var(--text-muted); padding: 2rem;">No drivers found matching filters.</td></tr>`;
      return;
    }

    const today = new Date();
    const next30Days = new Date();
    next30Days.setDate(today.getDate() + 30);

    tbody.innerHTML = filtered.map(d => {
      let badgeClass = "badge-driver"; // Available (green)
      if (d.status === "On Trip") badgeClass = "badge-manager"; // Blue
      else if (d.status === "Off Duty") badgeClass = "badge-muted"; // Gray
      else if (d.status === "Suspended") badgeClass = "badge-danger"; // Red

      // Compliance warning for safety score
      let safetyHTML = `<strong>${d.safetyScore}</strong>`;
      if (d.safetyScore >= 90) {
        safetyHTML = `<strong class="text-success">${d.safetyScore}</strong>`;
      } else if (d.safetyScore < 80) {
        safetyHTML = `<strong class="text-danger">${d.safetyScore}</strong>`;
      } else {
        safetyHTML = `<strong class="text-warning">${d.safetyScore}</strong>`;
      }

      // Compliance check for license expiry
      const expiryDate = new Date(d.expiry);
      let expiryHTML = d.expiry;
      if (expiryDate < today) {
        expiryHTML = `<span class="text-danger" style="font-weight: 600;">${d.expiry} (EXPIRED)</span>`;
      } else if (expiryDate <= next30Days) {
        expiryHTML = `<span class="text-warning" style="font-weight: 600;">${d.expiry} (EXPIRING SOON)</span>`;
      }

      return `
        <tr>
          <td style="font-weight: 600;">${d.name}</td>
          <td style="font-family: monospace;">${d.license}</td>
          <td>${d.category}</td>
          <td>${expiryHTML}</td>
          <td>${d.phone}</td>
          <td>${safetyHTML}</td>
          <td><span class="badge ${badgeClass}">${d.status}</span></td>
          <td class="actions-cell">
            ${(new Date(d.expiry) <= next30Days) ? `<button class="btn btn-secondary btn-small" style="background: rgba(251, 191, 36, 0.15); color: var(--color-safety); border-color: rgba(251, 191, 36, 0.3);" onclick="app.openEmailReminderModal('${d.license}')">✉ Remind</button>` : ''}
            <button class="btn btn-secondary btn-small btn-warning-small" onclick="app.openEditDriverModal('${d.license}')">Edit</button>
            <button class="btn btn-danger btn-small" onclick="app.deleteDriver('${d.license}')">Delete</button>
          </td>
        </tr>
      `;
    }).join('');
  }

  openAddDriverModal() {
    document.getElementById("driver-form-mode").value = "add";
    document.getElementById("driver-old-license").value = "";
    document.getElementById("driver-modal-title").innerText = "Register New Driver";

    const licenseInput = document.getElementById("driver-license");
    licenseInput.value = "";
    licenseInput.disabled = false;

    document.getElementById("driver-name").value = "";
    document.getElementById("driver-category").value = "Class A CDL";
    document.getElementById("driver-expiry").value = "";
    document.getElementById("driver-phone").value = "";
    document.getElementById("driver-safety").value = "";
    document.getElementById("driver-status").value = "Available";

    document.getElementById("driver-form-error").classList.add("hidden");
    document.getElementById("driver-modal").classList.add("active");
  }

  openEditDriverModal(license) {
    const driver = this.drivers.find(d => d.license === license);
    if (!driver) return;

    document.getElementById("driver-form-mode").value = "edit";
    document.getElementById("driver-old-license").value = license;
    document.getElementById("driver-modal-title").innerText = "Edit Driver Profile";

    const licenseInput = document.getElementById("driver-license");
    licenseInput.value = driver.license;
    licenseInput.disabled = true; // License is unique/read-only on edit

    document.getElementById("driver-name").value = driver.name;
    document.getElementById("driver-category").value = driver.category;
    document.getElementById("driver-expiry").value = driver.expiry;
    document.getElementById("driver-phone").value = driver.phone;
    document.getElementById("driver-safety").value = driver.safetyScore;
    document.getElementById("driver-status").value = driver.status;

    document.getElementById("driver-form-error").classList.add("hidden");
    document.getElementById("driver-modal").classList.add("active");
  }

  closeDriverModal() {
    document.getElementById("driver-modal").classList.remove("active");
    document.getElementById("driver-form").reset();
  }

  handleDriverFormSubmit() {
    const mode = document.getElementById("driver-form-mode").value;
    const oldLicense = document.getElementById("driver-old-license").value;
    const name = document.getElementById("driver-name").value.trim();
    const license = document.getElementById("driver-license").value.trim().toUpperCase();
    const category = document.getElementById("driver-category").value;
    const expiry = document.getElementById("driver-expiry").value;
    const phone = document.getElementById("driver-phone").value.trim();
    const safetyScore = parseInt(document.getElementById("driver-safety").value);
    const status = document.getElementById("driver-status").value;

    const errorDiv = document.getElementById("driver-form-error");

    if (!name || !license || !expiry || !phone || isNaN(safetyScore)) {
      errorDiv.innerText = "All fields are required.";
      errorDiv.classList.remove("hidden");
      return;
    }

    if (safetyScore < 0 || safetyScore > 100) {
      errorDiv.innerText = "Safety score must be between 0 and 100.";
      errorDiv.classList.remove("hidden");
      return;
    }

    // Uniqueness Check
    if (mode === "add") {
      const exists = this.drivers.some(d => d.license === license);
      if (exists) {
        errorDiv.innerText = `A driver with license number '${license}' already exists.`;
        errorDiv.classList.remove("hidden");
        return;
      }

      const newDriver = { name, license, category, expiry, phone, safetyScore, status };
      this.drivers.push(newDriver);
      this.addLog(`Registered new driver profile: '${name}' (${license}).`);
    } else if (mode === "edit") {
      const driverIndex = this.drivers.findIndex(d => d.license === oldLicense);
      if (driverIndex === -1) {
        errorDiv.innerText = "Driver profile not found.";
        errorDiv.classList.remove("hidden");
        return;
      }

      this.drivers[driverIndex].name = name;
      this.drivers[driverIndex].category = category;
      this.drivers[driverIndex].expiry = expiry;
      this.drivers[driverIndex].phone = phone;
      this.drivers[driverIndex].safetyScore = safetyScore;
      this.drivers[driverIndex].status = status;

      this.addLog(`Updated driver profile: '${name}' (${oldLicense}).`);
    }

    this.saveToStorage();
    this.renderDrivers();
    this.closeDriverModal();
  }

  deleteDriver(license) {
    const driver = this.drivers.find(d => d.license === license);
    const name = driver ? driver.name : license;
    
    if (confirm(`Are you sure you want to delete driver profile for '${name}'? This action cannot be undone.`)) {
      this.drivers = this.drivers.filter(d => d.license !== license);
      this.saveToStorage();
      this.addLog(`Deleted driver profile: '${name}' (${license}).`);
      this.renderDrivers();
    }
  }

  renderTrips() {
    const searchVal = document.getElementById("trip-search").value.toLowerCase().trim();
    const filterStatus = document.getElementById("trip-filter-status").value;

    let filtered = this.trips.filter(t => {
      const matchesSearch = t.source.toLowerCase().includes(searchVal) || 
                            t.destination.toLowerCase().includes(searchVal) ||
                            t.id.toLowerCase().includes(searchVal);
      const matchesStatus = !filterStatus || t.status === filterStatus;

      return matchesSearch && matchesStatus;
    });

    const tbody = document.getElementById("trip-table-body");
    if (!tbody) return;

    if (filtered.length === 0) {
      tbody.innerHTML = `<tr><td colspan="9" class="text-center" style="color: var(--text-muted); padding: 2rem;">No trips found matching filters.</td></tr>`;
      return;
    }

    tbody.innerHTML = filtered.map(t => {
      let badgeClass = "badge-muted"; // Draft (gray)
      if (t.status === "Dispatched") badgeClass = "badge-safety"; // Amber
      else if (t.status === "Completed") badgeClass = "badge-driver"; // Green
      else if (t.status === "Cancelled") badgeClass = "badge-danger"; // Red

      let actionsHTML = "";
      if (t.status === "Draft") {
        actionsHTML = `
          <button class="btn btn-secondary btn-small" onclick="app.dispatchTrip('${t.id}')">Dispatch</button>
          <button class="btn btn-danger btn-small" onclick="app.cancelTrip('${t.id}')">Cancel</button>
        `;
      } else if (t.status === "Dispatched") {
        actionsHTML = `
          <button class="btn btn-secondary btn-small btn-warning-small" onclick="app.openCompleteTripModal('${t.id}', '${t.vehicle}')">Complete</button>
          <button class="btn btn-danger btn-small" onclick="app.cancelTrip('${t.id}')">Cancel</button>
        `;
      } else {
        actionsHTML = `<span style="font-size: 0.75rem; color: var(--text-muted);">None</span>`;
      }

      return `
        <tr>
          <td style="font-weight: 600; font-family: monospace;">${t.id}</td>
          <td>${t.source}</td>
          <td>${t.destination}</td>
          <td style="font-family: monospace; font-weight: 600;">${t.vehicle}</td>
          <td>${t.driver}</td>
          <td>${t.weight.toLocaleString()} kg</td>
          <td>${t.distance.toLocaleString()} km</td>
          <td><span class="badge ${badgeClass}">${t.status}</span></td>
          <td class="actions-cell">${actionsHTML}</td>
        </tr>
      `;
    }).join('');
  }

  openCreateTripModal() {
    const today = new Date();
    
    // Populate Vehicles dropdown (Available only)
    const vehicleSelect = document.getElementById("trip-vehicle");
    const availableVehicles = this.vehicles.filter(v => v.status === "Available");
    
    if (availableVehicles.length === 0) {
      vehicleSelect.innerHTML = `<option value="">No vehicles available</option>`;
    } else {
      vehicleSelect.innerHTML = availableVehicles.map(v => 
        `<option value="${v.registration}">${v.registration} - ${v.name} (${v.capacity.toLocaleString()} kg)</option>`
      ).join('');
    }

    // Populate Drivers dropdown (Available & not expired CDL)
    const driverSelect = document.getElementById("trip-driver");
    const availableDrivers = this.drivers.filter(d => {
      const isAvailable = d.status === "Available";
      const isNotExpired = new Date(d.expiry) >= today;
      return isAvailable && isNotExpired;
    });

    if (availableDrivers.length === 0) {
      driverSelect.innerHTML = `<option value="">No drivers available</option>`;
    } else {
      driverSelect.innerHTML = availableDrivers.map(d => 
        `<option value="${d.name}">${d.name} (Safety: ${d.safetyScore})</option>`
      ).join('');
    }

    // Reset fields
    document.getElementById("trip-source").value = "";
    document.getElementById("trip-destination").value = "";
    document.getElementById("trip-weight").value = "";
    document.getElementById("trip-distance").value = "";

    document.getElementById("trip-form-error").classList.add("hidden");
    document.getElementById("trip-modal").classList.add("active");
  }

  closeTripModal() {
    document.getElementById("trip-modal").classList.remove("active");
    document.getElementById("trip-form").reset();
  }

  handleTripFormSubmit() {
    const source = document.getElementById("trip-source").value.trim();
    const destination = document.getElementById("trip-destination").value.trim();
    const weight = parseInt(document.getElementById("trip-weight").value);
    const distance = parseInt(document.getElementById("trip-distance").value);
    const vehicleReg = document.getElementById("trip-vehicle").value;
    const driverName = document.getElementById("trip-driver").value;

    const errorDiv = document.getElementById("trip-form-error");

    if (!source || !destination || isNaN(weight) || isNaN(distance) || !vehicleReg || !driverName) {
      errorDiv.innerText = "All fields are required.";
      errorDiv.classList.remove("hidden");
      return;
    }

    // Cargo weight vs max capacity business rule validation
    const vehicle = this.vehicles.find(v => v.registration === vehicleReg);
    if (!vehicle) {
      errorDiv.innerText = "Selected vehicle not found.";
      errorDiv.classList.remove("hidden");
      return;
    }

    if (weight > vehicle.capacity) {
      errorDiv.innerText = `Cargo Weight (${weight.toLocaleString()} kg) exceeds vehicle's maximum load capacity (${vehicle.capacity.toLocaleString()} kg).`;
      errorDiv.classList.remove("hidden");
      return;
    }

    // Generate new trip ID
    const tripId = `TRP-${100 + this.trips.length + 1}`;
    
    const newTrip = {
      id: tripId,
      source,
      destination,
      vehicle: vehicleReg,
      driver: driverName,
      weight,
      distance,
      status: "Draft"
    };

    this.trips.push(newTrip);
    this.addLog(`Created draft trip: '${tripId}' from '${source}' to '${destination}'.`);
    this.saveToStorage();
    this.renderTrips();
    this.closeTripModal();
  }

     dispatchTrip(id) {
       const trip = this.trips.find(t => t.id === id);
       if (!trip) return;

       // Double-check availability of vehicle & driver
       const vehicle = this.vehicles.find(v => v.registration === trip.vehicle);
       const driver = this.drivers.find(d => d.name === trip.driver);

       if (!vehicle || vehicle.status !== "Available") {
         alert(`Cannot dispatch: Assigned vehicle '${trip.vehicle}' is no longer available.`);
         return;
       }

       if (!driver || driver.status !== "Available") {
         alert(`Cannot dispatch: Assigned driver '${trip.driver}' is no longer available.`);
         return;
       }

       // Safety double-check on driver's license
       if (new Date(driver.expiry) < new Date()) {
         alert(`Cannot dispatch: Assigned driver '${trip.driver}' has an expired license.`);
         return;
       }

       // Update statuses
       vehicle.status = "On Trip";
       driver.status = "On Trip";
       trip.status = "Dispatched";

       this.addLog(`Dispatched trip: '${id}' using vehicle '${trip.vehicle}' and driver '${trip.driver}'.`);
       this.saveToStorage();
       this.renderTrips();
     }

     cancelTrip(id) {
       const trip = this.trips.find(t => t.id === id);
       if (!trip) return;

       // If currently dispatched, release vehicle and driver
       if (trip.status === "Dispatched") {
         const vehicle = this.vehicles.find(v => v.registration === trip.vehicle);
         const driver = this.drivers.find(d => d.name === trip.driver);

         if (vehicle && vehicle.status === "On Trip") vehicle.status = "Available";
         if (driver && driver.status === "On Trip") driver.status = "Available";
       }

       trip.status = "Cancelled";
       this.addLog(`Cancelled trip: '${id}'.`);
       this.saveToStorage();
       this.renderTrips();
     }

     openCompleteTripModal(id, vehicleReg) {
       const vehicle = this.vehicles.find(v => v.registration === vehicleReg);
       if (!vehicle) return;

       document.getElementById("trip-complete-id").value = id;
       document.getElementById("trip-complete-vehicle-reg").value = vehicleReg;
       document.getElementById("trip-complete-curr-odo").value = `${vehicle.odometer.toLocaleString()} km`;
       document.getElementById("trip-complete-final-odo").value = "";
       document.getElementById("trip-complete-fuel-liters").value = "";
       document.getElementById("trip-complete-fuel-cost").value = "";

       document.getElementById("trip-complete-form-error").classList.add("hidden");
       document.getElementById("trip-complete-modal").classList.add("active");
     }

     closeTripCompleteModal() {
       document.getElementById("trip-complete-modal").classList.remove("active");
       document.getElementById("trip-complete-form").reset();
     }

     calculateFuelCostPreset() {
       const liters = parseInt(document.getElementById("trip-complete-fuel-liters").value);
       const fuelCostInput = document.getElementById("trip-complete-fuel-cost");
       if (!isNaN(liters) && liters > 0) {
         fuelCostInput.value = Math.round(liters * 1.6); // Preset calculation ($1.60 per liter)
       } else {
         fuelCostInput.value = "";
       }
     }

     handleTripCompleteSubmit() {
       const id = document.getElementById("trip-complete-id").value;
       const vehicleReg = document.getElementById("trip-complete-vehicle-reg").value;
       const finalOdo = parseInt(document.getElementById("trip-complete-final-odo").value);
       const fuelLiters = parseInt(document.getElementById("trip-complete-fuel-liters").value);
       const fuelCost = parseInt(document.getElementById("trip-complete-fuel-cost").value);

       const errorDiv = document.getElementById("trip-complete-form-error");

       const trip = this.trips.find(t => t.id === id);
       const vehicle = this.vehicles.find(v => v.registration === vehicleReg);
       const driver = this.drivers.find(d => d.name === (trip ? trip.driver : ""));

       if (!trip || !vehicle || !driver) {
         errorDiv.innerText = "Invalid trip, vehicle, or driver state.";
         errorDiv.classList.remove("hidden");
         return;
       }

       if (isNaN(finalOdo) || finalOdo <= vehicle.odometer) {
         errorDiv.innerText = `Final odometer must exceed the vehicle's current odometer (${vehicle.odometer.toLocaleString()} km).`;
         errorDiv.classList.remove("hidden");
         return;
       }

       if (isNaN(fuelLiters) || fuelLiters <= 0 || isNaN(fuelCost) || fuelCost <= 0) {
         errorDiv.innerText = "Please provide valid fuel metrics.";
         errorDiv.classList.remove("hidden");
         return;
       }

       // Update vehicle's odometer
       vehicle.odometer = finalOdo;

       // Automatically generate a fuel expense log
       const expId = `EXP-${400 + this.expenses.length + 1}`;
       const newFuelExpense = {
         id: expId,
         vehicle: vehicleReg,
         type: "Fuel",
         liters: fuelLiters,
         cost: fuelCost,
         date: new Date().toISOString().split("T")[0],
         description: `Auto logged fuel from completed trip '${id}'`
       };
       this.expenses.push(newFuelExpense);

       // Set statuses back to Available
       vehicle.status = "Available";
       driver.status = "Available";
       trip.status = "Completed";

       this.addLog(`Completed trip: '${id}'. Logged fuel expense '${expId}' ($${fuelCost}) & set vehicle odometer to '${finalOdo} km'.`);
    this.saveToStorage();
    this.renderTrips();
    this.closeTripCompleteModal();
  }

  renderMaintenance() {
    const searchVal = document.getElementById("maintenance-search").value.toLowerCase().trim();
    const filterStatus = document.getElementById("maintenance-filter-status").value;

    let filtered = this.maintenance.filter(m => {
      const matchesSearch = m.vehicle.toLowerCase().includes(searchVal) || 
                            m.description.toLowerCase().includes(searchVal) ||
                            m.id.toLowerCase().includes(searchVal);
      const matchesStatus = !filterStatus || m.status === filterStatus;

      return matchesSearch && matchesStatus;
    });

    const tbody = document.getElementById("maintenance-table-body");
    if (!tbody) return;

    if (filtered.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" class="text-center" style="color: var(--text-muted); padding: 2rem;">No maintenance logs found matching filters.</td></tr>`;
      return;
    }

    tbody.innerHTML = filtered.map(m => {
      let badgeClass = "badge-safety"; // Scheduled (amber)
      if (m.status === "In Progress") badgeClass = "badge-manager"; // Blue
      else if (m.status === "Completed") badgeClass = "badge-driver"; // Green

      let actionsHTML = "";
      if (m.status === "Scheduled") {
        actionsHTML = `
          <button class="btn btn-secondary btn-small" onclick="app.setMaintenanceStatus('${m.id}', 'In Progress')">Start Work</button>
          <button class="btn btn-secondary btn-small btn-warning-small" onclick="app.setMaintenanceStatus('${m.id}', 'Completed')">Complete</button>
        `;
      } else if (m.status === "In Progress") {
        actionsHTML = `
          <button class="btn btn-secondary btn-small btn-warning-small" onclick="app.setMaintenanceStatus('${m.id}', 'Completed')">Complete</button>
        `;
      } else {
        actionsHTML = `<span style="font-size: 0.75rem; color: var(--text-muted);">Completed</span>`;
      }

      return `
        <tr>
          <td style="font-weight: 600; font-family: monospace;">${m.id}</td>
          <td style="font-family: monospace; font-weight: 600;">${m.vehicle}</td>
          <td>${m.description}</td>
          <td>${m.date}</td>
          <td>$${m.cost.toLocaleString()}</td>
          <td><span class="badge ${badgeClass}">${m.status}</span></td>
          <td class="actions-cell">${actionsHTML}</td>
        </tr>
      `;
    }).join('');
  }

  openCreateMaintenanceModal() {
    // Populate Vehicles dropdown (exclude Retired)
    const vehicleSelect = document.getElementById("maintenance-vehicle");
    const activeVehicles = this.vehicles.filter(v => v.status !== "Retired");

    if (activeVehicles.length === 0) {
      vehicleSelect.innerHTML = `<option value="">No vehicles found</option>`;
    } else {
      vehicleSelect.innerHTML = activeVehicles.map(v => 
        `<option value="${v.registration}">${v.registration} - ${v.name} (Status: ${v.status})</option>`
      ).join('');
    }

    // Reset fields
    document.getElementById("maintenance-date").value = "";
    document.getElementById("maintenance-cost").value = "";
    document.getElementById("maintenance-status").value = "Scheduled";
    document.getElementById("maintenance-desc").value = "";

    document.getElementById("maintenance-form-error").classList.add("hidden");
    document.getElementById("maintenance-modal").classList.add("active");
  }

  closeMaintenanceModal() {
    document.getElementById("maintenance-modal").classList.remove("active");
    document.getElementById("maintenance-form").reset();
  }

  handleMaintenanceFormSubmit() {
    const vehicleReg = document.getElementById("maintenance-vehicle").value;
    const date = document.getElementById("maintenance-date").value;
    const cost = parseInt(document.getElementById("maintenance-cost").value);
    const status = document.getElementById("maintenance-status").value;
    const description = document.getElementById("maintenance-desc").value.trim();

    const errorDiv = document.getElementById("maintenance-form-error");

    if (!vehicleReg || !date || isNaN(cost) || !status || !description) {
      errorDiv.innerText = "All fields are required.";
      errorDiv.classList.remove("hidden");
      return;
    }

    // Fetch vehicle and validate statuses
    const vehicle = this.vehicles.find(v => v.registration === vehicleReg);
    if (!vehicle) {
      errorDiv.innerText = "Vehicle not found.";
      errorDiv.classList.remove("hidden");
      return;
    }

    if (vehicle.status === "On Trip") {
      errorDiv.innerText = "Vehicle is currently on an active trip and cannot undergo maintenance.";
      errorDiv.classList.remove("hidden");
      return;
    }

    // Generate new work order ID
    const woId = `MNT-${100 + this.maintenance.length + 1}`;

    const newRecord = {
      id: woId,
      vehicle: vehicleReg,
      description,
      cost,
      date,
      status
    };

    this.maintenance.push(newRecord);

    // Business Rule: Switches vehicle status to "In Shop"
    vehicle.status = "In Shop";

    this.addLog(`Logged maintenance work order: '${woId}' for vehicle '${vehicleReg}' and placed vehicle In Shop.`);
    this.saveToStorage();
    this.renderMaintenance();
    this.closeMaintenanceModal();
  }

  setMaintenanceStatus(id, newStatus) {
    const record = this.maintenance.find(m => m.id === id);
    if (!record) return;

    record.status = newStatus;

    // Business Rule: Releasing vehicle if Completed
    if (newStatus === "Completed") {
      const vehicle = this.vehicles.find(v => v.registration === record.vehicle);
      if (vehicle) {
        // Check if this vehicle has other active (Scheduled or In Progress) maintenance work orders
        const hasOtherActive = this.maintenance.some(m => m.vehicle === record.vehicle && m.id !== id && m.status !== "Completed");
        if (!hasOtherActive) {
          vehicle.status = "Available";
          this.addLog(`Maintenance '${id}' completed. Vehicle '${record.vehicle}' is now Available.`);
        } else {
          this.addLog(`Maintenance '${id}' completed. Vehicle '${record.vehicle}' remains In Shop due to other active work orders.`);
        }
      }
    } else {
      this.addLog(`Work order '${id}' status updated to '${newStatus}'.`);
    }

    this.saveToStorage();
    this.renderMaintenance();
  }

  renderExpenses() {
    const filterType = document.getElementById("expense-filter-type").value;

    // Calculate TCO per vehicle: Sum of all expenses + completed maintenance costs
    const tcoBody = document.getElementById("tco-table-body");
    if (tcoBody) {
      tcoBody.innerHTML = this.vehicles.map(v => {
        // Sum fuel costs
        const fuelCost = this.expenses
          .filter(e => e.vehicle === v.registration && e.type === "Fuel")
          .reduce((sum, e) => sum + e.cost, 0);

        // Sum maintenance costs from both manual expense logs and completed maintenance logs
        const manualMaintCost = this.expenses
          .filter(e => e.vehicle === v.registration && e.type === "Maintenance")
          .reduce((sum, e) => sum + e.cost, 0);
        const loggedMaintCost = this.maintenance
          .filter(m => m.vehicle === v.registration && m.status === "Completed")
          .reduce((sum, m) => sum + m.cost, 0);
        const maintCost = manualMaintCost + loggedMaintCost;

        // Sum tolls & other costs
        const tollsOtherCost = this.expenses
          .filter(e => e.vehicle === v.registration && (e.type === "Tolls" || e.type === "Other"))
          .reduce((sum, e) => sum + e.cost, 0);

        const totalCost = fuelCost + maintCost + tollsOtherCost;

        return `
          <tr>
            <td style="font-weight: 600; font-family: monospace;">${v.registration}</td>
            <td>$${fuelCost.toLocaleString()}</td>
            <td>$${maintCost.toLocaleString()}</td>
            <td>$${tollsOtherCost.toLocaleString()}</td>
            <td style="font-weight: 700; color: var(--success);">$${totalCost.toLocaleString()}</td>
          </tr>
        `;
      }).join('');
    }

    // Render individual expense logs
    let filtered = this.expenses.filter(e => {
      return !filterType || e.type === filterType;
    });

    // Sort by date descending
    filtered.sort((a, b) => new Date(b.date) - new Date(a.date));

    const expenseBody = document.getElementById("expense-table-body");
    if (expenseBody) {
      if (filtered.length === 0) {
        expenseBody.innerHTML = `<tr><td colspan="6" class="text-center" style="color: var(--text-muted); padding: 1.5rem;">No operating expenses recorded.</td></tr>`;
        return;
      }

      expenseBody.innerHTML = filtered.map(e => {
        let badgeClass = "badge-muted";
        if (e.type === "Fuel") badgeClass = "badge-driver";
        else if (e.type === "Maintenance") badgeClass = "badge-safety";
        else if (e.type === "Tolls") badgeClass = "badge-manager";
        else if (e.type === "Other") badgeClass = "badge-finance";

        const descLiters = e.type === "Fuel" && e.liters ? `${e.description} (${e.liters} L)` : e.description;

        return `
          <tr>
            <td style="font-family: monospace; font-size: 0.8rem; color: var(--text-muted);">${e.id}</td>
            <td style="font-family: monospace; font-weight: 600;">${e.vehicle}</td>
            <td><span class="badge ${badgeClass}">${e.type}</span></td>
            <td style="font-weight: 600;">$${e.cost.toLocaleString()}</td>
            <td>${e.date}</td>
            <td style="font-size: 0.85rem; max-width: 150px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${descLiters}">${descLiters}</td>
          </tr>
        `;
      }).join('');
    }
  }

  openCreateExpenseModal() {
    // Populate vehicles dropdown (exclude Retired)
    const vehicleSelect = document.getElementById("expense-vehicle");
    const activeVehicles = this.vehicles.filter(v => v.status !== "Retired");

    if (activeVehicles.length === 0) {
      vehicleSelect.innerHTML = `<option value="">No vehicles found</option>`;
    } else {
      vehicleSelect.innerHTML = activeVehicles.map(v => 
        `<option value="${v.registration}">${v.registration} - ${v.name}</option>`
      ).join('');
    }

    // Reset fields
    document.getElementById("expense-type").value = "Fuel";
    document.getElementById("expense-liters").value = "";
    document.getElementById("expense-cost").value = "";
    document.getElementById("expense-date").value = new Date().toISOString().split("T")[0];
    document.getElementById("expense-desc").value = "";

    this.toggleExpenseLitersInput();
    document.getElementById("expense-form-error").classList.add("hidden");
    document.getElementById("expense-modal").classList.add("active");
  }

  closeExpenseModal() {
    document.getElementById("expense-modal").classList.remove("active");
    document.getElementById("expense-form").reset();
  }

  toggleExpenseLitersInput() {
    const type = document.getElementById("expense-type").value;
    const container = document.getElementById("expense-liters-container");
    const input = document.getElementById("expense-liters");
    if (container && input) {
      if (type === "Fuel") {
        container.style.display = "block";
        input.required = true;
      } else {
        container.style.display = "none";
        input.required = false;
        input.value = "";
      }
    }
  }

  handleExpenseFormSubmit() {
    const vehicleReg = document.getElementById("expense-vehicle").value;
    const type = document.getElementById("expense-type").value;
    const litersVal = document.getElementById("expense-liters").value;
    const cost = parseInt(document.getElementById("expense-cost").value);
    const date = document.getElementById("expense-date").value;
    const description = document.getElementById("expense-desc").value.trim();

    const errorDiv = document.getElementById("expense-form-error");

    if (!vehicleReg || !type || isNaN(cost) || !date || !description) {
      errorDiv.innerText = "All fields are required.";
      errorDiv.classList.remove("hidden");
      return;
    }

    if (cost <= 0) {
      errorDiv.innerText = "Expense cost must be greater than zero.";
      errorDiv.classList.remove("hidden");
      return;
    }

    let liters = null;
    if (type === "Fuel") {
      liters = parseInt(litersVal);
      if (isNaN(liters) || liters <= 0) {
        errorDiv.innerText = "Fuel volume must be a positive number of liters.";
        errorDiv.classList.remove("hidden");
        return;
      }
    }

    const expId = `EXP-${400 + this.expenses.length + 1}`;
    const newExpense = {
      id: expId,
      vehicle: vehicleReg,
      type,
      liters,
      cost,
      date,
      description
    };

    this.expenses.push(newExpense);
    this.addLog(`Recorded manual expense: '${expId}' ($${cost}) for vehicle '${vehicleReg}'.`);
    this.saveToStorage();
    this.renderExpenses();
    this.closeExpenseModal();
  }

  // ==========================================================================
  // Email Compliance Reminders
  // ==========================================================================
  openEmailReminderModal(license) {
    const driver = this.drivers.find(d => d.license === license);
    if (!driver) return;

    const emailTo = document.getElementById("email-to");
    const emailSubject = document.getElementById("email-subject");
    const emailBody = document.getElementById("email-body");
    const emailStatus = document.getElementById("email-reminder-status");

    // Standard driver mock email
    const driverEmail = `${driver.name.toLowerCase().replace(" ", ".")}@transitops.com`;
    
    emailTo.value = driverEmail;
    emailSubject.value = `URGENT: Commercial Driver's License Expiry Warning (${driver.license})`;
    
    const today = new Date();
    const expiryDate = new Date(driver.expiry);
    let daysMessage = "";
    if (expiryDate < today) {
      daysMessage = `expired on ${driver.expiry} and is legally invalid. You are currently Suspended from dispatching active trips.`;
    } else {
      const daysDiff = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
      daysMessage = `will expire on ${driver.expiry} (${daysDiff} days remaining). Please initiate the CDL renewal process to avoid suspension.`;
    }

    emailBody.value = `Dear ${driver.name},

This compliance notification is from the TransitOps Safety & Compliance Department. 

Our records indicate that your Commercial Driver's License (CDL Number: ${driver.license}, Category: ${driver.category}) ${daysMessage}

Please submit your renewed medical card and CDL certification paperwork to the safety coordinator immediately.

Safe driving,
TransitOps Safety & Compliance Office`;

    emailStatus.classList.add("hidden");
    document.getElementById("email-reminder-modal").classList.add("active");
  }

  closeEmailReminderModal() {
    document.getElementById("email-reminder-modal").classList.remove("active");
    document.getElementById("email-reminder-form").reset();
  }

  sendEmailReminder() {
    const to = document.getElementById("email-to").value;
    const subject = document.getElementById("email-subject").value;
    
    // Simulate sending email
    const statusDiv = document.getElementById("email-reminder-status");
    statusDiv.innerText = `Simulated email notification successfully dispatched to ${to}!`;
    statusDiv.classList.remove("hidden");
    
    this.addLog(`Dispatched CDL renewal compliance email reminder to '${to}'.`);
    
    setTimeout(() => {
      this.closeEmailReminderModal();
    }, 1500);
  }

  triggerMailto() {
    const to = document.getElementById("email-to").value;
    const subject = encodeURIComponent(document.getElementById("email-subject").value);
    const body = encodeURIComponent(document.getElementById("email-body").value);
    
    window.location.href = `mailto:${to}?subject=${subject}&body=${body}`;
    this.addLog(`Triggered local mailto helper client for '${to}'.`);
    this.closeEmailReminderModal();
  }

  // ==========================================================================
  // Vehicle Document Management
  // ==========================================================================
  openVehicleDocsModal(reg) {
    const vehicle = this.vehicles.find(v => v.registration === reg);
    if (!vehicle) return;

    document.getElementById("docs-vehicle-reg").value = reg;
    document.getElementById("vehicle-docs-title").innerText = `Documents for ${reg} (${vehicle.name})`;
    document.getElementById("docs-file-input").value = "";
    document.getElementById("docs-type-input").value = "Registration";

    this.renderVehicleDocsList(reg);
    document.getElementById("vehicle-docs-modal").classList.add("active");
  }

  closeVehicleDocsModal() {
    document.getElementById("vehicle-docs-modal").classList.remove("active");
    document.getElementById("vehicle-docs-form").reset();
  }

  renderVehicleDocsList(reg) {
    const vehicle = this.vehicles.find(v => v.registration === reg);
    const tbody = document.getElementById("vehicle-docs-table-body");
    if (!tbody || !vehicle) return;

    if (!vehicle.documents || vehicle.documents.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5" class="text-center" style="color: var(--text-muted); padding: 1.5rem;">No documents attached to this vehicle.</td></tr>`;
      return;
    }

    tbody.innerHTML = vehicle.documents.map((doc, index) => {
      return `
        <tr>
          <td style="font-weight: 500; font-size: 0.85rem; max-width: 180px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${doc.name}">${doc.name}</td>
          <td><span class="badge ${doc.type === 'Registration' ? 'badge-manager' : doc.type === 'Insurance' ? 'badge-driver' : doc.type === 'Permit' ? 'badge-safety' : 'badge-finance'}">${doc.type}</span></td>
          <td style="font-size: 0.8rem;">${doc.date}</td>
          <td style="font-size: 0.8rem; color: var(--text-muted);">${doc.size}</td>
          <td class="actions-cell">
            <button class="btn btn-secondary btn-small" onclick="app.viewVehicleDocument('${reg}', ${index})">View</button>
            <button class="btn btn-danger btn-small" onclick="app.deleteVehicleDocument('${reg}', ${index})">Delete</button>
          </td>
        </tr>
      `;
    }).join('');
  }

  uploadVehicleDocument() {
    const reg = document.getElementById("docs-vehicle-reg").value;
    const fileInput = document.getElementById("docs-file-input");
    const type = document.getElementById("docs-type-input").value;
    
    if (!fileInput.files || fileInput.files.length === 0) return;
    const file = fileInput.files[0];

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target.result;
      const vehicle = this.vehicles.find(v => v.registration === reg);
      if (vehicle) {
        if (!vehicle.documents) {
          vehicle.documents = [];
        }
        
        // Size format
        let sizeStr = `${Math.round(file.size / 1024)} KB`;
        if (file.size > 1024 * 1024) {
          sizeStr = `${(file.size / (1024 * 1024)).toFixed(1)} MB`;
        }

        const newDoc = {
          name: file.name,
          type,
          date: new Date().toISOString().split("T")[0],
          size: sizeStr,
          dataUrl
        };

        vehicle.documents.push(newDoc);
        this.saveToStorage();
        this.renderVehicleDocsList(reg);
        this.addLog(`Attached document '${file.name}' to vehicle '${reg}'.`);
        
        fileInput.value = "";
      }
    };
    reader.readAsDataURL(file);
  }

  viewVehicleDocument(reg, index) {
    const vehicle = this.vehicles.find(v => v.registration === reg);
    if (!vehicle || !vehicle.documents || !vehicle.documents[index]) return;

    const doc = vehicle.documents[index];
    if (doc.dataUrl) {
      const newTab = window.open();
      if (newTab) {
        newTab.document.write(`<iframe src="${doc.dataUrl}" style="border:0; top:0; left:0; bottom:0; right:0; width:100%; height:100%;" allowfullscreen></iframe>`);
        newTab.document.title = doc.name;
      } else {
        const link = document.createElement("a");
        link.href = doc.dataUrl;
        link.download = doc.name;
        link.click();
      }
      this.addLog(`Viewed document '${doc.name}' for vehicle '${reg}'.`);
    } else {
      alert("Document preview not available.");
    }
  }

  deleteVehicleDocument(reg, index) {
    const vehicle = this.vehicles.find(v => v.registration === reg);
    if (!vehicle || !vehicle.documents || !vehicle.documents[index]) return;

    const docName = vehicle.documents[index].name;
    if (confirm(`Are you sure you want to detach document '${docName}'?`)) {
      vehicle.documents.splice(index, 1);
      this.saveToStorage();
      this.renderVehicleDocsList(reg);
      this.addLog(`Detached document '${docName}' from vehicle '${reg}'.`);
    }
  }

  renderReports() {
    const tbody = document.getElementById("reports-table-body");
    if (!tbody) return;

    let totalFleetCost = 0;
    let totalFleetAcquisition = 0;
    let totalFleetDistance = 0;
    let totalFleetFuel = 0;
    let totalFleetRevenue = 0;

    const vehicleMetrics = this.vehicles.map(v => {
      // 1. Distance Run
      const distanceRun = this.trips
        .filter(t => t.vehicle === v.registration && t.status === "Completed")
        .reduce((sum, t) => sum + t.distance, 0);

      // 2. Fuel Consumed (Liters)
      const tripFuel = this.trips
        .filter(t => t.vehicle === v.registration && t.status === "Completed" && t.fuelConsumed)
        .reduce((sum, t) => sum + t.fuelConsumed, 0);
      const manualFuelLiters = this.expenses
        .filter(e => e.vehicle === v.registration && e.type === "Fuel" && e.liters)
        .reduce((sum, e) => sum + e.liters, 0);
      const fuelConsumed = tripFuel + manualFuelLiters;

      // 3. Operational Cost
      const fuelCost = this.expenses
        .filter(e => e.vehicle === v.registration && e.type === "Fuel")
        .reduce((sum, e) => sum + e.cost, 0);
      const manualMaintCost = this.expenses
        .filter(e => e.vehicle === v.registration && e.type === "Maintenance")
        .reduce((sum, e) => sum + e.cost, 0);
      const loggedMaintCost = this.maintenance
        .filter(m => m.vehicle === v.registration && m.status === "Completed")
        .reduce((sum, m) => sum + m.cost, 0);
      const maintCost = manualMaintCost + loggedMaintCost;
      const tollsOtherCost = this.expenses
        .filter(e => e.vehicle === v.registration && (e.type === "Tolls" || e.type === "Other"))
        .reduce((sum, e) => sum + e.cost, 0);
      const operationalCost = fuelCost + maintCost + tollsOtherCost;

      // 4. Revenue (rate of $0.003 per kg-km)
      const revenue = this.trips
        .filter(t => t.vehicle === v.registration && t.status === "Completed")
        .reduce((sum, t) => sum + (t.distance * t.weight * 0.003), 0);

      // 5. Profit
      const netProfit = revenue - operationalCost;

      // 6. ROI
      const roi = v.cost > 0 ? (netProfit / v.cost) * 100 : 0;

      // Aggregates
      totalFleetCost += operationalCost;
      totalFleetAcquisition += v.cost;
      totalFleetDistance += distanceRun;
      totalFleetFuel += fuelConsumed;
      totalFleetRevenue += revenue;

      return {
        reg: v.registration,
        odometer: v.odometer,
        distanceRun,
        fuelConsumed,
        operationalCost,
        revenue,
        netProfit,
        roi
      };
    });

    // Populate widgets
    document.getElementById("report-total-cost").innerText = `$${totalFleetCost.toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 0})}`;
    
    const activeVehicles = this.vehicles.filter(v => v.status === "On Trip").length;
    const utilizationPct = this.vehicles.length > 0 ? (activeVehicles / this.vehicles.length) * 100 : 0;
    document.getElementById("report-utilization").innerText = `${utilizationPct.toFixed(1)}%`;

    const avgEfficiency = totalFleetFuel > 0 ? totalFleetDistance / totalFleetFuel : 0;
    document.getElementById("report-avg-efficiency").innerText = `${avgEfficiency.toFixed(2)} km/L`;

    const fleetRoi = totalFleetAcquisition > 0 ? ((totalFleetRevenue - totalFleetCost) / totalFleetAcquisition) * 100 : 0;
    document.getElementById("report-avg-roi").innerText = `${fleetRoi.toFixed(2)}%`;

    // Render rows
    tbody.innerHTML = vehicleMetrics.map(vm => {
      const efficiencyStr = vm.fuelConsumed > 0 ? `${(vm.distanceRun / vm.fuelConsumed).toFixed(2)} km/L` : "N/A";
      const roiClass = vm.roi >= 0 ? "text-success" : "text-danger";
      return `
        <tr>
          <td style="font-weight: 600; font-family: monospace;">${vm.reg}</td>
          <td>${vm.odometer.toLocaleString()} km</td>
          <td>${vm.distanceRun.toLocaleString()} km</td>
          <td>${efficiencyStr}</td>
          <td style="color: var(--color-finance); font-weight: 600;">$${vm.operationalCost.toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 0})}</td>
          <td style="color: var(--color-driver); font-weight: 600;">$${vm.revenue.toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 0})}</td>
          <td style="font-weight: 600;">$${vm.netProfit.toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 0})}</td>
          <td class="${roiClass}" style="font-weight: 700;">${vm.roi.toFixed(2)}%</td>
        </tr>
      `;
    }).join('');
  }

  exportReportsCSV() {
    let csv = "Vehicle Registration,Odometer (km),Distance Run (km),Fuel Efficiency,Operational Cost ($),Revenue ($),Net Profit ($),ROI (%)\n";

    this.vehicles.forEach(v => {
      const distanceRun = this.trips
        .filter(t => t.vehicle === v.registration && t.status === "Completed")
        .reduce((sum, t) => sum + t.distance, 0);

      const tripFuel = this.trips
        .filter(t => t.vehicle === v.registration && t.status === "Completed" && t.fuelConsumed)
        .reduce((sum, t) => sum + t.fuelConsumed, 0);
      const manualFuelLiters = this.expenses
        .filter(e => e.vehicle === v.registration && e.type === "Fuel" && e.liters)
        .reduce((sum, e) => sum + e.liters, 0);
      const fuelConsumed = tripFuel + manualFuelLiters;

      const fuelCost = this.expenses
        .filter(e => e.vehicle === v.registration && e.type === "Fuel")
        .reduce((sum, e) => sum + e.cost, 0);
      const manualMaintCost = this.expenses
        .filter(e => e.vehicle === v.registration && e.type === "Maintenance")
        .reduce((sum, e) => sum + e.cost, 0);
      const loggedMaintCost = this.maintenance
        .filter(m => m.vehicle === v.registration && m.status === "Completed")
        .reduce((sum, m) => sum + m.cost, 0);
      const maintCost = manualMaintCost + loggedMaintCost;
      const tollsOtherCost = this.expenses
        .filter(e => e.vehicle === v.registration && (e.type === "Tolls" || e.type === "Other"))
        .reduce((sum, e) => sum + e.cost, 0);
      const operationalCost = fuelCost + maintCost + tollsOtherCost;

      const revenue = this.trips
        .filter(t => t.vehicle === v.registration && t.status === "Completed")
        .reduce((sum, t) => sum + (t.distance * t.weight * 0.003), 0);

      const netProfit = revenue - operationalCost;
      const roi = v.cost > 0 ? (netProfit / v.cost) * 100 : 0;
      const efficiencyStr = fuelConsumed > 0 ? (distanceRun / fuelConsumed).toFixed(2) : "N/A";

      csv += `"${v.registration}","${v.odometer}","${distanceRun}","${efficiencyStr}","${operationalCost}","${revenue}","${netProfit}","${roi.toFixed(2)}"\n`;
    });

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `transitops_fleet_report_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    this.addLog("Exported fleet financial reports to CSV.");
  }
}

// Instantiate state globally
const app = new AppState();

// ==========================================================================
// Event Listeners & Bootstrapping
// ==========================================================================
document.addEventListener("DOMContentLoaded", () => {
  app.init();

  // Handle Form Submission Login
  const loginForm = document.getElementById("login-form");
  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = document.getElementById("email").value.trim().toLowerCase();
    const password = document.getElementById("password").value;

    const user = PREDEFINED_USERS[email];
    if (user && user.password === password) {
      app.loginUser(email);
    } else {
      const errorMsg = document.getElementById("login-error");
      errorMsg.innerText = "Invalid email or password preset.";
      errorMsg.classList.remove("hidden");
      app.addLog(`Failed login attempt for '${email}'.`);
    }
  });

  // Handle Quick Demo Login Buttons
  const quickLoginButtons = document.querySelectorAll(".quick-login-btn");
  quickLoginButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      const email = btn.getAttribute("data-email");
      app.loginUser(email);
    });
  });

  // Handle Sidebar Navigation click
  const navItems = document.querySelectorAll(".nav-menu .nav-item");
  navItems.forEach(item => {
    item.addEventListener("click", (e) => {
      e.preventDefault();
      if (item.classList.contains("disabled")) return;
      const tabId = item.getAttribute("data-tab");
      window.location.hash = tabId; // Updates URL hash, triggering hashchange listener
    });
  });

  // Handle RBAC Role Switcher
  const roleSwitcher = document.getElementById("rbac-role-switcher");
  roleSwitcher.addEventListener("change", (e) => {
    app.setSimulatedRole(e.target.value);
  });

  // Theme Toggle Button
  const themeToggle = document.getElementById("theme-toggle");
  themeToggle.addEventListener("click", () => {
    app.toggleTheme();
  });

  // Logout Button
  const logoutBtn = document.getElementById("logout-btn");
  logoutBtn.addEventListener("click", () => {
    app.logout();
  });

  // Dashboard Filters Selector change bindings
  const filterType = document.getElementById("filter-type");
  filterType.addEventListener("change", () => app.handleFilterChange());

  const filterStatus = document.getElementById("filter-status");
  filterStatus.addEventListener("change", () => app.handleFilterChange());

  const filterRegion = document.getElementById("filter-region");
  filterRegion.addEventListener("change", () => app.handleFilterChange());

  const btnResetFilters = document.getElementById("btn-reset-filters");
  btnResetFilters.addEventListener("click", () => app.resetFilters());

  // Vehicle Registry Filters bindings
  const vehicleSearch = document.getElementById("vehicle-search");
  vehicleSearch.addEventListener("input", () => app.renderVehicles());

  document.getElementById("vehicle-filter-type").addEventListener("change", () => app.renderVehicles());
  document.getElementById("vehicle-filter-status").addEventListener("change", () => app.renderVehicles());
  document.getElementById("vehicle-filter-region").addEventListener("change", () => app.renderVehicles());
  document.getElementById("vehicle-sort-by").addEventListener("change", () => app.renderVehicles());

  const btnAddVehicle = document.getElementById("btn-add-vehicle");
  btnAddVehicle.addEventListener("click", () => app.openAddVehicleModal());

  const vehicleForm = document.getElementById("vehicle-form");
  vehicleForm.addEventListener("submit", (e) => {
    e.preventDefault();
    app.handleVehicleFormSubmit();
  });

  // Driver Management Filters bindings
  const driverSearch = document.getElementById("driver-search");
  driverSearch.addEventListener("input", () => app.renderDrivers());

  document.getElementById("driver-filter-status").addEventListener("change", () => app.renderDrivers());
  document.getElementById("driver-filter-category").addEventListener("change", () => app.renderDrivers());
  document.getElementById("driver-sort-by").addEventListener("change", () => app.renderDrivers());

  const btnAddDriver = document.getElementById("btn-add-driver");
  btnAddDriver.addEventListener("click", () => app.openAddDriverModal());

  const driverForm = document.getElementById("driver-form");
  driverForm.addEventListener("submit", (e) => {
    e.preventDefault();
    app.handleDriverFormSubmit();
  });

  // Trip Management bindings
  const tripSearch = document.getElementById("trip-search");
  tripSearch.addEventListener("input", () => app.renderTrips());

  document.getElementById("trip-filter-status").addEventListener("change", () => app.renderTrips());

  const tripForm = document.getElementById("trip-form");
  tripForm.addEventListener("submit", (e) => {
    e.preventDefault();
    app.handleTripFormSubmit();
  });

  const tripCompleteForm = document.getElementById("trip-complete-form");
  tripCompleteForm.addEventListener("submit", (e) => {
    e.preventDefault();
    app.handleTripCompleteSubmit();
  });

  // Maintenance Management bindings
  const maintenanceSearch = document.getElementById("maintenance-search");
  if (maintenanceSearch) {
    maintenanceSearch.addEventListener("input", () => app.renderMaintenance());
  }

  const mntFilterStatus = document.getElementById("maintenance-filter-status");
  if (mntFilterStatus) {
    mntFilterStatus.addEventListener("change", () => app.renderMaintenance());
  }

  const maintenanceForm = document.getElementById("maintenance-form");
  if (maintenanceForm) {
    maintenanceForm.addEventListener("submit", (e) => {
      e.preventDefault();
      app.handleMaintenanceFormSubmit();
    });
  }

  // Expense Management bindings
  const expFilterType = document.getElementById("expense-filter-type");
  if (expFilterType) {
    expFilterType.addEventListener("change", () => app.renderExpenses());
  }

  const expenseForm = document.getElementById("expense-form");
  if (expenseForm) {
    expenseForm.addEventListener("submit", (e) => {
      e.preventDefault();
      app.handleExpenseFormSubmit();
    });
  }

  // Bind global routing to hashchange
  window.addEventListener("hashchange", () => {
    app.handleRouting();
  });
});
