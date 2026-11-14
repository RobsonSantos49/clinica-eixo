(() => {
  const S = window.SITE || {};
  const reduzir = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const celular = matchMedia("(max-width: 760px)").matches;


  /* ── Rolagem que toca o vídeo ─────────────────────────────────────────── */
  const cine = document.querySelector(".cine");
  const canvas = cine && cine.querySelector(".cine-canvas");
  if (cine && canvas && S.frames && S.frames.total) {
    const ctx = canvas.getContext("2d");
    const total = (celular && S.frames.totalMobile) || S.frames.total;
    const padrao = celular ? S.frames.mobile : S.frames.desktop;
    const src = (i) => padrao.replace("{n}", String(i + 1).padStart(4, "0"));
    const quadros = new Array(total);
    const momentos = [...cine.querySelectorAll(".momento")];
    let alvo = 0, atual = 0, desenhado = -1;

    const carregar = (i) => {
      if (quadros[i]) return quadros[i];
      const img = new Image();
      img.decoding = "async";
      img.src = src(i);
      img.onload = () => { if (Math.round(atual) === i || desenhado === -1) desenhar(i, true); };
      return (quadros[i] = img);
    };

    // Carrega em passadas (1 a cada 8, depois 1 a cada 4…) para cobrir o filme inteiro cedo
    carregar(0);
    {
      const fila = [];
      for (const passo of [8, 4, 2, 1]) for (let i = 0; i < total; i += passo) if (!fila.includes(i)) fila.push(i);
      let k = 0;
      const lote = () => { for (let n = 0; n < 6 && k < fila.length; n++) carregar(fila[k++]); if (k < fila.length) setTimeout(lote, 40); };
      lote();
    }

    const pronto = (i) => quadros[i] && quadros[i].complete && quadros[i].naturalWidth;
    const maisProximo = (i) => {
      for (let d = 0; d < total; d++) {
        if (pronto(i - d)) return i - d;
        if (pronto(i + d)) return i + d;
      }
      return -1;
    };

    const ajustar = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(canvas.clientWidth * dpr);
      canvas.height = Math.round(canvas.clientHeight * dpr);
      desenhado = -1;
      desenhar(Math.round(atual), true);
    };

    function desenhar(i, forcar) {
      const j = maisProximo(i);
      if (j < 0 || (j === desenhado && !forcar)) return;
      const img = quadros[j];
      const cw = canvas.width, ch = canvas.height;
      const escala = Math.max(cw / img.naturalWidth, ch / img.naturalHeight); // "cover"
      const w = img.naturalWidth * escala, h = img.naturalHeight * escala;
      ctx.drawImage(img, (cw - w) / 2, (ch - h) / 2, w, h);
      desenhado = j;
    }

    const progresso = () => {
      const r = cine.getBoundingClientRect();
      const curso = cine.offsetHeight - innerHeight;
      return Math.min(1, Math.max(0, -r.top / (curso || 1)));
    };

    const atualizarMomentos = (p) => {
      for (const m of momentos) {
        const de = parseFloat(m.dataset.de || 0), ate = parseFloat(m.dataset.ate || 1);
        m.classList.toggle("ativo", p >= de && (p < ate || (ate >= 1 && p >= 1)));
      }
      cine.classList.toggle("andou", p > 0.02);
    };

    const quadro = () => {
      alvo = progresso() * (total - 1);
      atual += (alvo - atual) * (reduzir ? 1 : 0.18); // suaviza: sensação de filme, não de slide
      if (Math.abs(alvo - atual) < 0.05) atual = alvo;
      desenhar(Math.round(atual));
      atualizarMomentos(atual / (total - 1));
      requestAnimationFrame(quadro);
    };

    addEventListener("resize", ajustar);
    ajustar();
    // Com "reduzir movimento" o vídeo continua: ele só avança quando a pessoa rola (sem suavização)
    requestAnimationFrame(quadro);
  }

  /* ── Parallax leve nas artes ──────────────────────────────────────────── */
  const artes = reduzir ? [] : [...document.querySelectorAll(".arte")];
  if (artes.length) {
    const mover = () => {
      for (const a of artes) {
        const r = a.parentElement.getBoundingClientRect();
        if (r.bottom < 0 || r.top > innerHeight) continue;
        const c = (r.top + r.height / 2 - innerHeight / 2) / innerHeight;
        a.style.transform = `translate3d(0, ${(c * -60).toFixed(1)}px, 0) scale(1.08)`;
      }
    };
    addEventListener("scroll", () => requestAnimationFrame(mover), { passive: true });
    mover();
  }

  /* ── Topo, revelar e ano ──────────────────────────────────────────────── */
  const topo = document.querySelector(".topo");

  // Menu do celular (botão ☰)
  const botaoMenu = document.querySelector(".menu-botao");
  if (topo && botaoMenu) {
    const abrir = (sim) => {
      topo.classList.toggle("aberto", sim);
      botaoMenu.setAttribute("aria-expanded", String(sim));
      botaoMenu.setAttribute("aria-label", sim ? "Fechar menu" : "Abrir menu");
    };
    botaoMenu.addEventListener("click", () => abrir(!topo.classList.contains("aberto")));
    topo.querySelectorAll(".menu a").forEach((a) => a.addEventListener("click", () => abrir(false)));
    addEventListener("keydown", (e) => { if (e.key === "Escape") abrir(false); });
    document.addEventListener("click", (e) => { if (!topo.contains(e.target)) abrir(false); });
  }
  const whats = document.querySelector(".whats");
  let formNaTela = false; // o botão flutuante se recolhe para não cobrir o "Enviar"
  const aoRolar = () => {
    topo && topo.classList.toggle("rolou", scrollY > 40);
    whats && whats.classList.toggle("visivel", scrollY > innerHeight * 0.6 && !formNaTela);
  };
  const formEl = document.querySelector(".form");
  if (formEl) new IntersectionObserver(([e]) => { formNaTela = e.isIntersecting; aoRolar(); }).observe(formEl);
  addEventListener("scroll", aoRolar, { passive: true });
  aoRolar();

  const io = new IntersectionObserver((es) => es.forEach((e) => {
    if (e.isIntersecting) { e.target.classList.add("visto"); io.unobserve(e.target); }
  }), { threshold: 0.18 });
  document.querySelectorAll(".revelar").forEach((el) => io.observe(el));
  document.querySelectorAll("[data-ano]").forEach((el) => (el.textContent = new Date().getFullYear()));

  /* ── WhatsApp ─────────────────────────────────────────────────────────── */
  if (whats && S.whatsapp) {
    const num = String(S.whatsapp.numero || "").replace(/\D/g, "");
    whats.href = `https://wa.me/${num}?text=${encodeURIComponent(S.whatsapp.mensagem || "")}`;
  }
  // Outros botões de WhatsApp na página: <a data-whats data-msg="...">
  if (S.whatsapp) {
    const num = String(S.whatsapp.numero || "").replace(/\D/g, "");
    document.querySelectorAll("[data-whats]").forEach((a) => {
      a.href = `https://wa.me/${num}?text=${encodeURIComponent(a.dataset.msg || S.whatsapp.mensagem || "")}`;
    });
  }

  /* ── Proteção das imagens: bloqueia botão direito e arrastar ──────────── */
  const ehImagem = (el) => el instanceof Element && el.closest("img, canvas, .cine-vinheta");
  document.addEventListener("contextmenu", (e) => { if (ehImagem(e.target)) e.preventDefault(); });
  document.addEventListener("dragstart", (e) => { if (ehImagem(e.target)) e.preventDefault(); });
  document.querySelectorAll("img").forEach((img) => img.setAttribute("draggable", "false"));

  /* ── Redes sociais (endereços no config.js) ───────────────────────────── */
  document.querySelectorAll("[data-rede]").forEach((a) => {
    const url = (S.redes || {})[a.dataset.rede];
    if (url) a.href = url;
    else a.closest("li").remove();
  });

  /* ── Como chegar (endereço no config.js) ──────────────────────────────── */
  document.querySelectorAll("[data-rota]").forEach((a) => {
    const end = encodeURIComponent(S.endereco || "");
    if (!end) return a.closest(".rotas").remove();
    a.href = a.dataset.rota === "waze"
      ? `https://waze.com/ul?q=${end}&navigate=yes`
      : `https://www.google.com/maps/search/?api=1&query=${end}`;
  });

  /* ── Formulário → e-mail ──────────────────────────────────────────────── */
  const form = document.querySelector(".form");
  if (form && S.contato) {
    const status = form.querySelector(".form-status");
    const botao = form.querySelector("button[type=submit]");
    const continuar = form.querySelector(".form-whats");
    const avisar = (txt, tipo) => { status.textContent = txt; status.className = `form-status campo--inteiro ${tipo || ""}`; };

    const abertoEm = Date.now();
    form.addEventListener("submit", async (ev) => {
      ev.preventDefault();
      if (form.elements._honey.value) return; // robô: preencheu o campo invisível
      if (Date.now() - abertoEm < 4000) return; // robô: enviou segundos depois de abrir a página
      let valido = true;
      form.querySelectorAll("[required]").forEach((c) => {
        const ok = c.type === "checkbox" ? c.checked
          : c.type === "email" ? /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(c.value) : c.value.trim().length > 1;
        c.closest(".campo, .consentimento").classList.toggle("erro", !ok);
        if (!ok) valido = false;
      });
      if (!valido) return avisar("Confira os campos destacados e a autorização de uso dos dados.", "falha");

      const dados = Object.fromEntries(new FormData(form));
      delete dados._honey;

      // Depois do envio (deu certo ou não), oferece seguir pelo WhatsApp com a mensagem já escrita
      const seguirNoWhats = () => {
        if (!continuar || !S.whatsapp) return;
        const num = String(S.whatsapp.numero || "").replace(/\D/g, "");
        const nome = dados.nome.trim().split(/\s+/)[0];
        let msg = `Olá! Sou ${nome} e acabei de enviar o formulário do site da ${S.nome || "clínica"} para agendar uma avaliação.`;
        if (dados.mensagem && dados.mensagem.trim()) msg += ` Sobre o que estou sentindo: ${dados.mensagem.trim().slice(0, 300)}`;
        continuar.href = `https://wa.me/${num}?text=${encodeURIComponent(msg)}`;
        continuar.hidden = false;
      };
      const assunto = S.contato.assunto || `Novo contato pelo site ${S.nome || ""}`;
      let url, corpo;
      if (S.contato.web3formsChave) {
        url = "https://api.web3forms.com/submit";
        corpo = { access_key: S.contato.web3formsChave, subject: assunto, from_name: S.nome, ...dados };
      } else {
        url = `https://formsubmit.co/ajax/${encodeURIComponent(S.contato.email)}`;
        corpo = { _subject: assunto, _template: "table", _captcha: "false", ...dados };
      }

      botao.disabled = true;
      avisar("Enviando…");
      try {
        const r = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify(corpo),
        });
        const j = await r.json().catch(() => ({}));
        if (!r.ok || j.success === false || j.success === "false") throw new Error(j.message || r.status);
        form.reset();
        avisar("Recebemos seu contato. Em breve falamos com você. Se quiser agilizar, continue pelo WhatsApp:", "ok");
        seguirNoWhats();
      } catch (e) {
        console.warn("Falha no envio do formulário:", e);
        avisar("Não foi possível enviar agora. Seus dados não se perderam: mande pelo WhatsApp.", "falha");
        seguirNoWhats();
      } finally {
        botao.disabled = false;
      }
    });
  }
})();
