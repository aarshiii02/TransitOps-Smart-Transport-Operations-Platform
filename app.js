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

  // Bind global routing to hashchange
  window.addEventListener("hashchange", () => {
    app.handleRouting();
  });
});
