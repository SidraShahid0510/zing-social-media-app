const registrationForm = document.querySelector("#form");
const message = document.querySelector(".message");

async function registerUser(userdetails) {
  try {
    const fetchOptions = {
      method: "POST",
      body: JSON.stringify(userdetails), // ✅ send JSON string
      headers: {
        "Content-Type": "application/json",
      },
    };

    const response = await fetch(
      "https://v2.api.noroff.dev/auth/register",
      fetchOptions
    );
    const result = await response.json(); // ✅ parse response JSON

    if (response.ok) {
      message.textContent = "Registration successful!";
      console.log("User registered:", result);
    } else {
      // Show exact API error
      message.textContent =
        result.errors?.map((err) => err.message).join(", ") ||
        "Something went wrong.";
      console.error("API error:", result);
    }
  } catch (error) {
    // Network or other unexpected errors
    message.textContent = "Network error. Please try again later.";
    console.error("Fetch error:", error);
  }
}

function formSubmit(e) {
  e.preventDefault();

  const formData = new FormData(e.target);
  const formFields = Object.fromEntries(formData);

  const email = formFields.email;
  //basic email check
  if (!email.endsWith("@stud.noroff.no")) {
    message.textContent = "Email must end with @stud.noroff.no";
    return;
  }
  registerUser(formFields);
}

registrationForm.addEventListener("submit", formSubmit);
