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

// Demo VIB: reprodução da interface real de saúde do motor do app
// (anel 0–100, faróis por sistema, tendência e Assistente VIB).
// Quando o telefone entra na tela: o anel enche até 92, os faróis
// aparecem em sequência, a linha de tendência se desenha e a análise
// do assistente surge por último — como o app carregando de verdade.
const vibRing = document.getElementById("vibRingArc");
if (vibRing && !semAnimacao) {
  const CIRC = 283;                       // 2πr do anel (r=45)
  const saudeEl = document.getElementById("vibSaude");
  const linha = document.getElementById("vibLinha");
  const ponta = document.getElementById("vibPonta");
  const compr = linha.getTotalLength();

  // estado inicial: tudo zerado até o telefone aparecer
  vibRing.setAttribute("stroke-dasharray", "0 " + CIRC);
  saudeEl.textContent = "0";
  linha.style.strokeDasharray = compr;
  linha.style.strokeDashoffset = compr;
  ponta.style.opacity = "0";

  const rodar = () => {
    const t0 = performance.now();
    const DUR = 1400;
    const anel = (agora) => {
      const t = Math.min((agora - t0) / DUR, 1);
      const s = 1 - Math.pow(1 - t, 3);
      vibRing.setAttribute("stroke-dasharray", (92 / 100) * CIRC * s + " " + CIRC);
      saudeEl.textContent = Math.round(92 * s);
      if (t < 1) requestAnimationFrame(anel);
    };
    requestAnimationFrame(anel);
    document.querySelectorAll(".vib-chip").forEach((c, i) =>
      setTimeout(() => c.classList.add("in"), 500 + i * 180));
    setTimeout(() => {
      linha.style.transition = "stroke-dashoffset 1.5s ease-out";
      linha.style.strokeDashoffset = "0";
      setTimeout(() => (ponta.style.opacity = "1"), 1400);
    }, 900);
    setTimeout(() => document.getElementById("vibMsg").classList.add("in"), 2400);
  };

  const gatilho = new IntersectionObserver((es) => {
    if (es.some((e) => e.isIntersecting)) { rodar(); gatilho.disconnect(); }
  }, { threshold: 0.45 });
  gatilho.observe(document.querySelector(".vib-fone"));
} else if (vibRing) {
  document.querySelectorAll(".vib-chip").forEach((c) => c.classList.add("in"));
  document.getElementById("vibMsg").classList.add("in");
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
