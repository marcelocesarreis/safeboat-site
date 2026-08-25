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

// Demo VIB: saúde do motor no app.
// A linha de RMS anda saudável, começa a derivar (padrão de desalinhamento),
// cruza a zona de atenção e o app dispara o alerta preditivo — em loop.
const vibLinha = document.getElementById("vibLinha");
if (vibLinha && !semAnimacao) {
  const zona = document.getElementById("vibZona");
  const zonaTxt = document.getElementById("vibZonaTxt");
  const alerta = document.getElementById("vibAlerta");
  const dias = document.getElementById("vibDias");
  const PONTOS = 90;                     // janela deslizante
  const CICLO = 11000;                   // ms por ciclo completo
  let t0 = performance.now();
  const pts = [];

  const passo = (agora) => {
    const t = ((agora - t0) % CICLO) / CICLO;   // 0..1 dentro do ciclo
    // fase saudável (0–0.45): RMS baixo e estável · deriva (0.45–1): sobe
    const deriva = t < 0.45 ? 0 : Math.pow((t - 0.45) / 0.55, 1.6);
    const rms = 88 - deriva * 62 + Math.sin(agora / 130) * 3 + Math.random() * 2;
    pts.push(rms);
    if (pts.length > PONTOS) pts.shift();
    vibLinha.setAttribute("points", pts.map((y, i) => (i * (300 / (PONTOS - 1))).toFixed(1) + "," + y.toFixed(1)).join(" "));

    const alto = deriva > 0.5;                  // cruzou a zona de atenção
    vibLinha.setAttribute("stroke", alto ? "#C9A34A" : "#8CC63F");
    zona.classList.toggle("alerta", alto);
    zonaTxt.textContent = alto ? "Zona B · Atenção — tendência subindo" : "Zona A · Saudável";
    alerta.classList.toggle("on", deriva > 0.7);
    dias.textContent = alto ? "zona C em ~" + Math.max(4, Math.round(26 - deriva * 22)) + " dias" : "estável";
    requestAnimationFrame(passo);
  };
  requestAnimationFrame(passo);
} else if (vibLinha) {
  // Sem animação: quadro estático já contando a história (deriva + alerta)
  const pts = [];
  for (let i = 0; i < 90; i++) {
    const d = i < 40 ? 0 : Math.pow((i - 40) / 50, 1.6);
    pts.push((i * (300 / 89)).toFixed(1) + "," + (88 - d * 62).toFixed(1));
  }
  vibLinha.setAttribute("points", pts.join(" "));
  vibLinha.setAttribute("stroke", "#C9A34A");
  document.getElementById("vibZona").classList.add("alerta");
  document.getElementById("vibZonaTxt").textContent = "Zona B · Atenção — tendência subindo";
  document.getElementById("vibAlerta").classList.add("on");
  document.getElementById("vibDias").textContent = "zona C em ~9 dias";
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
