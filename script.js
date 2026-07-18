// Animação de entrada das seções
const observador = new IntersectionObserver(
  (entradas) => {
    for (const entrada of entradas) {
      if (entrada.isIntersecting) {
        entrada.target.classList.add("visivel");
        observador.unobserve(entrada.target);
      }
    }
  },
  { threshold: 0.12 }
);
document.querySelectorAll(".revela").forEach((el) => observador.observe(el));

// Menu móvel
const hamburguer = document.getElementById("hamburguer");
const menu = document.getElementById("menu");
hamburguer.addEventListener("click", () => {
  const aberto = menu.classList.toggle("aberto");
  hamburguer.setAttribute("aria-expanded", String(aberto));
});
menu.querySelectorAll("a").forEach((a) =>
  a.addEventListener("click", () => {
    menu.classList.remove("aberto");
    hamburguer.setAttribute("aria-expanded", "false");
  })
);
