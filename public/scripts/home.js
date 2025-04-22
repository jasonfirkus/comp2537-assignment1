async function isAuthenticated() {
  const response = await fetch("/authenticated");

  if (response.ok) {
    return (await response.json()).userInfo;
  } else {
    return false;
  }
}

function convertToAnon() {
  document.querySelector("#container h1").innerHTML = "Please sign up or log in";
  document.querySelectorAll(".member").forEach((link) => {
    link.classList.toggle("hidden");
  });
}

function convertToMember(name) {
  document.getElementById("name").textContent = name;
  document.querySelectorAll(".anon").forEach((link) => {
    link.classList.toggle("hidden");
  });
}

const isAuthResponse = await isAuthenticated();
if (!isAuthResponse) {
  convertToAnon();
} else {
  convertToMember(isAuthResponse.name);
}
