// login.js

const Noroff_API_Key = "384ffc1f-5fb6-497c-b8ef-68eb6ba14e6f";

const loginForm = document.querySelector("#form");
const message = document.querySelector(".message");

/**
 * Fetch the fresh profile after login and cache the avatar with a version,
 * so the navbar can cache-bust and show the updated image immediately.
 */
async function hydrateAvatarCache() {
  const accessToken = localStorage.getItem("accessToken");
  const username = localStorage.getItem("name");
  if (!accessToken || !username) return;

  try {
    const res = await fetch(
      `https://v2.api.noroff.dev/social/profiles/${encodeURIComponent(
        username
      )}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "X-Noroff-API-Key": Noroff_API_Key,
        },
      }
    );
    const { data } = await res.json();
    const url = (data?.avatar?.url || "").trim();
    if (url) {
      localStorage.setItem("avatarUrl", url);
      localStorage.setItem("avatarVer", String(Date.now())); // cache-buster
    } else {
      localStorage.removeItem("avatarUrl");
      localStorage.removeItem("avatarVer");
    }
  } catch (e) {
    // Non-fatal; continue to app
    console.warn("Could not hydrate avatar cache:", e);
  }
}

async function loginUser(userdetails) {
  try {
    const fetchOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userdetails),
    };

    const response = await fetch(
      "https://v2.api.noroff.dev/auth/login",
      fetchOptions
    );
    const result = await response.json();

    if (!response.ok) {
      const msg =
        result?.errors?.map((err) => err.message).join(", ") ||
        "Something went wrong.";
      message.textContent = msg;
      console.error("API error:", result);
      return;
    }

    // Store essentials
    localStorage.setItem("accessToken", result.data.accessToken);
    localStorage.setItem("name", result.data.name);

    // Seed avatar from login payload (may be stale), then hydrate from server
    if (result.data.avatar?.url) {
      localStorage.setItem("avatarUrl", result.data.avatar.url);
      localStorage.setItem("avatarVer", String(Date.now()));
    } else {
      localStorage.removeItem("avatarUrl");
      localStorage.removeItem("avatarVer");
    }

    message.textContent = "Login successful!";

    // Get fresh avatar BEFORE entering the app so navbar shows it instantly
    await hydrateAvatarCache();

    // Go to your app
    window.location.href = "index.html";
  } catch (error) {
    message.textContent = "Network error. Please try again later.";
    console.error("Fetch error:", error);
  }
}

function formSubmit(e) {
  e.preventDefault();

  const formData = new FormData(e.target);
  const formFields = Object.fromEntries(formData);
  const email = formFields.email || "";

  // basic email check
  if (!email.endsWith("@stud.noroff.no")) {
    message.textContent = "Email must end with @stud.noroff.no";
    return;
  }

  loginUser(formFields);
}

loginForm.addEventListener("submit", formSubmit);
