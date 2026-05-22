/**
 * PERFECTRISHTA - PREMIUM MATRIMONIAL PLATFORM CLIENT CONTROLLER
 * Fully responsive, local-storage state-driven Single Page Application
 */

document.addEventListener("DOMContentLoaded", () => {
  
  // ==========================================
  // 1. STATE & LOCAL STORAGE INITIALIZATION
  // ==========================================
  
  let appState = {
    user: null,          // User profile created during onboarding
    shortlists: [],      // Array of profile IDs
    conversations: {},   // Chat history indexed by profile ID
    premium: {
      unlocked: false,
      tier: "Standard",
      revealedContacts: [] // List of profile IDs whose contact details were unlocked
    },
    activeChatProfileId: null,
    currentTheme: "crimson", // "crimson" or "rosegold"
    pricingPeriod: "monthly" // "monthly" or "annual"
  };

  // Load from LocalStorage if exists
  function loadState() {
    const savedState = localStorage.getItem("perfectrishta_state");
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState);
        appState = { ...appState, ...parsed };
      } catch (e) {
        console.error("Failed parsing localStorage state", e);
      }
    }
  }

  // Save to LocalStorage
  function saveState() {
    localStorage.setItem("perfectrishta_state", JSON.stringify(appState));
  }

  loadState();

  // ==========================================
  // 2. ROUTING SYSTEM (SPA)
  // ==========================================
  
  const views = {
    home: document.getElementById("view-home"),
    onboarding: document.getElementById("view-onboarding"),
    dashboard: document.getElementById("view-dashboard"),
    shortlist: document.getElementById("view-shortlist"),
    chat: document.getElementById("view-chat"),
    plans: document.getElementById("view-plans")
  };

  const navLinks = document.querySelectorAll(".nav-link");

  function navigateTo(targetView) {
    // Hide all views
    Object.values(views).forEach(view => {
      if (view) view.classList.remove("active");
    });

    // Show target view
    const target = views[targetView];
    if (target) {
      target.classList.add("active");
    }

    // Update active nav link
    navLinks.forEach(link => {
      link.classList.remove("active");
      if (link.getAttribute("href") === `#${targetView}`) {
        link.classList.add("active");
      }
    });

    // Handle view-specific initializations
    if (targetView === "dashboard") {
      renderDashboard();
    } else if (targetView === "shortlist") {
      renderShortlist();
    } else if (targetView === "chat") {
      renderChatCenter();
    } else if (targetView === "home") {
      renderHomeFeatured();
    }

    // Scroll to top
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // Route based on URL hash
  function handleHashRoute() {
    const hash = window.location.hash.substring(1) || "home";
    
    // Guard: Redirect to onboarding if user clicks matches or chats without registering
    if ((hash === "dashboard" || hash === "chat" || hash === "shortlist") && !appState.user) {
      showToast("Please register or create a profile to explore verified matches.");
      window.location.hash = "onboarding";
      navigateTo("onboarding");
      return;
    }

    if (views[hash]) {
      navigateTo(hash);
    } else {
      navigateTo("home");
    }
  }

  window.addEventListener("hashchange", handleHashRoute);

  // Initialize Route
  setTimeout(() => {
    handleHashRoute();
  }, 100);

  // Nav actions
  document.getElementById("nav-logo-btn").addEventListener("click", () => {
    window.location.hash = "home";
  });
  document.getElementById("nav-home-btn").addEventListener("click", () => {
    window.location.hash = "home";
  });
  document.getElementById("nav-dashboard-btn").addEventListener("click", () => {
    window.location.hash = "dashboard";
  });
  document.getElementById("nav-shortlist-btn").addEventListener("click", () => {
    window.location.hash = "shortlist";
  });
  document.getElementById("nav-chat-btn").addEventListener("click", () => {
    window.location.hash = "chat";
  });
  document.getElementById("nav-plans-btn").addEventListener("click", () => {
    window.location.hash = "plans";
  });
  
  // Register button route
  const navRegisterBtn = document.getElementById("nav-register-btn");
  if (navRegisterBtn) {
    navRegisterBtn.addEventListener("click", () => {
      window.location.hash = "onboarding";
    });
  }

  // ==========================================
  // 3. THEME TOGGLE ENGINE
  // ==========================================
  
  const themeToggleBtn = document.getElementById("theme-toggle-btn");
  
  function applyTheme(theme) {
    document.body.className = "";
    if (theme === "crimson") {
      document.body.classList.add("theme-luxury-crimson");
    } else {
      document.body.classList.add("theme-luxury-rosegold");
    }
    appState.currentTheme = theme;
    saveState();
  }

  themeToggleBtn.addEventListener("click", () => {
    const nextTheme = appState.currentTheme === "crimson" ? "rosegold" : "crimson";
    applyTheme(nextTheme);
    showToast(`Switched to ${nextTheme === "crimson" ? "Luxury Crimson & Gold" : "Rose Gold & Ivory"} theme.`);
  });

  // Apply initial theme
  applyTheme(appState.currentTheme);

  // ==========================================
  // 4. TOAST NOTIFICATIONS SERVICE
  // ==========================================
  
  function showToast(message, isError = false) {
    const toastContainer = document.getElementById("toast-container");
    const toast = document.createElement("div");
    toast.className = `toast ${isError ? "toast-error" : ""}`;
    
    const iconClass = isError ? "fa-circle-exclamation" : "fa-crown";
    toast.innerHTML = `
      <i class="fa-solid ${iconClass}"></i>
      <span class="toast-message">${message}</span>
    `;
    
    toastContainer.appendChild(toast);
    
    // Auto-remove after 4 seconds
    setTimeout(() => {
      toast.style.animation = "slideIn 0.3s reverse ease";
      setTimeout(() => {
        toastContainer.removeChild(toast);
      }, 300);
    }, 4000);
  }

  // ==========================================
  // 5. USER SESSION META DISPLAY
  // ==========================================
  
  const userStatusArea = document.getElementById("user-status-area");
  
  function updateUserHeader() {
    if (appState.user) {
      const avatarUrl = appState.user.gender === "female" ? "assets/bride_featured.png" : "assets/groom_featured.png";
      const premiumLabel = appState.premium.unlocked ? `<span class="user-info-meta"><i class="fa-solid fa-crown text-gold"></i> ${appState.premium.tier}</span>` : `<span class="user-info-meta">Standard Tier</span>`;
      
      userStatusArea.innerHTML = `
        <img src="${avatarUrl}" alt="User Avatar" class="user-avatar-btn" id="header-avatar-btn">
        <div class="user-info-text text-center">
          <div class="user-name-title">${appState.user.name.split(" ")[0]}</div>
          ${premiumLabel}
        </div>
      `;
      
      // Upgrade dashboard banner
      const dashPremiumWidget = document.getElementById("dash-premium-widget");
      if (dashPremiumWidget) {
        if (appState.premium.unlocked) {
          dashPremiumWidget.innerHTML = `
            <span class="badge-royal"><i class="fa-solid fa-crown text-gold"></i> ${appState.premium.tier} Active</span>
          `;
        } else {
          dashPremiumWidget.innerHTML = `
            <span class="badge-royal"><i class="fa-solid fa-crown text-gold"></i> Standard Tier</span>
            <button class="btn btn-gold btn-small" id="dash-upgrade-btn-banner">Upgrade to Premium</button>
          `;
          document.getElementById("dash-upgrade-btn-banner").addEventListener("click", () => {
            window.location.hash = "plans";
          });
        }
      }
      
      // Update welcome text on dashboard
      const dashWelcomeTitle = document.getElementById("dashboard-welcome-title");
      if (dashWelcomeTitle) {
        dashWelcomeTitle.innerText = `Welcome to Your Sanctuary, ${appState.user.name}`;
      }

      // Add click listener on avatar
      document.getElementById("header-avatar-btn").addEventListener("click", () => {
        openOwnProfileDrawer();
      });
      
    } else {
      userStatusArea.innerHTML = `
        <button class="btn btn-outline" id="nav-register-btn"><i class="fa-solid fa-user-plus"></i> Register</button>
      `;
      document.getElementById("nav-register-btn").addEventListener("click", () => {
        window.location.hash = "onboarding";
      });
    }
  }

  updateUserHeader();

  // ==========================================
  // 6. COMPATIBILITY ALGORITHM
  // ==========================================
  
  function calculateCompatibility(profile) {
    if (!appState.user) return 80; // Baseline default if no user profile created
    
    const pref = appState.user.partnerExpectations;
    let score = 50; // Starting baseline

    // 1. Age Expectation (Max 15%)
    if (profile.age >= pref.minAge && profile.age <= pref.maxAge) {
      score += 15;
    } else {
      const diff = Math.min(Math.abs(profile.age - pref.minAge), Math.abs(profile.age - pref.maxAge));
      score += Math.max(0, 15 - diff * 3);
    }

    // 2. Religion Expectation (Max 25%)
    if (profile.religion.toLowerCase() === pref.religion.toLowerCase()) {
      score += 25;
    } else {
      score += 5; // Diversity points
    }

    // 3. Mother Tongue (Max 20%)
    if (profile.motherTongue.toLowerCase() === appState.user.motherTongue.toLowerCase()) {
      score += 20;
    } else {
      score += 10;
    }

    // 4. Diet Preference (Max 15%)
    if (pref.diet === "Any" || profile.lifestyle.toLowerCase() === pref.diet.toLowerCase()) {
      score += 15;
    } else {
      score += 5;
    }

    // 5. Income Expectation (Max 15%)
    if (profile.incomeValue >= pref.minIncome) {
      score += 15;
    } else {
      const ratio = profile.incomeValue / pref.minIncome;
      score += Math.floor(ratio * 12);
    }

    // Normalize between 65% and 98% for realistic premium matchmaking feel
    if (score > 98) score = 98;
    if (score < 65) score = 65;
    
    return score;
  }

  // ==========================================
  // 7. MULTI-STEP ONBOARDING WIZARD
  // ==========================================
  
  const onboardingForm = document.getElementById("onboarding-wizard-form");
  const stepPanes = document.querySelectorAll(".onboarding-step-pane");
  const stepIndicators = document.querySelectorAll(".step-indicator");
  const progressBarFill = document.getElementById("onboarding-progress");

  // Step wizard navigation buttons
  document.querySelectorAll(".btn-next").forEach(btn => {
    btn.addEventListener("click", () => {
      const nextStep = btn.getAttribute("data-next");
      
      // Perform validation for current fields
      const currentPane = btn.closest(".onboarding-step-pane");
      const requiredInputs = currentPane.querySelectorAll("[required]");
      let isValid = true;
      
      requiredInputs.forEach(input => {
        if (!input.checkValidity()) {
          input.reportValidity();
          isValid = false;
        }
      });
      
      if (isValid) {
        goToStep(parseInt(nextStep));
      }
    });
  });

  document.querySelectorAll(".btn-prev").forEach(btn => {
    btn.addEventListener("click", () => {
      const prevStep = btn.getAttribute("data-prev");
      goToStep(parseInt(prevStep));
    });
  });

  function goToStep(stepNumber) {
    // Progress fill percentage
    const fillPercent = stepNumber * 25;
    progressBarFill.style.width = `${fillPercent}%`;

    // Toggle Panes
    stepPanes.forEach((pane, idx) => {
      pane.classList.remove("active");
      if (idx + 1 === stepNumber) {
        pane.classList.add("active");
      }
    });

    // Update step indicators
    stepIndicators.forEach((indicator, idx) => {
      indicator.classList.remove("active", "completed");
      if (idx + 1 === stepNumber) {
        indicator.classList.add("active");
      } else if (idx + 1 < stepNumber) {
        indicator.classList.add("completed");
      }
    });
  }

  // Handle registration submit
  onboardingForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const name = document.getElementById("ob-name").value;
    const gender = document.getElementById("ob-gender").value;
    const dob = document.getElementById("ob-dob").value;
    const height = document.getElementById("ob-height").value;
    const religion = document.getElementById("ob-religion").value;
    const caste = document.getElementById("ob-caste").value;
    const motherTongue = document.getElementById("ob-mothertongue").value;
    const location = document.getElementById("ob-location").value;
    const education = document.getElementById("ob-education").value;
    const profession = document.getElementById("ob-profession").value;
    const company = document.getElementById("ob-company").value;
    const income = document.getElementById("ob-income").value;
    const diet = document.getElementById("ob-diet").value;
    const bio = document.getElementById("ob-bio").value;

    const prefMinAge = parseInt(document.getElementById("ob-pref-minage").value);
    const prefMaxAge = parseInt(document.getElementById("ob-pref-maxage").value);
    const prefReligion = document.getElementById("ob-pref-religion").value;
    const prefDiet = document.getElementById("ob-pref-diet").value;
    const prefIncome = parseInt(document.getElementById("ob-pref-income").value);

    // Compute age from dob
    const birthDate = new Date(dob);
    const ageDiff = Date.now() - birthDate.getTime();
    const ageDate = new Date(ageDiff);
    const age = Math.abs(ageDate.getUTCFullYear() - 1970);

    const newUser = {
      name,
      gender,
      dob,
      age,
      height,
      religion,
      caste,
      motherTongue,
      location,
      education,
      profession,
      company,
      income,
      diet,
      bio,
      partnerExpectations: {
        minAge: prefMinAge,
        maxAge: prefMaxAge,
        religion: prefReligion,
        diet: prefDiet,
        minIncome: prefIncome
      }
    };

    appState.user = newUser;
    saveState();
    updateUserHeader();

    showToast("Profile Created Successfully! Welcoming you to PerfectRishta.");
    
    // Seed standard chat templates
    seedInitialChats();
    
    // Reset wizard
    goToStep(1);
    onboardingForm.reset();

    // Redirect to matches
    window.location.hash = "dashboard";
  });

  // ==========================================
  // 8. LANDING QUICK SEARCH & FEATURED RENDER
  // ==========================================
  
  const quickSearchForm = document.getElementById("quick-search-form");
  
  quickSearchForm.addEventListener("submit", (e) => {
    e.preventDefault();
    
    const targetGender = document.getElementById("qs-gender").value;
    const targetReligion = document.getElementById("qs-religion").value;
    const targetLang = document.getElementById("qs-mother-tongue").value;

    if (!appState.user) {
      // Auto register first or prompt
      showToast("To discover matches, please complete our premium registration onboarding.");
      window.location.hash = "onboarding";
      return;
    }

    // Set filters in dashboard search inputs
    const filterRel = document.getElementById("filter-religion");
    const filterLang = document.getElementById("filter-mothertongue");
    
    if (filterRel) filterRel.value = targetReligion;
    if (filterLang) filterLang.value = targetLang;

    // Navigate to dashboard
    window.location.hash = "dashboard";
  });

  function renderHomeFeatured() {
    const featuredGrid = document.getElementById("home-featured-grid");
    if (!featuredGrid) return;

    // Select 3 top premium profiles as spotlights
    const spotlights = mockProfiles.slice(0, 3);
    
    featuredGrid.innerHTML = "";
    
    spotlights.forEach(profile => {
      const compVal = calculateCompatibility(profile);
      const card = createProfileCardMarkup(profile, compVal, true);
      featuredGrid.appendChild(card);
    });

    attachCardEventListeners(featuredGrid);
  }

  // Home Page View All Action
  const homeViewAllBtn = document.getElementById("home-view-all-btn");
  if (homeViewAllBtn) {
    homeViewAllBtn.addEventListener("click", () => {
      window.location.hash = "dashboard";
    });
  }

  renderHomeFeatured();

  // ==========================================
  // 9. DASHBOARD: MATCHES DIRECTORY
  // ==========================================
  
  // Elements
  const dashboardProfilesGrid = document.getElementById("dashboard-profiles-grid");
  const filterAgeMin = document.getElementById("filter-age-min");
  const filterAgeMax = document.getElementById("filter-age-max");
  const filterReligion = document.getElementById("filter-religion");
  const filterMotherTongue = document.getElementById("filter-mothertongue");
  const filterDietVeg = document.getElementById("filter-diet-veg");
  const filterIncomeMin = document.getElementById("filter-income-min");
  const filterVerifiedId = document.getElementById("filter-verified-id");
  const sortProfiles = document.getElementById("sort-profiles");
  const profilesCountText = document.getElementById("profiles-count-text");

  // Attach filter event listeners
  const filterInputs = [
    filterAgeMin, filterAgeMax, filterReligion, 
    filterMotherTongue, filterDietVeg, filterIncomeMin, 
    filterVerifiedId, sortProfiles
  ];

  filterInputs.forEach(input => {
    if (input) {
      input.addEventListener("change", renderDashboard);
      input.addEventListener("input", renderDashboard);
    }
  });

  // Reset Filters Button
  const resetFiltersBtn = document.getElementById("filters-reset-btn");
  if (resetFiltersBtn) {
    resetFiltersBtn.addEventListener("click", () => {
      if (filterAgeMin) filterAgeMin.value = "20";
      if (filterAgeMax) filterAgeMax.value = "35";
      if (filterReligion) filterReligion.value = "all";
      if (filterMotherTongue) filterMotherTongue.value = "all";
      if (filterDietVeg) filterDietVeg.checked = false;
      if (filterIncomeMin) filterIncomeMin.value = "0";
      if (filterVerifiedId) filterVerifiedId.checked = false;
      if (sortProfiles) sortProfiles.value = "match";
      
      renderDashboard();
      showToast("Filters reset successfully.");
    });
  }

  function renderDashboard() {
    if (!dashboardProfilesGrid) return;
    if (!appState.user) return;

    // Filter Logic
    let filtered = mockProfiles.filter(profile => {
      // 1. Gender Filter: Match opposite of user gender
      if (profile.gender === appState.user.gender) return false;

      // 2. Age Filter
      const minAge = parseInt(filterAgeMin.value) || 18;
      const maxAge = parseInt(filterAgeMax.value) || 60;
      if (profile.age < minAge || profile.age > maxAge) return false;

      // 3. Religion
      const selectedReligion = filterReligion.value;
      if (selectedReligion !== "all" && profile.religion !== selectedReligion) return false;

      // 4. Mother Tongue
      const selectedLang = filterMotherTongue.value;
      if (selectedLang !== "all" && profile.motherTongue !== selectedLang) return false;

      // 5. Diet
      if (filterDietVeg.checked && profile.diet !== "Vegetarian") return false;

      // 6. Min Income
      const minIncome = parseInt(filterIncomeMin.value) || 0;
      if (profile.incomeValue < minIncome) return false;

      // 7. Verified Badge
      if (filterVerifiedId.checked && !profile.verified.id) return false;

      return true;
    });

    // Compute dynamic compatibility scores
    const calculatedProfiles = filtered.map(profile => {
      return {
        ...profile,
        compatibilityScore: calculateCompatibility(profile)
      };
    });

    // Sorting Logic
    const sortVal = sortProfiles.value;
    if (sortVal === "match") {
      calculatedProfiles.sort((a, b) => b.compatibilityScore - a.compatibilityScore);
    } else if (sortVal === "age-asc") {
      calculatedProfiles.sort((a, b) => a.age - b.age);
    } else if (sortVal === "age-desc") {
      calculatedProfiles.sort((a, b) => b.age - a.age);
    } else if (sortVal === "income-desc") {
      calculatedProfiles.sort((a, b) => b.incomeValue - a.incomeValue);
    }

    // Render Grid
    dashboardProfilesGrid.innerHTML = "";
    profilesCountText.innerText = `Showing ${calculatedProfiles.length} verified matches`;

    if (calculatedProfiles.length === 0) {
      dashboardProfilesGrid.innerHTML = `
        <div class="empty-state" style="grid-column: 1 / -1; width: 100%;">
          <div class="empty-icon"><i class="fa-solid fa-ban"></i></div>
          <h3>No Match Alignments Found</h3>
          <p>Try widening your age, location, or income expectation filters to discover matches.</p>
        </div>
      `;
      return;
    }

    calculatedProfiles.forEach(profile => {
      const card = createProfileCardMarkup(profile, profile.compatibilityScore, false);
      dashboardProfilesGrid.appendChild(card);
    });

    attachCardEventListeners(dashboardProfilesGrid);
  }

  // ==========================================
  // 10. REUSABLE CARD CREATION MARKUP
  // ==========================================
  
  function createProfileCardMarkup(profile, compatibilityScore, isSpotlight = false) {
    const card = document.createElement("div");
    card.className = "profile-card";
    card.setAttribute("data-id", profile.id);

    const isShortlisted = appState.shortlists.includes(profile.id);
    const heartClass = isShortlisted ? "fa-solid fa-heart active" : "fa-regular fa-heart";
    const statusLabel = isSpotlight ? "Spotlight" : `${compatibilityScore}% Match`;

    // Mask details if not premium
    const displayIncome = profile.income;

    card.innerHTML = `
      <div class="profile-card-image">
        <img src="${profile.photo}" alt="${profile.name}" class="card-img" onerror="this.src='https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400';">
        <div class="card-gradient-overlay"></div>
        <div class="card-compatibility-badge">
          <i class="fa-solid fa-crown text-gold"></i> <span>${statusLabel}</span>
        </div>
        <button class="card-shortlist-btn ${isShortlisted ? "active" : ""}" data-id="${profile.id}" title="Toggle Shortlist">
          <i class="${heartClass}"></i>
        </button>
        <div class="card-profile-header-text">
          <div class="card-name-row">
            <h3 class="card-profile-name">${profile.name}</h3>
            ${profile.verified.id ? `<i class="fa-solid fa-circle-check verification-badge" title="Aadhaar ID Verified"></i>` : ""}
          </div>
          <div class="card-age-location">${profile.age} Yrs • ${profile.height} • ${profile.location}</div>
        </div>
      </div>
      <div class="profile-card-details">
        <div class="card-info-table">
          <div class="info-item">
            <span class="info-label">Education</span>
            <span class="info-value" title="${profile.education}">${profile.education.split(",")[0]}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Profession</span>
            <span class="info-value" title="${profile.profession}">${profile.profession}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Religion / Caste</span>
            <span class="info-value">${profile.religion} (${profile.caste})</span>
          </div>
          <div class="info-item">
            <span class="info-label">Annual Income</span>
            <span class="info-value">${displayIncome}</span>
          </div>
        </div>
        <p class="card-bio-snippet">${profile.bio}</p>
        <div class="card-actions">
          <button class="btn btn-outline card-details-btn" data-id="${profile.id}">Details</button>
          <button class="btn btn-gold card-chat-btn" data-id="${profile.id}"><i class="fa-solid fa-comments"></i> Chat</button>
        </div>
      </div>
    `;

    return card;
  }

  function attachCardEventListeners(containerElement) {
    // Details button
    containerElement.querySelectorAll(".card-details-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-id");
        openProfileDrawer(id);
      });
    });

    // Chat now button
    containerElement.querySelectorAll(".card-chat-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-id");
        startChatWith(id);
      });
    });

    // Shortlist toggle button
    containerElement.querySelectorAll(".card-shortlist-btn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const id = btn.getAttribute("data-id");
        toggleShortlist(id, btn);
      });
    });
  }

  function toggleShortlist(profileId, btnElement) {
    const icon = btnElement.querySelector("i");
    const index = appState.shortlists.indexOf(profileId);
    
    if (index === -1) {
      appState.shortlists.push(profileId);
      btnElement.classList.add("active");
      icon.className = "fa-solid fa-heart active";
      showToast("Added to your custom shortlist.");
    } else {
      appState.shortlists.splice(index, 1);
      btnElement.classList.remove("active");
      icon.className = "fa-regular fa-heart";
      showToast("Removed from shortlist.");
    }
    
    saveState();

    // If currently viewing shortlists, refresh list
    if (window.location.hash === "#shortlist") {
      renderShortlist();
    }
  }

  // ==========================================
  // 11. SHORTLIST VIEW CONTROLLER
  // ==========================================
  
  function renderShortlist() {
    const shortlistGrid = document.getElementById("shortlists-grid-container");
    const emptyState = document.getElementById("shortlist-empty-state");
    
    if (!shortlistGrid) return;

    shortlistGrid.innerHTML = "";

    const activeShortlists = mockProfiles.filter(p => appState.shortlists.includes(p.id));

    if (activeShortlists.length === 0) {
      shortlistGrid.style.display = "none";
      emptyState.style.display = "flex";
      return;
    }

    shortlistGrid.style.display = "grid";
    emptyState.style.display = "none";

    activeShortlists.forEach(profile => {
      const compVal = calculateCompatibility(profile);
      const card = createProfileCardMarkup(profile, compVal, false);
      shortlistGrid.appendChild(card);
    });

    attachCardEventListeners(shortlistGrid);
  }

  const shortlistGoDashBtn = document.getElementById("shortlist-go-dash-btn");
  if (shortlistGoDashBtn) {
    shortlistGoDashBtn.addEventListener("click", () => {
      window.location.hash = "dashboard";
    });
  }

  // ==========================================
  // 12. IMMERSIVE PROFILE DRAWER & VIEW
  // ==========================================
  
  const drawerOverlay = document.getElementById("profile-drawer-overlay");
  const profileDrawer = document.getElementById("profile-drawer");
  const closeDrawerBtn = document.getElementById("close-drawer-btn");
  const drawerDynamicContent = document.getElementById("drawer-dynamic-content");

  function openProfileDrawer(profileId) {
    const profile = mockProfiles.find(p => p.id === profileId);
    if (!profile) return;

    const compVal = calculateCompatibility(profile);
    const isContactUnlocked = appState.premium.unlocked || appState.premium.revealedContacts.includes(profile.id);

    let contactBlockMarkup = "";
    if (isContactUnlocked) {
      // Generating beautiful mock phone and email securely
      const phone = profile.gender === "female" ? "+91 98334 11202" : "+91 97116 54930";
      const email = `${profile.name.toLowerCase().replace(" ", "")}@premium-rishta.com`;
      contactBlockMarkup = `
        <div class="revealed-contact-details">
          <div class="contact-item">
            <i class="fa-solid fa-phone"></i>
            <div>
              <span class="info-label">Mobile Number (Verified)</span>
              <span>${phone}</span>
            </div>
          </div>
          <div class="contact-item">
            <i class="fa-solid fa-envelope"></i>
            <div>
              <span class="info-label">Direct Email (Confidential)</span>
              <span>${email}</span>
            </div>
          </div>
        </div>
      `;
    } else {
      contactBlockMarkup = `
        <div class="pricing-toggle-widget" style="width: 100%; border-radius: 8px; justify-content: space-between; padding: 1rem 1.5rem; display: flex; align-items: center; border: 1px dashed var(--border-color);">
          <div>
            <h5 style="font-size:0.75rem; text-transform:uppercase; color: var(--text-muted);"><i class="fa-solid fa-lock"></i> Verified Contact Revealed</h5>
            <p style="font-weight: 700; font-size:0.95rem;">+91 98******82</p>
          </div>
          <button class="btn btn-gold btn-small" id="drawer-unlock-contact-btn" data-id="${profile.id}">Reveal Number</button>
        </div>
      `;
    }

    drawerDynamicContent.innerHTML = `
      <div class="drawer-hero">
        <img src="${profile.photo}" alt="${profile.name}" class="drawer-hero-img" onerror="this.src='https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400';">
        <div class="drawer-hero-overlay"></div>
        <div class="drawer-header-text">
          <h2 class="drawer-name-title">${profile.name}</h2>
          <div class="drawer-meta-line">
            <span>${profile.age} Years Old • ${profile.height}</span>
            <span class="text-gold"><i class="fa-solid fa-crown text-gold"></i> ${compVal}% Compatibility Score</span>
          </div>
        </div>
      </div>

      <div class="drawer-body">
        
        <!-- About Section -->
        <div class="drawer-section">
          <h4 class="drawer-section-title">Personal Statement</h4>
          <p class="drawer-bio-p">"${profile.bio}"</p>
        </div>

        <!-- Demographic Roots -->
        <div class="drawer-section">
          <h4 class="drawer-section-title">Demographic & Community Roots</h4>
          <div class="drawer-grid-details">
            <div class="drawer-info-cell">
              <h5>Religion & Caste</h5>
              <p>${profile.religion} (${profile.caste})</p>
            </div>
            <div class="drawer-info-cell">
              <h5>Mother Tongue</h5>
              <p>${profile.motherTongue}</p>
            </div>
            <div class="drawer-info-cell">
              <h5>Diet Preference</h5>
              <p>${profile.lifestyle}</p>
            </div>
            <div class="drawer-info-cell">
              <h5>Current Residence</h5>
              <p>${profile.location}</p>
            </div>
          </div>
        </div>

        <!-- Career & Education -->
        <div class="drawer-section">
          <h4 class="drawer-section-title">Education & Career Standing</h4>
          <div class="drawer-grid-details">
            <div class="drawer-info-cell">
              <h5>Education Credentials</h5>
              <p>${profile.education}</p>
            </div>
            <div class="drawer-info-cell">
              <h5>Occupation</h5>
              <p>${profile.profession}</p>
            </div>
            <div class="drawer-info-cell">
              <h5>Current Organization</h5>
              <p>${profile.company}</p>
            </div>
            <div class="drawer-info-cell">
              <h5>Annual Income</h5>
              <p>${profile.income}</p>
            </div>
          </div>
        </div>

        <!-- Family Details -->
        <div class="drawer-section">
          <h4 class="drawer-section-title">Family Legacy Details</h4>
          <p class="drawer-bio-p">${profile.familyDetails}</p>
        </div>

        <!-- Trust Credentials -->
        <div class="drawer-section">
          <h4 class="drawer-section-title">PerfectRishta Trust Badges</h4>
          <div class="badges-row" style="margin-top: 0.5rem;">
            <span class="security-badge" style="border-color: #1ea7fd; color: #1ea7fd;">
              <i class="fa-solid fa-shield-halved"></i> Mobile Verified
            </span>
            <span class="security-badge" style="border-color: #1ea7fd; color: #1ea7fd;">
              <i class="fa-solid fa-passport"></i> Aadhaar ID Verified
            </span>
            <span class="security-badge" style="${profile.verified.education ? "border-color: #1ea7fd; color: #1ea7fd;" : "opacity: 0.4;"}">
              <i class="fa-solid fa-graduation-cap"></i> Degree Verified
            </span>
          </div>
        </div>

        <!-- Secure Contact Details -->
        <div class="drawer-section">
          <h4 class="drawer-section-title">Sovereign Direct Contacts</h4>
          ${contactBlockMarkup}
        </div>

        <!-- Compatibility Breakdown Check -->
        <div class="drawer-section">
          <h4 class="drawer-section-title">Sovereign Compatibility Matrix</h4>
          <div class="compatibility-comparison-table">
            <div class="table-row-comp">
              <span>Partner Expectation criteria</span>
              <span class="comp-metric">${profile.name.split(" ")[0]}'s Details</span>
              <span class="comp-metric">Match Result</span>
            </div>
            <div class="table-row-comp">
              <span>Religion: ${appState.user.partnerExpectations.religion}</span>
              <span>${profile.religion}</span>
              <span class="comp-check ${profile.religion === appState.user.partnerExpectations.religion ? "match" : "mismatch"}">
                ${profile.religion === appState.user.partnerExpectations.religion ? '<i class="fa-solid fa-circle-check"></i> Match' : '<i class="fa-solid fa-circle-xmark"></i> Diverse'}
              </span>
            </div>
            <div class="table-row-comp">
              <span>Age range: ${appState.user.partnerExpectations.minAge}-${appState.user.partnerExpectations.maxAge} Yrs</span>
              <span>${profile.age} Yrs</span>
              <span class="comp-check ${(profile.age >= appState.user.partnerExpectations.minAge && profile.age <= appState.user.partnerExpectations.maxAge) ? "match" : "mismatch"}">
                ${(profile.age >= appState.user.partnerExpectations.minAge && profile.age <= appState.user.partnerExpectations.maxAge) ? '<i class="fa-solid fa-circle-check"></i> Match' : '<i class="fa-solid fa-circle-xmark"></i> Close'}
              </span>
            </div>
            <div class="table-row-comp">
              <span>Diet: ${appState.user.partnerExpectations.diet}</span>
              <span>${profile.lifestyle}</span>
              <span class="comp-check ${(appState.user.partnerExpectations.diet === "Any" || profile.lifestyle === appState.user.partnerExpectations.diet) ? "match" : "mismatch"}">
                ${(appState.user.partnerExpectations.diet === "Any" || profile.lifestyle === appState.user.partnerExpectations.diet) ? '<i class="fa-solid fa-circle-check"></i> Match' : '<i class="fa-solid fa-circle-xmark"></i> Different'}
              </span>
            </div>
            <div class="table-row-comp">
              <span>Min Income: ₹${appState.user.partnerExpectations.minIncome / 100000} Lakhs+</span>
              <span>₹${profile.incomeValue / 100000} Lakhs</span>
              <span class="comp-check ${profile.incomeValue >= appState.user.partnerExpectations.minIncome ? "match" : "mismatch"}">
                ${profile.incomeValue >= appState.user.partnerExpectations.minIncome ? '<i class="fa-solid fa-circle-check"></i> Match' : '<i class="fa-solid fa-circle-xmark"></i> Below Expectation'}
              </span>
            </div>
          </div>
        </div>

      </div>

      <div class="drawer-actions-bar">
        <button class="btn btn-outline flex-1" id="drawer-shortlist-btn" data-id="${profile.id}">
          <i class="${appState.shortlists.includes(profile.id) ? "fa-solid" : "fa-regular"} fa-heart text-gold"></i> Shortlist Match
        </button>
        <button class="btn btn-gold flex-1" id="drawer-chat-btn" data-id="${profile.id}">
          <i class="fa-solid fa-comments"></i> Initiate Private Chat
        </button>
      </div>
    `;

    // Open Drawer
    drawerOverlay.classList.add("active");
    profileDrawer.classList.add("active");

    // Drawer action events
    document.getElementById("drawer-shortlist-btn").addEventListener("click", (e) => {
      toggleShortlist(profile.id, e.currentTarget);
      const icon = e.currentTarget.querySelector("i");
      icon.className = `${appState.shortlists.includes(profile.id) ? "fa-solid" : "fa-regular"} fa-heart text-gold`;
    });

    document.getElementById("drawer-chat-btn").addEventListener("click", () => {
      closeProfileDrawer();
      startChatWith(profile.id);
    });

    // Reveal Contact action button
    const unlockBtn = document.getElementById("drawer-unlock-contact-btn");
    if (unlockBtn) {
      unlockBtn.addEventListener("click", () => {
        closeProfileDrawer();
        window.location.hash = "plans";
        showToast("Select a premium upgrade plan to instantly reveal match contact details.");
      });
    }
  }

  function openOwnProfileDrawer() {
    if (!appState.user) return;
    
    drawerDynamicContent.innerHTML = `
      <div class="drawer-hero" style="background-color: var(--color-primary); height: 220px; display: flex; align-items: center; justify-content: center;">
        <div class="drawer-header-text" style="position: static; text-align: center; padding: 2rem;">
          <h2 class="drawer-name-title">${appState.user.name}</h2>
          <span class="online-indicator" style="justify-content: center;"><span class="pulse-dot"></span> Active (My Sovereign Profile)</span>
        </div>
      </div>
      <div class="drawer-body">
        <div class="drawer-section">
          <h4 class="drawer-section-title">Personal Statement</h4>
          <p class="drawer-bio-p">"${appState.user.bio}"</p>
        </div>
        <div class="drawer-section">
          <h4 class="drawer-section-title">Profile Demographics</h4>
          <div class="drawer-grid-details">
            <div class="drawer-info-cell">
              <h5>Age & Height</h5>
              <p>${appState.user.age} Yrs • ${appState.user.height}</p>
            </div>
            <div class="drawer-info-cell">
              <h5>Community & Tongue</h5>
              <p>${appState.user.religion} (${appState.user.caste}) • ${appState.user.motherTongue}</p>
            </div>
            <div class="drawer-info-cell">
              <h5>Occupation</h5>
              <p>${appState.user.profession} at ${appState.user.company}</p>
            </div>
            <div class="drawer-info-cell">
              <h5>Income & Diet</h5>
              <p>${appState.user.income} • ${appState.user.diet}</p>
            </div>
          </div>
        </div>
        <div class="drawer-section" style="margin-top: 3rem;">
          <button class="btn btn-outline btn-full" id="btn-logout-rishta" style="border-color: var(--color-primary-light); color: var(--color-primary-light);"><i class="fa-solid fa-arrow-right-from-bracket"></i> Logout & Reset Account</button>
        </div>
      </div>
    `;

    // Open Drawer
    drawerOverlay.classList.add("active");
    profileDrawer.classList.add("active");

    // Handle logout action
    document.getElementById("btn-logout-rishta").addEventListener("click", () => {
      if (confirm("Are you sure you want to reset and logout from PerfectRishta? This will clear all local saves.")) {
        localStorage.removeItem("perfectrishta_state");
        appState = {
          user: null,
          shortlists: [],
          conversations: {},
          premium: { unlocked: false, tier: "Standard", revealedContacts: [] },
          activeChatProfileId: null,
          currentTheme: "crimson",
          pricingPeriod: "monthly"
        };
        closeProfileDrawer();
        updateUserHeader();
        window.location.hash = "home";
        showToast("Account reset successfully. Hope to see you back soon!");
      }
    });
  }

  function closeProfileDrawer() {
    drawerOverlay.classList.remove("active");
    profileDrawer.classList.remove("active");
  }

  if (closeDrawerBtn) closeDrawerBtn.addEventListener("click", closeProfileDrawer);
  if (drawerOverlay) drawerOverlay.addEventListener("click", closeProfileDrawer);

  // ==========================================
  // 13. CHAT SIMULATOR ENGINE (INTERACTIVE MESSAGING)
  // ==========================================
  
  // Pre-seed conversation with featured bride and groom to make it look premium
  function seedInitialChats() {
    if (Object.keys(appState.conversations).length > 0) return;

    // Seed conversations with PR001 (Priyanjali) and PR002 (Rohan)
    const seedIds = ["PR001", "PR002"];
    
    seedIds.forEach(id => {
      const profile = mockProfiles.find(p => p.id === id);
      if (profile) {
        // Only seed if user gender matches target matchmaking rules (opposite sex)
        if (profile.gender !== appState.user.gender) {
          appState.conversations[id] = [
            {
              sender: "incoming",
              message: `Hello! I came across your profile on PerfectRishta and really appreciated your statement. Your education and career goals align beautifully with what I am looking for. I'd love to converse further.`,
              timestamp: getFormattedTime(new Date(Date.now() - 3600000)) // 1 hour ago
            }
          ];
        }
      }
    });
    saveState();
    updateChatCountBadge();
  }

  function updateChatCountBadge() {
    const badge = document.getElementById("chat-count-badge");
    if (!badge) return;

    const convos = Object.keys(appState.conversations);
    if (convos.length > 0) {
      badge.innerText = convos.length;
      badge.style.display = "inline-block";
    } else {
      badge.style.display = "none";
    }
  }

  function startChatWith(profileId) {
    if (!appState.conversations[profileId]) {
      appState.conversations[profileId] = [];
    }
    appState.activeChatProfileId = profileId;
    saveState();
    updateChatCountBadge();
    window.location.hash = "chat";
    renderChatCenter();
  }

  // Formatting timestamp
  function getFormattedTime(date = new Date()) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  function renderChatCenter() {
    const activeConvoList = document.getElementById("chat-conversations-list");
    const chatActiveView = document.getElementById("chat-active-view");
    const chatEmptyView = document.getElementById("chat-empty-view");

    if (!activeConvoList) return;

    activeConvoList.innerHTML = "";

    const convoProfileIds = Object.keys(appState.conversations);

    if (convoProfileIds.length === 0) {
      chatActiveView.style.display = "none";
      chatEmptyView.style.display = "flex";
      return;
    }

    chatEmptyView.style.display = "none";
    chatActiveView.style.display = "flex";

    // 1. Render Left Conversations List
    convoProfileIds.forEach(id => {
      const profile = mockProfiles.find(p => p.id === id);
      if (!profile) return;

      const thread = appState.conversations[id];
      const lastMsg = thread[thread.length - 1];
      const activeClass = id === appState.activeChatProfileId ? "active" : "";

      const item = document.createElement("div");
      item.className = `convo-item ${activeClass}`;
      item.innerHTML = `
        <img src="${profile.photo}" alt="${profile.name}" class="convo-avatar" onerror="this.src='https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400';">
        <div class="convo-info">
          <div class="convo-name-row">
            <span class="convo-name">${profile.name}</span>
            <span class="convo-time">${lastMsg ? lastMsg.timestamp : ""}</span>
          </div>
          <p class="convo-preview-msg">${lastMsg ? lastMsg.message : "Start private conversation..."}</p>
        </div>
      `;

      item.addEventListener("click", () => {
        appState.activeChatProfileId = id;
        saveState();
        renderChatCenter();
      });

      activeConvoList.appendChild(item);
    });

    // 2. Load Active Conversation Thread Panel on the Right
    const activeId = appState.activeChatProfileId || convoProfileIds[0];
    const profile = mockProfiles.find(p => p.id === activeId);
    
    if (profile) {
      document.getElementById("chat-header-name").innerText = profile.name;
      document.getElementById("chat-header-avatar").src = profile.photo;
      
      // Contact button setup in chat
      const contactBtn = document.getElementById("chat-header-reveal-btn");
      contactBtn.onclick = () => {
        openProfileDrawer(profile.id);
      };

      // Secure call setup
      const callBtn = document.getElementById("chat-header-call-btn");
      callBtn.onclick = () => {
        showSecureCallDialog(profile);
      };

      // Message thread log render
      const messageLog = document.getElementById("chat-messages-log");
      messageLog.innerHTML = "";

      const messages = appState.conversations[activeId] || [];

      if (messages.length === 0) {
        messageLog.innerHTML = `
          <div class="text-center text-muted" style="margin-top: 3rem; font-size:0.85rem;">
            <i class="fa-solid fa-lock text-gold"></i> This private connection is fully SSL encrypted & verified secure.
            <p class="margin-top-sm">Send a message to start aligning heart connections.</p>
          </div>
        `;
      } else {
        messages.forEach(msg => {
          const bubble = document.createElement("div");
          bubble.className = `chat-message-bubble ${msg.sender}`;
          bubble.innerHTML = `
            <p>${msg.message}</p>
            <span class="message-timestamp">${msg.timestamp} ${msg.sender === "outgoing" ? ' <i class="fa-solid fa-check-double" style="margin-left: 2px;"></i>' : ""}</span>
          `;
          messageLog.appendChild(bubble);
        });
      }

      // Smooth scroll to bottom
      messageLog.scrollTop = messageLog.scrollHeight;

      // Handle Quick suggestions text fill
      const suggestionList = document.getElementById("chat-suggestions-list");
      suggestionList.innerHTML = "";

      const customSuggestions = [
        `Hi ${profile.name.split(" ")[0]}! I really appreciate your profile, let's connect.`,
        "Would you like to schedule a secure audio call via the PerfectRishta app?",
        "Hi! Our compatibility score is outstanding. I'd love to learn more about you."
      ];

      customSuggestions.forEach(text => {
        const btn = document.createElement("button");
        btn.className = "btn-suggest";
        btn.innerText = text;
        btn.onclick = () => {
          document.getElementById("chat-input-box").value = text;
        };
        suggestionList.appendChild(btn);
      });
    }
  }

  // Handle send message form submit
  const chatMessageForm = document.getElementById("chat-message-form");
  const chatInputBox = document.getElementById("chat-input-box");

  if (chatMessageForm) {
    chatMessageForm.addEventListener("submit", (e) => {
      e.preventDefault();
      
      const msgText = chatInputBox.value.trim();
      const activeId = appState.activeChatProfileId;

      if (!msgText || !activeId) return;

      // Outgoing message
      const time = getFormattedTime();
      appState.conversations[activeId].push({
        sender: "outgoing",
        message: msgText,
        timestamp: time
      });

      chatInputBox.value = "";
      saveState();
      renderChatCenter();

      // Trigger realistic AI-simulated response
      simulatePartnerReply(activeId, msgText);
    });
  }

  function simulatePartnerReply(profileId, userText) {
    const profile = mockProfiles.find(p => p.id === profileId);
    if (!profile) return;

    // Show simulated typing status in header after 1 second
    setTimeout(() => {
      const headerText = document.querySelector(".online-indicator");
      if (headerText) {
        headerText.innerHTML = `<span class="online-indicator" style="color:var(--color-accent);"><span class="pulse-dot" style="background-color:var(--color-accent);"></span> Typing...</span>`;
      }
    }, 1000);

    // Dynamic responses based on profile and user text context
    setTimeout(() => {
      let replyMessage = "";
      const lower = userText.toLowerCase();

      if (lower.includes("call") || lower.includes("phone") || lower.includes("talk")) {
        replyMessage = `Hello! I would absolutely love to have a secure voice call with you. I prefer keeping initial communications on the PerfectRishta secure gateway. Would tomorrow evening work for you?`;
      } else if (lower.includes("expect") || lower.includes("partner") || lower.includes("marry")) {
        replyMessage = `Our values align wonderfully. In a partner, I highly value emotional maturity, intellectual curiosity, and family roots, which your profile exhibits beautifully. What are your primary long-term aspirations?`;
      } else {
        replyMessage = `Thank you so much for the message. I also reviewed your profile and our matches calculate very highly! I'd love to chat more and perhaps introduce our families soon if things align well.`;
      }

      appState.conversations[profileId].push({
        sender: "incoming",
        message: replyMessage,
        timestamp: getFormattedTime()
      });

      saveState();
      
      // Update UI and trigger toast message
      if (window.location.hash === "#chat" && appState.activeChatProfileId === profileId) {
        renderChatCenter();
      } else {
        showToast(`New connection message from ${profile.name}!`);
      }
      
      updateChatCountBadge();
    }, 2800);
  }

  // Chat window empty state go dashboard
  document.getElementById("chat-go-dash-btn").addEventListener("click", () => {
    window.location.hash = "dashboard";
  });

  // Secure Audio Call modal simulation
  function showSecureCallDialog(profile) {
    const overlay = document.getElementById("shared-modal-overlay");
    const dialog = document.getElementById("shared-dialog-modal");
    const title = document.getElementById("shared-modal-title");
    const body = document.getElementById("shared-modal-body");

    title.innerHTML = `<i class="fa-solid fa-phone-volume text-gold"></i> PerfectRishta Secure Voice Link`;
    body.innerHTML = `
      <div class="text-center">
        <img src="${profile.photo}" alt="${profile.name}" style="width:90px; height:90px; border-radius:50%; object-fit:cover; border:2px solid var(--color-accent); margin-bottom:1rem;">
        <h4 style="font-size:1.3rem;">Connecting Call to ${profile.name}</h4>
        <span class="online-indicator" style="justify-content:center; color: var(--color-accent); margin-top:0.25rem;"><span class="pulse-dot" style="background-color:var(--color-accent);"></span> Secure SSL Encryption Enabled</span>
        
        <p class="margin-top-md" style="font-size:0.9rem; color:var(--text-muted);">This call is hosted via PerfectRishta's premium mask gateway. Neither party's personal phone number is revealed during the voice link.</p>
        
        <div class="flex-row-responsive" style="margin-top:2.5rem; justify-content:center; gap:1.5rem;">
          <button class="btn btn-outline" id="call-cancel-btn" style="border-color:#ef4444; color:#ef4444;"><i class="fa-solid fa-phone-slash"></i> Hang Up</button>
          <button class="btn btn-gold" id="call-accept-btn" style="background-color:#10b981; color:#fff; box-shadow:none;"><i class="fa-solid fa-microphone"></i> Audio Connected</button>
        </div>
      </div>
    `;

    overlay.classList.add("active");
    dialog.classList.add("active");

    const closeBtn = document.getElementById("shared-modal-close-btn");
    const cancelBtn = document.getElementById("call-cancel-btn");
    const acceptBtn = document.getElementById("call-accept-btn");

    const closeCall = () => {
      overlay.classList.remove("active");
      dialog.classList.remove("active");
    };

    closeBtn.onclick = closeCall;
    cancelBtn.onclick = closeCall;
    
    acceptBtn.onclick = () => {
      showToast("Audio match connected successfully. Happy matchmaking conversation!");
      closeCall();
    };
  }

  // ==========================================
  // 14. PREMIUM PLANS SUBSCRIPTIONS GATEWAY
  // ==========================================
  
  const pricingToggle = document.getElementById("pricing-period-toggle");
  const priceGold = document.getElementById("price-gold");
  const priceDiamond = document.getElementById("price-diamond");
  const pricePlatinum = document.getElementById("price-platinum");
  
  const durGold = document.getElementById("dur-gold");
  const durDiamond = document.getElementById("dur-diamond");
  const durPlatinum = document.getElementById("dur-platinum");

  const lblMonthly = document.getElementById("toggle-lbl-monthly");
  const lblAnnual = document.getElementById("toggle-lbl-annual");

  if (pricingToggle) {
    pricingToggle.addEventListener("change", () => {
      if (pricingToggle.checked) {
        // Annual Rates (30% off, billed annually)
        priceGold.innerText = "2,450";
        priceDiamond.innerText = "4,340";
        pricePlatinum.innerText = "12,950";
        
        durGold.innerText = " / Mo (Billed Annually)";
        durDiamond.innerText = " / Mo (Billed Annually)";
        durPlatinum.innerText = " / Mo (Billed Annually)";
        
        lblMonthly.classList.remove("active");
        lblAnnual.classList.add("active");
        appState.pricingPeriod = "annual";
      } else {
        // Monthly / standard 3 months Rates
        priceGold.innerText = "3,500";
        priceDiamond.innerText = "6,200";
        pricePlatinum.innerText = "18,500";
        
        durGold.innerText = " / 3 Months";
        durDiamond.innerText = " / 3 Months";
        durPlatinum.innerText = " / 3 Months";
        
        lblMonthly.classList.add("active");
        lblAnnual.classList.remove("active");
        appState.pricingPeriod = "monthly";
      }
      saveState();
    });
  }

  // Checkout modal elements
  const checkoutOverlay = document.getElementById("checkout-modal-overlay");
  const checkoutModal = document.getElementById("checkout-modal");
  const checkoutCloseBtn = document.getElementById("checkout-close-btn");
  const checkoutPlanName = document.getElementById("checkout-plan-name");
  const checkoutPlanPrice = document.getElementById("checkout-plan-price");
  const checkoutForm = document.getElementById("checkout-payment-form");

  document.querySelectorAll(".buy-plan-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const planName = btn.getAttribute("data-plan");
      
      let price = "₹6,200";
      if (planName === "Gold Prime") {
        price = appState.pricingPeriod === "monthly" ? "₹3,500" : "₹29,400 (Annual)";
      } else if (planName === "Diamond Royal") {
        price = appState.pricingPeriod === "monthly" ? "₹6,200" : "₹52,080 (Annual)";
      } else if (planName === "Platinum Concierge") {
        price = appState.pricingPeriod === "monthly" ? "₹18,500" : "₹155,400 (Annual)";
      }

      checkoutPlanName.innerText = planName;
      checkoutPlanPrice.innerText = price;
      
      checkoutOverlay.classList.add("active");
      checkoutModal.classList.add("active");
    });
  });

  const closeCheckout = () => {
    checkoutOverlay.classList.remove("active");
    checkoutModal.classList.remove("active");
  };

  if (checkoutCloseBtn) checkoutCloseBtn.addEventListener("click", closeCheckout);
  if (checkoutOverlay) checkoutOverlay.addEventListener("click", closeCheckout);

  // Submit secure gateway payment
  if (checkoutForm) {
    checkoutForm.addEventListener("submit", (e) => {
      e.preventDefault();

      const selectedPlan = checkoutPlanName.innerText;
      
      // Show simulated loading status on submit button
      const submitBtn = document.getElementById("checkout-submit-btn");
      submitBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Processing Secure Gateway...`;
      submitBtn.disabled = true;

      setTimeout(() => {
        appState.premium = {
          unlocked: true,
          tier: selectedPlan,
          revealedContacts: appState.premium.revealedContacts
        };

        saveState();
        updateUserHeader();
        closeCheckout();

        // Show royal custom dialogue
        showCelebrationDialog(selectedPlan);

        // Reset submit button
        submitBtn.innerHTML = `<i class="fa-solid fa-lock"></i> Authorize Secure Payment`;
        submitBtn.disabled = false;

        // Redirect to dashboard
        window.location.hash = "dashboard";
      }, 2000);
    });
  }

  function showCelebrationDialog(planName) {
    const overlay = document.getElementById("shared-modal-overlay");
    const dialog = document.getElementById("shared-dialog-modal");
    const title = document.getElementById("shared-modal-title");
    const body = document.getElementById("shared-modal-body");

    title.innerHTML = `<i class="fa-solid fa-circle-check text-gold"></i> PerfectRishta Upgrade Complete!`;
    body.innerHTML = `
      <div class="text-center" style="padding: 1rem 0;">
        <div style="font-size:3.5rem; color:var(--color-accent); margin-bottom:1rem;"><i class="fa-solid fa-crown fa-bounce"></i></div>
        <h4 style="font-size:1.4rem; font-family:'Playfair Display', serif;">Welcome to ${planName} Luxury Tier</h4>
        <p class="margin-top-sm" style="font-size: 0.95rem; color:var(--text-muted); max-width:380px; margin:0 auto 1.5rem;">You have successfully entered our sovereign matching ecosystem. Full contact details and private direct communications are now unlocked.</p>
        
        <ul style="text-align:left; display:inline-block; font-size:0.85rem; margin-bottom:1.5rem; line-height:1.8;">
          <li><i class="fa-solid fa-check text-gold" style="margin-right:0.5rem;"></i> Direct Phone and Email details Unlocked!</li>
          <li><i class="fa-solid fa-check text-gold" style="margin-right:0.5rem;"></i> Read Receipts active on Private Message Center</li>
          <li><i class="fa-solid fa-check text-gold" style="margin-right:0.5rem;"></i> Profile highlighted with Royal Premium badges</li>
        </ul>
        
        <div>
          <button class="btn btn-gold btn-large" id="celebration-close-btn" style="width:100%;">Step Into My Sanctuary</button>
        </div>
      </div>
    `;

    overlay.classList.add("active");
    dialog.classList.add("active");

    const closeBtn = document.getElementById("shared-modal-close-btn");
    const celebrCloseBtn = document.getElementById("celebration-close-btn");

    const closeCelebr = () => {
      overlay.classList.remove("active");
      dialog.classList.remove("active");
    };

    closeBtn.onclick = closeCelebr;
    celebrCloseBtn.onclick = closeCelebr;
  }

  // Initial updates on load
  updateChatCountBadge();

});
