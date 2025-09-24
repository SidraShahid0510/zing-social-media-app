/**
 * @typedef {Object} Author
 * @property {string} name
 * @property {{ url?: string }} [avatar]
 */

/**
 * @typedef {Object} Media
 * @property {string} url
 * @property {string} [alt]
 */

/**
 * @typedef {Object} PostCounts
 * @property {number} [reactions]
 * @property {number} [comments]
 */

/**
 * @typedef {Object} CommentItem
 * @property {string} id
 * @property {Author} author
 * @property {string} body
 * @property {string} created
 */

/**
 * @typedef {Object} Post
 * @property {string} id
 * @property {string} title
 * @property {string} body
 * @property {string} created
 * @property {Author} author
 * @property {Media} [media]
 * @property {PostCounts} [_count]
 * @property {CommentItem[]} [comments]
 * @property {string} [feeling]
 */

const postContainer = document.querySelector(".post-container");
const Noroff_API_Key = "384ffc1f-5fb6-497c-b8ef-68eb6ba14e6f";
const DEFAULT_AVATAR = "images/default-avatar.png";

let currentAvatarUrl = DEFAULT_AVATAR;

// Fetch latest from API and update UI
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
    currentAvatarUrl = data?.avatar?.url?.trim() || DEFAULT_AVATAR;

    // Update common avatar targets + username
    const avatarTargets = [
      "#nav-profile-img",
      "#nav-menu-img",
      "#post-profile-pic",
      "#comment-section-profile-image",
      "#create-profile-img",
    ];
    avatarTargets.forEach((sel) => {
      const el = document.querySelector(sel);
      if (el) {
        el.src = currentAvatarUrl;
        el.alt = `${username}'s avatar`;
        el.onerror = () => {
          el.onerror = null;
          el.src = DEFAULT_AVATAR;
        };
      }
    });
    const navUsernameEl = document.getElementById("nav-username");
    if (navUsernameEl) navUsernameEl.textContent = username;
  } catch (err) {
    console.error("Error fetching avatar:", err);
  }
}

// --- Post Count Helper ---
const POST_COUNT_SELECTOR = "#posts-count";

async function fetchUserPostCount(username) {
  const token = localStorage.getItem("accessToken");
  if (!token || !username) return 0;

  try {
    const res = await fetch(
      `https://v2.api.noroff.dev/social/profiles/${encodeURIComponent(
        username
      )}/posts?_author=false&_comments=false&_reactions=false`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "X-Noroff-API-Key": Noroff_API_Key,
        },
      }
    );

    const { data = [] } = await res.json();
    return Array.isArray(data) ? data.length : 0;
  } catch (e) {
    console.error("fetchUserPostCount error:", e);
    return 0;
  }
}
//update the post count
function setPostCountText(count) {
  const el = document.querySelector(POST_COUNT_SELECTOR);
  if (el) el.textContent = count;
}

let currentPostCount = null;

//Update, increment, or decrement post count in the UI
window.updateMyPostCount = async function () {
  const me = localStorage.getItem("name");
  if (!me) return;

  const count = await fetchUserPostCount(me);
  currentPostCount = count;
  setPostCountText(count);
};

window.incrementPostCount = function () {
  if (currentPostCount === null) return; // not loaded yet
  currentPostCount++;
  setPostCountText(currentPostCount);
};
window.decrementPostCount = function () {
  if (currentPostCount === null) return; // not loaded yet
  currentPostCount = Math.max(0, currentPostCount - 1);
  setPostCountText(currentPostCount);
};

// --- Following Count Helper ---
const FOLLOWING_COUNT_SELECTOR = "#following-count";

async function fetchFollowingCount(username) {
  const token = localStorage.getItem("accessToken");
  if (!token || !username) return 0;

  try {
    const res = await fetch(
      `https://v2.api.noroff.dev/social/profiles/${encodeURIComponent(
        username
      )}?_followers=true&_following=true`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "X-Noroff-API-Key": Noroff_API_Key,
        },
      }
    );

    const { data } = await res.json();
    return Array.isArray(data.following) ? data.following.length : 0;
  } catch (e) {
    console.error("fetchFollowingCount error:", e);
    return 0;
  }
}
function setFollowingCountText(count) {
  const el = document.querySelector(FOLLOWING_COUNT_SELECTOR);
  if (el) el.textContent = count;
}

let currentFollowingCount = null;

window.updateMyFollowingCount = async function () {
  const me = localStorage.getItem("name");
  if (!me) return;

  const count = await fetchFollowingCount(me);
  currentFollowingCount = count;
  setFollowingCountText(count);
};

// Increments following count
window.incrementFollowingCount = function () {
  if (currentFollowingCount === null) return;
  currentFollowingCount++;
  setFollowingCountText(currentFollowingCount);
};
// Decrements following count
window.decrementFollowingCount = function () {
  if (currentFollowingCount === null) return;
  currentFollowingCount = Math.max(0, currentFollowingCount - 1);
  setFollowingCountText(currentFollowingCount);
};

// --- Follow / Unfollow API Calls ---
async function followUser(username) {
  const token = localStorage.getItem("accessToken");
  if (!token || !username) return false;

  try {
    const res = await fetch(
      `https://v2.api.noroff.dev/social/profiles/${encodeURIComponent(
        username
      )}/follow`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "X-Noroff-API-Key": Noroff_API_Key,
        },
      }
    );
    return res.ok;
  } catch (e) {
    console.error("followUser error:", e);
    return false;
  }
}

async function unfollowUser(username) {
  const token = localStorage.getItem("accessToken");
  if (!token || !username) return false;

  try {
    const res = await fetch(
      `https://v2.api.noroff.dev/social/profiles/${encodeURIComponent(
        username
      )}/unfollow`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "X-Noroff-API-Key": Noroff_API_Key,
        },
      }
    );
    return res.ok;
  } catch (e) {
    console.error("unfollowUser error:", e);
    return false;
  }
}

async function toggleFollow(username, btnEl) {
  if (!username || !btnEl) return;

  const isFollowing = btnEl.classList.contains("following");
  const success = isFollowing
    ? await unfollowUser(username)
    : await followUser(username);

  if (success) {
    // Update button text + style
    const newText = isFollowing ? "Follow" : "Following";
    document
      .querySelectorAll(
        `.follow-text[data-author="${username}"], .pd-follow-text[data-author="${username}"]`
      )
      .forEach((b) => {
        b.textContent = newText;
        b.classList.toggle("following", !isFollowing);
      });

    // Update counts instantly
    if (!isFollowing && window.incrementFollowingCount) {
      window.incrementFollowingCount();
    } else if (isFollowing && window.decrementFollowingCount) {
      window.decrementFollowingCount();
    }

    // Update other user's profile page count too
    if (typeof updateOtherUserFollowingCount === "function") {
      updateOtherUserFollowingCount(username);
    }
  }
}

/* *************create post************* */
const writePostSection = document.querySelector(".write-post-section");
const createPostContainer = document.querySelector(".create-post-container");
const closeBtn = document.getElementById("close-create");

writePostSection.addEventListener("click", () => {
  createPostContainer.classList.add("active");
  document.body.style.overflow = "hidden";

  const createImg = document.getElementById("create-profile-img");
  if (createImg) {
    createImg.src = currentAvatarUrl || DEFAULT_AVATAR;
    createImg.onerror = () => {
      createImg.onerror = null;
      createImg.src = DEFAULT_AVATAR;
    };
  }
  document.getElementById("create-username").textContent =
    localStorage.getItem("name") || "User";
});
closeBtn.addEventListener("click", () => {
  createPostContainer.classList.remove("active");
  document.body.style.overflow = "";
});

/*------show image url input when user click on image icon-----*/
const imageIcon = document.querySelector(".create-activity-icons .fa-image");
const imageUrlInput = document.getElementById("image-url");
const urlImageDiv = document.querySelector(".url-img-div");
const previewImg = urlImageDiv.querySelector("img");
const removeImgBtn = document.getElementById("remove-img");

imageIcon.addEventListener("click", () => {
  imageUrlInput.style.display = "block";
  imageUrlInput.focus();
});
imageUrlInput.addEventListener("input", () => {
  const url = imageUrlInput.value.trim();
  if (url) {
    previewImg.src = url;
    urlImageDiv.style.display = "block";
  } else {
    urlImageDiv.style.display = "none";
    previewImg.src = "";
  }
});
removeImgBtn.addEventListener("click", () => {
  previewImg.src = "";
  imageUrlInput.value = "";
  urlImageDiv.style.display = "none";
  imageUrlInput.style.display = "none";
});
/*-----handle post button-----*/
const postBtn = document.querySelector(".create-post-btn");
const textarea = document.querySelector(".create-txt textarea");
const titleInput = document.getElementById("post-title");

/*--------show feelings section when user click on emoji--------*/

const feelingsSection = document.querySelector(".feelings-section");
const feelingsIcon = document.querySelector(
  ".create-activity-icons .fa-face-smile"
);
const closeFeelingsBtn = document.getElementById("close-feelings");
const feelingOptions = document.querySelectorAll(".feeling");

setupEmojiPicker(feelingOptions, textarea, feelingsSection);

feelingsIcon.addEventListener("click", () => {
  feelingsSection.style.display = "flex";
});
closeFeelingsBtn.addEventListener("click", () => {
  feelingsSection.style.display = "none";
});

function setupEmojiPicker(feelingOptions, textareaElement, feelingsSection) {
  feelingOptions.forEach((feeling) => {
    feeling.addEventListener("click", () => {
      const emoji = feeling.querySelector("span").textContent;
      textareaElement.value += emoji + " ";
      feelingsSection.style.display = "none";
    });
  });
}

// For create post
feelingsIcon.addEventListener("click", () => {
  feelingsSection.style.display = "flex";
});

// For edit post
const editPostContainer = document.querySelector(".edit-post-container");
const editCloseBtn = document.getElementById("close-edit");
const editTitleInput = editPostContainer.querySelector("#edit-post-title");
const editTextarea = editPostContainer.querySelector(".edit-txt textarea");
const editImageInput = editPostContainer.querySelector("#edit-image-url");
const editPreviewImg = editPostContainer.querySelector(".edit-url-img-div img");
const editUrlImageDiv = editPostContainer.querySelector(".edit-url-img-div");
const saveEditBtn = editPostContainer.querySelector(".edit-post-btn");
const editFeelingsSection = document.querySelector(".edit-feelings-section");
const editFeelingOptions = editFeelingsSection.querySelectorAll(".feeling");
const editCloseFeelingsBtn = document.getElementById("close-edit-feelings");
const editFeelingsIcon = document.querySelector(
  ".edit-activity-icons .fa-face-smile"
);
let currentEditingPostId = null;
setupEmojiPicker(editFeelingOptions, editTextarea, editFeelingsSection);
editFeelingsIcon.addEventListener("click", () => {
  editFeelingsSection.style.display = "flex";
});
editCloseFeelingsBtn.addEventListener("click", () => {
  editFeelingsSection.style.display = "none";
});

/*********create post function******************/

async function createPost() {
  const postText = textarea.value.trim();
  const rawImageUrl = (imageUrlInput?.value || "").trim();
  const hasImage = !!rawImageUrl;

  if (!postText && !hasImage) {
    console.warn("Cannot create an empty post.");
    return;
  }

  const accessToken = localStorage.getItem("accessToken");
  if (!accessToken) {
    console.error("No access token found. Please login first.");
    return;
  }

  const payload = {
    title:
      document.getElementById("post-title").value.trim() || "Untitled Post",
    body: postText,
  };
  if (hasImage) {
    payload.media = { url: rawImageUrl, alt: "post image" };
  }

  try {
    const response = await fetch("https://v2.api.noroff.dev/social/posts", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        "X-Noroff-API-Key": Noroff_API_Key,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Failed to create post:", errorData);
      return;
    }

    const result = await response.json();
    console.log("Post created successfully:", result);
    // Increment post count
    if (window.incrementPostCount) window.incrementPostCount();
    if (typeof updateOtherUserPostCount === "function") {
      updateOtherUserPostCount(localStorage.getItem("name"));
    }
    textarea.value = "";
    document.getElementById("post-title").value = "";
    imageUrlInput.value = "";
    previewImg.src = "";
    urlImageDiv.style.display = "none";
    imageUrlInput.style.display = "none";
    createPostContainer.classList.remove("active");
    document.body.style.overflow = "";

    // Main feed → all posts (mine + others)
    const mainFeed = document.querySelector(".post-container");
    if (mainFeed) {
      const allPosts = await fetchPosts(true);
      generatePosts(allPosts, mainFeed);
    }

    // Profile feed → only my posts
    const profileFeed = document.querySelector(".profile-post-container");
    if (profileFeed) {
      const myPosts = await fetchPosts(false); // only my posts
      generatePosts(myPosts, profileFeed);
    }
  } catch (error) {
    console.error("Error creating post:", error);
  }
}

postBtn.addEventListener("click", createPost);

async function fetchPosts(includeAuthor = false) {
  const token = localStorage.getItem("accessToken");
  const username = localStorage.getItem("name");
  if (!token) return [];

  try {
    let url;
    if (includeAuthor) {
      // ✅ Global feed: all posts including mine
      url = `https://v2.api.noroff.dev/social/posts?_author=true&_comments=true&_reactions=true`;
    } else {
      // ✅ My posts only
      if (!username) return [];
      url = `https://v2.api.noroff.dev/social/profiles/${encodeURIComponent(
        username
      )}/posts?_author=true&_comments=true&_reactions=true`;
    }

    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        "X-Noroff-API-Key": Noroff_API_Key,
      },
    });

    if (!res.ok) throw new Error("Failed to fetch posts");
    const { data } = await res.json();
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.error("Error fetching posts:", err);
    return [];
  }
}

// smiley button that opens the detail modal
function attachOpenDetailSmiley(activityContainerEl, postId) {
  if (!activityContainerEl) return;
  const btn = document.createElement("button");
  btn.className = "activity-emoji-open-btn";
  btn.type = "button";
  btn.title = "React / comment with emoji";
  btn.innerHTML = `<i class="fa-solid fa-face-smile"></i>`;
  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    openPostDetail(postId);
  });
  activityContainerEl.appendChild(btn);
}

// --- Reactions helpers ---
async function refreshCountsFromServer(postId) {
  try {
    const accessToken = localStorage.getItem("accessToken");
    const res = await fetch(
      `https://v2.api.noroff.dev/social/posts/${encodeURIComponent(
        postId
      )}?_comments=true&_reactions=true`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "X-Noroff-API-Key": Noroff_API_Key,
        },
      }
    );
    const { data } = await res.json();
    const likes = data?._count?.reactions ?? 0;
    const comments = Array.isArray(data?.comments)
      ? data.comments.length
      : data?._count?.comments ?? 0;

    // sync modal
    const modalLike = document.querySelector(
      ".post-detail-content .pd-like-count"
    );
    if (modalLike) modalLike.textContent = likes;
    const modalComments = document.querySelector(
      ".post-detail-content .pd-comment-num"
    );
    if (modalComments) modalComments.textContent = comments;

    // sync list card
    updateListLikeCount(postId, likes);
    updateListCommentCount(postId, comments);
  } catch (e) {
    console.error("refreshCountsFromServer error:", e);
  }
}
async function reactWithEmoji(postId, emoji) {
  const accessToken = localStorage.getItem("accessToken");
  if (!accessToken || !postId || !emoji) return;
  try {
    const res = await fetch(
      `https://v2.api.noroff.dev/social/posts/${encodeURIComponent(
        postId
      )}/react/${encodeURIComponent(emoji)}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "X-Noroff-API-Key": Noroff_API_Key,
        },
      }
    );
    if (!res.ok) throw new Error("Reaction failed");
    await refreshCountsFromServer(postId);
  } catch (e) {
    console.error("reactWithEmoji error:", e);
  }
}
//generate posts function
async function generatePosts(posts, container) {
  if (!container || !posts) return;
  container.innerHTML = "";
  const loggedInUser = localStorage.getItem("name");
  let followingList = [];

  try {
    const token = localStorage.getItem("accessToken");
    if (token && loggedInUser) {
      const res = await fetch(
        `https://v2.api.noroff.dev/social/profiles/${encodeURIComponent(
          loggedInUser
        )}?_followers=true&_following=true`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "X-Noroff-API-Key": Noroff_API_Key,
          },
        }
      );
      if (res.ok) {
        const { data } = await res.json();
        followingList = data.following?.map((f) => f.name) || [];
      }
    }
  } catch (err) {
    console.error("Error fetching following list:", err);
  }

  posts.forEach((post) => {
    const feeling = post.feeling || "";
    const isOwnPost = post.author?.name === loggedInUser;
    const likeCount = post._count?.reactions ?? 0;
    const commentCount = post._count?.comments ?? 0;

    const authorAvatar = isOwnPost
      ? currentAvatarUrl
      : post.author?.avatar?.url || DEFAULT_AVATAR;

    const postHTML = `
      <div class="post-header">
        <div class="user-profile">
         <img src="${authorAvatar}" alt="profile"/>
          <div>
            <div class="author-row">
              <p class="post-author-name">${post.author?.name || "unknown"}${
      feeling ? ` is ${feeling}` : ""
    }</p>
            </div>
            <span>${new Date(post.created).toLocaleString()}</span>
          </div>
        </div>
        ${
          isOwnPost
            ? `
          <i class="fa-solid fa-ellipsis-vertical"></i>
          <div class="edit-del-btns">
            <a href="#" class="edit-btn"><i class="fa-solid fa-pen"></i>Edit Post</a>
            <a href="#" class="delete-btn" data-id="${post.id}"><i class="fa-solid fa-trash-can"></i>Delete Post</a>
          </div>
        `
            : ""
        }
      </div>
      <h2 class="post-title">${post.title || "Untitled Post"}</h2>
      <p class="post-text">${post.body || ""}</p>
      ${
        post.media?.url
          ? `<img src="${post.media.url}" alt="post image" class="post-img" />`
          : ""
      }
      <div class="activity-icons" data-post-id="${post.id}">
        <button class="activity-like-btn" type="button" aria-pressed="false">
          <i class="fa-solid fa-thumbs-up"></i>
          <span class="activity-like-count">${likeCount}</span>
        </button>
        <button class="activity-comment-count" type="button">
          <i class="fa-solid fa-comment"></i>
          <span class="activity-comment-num">${commentCount}</span>
        </button>
        <button class="activity-share-btn" type="button"><i class="fa-solid fa-share"></i></button>
      </div>
    `;

    const postElement = document.createElement("div");
    postElement.classList.add("post");
    postElement.dataset.postId = post.id;
    postElement.innerHTML = postHTML;
    container.appendChild(postElement);

    // Add smiley to open detail modal
    const activityBar = postElement.querySelector(".activity-icons");
    attachOpenDetailSmiley(activityBar, post.id);

    // Add Follow Button if not own post
    if (!isOwnPost && post.author?.name) {
      const authorRow = postElement.querySelector(".author-row");
      if (authorRow) {
        const followBtn = document.createElement("button");
        followBtn.className = "follow-text";
        followBtn.type = "button";
        followBtn.dataset.author = post.author.name;

        const isAlreadyFollowing = followingList.includes(post.author.name);
        followBtn.textContent = isAlreadyFollowing ? "Following" : "Follow";
        followBtn.setAttribute("aria-pressed", String(isAlreadyFollowing));
        if (isAlreadyFollowing) followBtn.classList.add("following");

        followBtn.addEventListener("click", async (e) => {
          e.stopPropagation();
          await toggleFollow(post.author.name, followBtn);
        });

        authorRow.appendChild(followBtn);
      }
    }

    // Click to open post detail unless clicking on buttons
    postElement.addEventListener("click", (e) => {
      if (e.target.closest("button, a, .edit-del-btns, .activity-icons"))
        return;
      openPostDetail(post.id);
    });

    const headerEl = postElement.querySelector(".user-profile");
    if (headerEl && post.author?.name) {
      headerEl.addEventListener("click", (e) => {
        e.stopPropagation();
        const me = localStorage.getItem("name");
        if (post.author.name === me) {
          window.location.href = "login-user.html";
        } else {
          window.location.href = `user-profile.html?username=${encodeURIComponent(
            post.author.name
          )}`;
        }
      });
    }

    // Like button
    const likeBtn = postElement.querySelector(".activity-like-btn");
    if (likeBtn) {
      likeBtn.addEventListener("click", async () => {
        await toggleLike(post.id, likeBtn);
      });
    }

    // Comment button
    const commentBtn = postElement.querySelector(".activity-comment-count");
    if (commentBtn)
      commentBtn.addEventListener("click", () => openPostDetail(post.id));

    // Own post edit/delete buttons
    if (isOwnPost) {
      const ellipsis = postElement.querySelector(".fa-ellipsis-vertical");
      const editDelBtns = postElement.querySelector(".edit-del-btns");
      const deleteBtn = postElement.querySelector(".delete-btn");
      const editBtn = postElement.querySelector(".edit-btn");

      if (ellipsis && editDelBtns) {
        ellipsis.addEventListener("click", (e) => {
          e.stopPropagation();
          editDelBtns.classList.toggle("active");
        });
        document.addEventListener("click", () => {
          editDelBtns.classList.remove("active");
        });
      }

      // Delete Post
      if (deleteBtn) {
        deleteBtn.addEventListener("click", async (e) => {
          e.preventDefault();
          if (confirm("Are you sure you want to delete this post?")) {
            await deletePost(post.id);
          }
        });
      }

      // Edit Post
      if (editBtn && typeof editTitleInput !== "undefined") {
        editBtn.addEventListener("click", (e) => {
          e.preventDefault();
          currentEditingPostId = post.id;
          if (editTitleInput) editTitleInput.value = post.title || "";
          if (editTextarea) editTextarea.value = post.body || "";

          if (editPreviewImg && editUrlImageDiv && editImageInput) {
            if (post.media?.url) {
              editPreviewImg.src = post.media.url;
              editUrlImageDiv.style.display = "block";
              editImageInput.value = post.media.url;
            } else {
              editPreviewImg.src = "";
              editUrlImageDiv.style.display = "none";
              editImageInput.value = "";
            }
          }

          const editUserProfileImg =
            editPostContainer.querySelector("#edit-profile-img") ||
            editPostContainer.querySelector("#create-profile-img") ||
            editPostContainer.querySelector(".edit-content img");

          const editUsernameEl =
            editPostContainer.querySelector("#edit-username");
          const currentName = localStorage.getItem("name") || "User";

          if (editUserProfileImg) {
            editUserProfileImg.src = currentAvatarUrl || DEFAULT_AVATAR;
            editUserProfileImg.onerror = () => {
              editUserProfileImg.onerror = null;
              editUserProfileImg.src = DEFAULT_AVATAR;
            };
          }
          if (editUsernameEl) editUsernameEl.textContent = currentName;

          if (editPostContainer) {
            editPostContainer.classList.add("active");
            document.body.style.overflow = "hidden";
          }
        });
      }
    }
  });
}

// --- debounce helper ---
function debounce(fn, delay = 200) {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

// --- in-memory cache of all feed posts ---
let allPostsCache = [];

// Case-insensitive filter over title/body/author
function filterPosts(queryString) {
  const searchText = queryString.trim().toLowerCase();
  if (!searchText) return allPostsCache;
  return allPostsCache.filter((post) => {
    const title = (post.title || "").toLowerCase();
    const body = (post.body || "").toLowerCase();
    const author = (post.author?.name || "").toLowerCase();
    return (
      title.includes(searchText) ||
      body.includes(searchText) ||
      author.includes(searchText)
    );
  });
}

// Wire search input: filter + re-render
function setupFeedSearch(containerEl) {
  const inputEl =
    document.getElementById("nav-search") ||
    document.querySelector(".search-box input");
  if (!inputEl || !containerEl) return;

  const performSearch = debounce(() => {
    const searchText = (inputEl.value || "").toLowerCase().trim();
    const filtered = filterPosts(searchText);
    generatePosts(filtered, containerEl);
  }, 200);

  inputEl.addEventListener("input", performSearch);
  inputEl.addEventListener("keydown", (evt) => {
    if (evt.key === "Escape") {
      inputEl.value = "";
      performSearch();
    }
  });
}

function updateListLikeCount(postId, newCount) {
  const el = document.querySelector(
    `.post[data-post-id="${postId}"] .activity-like-count`
  );
  if (el) el.textContent = newCount;
}

function updateListCommentCount(postId, newCount) {
  const el = document.querySelector(
    `.post[data-post-id="${postId}"] .activity-comment-num`
  );
  if (el) el.textContent = newCount;
}

// --- Like toggle ---
async function toggleLike(postId, btnEl) {
  const accessToken = localStorage.getItem("accessToken");
  const symbol = encodeURIComponent("👍");
  try {
    const res = await fetch(
      `https://v2.api.noroff.dev/social/posts/${postId}/react/${symbol}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "X-Noroff-API-Key": Noroff_API_Key,
        },
      }
    );
    if (!res.ok) throw new Error("Like request failed");

    const countEl =
      btnEl.querySelector(".activity-like-count") ||
      btnEl.querySelector(".pd-like-count");
    if (countEl) {
      const isActive = btnEl.classList.contains("active");
      btnEl.classList.toggle("active", !isActive);
      btnEl.setAttribute("aria-pressed", String(!isActive));
      let count = parseInt(countEl.textContent, 10) || 0;
      count = !isActive ? count + 1 : Math.max(0, count - 1);
      countEl.textContent = count;

      updateListLikeCount(postId, count);
    }
  } catch (err) {
    console.error("Failed to toggle like:", err);
  }
}

/***********post-detail-container*************************/
const postDetailContainer = document.querySelector(".post-detail-container");
const postDetailContent = postDetailContainer.querySelector(
  ".post-detail-content"
);
const closePostDetailBtn = document.getElementById("close-post-detail");

closePostDetailBtn.addEventListener("click", () => {
  postDetailContainer.classList.remove("active");
  postDetailContent.innerHTML = ""; // cleanup so no stale listeners
  document.body.style.overflow = "";
});

async function getSinglePost(id) {
  const accessToken = localStorage.getItem("accessToken");
  const fetchOpts = {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "X-Noroff-API-Key": Noroff_API_Key,
    },
  };
  const apiResponse = await fetch(
    `https://v2.api.noroff.dev/social/posts/${id}?_author=true&_comments=true&_reactions=true`,
    fetchOpts
  );
  const json = await apiResponse.json();
  return json.data || json;
}
async function openPostDetail(postId) {
  try {
    const post = await getSinglePost(postId);
    renderPostDetail(post);
    postDetailContainer.classList.add("active");
    document.body.style.overflow = "hidden";
  } catch (err) {
    console.error("Failed to open post detail:", err);
  }
}

// ===== Emoji-in-comment helpers (detail modal) =====
function insertAtCursor(textareaEl, textToInsert) {
  if (!textareaEl) return;
  const start = textareaEl.selectionStart ?? textareaEl.value.length;
  const end = textareaEl.selectionEnd ?? textareaEl.value.length;
  const before = textareaEl.value.slice(0, start);
  textareaEl.value = before + textToInsert + textareaEl.value.slice(end);
  const newPos = start + textToInsert.length;
  textareaEl.setSelectionRange(newPos, newPos);
  textareaEl.focus();
}

function setupCommentEmojiUI(modalRootEl, postId) {
  if (!modalRootEl) return;
  const composer = modalRootEl.querySelector(".pd-write-comment");
  const textarea = modalRootEl.querySelector(".pd-comment-textarea");
  const sendBtn = modalRootEl.querySelector(".pd-send-comment");
  if (!composer || !textarea || !sendBtn) return;

  const toggleBtn = document.createElement("button");
  toggleBtn.type = "button";
  toggleBtn.className = "pd-emoji-toggle";
  toggleBtn.title = "Insert emoji";
  toggleBtn.innerHTML = `<i class="fa-solid fa-face-smile"></i>`;
  sendBtn.insertAdjacentElement("beforebegin", toggleBtn);

  const panel = document.createElement("div");
  panel.className = "pd-emoji-panel";
  panel.style.display = "none";
  const emojis = [
    "😀",
    "😁",
    "😂",
    "🤣",
    "😊",
    "😍",
    "😎",
    "🥳",
    "👍",
    "👏",
    "🙌",
    "🤝",
    "🔥",
    "💯",
    "✨",
    "🌟",
    "😮",
    "😢",
    "🥲",
    "🤔",
    "😋",
    "🍕",
    "🍔",
    "🥞",
    "☕",
    "🍩",
  ];
  panel.innerHTML = emojis
    .map(
      (e) =>
        `<button type="button" class="pd-emoji-item" data-emoji="${e}">${e}</button>`
    )
    .join("");
  composer.insertAdjacentElement("afterend", panel);

  toggleBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    panel.style.display = panel.style.display === "none" ? "flex" : "none";
  });

  // When an emoji is clicked, insert it and send it as a reaction for this post
  panel.addEventListener("click", async (e) => {
    const btn = e.target.closest(".pd-emoji-item");
    if (!btn) return;

    const emoji = btn.dataset.emoji;

    // Insert emoji into comment box
    insertAtCursor(textarea, emoji);

    try {
      const res = await fetch(
        `https://v2.api.noroff.dev/social/posts/${postId}/react/${encodeURIComponent(
          emoji
        )}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
            "X-Noroff-API-Key": Noroff_API_Key,
          },
        }
      );
      if (!res.ok) throw new Error("Failed to send emoji reaction");
      console.log(`Emoji ${emoji} sent for post ${postId}`);
    } catch (err) {
      console.error("Error sending emoji reaction:", err);
    }

    panel.style.display = "none";
  });

  if (sendBtn)
    sendBtn.addEventListener("click", () => {
      panel.style.display = "none";
    });
  document.addEventListener("click", (evt) => {
    if (!modalRootEl.contains(evt.target)) panel.style.display = "none";
  });
  textarea.addEventListener("keydown", (evt) => {
    if (evt.key === "Escape") panel.style.display = "none";
  });
}
// Renders a single post's details inside the modal.
function renderPostDetail(post) {
  const currentUsername = localStorage.getItem("name") || "User";
  const feeling = post.feeling || "";
  const likeCount = post._count?.reactions ?? 0;
  const commentCount = post._count?.comments ?? 0;
  const postImg = post.media?.url;

  const authorAvatar =
    post.author?.name === currentUsername
      ? currentAvatarUrl || DEFAULT_AVATAR
      : post.author?.avatar?.url || DEFAULT_AVATAR;

  postDetailContent.innerHTML = `
    <div class="pd-header">
      <div class="pd-user-profile">
        <img src="${authorAvatar}" alt="profile" />
        <div>
          <div class="author-row">
            <p class="pd-author-name">${post.author?.name || "unknown"}${
    feeling ? ` is ${feeling}` : ""
  }</p>
          </div>
          <span>${new Date(post.created).toLocaleString()}</span>
        </div>
      </div>
    </div>

    <h2 class="pd-title">${post.title || "Untitled Post"}</h2>
    <p class="pd-text">${post.body || ""}</p>
    ${postImg ? `<img src="${postImg}" class="pd-img" alt="post image" />` : ""}

    <div class="pd-activity" data-post-id="${post.id}">
      <button class="pd-like-btn" type="button" aria-pressed="false">
        <i class="fa-solid fa-thumbs-up"></i>
        <span class="pd-like-count">${likeCount}</span>
      </button>
      <button class="pd-comment-count" type="button">
        <i class="fa-solid fa-comment"></i>
        <span class="pd-comment-num">${commentCount}</span>
      </button>
      <button class="pd-share-btn" type="button"><i class="fa-solid fa-share"></i></button>
    </div>

    <div class="pd-write-comment">
      <img src="${
        currentAvatarUrl || DEFAULT_AVATAR
      }" alt="${currentUsername}" />
      <textarea class="pd-comment-textarea" placeholder="write your comment"></textarea>
      <button class="pd-send-comment" type="button" title="Send">
        <i class="fa-solid fa-paper-plane"></i>
      </button>
    </div>

    <div class="pd-comments">
      ${
        Array.isArray(post.comments) && post.comments.length
          ? post.comments
              .map(
                (c) => `
          <div class="pd-comment" data-comment-id="${c.id}">
            <img src="${
              c.author?.name === currentUsername
                ? currentAvatarUrl || DEFAULT_AVATAR
                : c.author?.avatar?.url || DEFAULT_AVATAR
            }" alt="${c.author?.name || "unknown"}" />
            <div>
              <p class="pd-comment-author">${c.author?.name || "unknown"}</p>
              <p class="pd-comment-body">${c.body || ""}</p>
              <span class="pd-comment-time">${new Date(
                c.created
              ).toLocaleString()}</span>
            </div>
          </div>`
              )
              .join("")
          : `<p class="pd-no-comments">No comments yet.</p>`
      }
    </div>
  `;

  setupCommentEmojiUI(postDetailContent, post.id);

  const pdUserProfile = postDetailContent.querySelector(".pd-user-profile");
  if (pdUserProfile && post.author?.name) {
    pdUserProfile.addEventListener("click", () => {
      window.location.href = `user-profile.html?username=${encodeURIComponent(
        post.author.name
      )}`;
    });
  }

  try {
    const pdUserProfileDiv = postDetailContent.querySelector(
      ".pd-user-profile > div"
    );
    if (
      pdUserProfileDiv &&
      post.author?.name &&
      post.author.name !== currentUsername
    ) {
      const pdFollowBtn = document.createElement("button");
      pdFollowBtn.className = "pd-follow-text";
      pdFollowBtn.type = "button";
      pdFollowBtn.dataset.author = post.author.name;

      pdFollowBtn.textContent = "Follow";
      pdFollowBtn.setAttribute("aria-pressed", "false");

      pdFollowBtn.style.fontSize = "0.8rem";
      pdFollowBtn.style.border = "none";
      pdFollowBtn.style.background = "transparent";
      pdFollowBtn.style.cursor = "pointer";

      pdFollowBtn.addEventListener("click", async (e) => {
        e.stopPropagation();
        await toggleFollow(post.author.name, pdFollowBtn);
      });

      pdUserProfileDiv.appendChild(pdFollowBtn);
    }
  } catch (err) {
    console.error("Failed to add follow button in post detail:", err);
  }

  const likeBtn = postDetailContent.querySelector(".pd-like-btn");
  likeBtn?.addEventListener("click", () => toggleLike(post.id, likeBtn));

  const sendBtn = postDetailContent.querySelector(".pd-send-comment");
  const ta = postDetailContent.querySelector(".pd-comment-textarea");
  sendBtn?.addEventListener("click", () => sendComment(post.id, ta));

  ta?.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendComment(post.id, ta);
    }
  });
}
//Deletes a given post from the API and updates the UI accordingly.
async function deletePost(postId) {
  const token = localStorage.getItem("accessToken");
  if (!token || !postId) return;

  try {
    const res = await fetch(
      `https://v2.api.noroff.dev/social/posts/${encodeURIComponent(postId)}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "X-Noroff-API-Key": Noroff_API_Key,
        },
      }
    );

    if (!res.ok) {
      console.error("Failed to delete post:", res.status, res.statusText);
      return;
    }

    const profileFeed = document.querySelector(".profile-post-container");
    if (profileFeed) {
      const myPosts = await fetchPosts(false);
      generatePosts(myPosts, profileFeed);
    }
    // Decrement post count
    if (window.decrementPostCount) window.decrementPostCount();
    if (typeof updateOtherUserPostCount === "function") {
      updateOtherUserPostCount(localStorage.getItem("name"));
    }
    console.log(`Post ${postId} deleted successfully.`);
  } catch (err) {
    console.error("Error deleting post:", err);
  }
}

// close edit container
editCloseBtn.addEventListener("click", () => {
  editPostContainer.classList.remove("active");
  document.body.style.overflow = "";
});

/*****update edit post function******* */
async function updatePost(postId, container) {
  if (!container) {
    container =
      document.querySelector(".post-container") ||
      document.querySelector(".profile-post-container");
    if (!container) return;
  }

  const accessToken = localStorage.getItem("accessToken");
  if (!accessToken) return alert("You must be logged in to edit posts.");

  const updatedPost = {
    title: editTitleInput?.value.trim() || "Untitled Post",
    body: editTextarea?.value.trim() || "",
    media: editImageInput?.value.trim()
      ? { url: editImageInput.value.trim(), alt: "User post image" }
      : null,
  };

  try {
    const response = await fetch(
      `https://v2.api.noroff.dev/social/posts/${postId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
          "X-Noroff-API-Key": Noroff_API_Key,
        },
        body: JSON.stringify(updatedPost),
      }
    );

    if (response.ok) {
      console.log(`Post ${postId} updated successfully`);
      if (editPostContainer) editPostContainer.classList.remove("active");
      document.body.style.overflow = "";
      currentEditingPostId = null;

      // Refresh the appropriate feed
      if (container.classList.contains("post-container")) {
        const allPosts = await fetchPosts(true);
        generatePosts(allPosts, container);
      } else if (container.classList.contains("profile-post-container")) {
        const myPosts = await fetchPosts(false);
        generatePosts(myPosts, container);
      }
    } else {
      const errorData = await response.json();
      console.error("Update failed:", errorData);
      alert("Failed to update post");
    }
  } catch (error) {
    console.error("Error updating post:", error);
  }
}

// show image input when clicking the image icon in edit mode
const editImageIcon = editPostContainer.querySelector(
  ".edit-activity-icons .fa-image"
);

editImageIcon.addEventListener("click", () => {
  editImageInput.style.display = "block";
  editImageInput.focus();
});

// update preview as user types URL
editImageInput.addEventListener("input", () => {
  const url = editImageInput.value.trim();
  if (url) {
    editPreviewImg.src = url;
    editUrlImageDiv.style.display = "block";
  } else {
    editPreviewImg.src = "";
    editUrlImageDiv.style.display = "none";
  }
});

// handle remove image button in edit mode
const editRemoveImgBtn = editPostContainer.querySelector("#edit-remove-img");
editRemoveImgBtn.addEventListener("click", () => {
  editPreviewImg.src = "";
  editImageInput.value = "";
  editUrlImageDiv.style.display = "none";
  editImageInput.style.display = "none";
});

// save button click
saveEditBtn.addEventListener("click", () => {
  if (currentEditingPostId) {
    let container;
    if (document.querySelector(".post-container")) {
      container = document.querySelector(".post-container");
    } else if (document.querySelector(".profile-post-container")) {
      container = document.querySelector(".profile-post-container");
    }
    updatePost(currentEditingPostId, container);
  }
});

// ====== Post Detail support ======
async function sendComment(postId, textareaEl) {
  const text = textareaEl?.value.trim();
  if (!text) return;

  const accessToken = localStorage.getItem("accessToken");
  const currentUserName = localStorage.getItem("name") || "User";

  try {
    const res = await fetch(
      `https://v2.api.noroff.dev/social/posts/${postId}/comment`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
          "X-Noroff-API-Key": Noroff_API_Key,
        },
        body: JSON.stringify({ body: text }),
      }
    );

    if (!res.ok) throw new Error("Comment request failed");
    const json = await res.json();
    const newComment = json.data || {};

    // If API doesn't return author, inject current user info
    if (!newComment.author) {
      newComment.author = {
        name: currentUserName,
        avatar: { url: currentAvatarUrl || DEFAULT_AVATAR },
      };
      newComment.created = new Date().toISOString();
    }

    appendComment(newComment);

    textareaEl.value = "";

    await refreshCountsFromServer(postId);
  } catch (err) {
    console.error("Failed to add comment:", err);
  }
}

function appendComment(c) {
  const commentsEl = postDetailContent.querySelector(".pd-comments");
  if (!commentsEl) return;

  if (commentsEl.querySelector(".pd-no-comments")) commentsEl.innerHTML = "";

  const avatarUrl =
    c.author?.name === localStorage.getItem("name")
      ? currentAvatarUrl || DEFAULT_AVATAR
      : c.author?.avatar?.url || DEFAULT_AVATAR;

  const html = `
    <div class="pd-comment" data-comment-id="${c.id}">
      <img src="${avatarUrl}" alt="${c.author?.name || "User"}" />
      <div>
        <p class="pd-comment-author">${c.author?.name || "User"}</p>
        <p class="pd-comment-body">${c.body || ""}</p>
        <span class="pd-comment-time">${new Date(
          c.created
        ).toLocaleString()}</span>
      </div>
    </div>
  `;
  commentsEl.insertAdjacentHTML("afterbegin", html);
}

async function main() {
  await fetchAndSetAvatar();

  const mainFeedContainer = document.querySelector(".post-container");
  const profileFeedContainer = document.querySelector(
    ".profile-post-container"
  );
  const currentPage = window.location.pathname;

  if (currentPage.includes("login-user.html") && profileFeedContainer) {
    console.log("Login-user page → handled by login-user.js");
  } else if (mainFeedContainer) {
    console.log("Main feed → showing all posts");
    const allPosts = await fetchPosts(true);
    allPostsCache = allPosts.slice();
    generatePosts(allPosts, mainFeedContainer);
    setupFeedSearch(mainFeedContainer);
  } else {
    console.log("No post containers found on this page");
  }
}

main();

// --- Stories re-locator: right-sidebar <-> main-content ---
(function () {
  const storiesWrapper = document.querySelector(".stories-wrapper");
  const rightSidebar = document.querySelector(".right-sidebar");
  const mainContent = document.querySelector(".main-content");
  const writePostSection = document.querySelector(".write-post-section");

  if (!storiesWrapper || !rightSidebar || !mainContent) return;

  const originalParent = storiesWrapper.parentNode;
  const originalNext = storiesWrapper.nextSibling;
  const storiesHeading = storiesWrapper.querySelector("h1");

  function moveToMain() {
    if (storiesHeading) storiesHeading.style.display = "none";
    const ref =
      writePostSection && mainContent.contains(writePostSection)
        ? writePostSection
        : mainContent.firstChild;
    mainContent.insertBefore(storiesWrapper, ref || null);
  }

  function moveBackToRight() {
    if (storiesHeading) storiesHeading.style.display = "block";
    if (originalNext && originalNext.parentNode === originalParent) {
      originalParent.insertBefore(storiesWrapper, originalNext);
    } else {
      originalParent.insertBefore(storiesWrapper, originalParent.firstChild);
    }
  }

  const mq = window.matchMedia("(max-width: 1200px)");
  const apply = () => (mq.matches ? moveToMain() : moveBackToRight());

  apply();

  if (document.readyState === "complete") {
    setTimeout(apply, 0);
  } else {
    window.addEventListener("load", () => setTimeout(apply, 0));
  }

  mq.addEventListener("change", apply);

  let rT;
  window.addEventListener("resize", () => {
    clearTimeout(rT);
    rT = setTimeout(apply, 150);
  });
})();
