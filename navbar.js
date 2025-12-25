const hamburger = document.getElementById("hamburger");
const navMenu = document.getElementById("navMenu");

/* Hamburger toggle */
hamburger.addEventListener("click", () => {
  navMenu.classList.toggle("active");
});

/* ================= ACTIVE LINK LOGIC ================= */
const currentPage = window.location.pathname.split("/").pop();

const navLinks = document.querySelectorAll(".header-btn");

navLinks.forEach(link => {
  const linkPage = link.getAttribute("href");

  if (linkPage === currentPage || (currentPage === "" && linkPage === "index.html")) {
    link.classList.add("active");
  }
});
