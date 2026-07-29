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

// Contagem dos números quando entram na tela
// Sobe de zero até o valor em 2s, desacelerando no fim — dá a sensação de
// ocorrências se acumulando, que é o ponto desses indicadores.
const DURACAO = 2000;
const semAnimacao = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const numeros = document.querySelectorAll("[data-contar]");
const escrever = (el, n) =>
  (el.textContent =
    (el.dataset.antes || "") + n.toLocaleString("pt-BR") + (el.dataset.depois || ""));

// Sem animação, o HTML já traz o valor final — nada a fazer.
if (!semAnimacao && numeros.length) {
  // Zera antes da primeira pintura, senão o valor final pisca no hero.
  numeros.forEach((el) => escrever(el, 0));

  const contar = (el) => {
    const alvo = Number(el.dataset.contar);
    if (!Number.isFinite(alvo)) return;
    const inicio = performance.now();
    const passo = (agora) => {
      const t = Math.min((agora - inicio) / DURACAO, 1);
      escrever(el, Math.round(alvo * (1 - Math.pow(1 - t, 3)))); // desacelera no fim
      if (t < 1) requestAnimationFrame(passo);
    };
    requestAnimationFrame(passo);
  };

  const contador = new IntersectionObserver(
    (entradas) => {
      for (const entrada of entradas) {
        if (!entrada.isIntersecting) continue;
        contar(entrada.target);
        contador.unobserve(entrada.target);
      }
    },
    { threshold: 0.6 }
  );
  numeros.forEach((el) => contador.observe(el));
}

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
