// login-user.js
document.addEventListener("DOMContentLoaded", () => {
  /* ---------- Config ---------- */
  const DEFAULT_AVATAR = "images/default-avatar.png";
  // Fetches the logged-in user's avatar from the API and sets it on the page
  async function fetchAndSetAvatar() {
    const username = localStorage.getItem("name");
    const token = localStorage.getItem("accessToken");
    if (!username || !token) return;

    try {
      const res = await fetch(
        `https://v2.api.noroff.dev/social/profiles/${encodeURIComponent(
          username
        )}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "X-Noroff-API-Key": Noroff_API_Key,
          },
        }
      );

      if (!res.ok) throw new Error("Failed to fetch user profile");
      const { data } = await res.json();
      const avatarUrl = data?.avatar?.url || DEFAULT_AVATAR;
      const avatarContainer = document.querySelector(".log-user-image img");
      if (avatarContainer) {
        avatarContainer.src = avatarUrl;
        avatarContainer.alt = `${username}'s avatar`;
        avatarContainer.onerror = () => {
          avatarContainer.onerror = null;
          avatarContainer.src = DEFAULT_AVATAR;
        };
      }
    } catch (err) {
      console.error("Error fetching avatar:", err);
    }
  }
  /* ---------- Banner logic ---------- */
  const DEFAULT_BANNER = "images/default-banner.jpg";
  const bannerImg = document.getElementById("profile-banner-img");
  const editBtn = document.getElementById("edit-cover-btn");
  const editContainer = document.getElementById("edit-cover-container");
  const bannerInput = document.getElementById("banner-Url-input");
  const saveBtn = document.getElementById("save-banner-btn");

  const bioForm = document.getElementById("bioForm");
  const bioTextarea = document.getElementById("bio");
  const statusText = document.getElementById("status");
  const bioFormContainer = document.getElementById("bioFormContainer");
  const bioDisplayContainer = document.getElementById("bioDisplayContainer");
  const bioText = document.getElementById("bioText");
  const editBioBtn = document.getElementById("editBioBtn");

  const currentUser = localStorage.getItem("name");
  const token = localStorage.getItem("accessToken");

  if (editContainer) editContainer.classList.add("hidden");
  function setBanner(url) {
    if (bannerImg) bannerImg.src = url || DEFAULT_BANNER;
  }
  // Loads the banner from the API for the current user
  async function loadBanner() {
    if (!currentUser || !token) {
      setBanner("");
      return;
    }
    try {
      const res = await fetch(
        `https://v2.api.noroff.dev/social/profiles/${encodeURIComponent(
          currentUser
        )}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            ...(typeof Noroff_API_Key !== "undefined" && {
              "X-Noroff-API-Key": Noroff_API_Key,
            }),
          },
        }
      );
      if (!res.ok) throw new Error("Failed to load banner");
      const json = await res.json();
      setBanner(json.data?.banner?.url || "");
    } catch (e) {
      console.error("Banner fetch failed", e);
      setBanner("");
    }
  }
  // Updates the user's banner in the API and on the page
  async function updateBanner(url) {
    if (!currentUser || !token) return;
    try {
      const res = await fetch(
        `https://v2.api.noroff.dev/social/profiles/${encodeURIComponent(
          currentUser
        )}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            ...(typeof Noroff_API_Key !== "undefined" && {
              "X-Noroff-API-Key": Noroff_API_Key,
            }),
          },
          body: JSON.stringify({ banner: { url } }),
        }
      );
      if (!res.ok) throw new Error("Failed to update banner");
      setBanner(url);
    } catch (e) {
      console.error("Banner update failed", e);
    }
  }
  // Handles editing the banner
  if (editBtn) {
    editBtn.addEventListener("click", () => {
      editContainer.classList.remove("hidden");
      bannerInput.focus();
      editBtn.classList.add("hidden");
    });
  }
  // Handles saving the new banner URL
  if (saveBtn) {
    saveBtn.addEventListener("click", () => {
      const url = bannerInput.value.trim();
      if (!url) return alert("Enter a valid URL");
      updateBanner(url);
      editContainer.classList.add("hidden");
      bannerInput.value = "";
      editBtn.classList.remove("hidden");
    });
  }

  loadBanner();

  /* ---------- Fetch profile + posts ---------- */
  async function fetchAndApplyProfile() {
    const currentUser = localStorage.getItem("name");
    const token = localStorage.getItem("accessToken");
    const profileFeed = document.querySelector(".profile-post-container");

    if (!currentUser || !token) {
      console.error("User not logged in");
      return;
    }

    try {
      const res = await fetch(
        `https://v2.api.noroff.dev/social/profiles/${encodeURIComponent(
          currentUser
        )}?_followers=true&_following=true`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "X-Noroff-API-Key": Noroff_API_Key,
          },
        }
      );

      if (!res.ok) throw new Error("Failed to fetch profile data");
      const { data: profile } = await res.json();

      // Update username
      const usernameP = document.querySelector(".profile-username p");
      if (usernameP) usernameP.textContent = profile.name || "User";

      // Update banner
      const bannerImg = document.getElementById("profile-banner-img");
      if (bannerImg) {
        bannerImg.src = profile.banner?.url || DEFAULT_BANNER;
        bannerImg.onerror = () => (bannerImg.src = DEFAULT_BANNER);
      }

      // Clear container before rendering posts
      if (profileFeed) {
        profileFeed.innerHTML = "";

        // Fetch posts data only
        const myPosts = await fetchPosts(false); // only my posts

        // Only render posts once per load
        generatePosts(myPosts, profileFeed);

        if (window.updateMyPostCount) window.updateMyPostCount();
        if (window.updateMyFollowingCount) window.updateMyFollowingCount();
      }
    } catch (err) {
      console.error("Error loading profile data:", err);
    }
  }

  fetchAndApplyProfile();

  /* ---------- Bio Section ---------- */
  const STATUS_DISPLAY_MS = 2500;
  let statusTimeoutId = null;
  // Shows the form for editing bio
  function showForm() {
    bioFormContainer.style.display = "block";
    bioDisplayContainer.style.display = "none";
    statusText.textContent = "";
  }
  // Shows the current bio view (non-editing mode)
  function showBioView() {
    bioFormContainer.style.display = "none";
    bioDisplayContainer.style.display = "block";
  }
  // Loads bio
  async function loadBio() {
    if (!currentUser || !token) {
      showForm();
      bioTextarea.value = "";
      return;
    }

    const lsKey = `bio_${currentUser}`;
    const saved = localStorage.getItem(lsKey);
    if (saved) {
      bioText.textContent = saved;
      showBioView();
      return;
    }

    try {
      const res = await fetch(
        `https://v2.api.noroff.dev/social/profiles/${encodeURIComponent(
          currentUser
        )}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "X-Noroff-API-Key": Noroff_API_Key,
          },
        }
      );
      const { data } = await res.json();
      bioText.textContent = data.bio || "";
      localStorage.setItem(lsKey, data.bio || "");
      showBioView();
    } catch (e) {
      console.error("Error loading bio:", e);
      showForm();
    }
  }

  async function saveBio(e) {
    e.preventDefault();
    if (!currentUser || !token) return;

    try {
      const newBio = bioTextarea.value.trim();
      const res = await fetch(
        `https://v2.api.noroff.dev/social/profiles/${encodeURIComponent(
          currentUser
        )}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            "X-Noroff-API-Key": Noroff_API_Key,
          },
          body: JSON.stringify({ bio: newBio }),
        }
      );

      if (!res.ok) throw new Error("Failed to update bio");

      localStorage.setItem(`bio_${currentUser}`, newBio);
      bioText.textContent = newBio;
      showBioView();
      statusText.textContent = "Bio updated!";
      clearTimeout(statusTimeoutId);
      statusTimeoutId = setTimeout(
        () => (statusText.textContent = ""),
        STATUS_DISPLAY_MS
      );
    } catch (e) {
      console.error("Error updating bio:", e);
      statusText.textContent = "Error saving bio.";
    }
  }

  if (bioForm) bioForm.addEventListener("submit", saveBio);
  if (editBioBtn) editBioBtn.addEventListener("click", showForm);
  fetchAndSetAvatar();
  loadBio();
});
