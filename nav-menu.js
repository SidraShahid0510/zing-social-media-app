// nav-menu.js

const navMenu = document.querySelector(".nav-menu");
const navUserIcon = document.querySelector(".nav-user-icon");
const navMenuClose = document.getElementById("close-nav-menu");
const logoutBtn = document.getElementById("logout");

// Start hidden
if (navMenu) navMenu.style.display = "none";

function openNavMenu() {
  if (!navMenu) return;
  navMenu.style.display = "block"; // Make it visible first
  requestAnimationFrame(() => {
    navMenu.classList.add("show"); // Trigger smooth transition
  });
}

function closeNavMenu() {
  if (!navMenu) return;
  navMenu.classList.remove("show"); // Play reverse animation
  navMenu.addEventListener(
    "transitionend",
    () => {
      navMenu.style.display = "none"; // Fully hide after animation ends
    },
    { once: true }
  );
}

navUserIcon?.addEventListener("click", openNavMenu);
navMenuClose?.addEventListener("click", closeNavMenu);

/******friend menu**** */
const friendMenu = document.querySelector(".nav-friends");
const friendsBtn = document.querySelector(
  ".left-sidebar-menu-items:nth-child(3)"
); // Friends item
const closeFriendBtn = document.getElementById("close-friend-btn");

if (friendsBtn && friendMenu && closeFriendBtn) {
  friendsBtn.addEventListener("click", () => {
    friendMenu.classList.add("show");
  });

  closeFriendBtn.addEventListener("click", () => {
    friendMenu.classList.remove("show");
  });
}
/******event menu**** */
const eventMenu = document.querySelector(".event-menu");
const eventsBtn = document.querySelector(
  ".left-sidebar-menu-items:nth-child(4)"
); // Events item in the menu
const closeEventBtn = document.getElementById("close-nav-event");

if (eventsBtn && eventMenu && closeEventBtn) {
  eventsBtn.addEventListener("click", () => {
    eventMenu.classList.add("show");
  });

  closeEventBtn.addEventListener("click", () => {
    eventMenu.classList.remove("show");
  });
}

function performLogout() {
  try {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("name");
    localStorage.removeItem("avatarUrl");
    localStorage.removeItem("avatarVer");
    localStorage.removeItem("email");
  } catch (error) {
    console.warn("Could not clear storage:", error); // fixed variable name
  } finally {
    if (navMenu) navMenu.style.display = "none";
    window.location.href = "index.html";
  }
}

if (logoutBtn) {
  // make the <p> behave like a button
  logoutBtn.style.cursor = "pointer";
  logoutBtn.setAttribute("role", "button");
  logoutBtn.tabIndex = 0;

  logoutBtn.addEventListener("click", () => performLogout());
  logoutBtn.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      performLogout();
    }
  });
}
