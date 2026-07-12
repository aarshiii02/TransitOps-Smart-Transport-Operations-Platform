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
// Application State
// ==========================================================================
class AppState {
  constructor() {
    this.currentUser = null;
    this.simulatedRole = null;
    this.theme = localStorage.getItem("transitops_theme") || "dark";
    this.logs = JSON.parse(localStorage.getItem("transitops_logs")) || [];
    
    // Database Storage Arrays
    this.vehicles = [];
    this.drivers = [];
    this.trips = [];
    this.maintenance = [];
    this.expenses = [];
  }

  init() {
    // Load local storage fleet data
    this.loadDatabase();

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

  loadDatabase() {
    const savedData = localStorage.getItem("transitops_database");
    if (savedData) {
      const db = JSON.parse(savedData);
      this.vehicles = db.vehicles || [];
      this.drivers = db.drivers || [];
      this.trips = db.trips || [];
      this.maintenance = db.maintenance || [];
      this.expenses = db.expenses || [];
    } else {
      // Predefined default mock data according to specs
      this.vehicles = [
        { registration: "VAN-01", name: "Ford Transit Cargo", type: "Van", capacity: 600, odometer: 12500, cost: 25000, status: "Available", region: "North" },
        { registration: "TRK-02", name: "Volvo FH16 Hauler", type: "Heavy Truck", capacity: 5000, odometer: 45000, cost: 65000, status: "On Trip", region: "South" },
        { registration: "SEM-03", name: "Scania R-Series Semi", type: "Semi-Trailer", capacity: 15000, odometer: 120000, cost: 95000, status: "In Shop", region: "East" },
        { registration: "VAN-04", name: "Mercedes Sprinter", type: "Van", capacity: 500, odometer: 8200, cost: 22000, status: "Available", region: "West" },
        { registration: "TRK-05", name: "Isuzu Elf Delivery", type: "Light Truck", capacity: 2500, odometer: 18400, cost: 38000, status: "Available", region: "North" },
        { registration: "SED-06", name: "Toyota Prius Utility", type: "Sedan", capacity: 300, odometer: 4000, cost: 18000, status: "Available", region: "South" },
        { registration: "TRK-07", name: "Peterbilt 389 Rig", type: "Heavy Truck", capacity: 6000, odometer: 350000, cost: 55000, status: "Retired", region: "East" },
        { registration: "SEM-08", name: "Freightliner Cascadia", type: "Semi-Trailer", capacity: 18000, odometer: 75000, cost: 110000, status: "Available", region: "West" }
      ];

      this.drivers = [
        { name: "Alex Mercer", license: "DL-8827", category: "Class A", expiry: "2028-12-15", contact: "555-0192", safetyScore: 92, status: "Available" },
        { name: "Marcus Vance", license: "DL-1928", category: "Class B", expiry: "2027-06-20", contact: "555-0144", safetyScore: 88, status: "On Trip" },
        { name: "Sarah Jenkins", license: "DL-3746", category: "Class A", expiry: "2029-01-10", contact: "555-0123", safetyScore: 95, status: "Off Duty" },
        { name: "John Doe", license: "DL-9921", category: "Class C", expiry: "2026-11-05", contact: "555-0188", safetyScore: 45, status: "Suspended" },
        { name: "Jane Smith", license: "DL-4472", category: "Class A", expiry: "2022-05-15", contact: "555-0112", safetyScore: 99, status: "Available" },
        { name: "Bob Johnson", license: "DL-7729", category: "Class B", expiry: "2027-10-18", contact: "555-0177", safetyScore: 82, status: "Available" }
      ];

      this.trips = [
        { id: "T-101", source: "Warehouse A", destination: "Retail Store 5", vehicleReg: "TRK-02", driverName: "Marcus Vance", cargoWeight: 4200, distance: 150, status: "Dispatched", date: "2026-07-11" },
        { id: "T-102", source: "Port Hub", destination: "Distribution Center", vehicleReg: "SEM-08", driverName: "Alex Mercer", cargoWeight: 12000, distance: 320, status: "Draft", date: "2026-07-12" },
        { id: "T-103", source: "Logistics Depot", destination: "Customer Site B", vehicleReg: "VAN-01", driverName: "Bob Johnson", cargoWeight: 450, distance: 60, status: "Completed", date: "2026-06-25", finalOdometer: 12560, fuelConsumed: 15, revenue: 1200 },
        { id: "T-104", source: "Warehouse B", destination: "Retail Store 2", vehicleReg: "SED-06", driverName: "Bob Johnson", cargoWeight: 150, distance: 25, status: "Completed", date: "2026-07-02", finalOdometer: 4025, fuelConsumed: 3, revenue: 350 }
      ];

      this.maintenance = [
        { id: "M-301", vehicleReg: "SEM-03", description: "Transmission Overhaul", date: "2026-07-10", cost: 2800, status: "Active" },
        { id: "M-302", vehicleReg: "VAN-01", description: "Oil Change & Brake Inspection", date: "2026-06-25", cost: 250, status: "Closed" }
      ];

      this.expenses = [
        { id: "E-401", vehicleReg: "VAN-01", type: "Fuel", amount: 30, date: "2026-06-25", description: "15L fuel log - Trip T-103" },
        { id: "E-402", vehicleReg: "TRK-02", type: "Fuel", amount: 60, date: "2026-07-01", description: "30L fuel log" },
        { id: "E-403", vehicleReg: "SED-06", type: "Fuel", amount: 6, date: "2026-07-02", description: "3L fuel log - Trip T-104" },
        { id: "E-404", vehicleReg: "SEM-03", type: "Maintenance", amount: 2800, date: "2026-07-10", description: "Transmission Overhaul" },
        { id: "E-405", vehicleReg: "VAN-01", type: "Maintenance", amount: 250, date: "2026-06-25", description: "Oil Change & Brake Inspection" },
        { id: "E-406", vehicleReg: "TRK-02", type: "Toll", amount: 45, date: "2026-07-02", description: "Highway Tolls" }
      ];

      this.saveDatabase();
    }
  }

  saveDatabase() {
    const db = {
      vehicles: this.vehicles,
      drivers: this.drivers,
      trips: this.trips,
      maintenance: this.maintenance,
      expenses: this.expenses
    };
    localStorage.setItem("transitops_database", JSON.stringify(db));
  }

  renderDashboard() {
    const typeFilter = document.getElementById("filter-type").value;
    const statusFilter = document.getElementById("filter-status").value;
    const regionFilter = document.getElementById("filter-region").value;

    // Filter Vehicles
    let filteredVehicles = this.vehicles;
    if (typeFilter !== "All") {
      filteredVehicles = filteredVehicles.filter(v => v.type === typeFilter);
    }
    if (statusFilter !== "All") {
      filteredVehicles = filteredVehicles.filter(v => v.status === statusFilter);
    }
    if (regionFilter !== "All") {
      filteredVehicles = filteredVehicles.filter(v => v.region === regionFilter);
    }

    const totalVehicles = filteredVehicles.length;

    // Available, Active, In Shop Vehicles
    const availableVehicles = filteredVehicles.filter(v => v.status === "Available").length;
    const activeVehicles = filteredVehicles.filter(v => v.status === "On Trip").length;
    const maintVehicles = filteredVehicles.filter(v => v.status === "In Shop").length;

    const availPercent = totalVehicles > 0 ? Math.round((availableVehicles / totalVehicles) * 100) : 0;
    const activePercent = totalVehicles > 0 ? Math.round((activeVehicles / totalVehicles) * 100) : 0;
    const maintPercent = totalVehicles > 0 ? Math.round((maintVehicles / totalVehicles) * 100) : 0;

    // Filter Trips based on selected vehicles
    const vehicleRegs = new Set(filteredVehicles.map(v => v.registration));
    let filteredTrips = this.trips.filter(t => vehicleRegs.has(t.vehicleReg));

    const activeTripsCount = filteredTrips.filter(t => t.status === "Dispatched").length;
    const pendingTripsCount = filteredTrips.filter(t => t.status === "Draft").length;

    // Drivers on duty (Available or On Trip)
    const onDutyDrivers = this.drivers.filter(d => d.status === "Available" || d.status === "On Trip").length;
    const onDutyPercent = this.drivers.length > 0 ? Math.round((onDutyDrivers / this.drivers.length) * 100) : 0;

    // Utilization
    const utilizationRate = totalVehicles > 0 ? Math.round((activeVehicles / totalVehicles) * 100) : 0;

    // Update UI elements
    document.getElementById("kpi-available-vehicles").innerText = availableVehicles;
    document.getElementById("sub-avail-percent").innerText = `${availPercent}% of filtered fleet`;

    document.getElementById("kpi-active-vehicles").innerText = activeVehicles;
    document.getElementById("sub-active-percent").innerText = `${activePercent}% of filtered fleet`;

    document.getElementById("kpi-in-maintenance").innerText = maintVehicles;
    document.getElementById("sub-maint-percent").innerText = `${maintPercent}% of filtered fleet`;

    document.getElementById("kpi-active-trips").innerText = activeTripsCount;
    document.getElementById("kpi-pending-trips").innerText = pendingTripsCount;

    document.getElementById("kpi-drivers-on-duty").innerText = onDutyDrivers;
    document.getElementById("sub-drivers-percent").innerText = `${onDutyPercent}% on duty / active`;

    document.getElementById("kpi-fleet-utilization").innerText = `${utilizationRate}%`;
    document.getElementById("utilization-progress-bar").style.width = `${utilizationRate}%`;

    // Render Canvas Charts
    this.drawStatusChart(filteredVehicles);
    this.drawCostsChart(filteredVehicles);
  }

  drawStatusChart(vehicles) {
    const canvas = document.getElementById("chart-fleet-status");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const statuses = {
      "Available": vehicles.filter(v => v.status === "Available").length,
      "On Trip": vehicles.filter(v => v.status === "On Trip").length,
      "In Shop": vehicles.filter(v => v.status === "In Shop").length,
      "Retired": vehicles.filter(v => v.status === "Retired").length
    };

    const colors = {
      "Available": "#10b981",
      "On Trip": "#6366f1",
      "In Shop": "#f59e0b",
      "Retired": "#ef4444"
    };

    const total = Object.values(statuses).reduce((a, b) => a + b, 0);
    
    const centerX = canvas.width / 3.4;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) - 15;

    if (total === 0) {
      ctx.fillStyle = "#94a3b8";
      ctx.font = "14px Outfit, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("No Vehicles Match Filters", centerX, centerY);
      return;
    }

    let startAngle = -0.5 * Math.PI;

    for (let status in statuses) {
      const count = statuses[status];
      if (count === 0) continue;

      const sliceAngle = (count / total) * 2 * Math.PI;

      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle);
      ctx.strokeStyle = colors[status];
      ctx.lineWidth = 18;
      ctx.stroke();

      startAngle += sliceAngle;
    }

    ctx.fillStyle = document.documentElement.getAttribute("data-theme") === "light" ? "#0f172a" : "#f8fafc";
    ctx.font = "bold 20px Outfit, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(total, centerX, centerY - 5);
    
    ctx.fillStyle = "#94a3b8";
    ctx.font = "11px Outfit, sans-serif";
    ctx.fillText("Fleet Size", centerX, centerY + 15);

    // Draw Legend on the right side
    const legendX = canvas.width / 1.7;
    let legendY = centerY - (Object.keys(statuses).length * 20) / 2 + 10;
    
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";

    for (let status in statuses) {
      const count = statuses[status];
      const pct = Math.round((count / total) * 100);

      ctx.fillStyle = colors[status];
      ctx.beginPath();
      ctx.arc(legendX, legendY, 5, 0, 2 * Math.PI);
      ctx.fill();

      ctx.fillStyle = document.documentElement.getAttribute("data-theme") === "light" ? "#475569" : "#94a3b8";
      ctx.font = "12px Outfit, sans-serif";
      ctx.fillText(`${status}: ${count} (${pct}%)`, legendX + 15, legendY);

      legendY += 22;
    }
  }

  drawCostsChart(vehicles) {
    const canvas = document.getElementById("chart-operational-costs");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const vehicleRegs = new Set(vehicles.map(v => v.registration));
    
    let fuelTotal = 0;
    let maintTotal = 0;
    let tollTotal = 0;

    this.expenses.forEach(e => {
      if (vehicleRegs.has(e.vehicleReg)) {
        if (e.type === "Fuel") fuelTotal += e.amount;
        else if (e.type === "Maintenance") maintTotal += e.amount;
        else tollTotal += e.amount;
      }
    });

    const categories = ["Fuel", "Maintenance", "Tolls & Other"];
    const values = [fuelTotal, maintTotal, tollTotal];
    const colors = ["#38bdf8", "#fbbf24", "#f472b6"];

    const maxValue = Math.max(...values, 100); 
    
    const paddingLeft = 50;
    const paddingRight = 20;
    const paddingTop = 20;
    const paddingBottom = 40;
    
    const chartWidth = canvas.width - paddingLeft - paddingRight;
    const chartHeight = canvas.height - paddingTop - paddingBottom;

    ctx.strokeStyle = document.documentElement.getAttribute("data-theme") === "light" ? "rgba(0, 0, 0, 0.08)" : "rgba(255, 255, 255, 0.08)";
    ctx.lineWidth = 1;
    
    const gridLines = 3;
    for (let i = 0; i <= gridLines; i++) {
      const y = paddingTop + (chartHeight / gridLines) * i;
      ctx.beginPath();
      ctx.moveTo(paddingLeft, y);
      ctx.lineTo(canvas.width - paddingRight, y);
      ctx.stroke();

      const gridVal = Math.round(maxValue - (maxValue / gridLines) * i);
      ctx.fillStyle = "#64748b";
      ctx.font = "10px Outfit, sans-serif";
      ctx.textAlign = "right";
      ctx.textBaseline = "middle";
      ctx.fillText(`$${gridVal}`, paddingLeft - 10, y);
    }

    const barWidth = 35;
    const gap = (chartWidth - barWidth * categories.length) / (categories.length + 1);

    for (let i = 0; i < categories.length; i++) {
      const val = values[i];
      const barHeight = (val / maxValue) * chartHeight;
      const x = paddingLeft + gap + (barWidth + gap) * i;
      const y = canvas.height - paddingBottom - barHeight;

      ctx.fillStyle = colors[i];
      ctx.fillRect(x, y, barWidth, barHeight);

      ctx.fillStyle = document.documentElement.getAttribute("data-theme") === "light" ? "#0f172a" : "#f8fafc";
      ctx.font = "bold 11px Outfit, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "bottom";
      ctx.fillText(`$${val}`, x + barWidth / 2, y - 4);

      ctx.fillStyle = "#64748b";
      ctx.font = "11px Outfit, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "top";
      ctx.fillText(categories[i], x + barWidth / 2, canvas.height - paddingBottom + 8);
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

    // If active tab was disabled, fallback to dashboard
    if (currentActiveTab) {
      this.switchTab("dashboard");
    }

    // Update privileges panel on Dashboard
    this.renderPrivileges();
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
        this.renderDashboard();
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
      this.renderDashboard();
    }
  }

  toggleTheme() {
    this.theme = this.theme === "dark" ? "light" : "dark";
    localStorage.setItem("transitops_theme", this.theme);
    document.documentElement.setAttribute("data-theme", this.theme);
    this.updateThemeUI();
    this.addLog(`UI theme changed to '${this.theme}'.`);
    if (this.currentUser && window.location.hash.replace("#", "") === "dashboard") {
      this.renderDashboard();
    }
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

  // Dashboard Filters change event
  const filterType = document.getElementById("filter-type");
  const filterStatus = document.getElementById("filter-status");
  const filterRegion = document.getElementById("filter-region");
  const resetFilters = document.getElementById("reset-filters");

  if (filterType && filterStatus && filterRegion && resetFilters) {
    const handleFilterChange = () => {
      app.renderDashboard();
      app.addLog(`Filtered dashboard: Type=${filterType.value}, Status=${filterStatus.value}, Region=${filterRegion.value}`);
    };

    filterType.addEventListener("change", handleFilterChange);
    filterStatus.addEventListener("change", handleFilterChange);
    filterRegion.addEventListener("change", handleFilterChange);

    resetFilters.addEventListener("click", () => {
      filterType.value = "All";
      filterStatus.value = "All";
      filterRegion.value = "All";
      app.renderDashboard();
      app.addLog("Dashboard filters reset to 'All'.");
    });
  }

  // Bind global routing to hashchange
  window.addEventListener("hashchange", () => {
    app.handleRouting();
  });
});
