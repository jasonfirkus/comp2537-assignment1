const form = document.getElementById("signup");

form.addEventListener("submit", (event) => {
  event.preventDefault();
  postSignup(form);
});

async function postSignup(form) {
  const data = new FormData(form);
  const name = data.get("name");
  const email = data.get("email");
  const password = data.get("password");

  try {
    const response = await fetch("/signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, email, password }),
    });
  } catch (error) {
    console.log("Error posting signup", error);
  }
}
