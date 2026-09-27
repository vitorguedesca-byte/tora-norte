(() => {
  'use strict';

  const WHATSAPP = '5531986438647';
  const NS = 'http://www.w3.org/2000/svg';
  const calmo = window.matchMedia('(prefers-reduced-motion: reduce)');

  /* ---------- utilidades ---------- */
  const limitar = (v, a, b) => Math.min(b, Math.max(a, v));
  const suave = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const saida = (t) => 1 - Math.pow(1 - t, 3);

  function sorteio(semente) {
    return function () {
      semente = (semente + 0x6d2b79f5) | 0;
      let t = Math.imul(semente ^ (semente >>> 15), 1 | semente);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function el(tag, atributos, pai) {
    const no = document.createElementNS(NS, tag);
    for (const k in atributos) no.setAttribute(k, atributos[k]);
    if (pai) pai.appendChild(no);
    return no;
  }

  const guardado = {
    ler(chave, armazenamento = 'localStorage') {
      try { return window[armazenamento].getItem(chave); } catch { return null; }
    },
    gravar(chave, valor, armazenamento = 'localStorage') {
      try { window[armazenamento].setItem(chave, valor); } catch { /* sem armazenamento: segue sem lembrar */ }
    },
  };

  /* ---------- serragem do corte: leque de pó, lascas que caem e quicam, poeira que se espalha ---------- */
  function serragem(tela) {
    const ctx = tela.getContext('2d');
    const graos = [];
    const cores = ['#f3e4c6', '#e6cc9f', '#d6b27e', '#c29160', '#f8eedb', '#a97b4c'];
    let W = 0, H = 0, chao = Infinity, s = 1;
    const cor = () => cores[(Math.random() * cores.length) | 0];
    const acaso = (a, b) => a + Math.random() * (b - a);
    return {
      medir(alturaChao, escala = 1) {
        W = tela.clientWidth; H = tela.clientHeight;
        chao = alturaChao ?? H;
        s = escala;
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        tela.width = W * dpr; tela.height = H * dpr;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      },
      soltar(x, y) {
        // leque de pó fino: sai da fenda para trás, levemente para cima
        for (let i = 0; i < 6; i++) {
          const ang = Math.PI + acaso(-0.55, 0.3), vel = acaso(1.4, 5.2) * s;
          graos.push({ tipo: 'po', x, y: y + acaso(-1.5, 1.5), vx: Math.cos(ang) * vel, vy: Math.sin(ang) * vel, vida: 0, max: acaso(40, 80), t: acaso(0.8, 2) * s, cor: cor(), peso: 0.1 * s });
        }
        // pó que escorre pelo lábio de baixo e cai rente à casca
        for (let i = 0; i < 2; i++) {
          graos.push({ tipo: 'po', x: x - acaso(0, 10 * s), y: y + 2, vx: -acaso(0.1, 0.7) * s, vy: acaso(0.2, 1) * s, vida: 0, max: acaso(70, 120), t: acaso(0.8, 1.6) * s, cor: cor(), peso: 0.12 * s });
        }
        // lascas: mais pesadas, giram e quicam no chão
        if (Math.random() < 0.4) {
          const ang = Math.PI + acaso(-0.8, 0.1), vel = acaso(1, 3.5) * s;
          graos.push({ tipo: 'lasca', x, y, vx: Math.cos(ang) * vel, vy: Math.sin(ang) * vel, vida: 0, max: acaso(90, 140), w: acaso(2.5, 5.5) * s, h: acaso(1, 2) * s, giro: acaso(0, 6.28), vg: acaso(-0.35, 0.35), cor: cor(), peso: 0.22 * s, quicou: false });
        }
        // poeira macia que se espalha e some
        if (Math.random() < 0.35) {
          graos.push({ tipo: 'poeira', x: x - acaso(0, 8 * s), y: y - acaso(0, 4 * s), vx: -acaso(0.2, 0.7) * s, vy: -acaso(0.05, 0.35) * s, vida: 0, max: acaso(60, 95), r: acaso(2, 4) * s });
        }
      },
      desenhar() {
        ctx.clearRect(0, 0, W, H);
        for (let i = graos.length - 1; i >= 0; i--) {
          const g = graos[i];
          g.vida++;
          if (g.vida > g.max) { graos.splice(i, 1); continue; }
          const resta = 1 - g.vida / g.max;
          if (g.tipo === 'poeira') {
            g.x += g.vx; g.y += g.vy; g.vx *= 0.98; g.r += 0.3 * s;
            const grad = ctx.createRadialGradient(g.x, g.y, 0, g.x, g.y, g.r);
            grad.addColorStop(0, `rgba(235, 218, 188, ${0.16 * resta})`);
            grad.addColorStop(1, 'rgba(235, 218, 188, 0)');
            ctx.globalAlpha = 1;
            ctx.fillStyle = grad;
            ctx.beginPath(); ctx.arc(g.x, g.y, g.r, 0, Math.PI * 2); ctx.fill();
            continue;
          }
          if (g.y < chao) {
            g.vy += g.peso; g.vx *= 0.965; g.x += g.vx; g.y += g.vy;
            if (g.y >= chao) {
              g.y = chao - Math.random() * 1.5 * s;
              if (g.tipo === 'lasca' && !g.quicou) { g.quicou = true; g.vy = -Math.abs(g.vy) * 0.28; g.y = chao - 0.5; g.vx *= 0.5; g.vg *= 0.4; }
              else { g.vy = 0; g.vx *= 0.3; }
            }
          } else { g.vx *= 0.7; g.x += g.vx; }
          ctx.globalAlpha = Math.min(1, resta * 1.8);
          ctx.fillStyle = g.cor;
          if (g.tipo === 'lasca') {
            if (g.y < chao) g.giro += g.vg;
            ctx.save(); ctx.translate(g.x, g.y); ctx.rotate(g.giro); ctx.fillRect(-g.w / 2, -g.h / 2, g.w, g.h); ctx.restore();
          } else {
            ctx.fillRect(g.x, g.y, g.t, g.t);
          }
        }
        ctx.globalAlpha = 1;
        return graos.length;
      },
    };
  }

  /* ---------- a tora do hero: abre e mostra a lista de materiais ---------- */
  function toraDoHero() {
    const tora = document.getElementById('madeiras');
    if (!tora) return;
    const miolo = tora.querySelector('.tora__miolo');
    const titulo = document.getElementById('madeiras-titulo');
    const alternadores = document.querySelectorAll('[data-alternar-tora]');
    const po = serragem(tora.querySelector('.tora__serragem'));

    let aberta = false;
    let ocupada = false;
    miolo.inert = true;

    const topoH = () => document.getElementById('topo').offsetHeight;
    const esperar = (ms) => new Promise((ok) => setTimeout(ok, calmo.matches ? 0 : ms));

    function marcarAlternadores() {
      alternadores.forEach((b) => {
        b.setAttribute('aria-expanded', String(aberta));
        const rotulo = b.querySelector('[data-rotulo]');
        if (rotulo) rotulo.textContent = aberta ? 'Fechar lista de materiais' : 'Montar lista de materiais';
      });
    }

    // deixa a tora logo abaixo do cabeçalho; devolve quanto tempo esperar
    function trazerParaTela() {
      const topo = tora.getBoundingClientRect().top;
      const alvo = topoH() + 16;
      const fora = topo < alvo - 4 || topo > window.innerHeight * 0.3;
      if (!fora) return 0;
      window.scrollTo({ top: window.scrollY + topo - alvo, behavior: calmo.matches ? 'auto' : 'smooth' });
      return Math.min(700, Math.abs(topo - alvo) * 0.6 + 200);
    }

    // a serra entra devagar e embala: come o giz, solta serragem, abre a fenda atrás de si e faz a tora vibrar
    function serrar() {
      if (calmo.matches) { tora.style.setProperty('--corte', '1'); return Promise.resolve(); }
      const kerf = tora.querySelector('.tora__kerf');
      const tela = tora.querySelector('.tora__serragem');
      const giz = tora.querySelector('.tora__giz');
      const ponta = tora.querySelector('.tora__ponta');
      const base = tora.querySelector('.tora__metade--base').getBoundingClientRect();
      const t0 = tela.getBoundingClientRect();
      po.medir(base.bottom - t0.top - base.height * 0.06, limitar(base.height * 2 / 378, 0.45, 1.2));
      tora.classList.add('tora--serrando');
      return new Promise((ok) => {
        const inicio = performance.now();
        const DUR = 1150;
        let terminou = false;
        const passo = (agora) => {
          const p = limitar((agora - inicio) / DUR, 0, 1);
          const e = 0.82 * p + 0.18 * p * p; // começa mais devagar, como a lâmina mordendo a madeira
          tora.style.setProperty('--corte', e.toFixed(4));
          tora.style.setProperty('--fenda', (0.55 * Math.pow(e, 1.6)).toFixed(3));
          if (p < 1) {
            const k = kerf.getBoundingClientRect();
            const t = tela.getBoundingClientRect();
            const lamina = k.left + k.width * e;
            po.soltar(lamina - t.left, k.top - t.top + k.height / 2);
            const gl = giz.getBoundingClientRect().left;
            giz.style.clipPath = `inset(0 0 0 ${Math.max(0, lamina - gl + 3).toFixed(1)}px)`;
            tora.style.setProperty('--vibra', `${((Math.random() - 0.5) * 1.4).toFixed(2)}px`);
            ponta.style.opacity = (0.55 + Math.random() * 0.45).toFixed(2);
          } else if (!terminou) {
            terminou = true;
            ponta.style.opacity = '';
            // a tora assenta quando a lâmina sai
            tora.style.setProperty('--vibra', '1.5px');
            setTimeout(() => tora.style.setProperty('--vibra', '0px'), 90);
            setTimeout(ok, 180);
          }
          const vivos = po.desenhar();
          if (p < 1 || vivos) requestAnimationFrame(passo);
        };
        requestAnimationFrame(passo);
      });
    }

    async function abrir() {
      if (aberta || ocupada) return;
      ocupada = true;
      aberta = true;
      marcarAlternadores();
      await esperar(trazerParaTela());
      tora.classList.add('tora--cortando');
      await serrar();
      tora.classList.add('tora--aberta');
      tora.classList.remove('tora--serrando');
      miolo.inert = false;
      await esperar(750);
      titulo.focus({ preventScroll: true });
      ocupada = false;
    }

    async function fechar() {
      if (!aberta || ocupada) return;
      ocupada = true;
      aberta = false;
      marcarAlternadores();
      miolo.inert = true;
      trazerParaTela();
      tora.classList.remove('tora--aberta');
      await esperar(780);
      tora.classList.remove('tora--cortando');
      tora.style.setProperty('--corte', '0');
      tora.style.setProperty('--fenda', '0');
      tora.querySelector('.tora__giz').style.clipPath = '';
      ocupada = false;
    }

    alternadores.forEach((b) => b.addEventListener('click', () => (aberta ? fechar() : abrir())));
    tora.querySelectorAll('[data-clique-tora]').forEach((m) => m.addEventListener('click', () => (aberta ? fechar() : abrir())));
    tora.querySelectorAll('[data-fechar-tora]').forEach((b) => b.addEventListener('click', async () => {
      await fechar();
      if (alternadores[0]) alternadores[0].focus({ preventScroll: true });
    }));
    miolo.addEventListener('keydown', (e) => { if (e.key === 'Escape') { e.stopPropagation(); fechar(); } });

    // qualquer link para #madeiras (menu, "Montar minha lista") abre a tora
    document.addEventListener('click', (e) => {
      const alvo = e.target.closest('a[href="#madeiras"], [data-mostrar-tora]');
      if (!alvo) return;
      if (alvo.tagName === 'A') e.preventDefault();
      if (aberta) trazerParaTela();
      else setTimeout(abrir, alvo.closest('dialog') ? 60 : 0);
    });
    if (location.hash === '#madeiras') setTimeout(abrir, 400);
  }

  /* ---------- seções das peças, desenhadas em escala ---------- */
  const ESCALA = 3.1; // unidades do desenho por centímetro

  function lerBitola(forma, valor) {
    const n = (valor.match(/[\d,]+/g) || []).map((x) => parseFloat(x.replace(',', '.')));
    if (forma === 'redonda') { const d = Math.max(...n); return { w: d, h: d, redonda: true }; }
    const menor = Math.min(n[0], n[1]), maior = Math.max(n[0], n[1]);
    return forma === 'em-pe' ? { w: menor, h: maior } : { w: maior, h: menor };
  }

  let secoes = 0;
  function desenharSecao(svg, dim) {
    if (!svg.dataset.id) svg.dataset.id = `secao-${++secoes}`;
    const id = svg.dataset.id;
    svg.textContent = '';
    const defs = el('defs', {}, svg);
    const fade = el('radialGradient', { id: `${id}-f`, cx: '0.5', cy: '0.5', r: '0.5' }, defs);
    el('stop', { offset: '0.35', 'stop-color': '#fff' }, fade);
    el('stop', { offset: '1', 'stop-color': '#fff', 'stop-opacity': 0 }, fade);
    const mascara = el('mask', { id: `${id}-m` }, defs);
    el('rect', { width: 120, height: 72, fill: `url(#${id}-f)` }, mascara);
    const grade = el('g', { stroke: '#231a12', 'stroke-opacity': 0.14, 'stroke-width': 0.6, mask: `url(#${id}-m)` }, svg);
    const modulo = ESCALA * 5;
    for (let x = 60 % modulo; x <= 120; x += modulo) el('line', { x1: x, y1: 0, x2: x, y2: 72 }, grade);
    for (let y = 36 % modulo; y <= 72; y += modulo) el('line', { x1: 0, y1: y, x2: 120, y2: y }, grade);

    const w = dim.w * ESCALA, h = dim.h * ESCALA;
    const x = 60 - w / 2, y = 36 - h / 2;
    const clip = el('clipPath', { id }, defs);
    const aneis = [];
    let contornoPeca;
    if (dim.redonda) {
      el('circle', { cx: 60, cy: 36, r: w / 2 }, clip);
      el('circle', { cx: 60, cy: 36, r: w / 2, fill: '#dcae74' }, svg);
      for (let rr = 2.2; rr < w / 2; rr += 2.3) aneis.push([60.8, 35.4, rr]);
      contornoPeca = el('circle', { cx: 60, cy: 36, r: w / 2, fill: 'none', stroke: '#4a3522', 'stroke-width': 2.2 });
    } else {
      el('rect', { x, y, width: w, height: h }, clip);
      el('rect', { x, y, width: w, height: h, fill: '#dcae74' }, svg);
      const miolo = h > w ? { x: 60 + w * 0.3, y: y + h * 1.25 } : { x: 60 + w * 0.08, y: y + h + Math.max(h * 2.2, 14) };
      const longe = Math.hypot(Math.max(Math.abs(x - miolo.x), Math.abs(x + w - miolo.x)), Math.max(Math.abs(y - miolo.y), Math.abs(y + h - miolo.y)));
      for (let rr = 2.4; rr < longe; rr += 2.5) aneis.push([miolo.x, miolo.y, rr]);
      contornoPeca = el('rect', { x, y, width: w, height: h, fill: 'none', stroke: '#231a12', 'stroke-width': 1.1 });
    }
    const g = el('g', { 'clip-path': `url(#${id})`, fill: 'none', stroke: '#9c5b28', 'stroke-opacity': 0.55, 'stroke-width': 0.7 }, svg);
    aneis.forEach(([cx, cy, rr]) => el('circle', { cx, cy, r: rr }, g));
    svg.appendChild(contornoPeca);
    svg._dim = dim;
  }

  function animarSecao(svg, alvo) {
    const de = svg._dim || alvo;
    if (calmo.matches || de.redonda !== alvo.redonda) { desenharSecao(svg, alvo); return; }
    const inicio = performance.now();
    cancelAnimationFrame(svg._quadro);
    const passo = (agora) => {
      const t = saida(limitar((agora - inicio) / 260, 0, 1));
      desenharSecao(svg, { w: de.w + (alvo.w - de.w) * t, h: de.h + (alvo.h - de.h) * t, redonda: alvo.redonda });
      if (t < 1) svg._quadro = requestAnimationFrame(passo);
    };
    svg._quadro = requestAnimationFrame(passo);
  }

  /* ---------- lista de materiais ---------- */
  function listaDeMateriais() {
    const CHAVE = 'tn-lista';
    let itens = [];
    try {
      const salvo = JSON.parse(guardado.ler(CHAVE) || '[]');
      if (Array.isArray(salvo)) itens = salvo.filter((i) => i && i.peca && i.qtd > 0);
    } catch { itens = []; }

    const barra = document.querySelector('.lista-barra');
    const total = barra.querySelector('[data-lista-total]');
    const dialogo = document.querySelector('.romaneio');
    const form = dialogo.querySelector('form');
    const ul = dialogo.querySelector('[data-itens]');
    const vazio = dialogo.querySelector('[data-vazio]');
    const enviar = dialogo.querySelector('[data-enviar]');
    const aviso = dialogo.querySelector('[data-aviso]');

    const descricao = (i) => `${i.peca} ${i.bitola} cm`;
    const comprimento = (i) => i.comp || 'comprimento a definir';

    function mensagem() {
      const linhas = itens.map((i) => `• ${i.qtd} × ${descricao(i)}, ${comprimento(i)}`);
      let texto = `Olá, Tora Norte! Quero um orçamento destes materiais:\n\n${linhas.join('\n')}`;
      const nome = form.elements.nome.value.trim();
      const local = form.elements.local.value.trim();
      const obs = form.elements.obs.value.trim();
      if (nome || local || obs) texto += '\n';
      if (nome) texto += `\nNome: ${nome}`;
      if (local) texto += `\nEntrega em: ${local}`;
      if (obs) texto += `\nObservações: ${obs}`;
      return texto;
    }

    function atualizarEnvio() {
      enviar.href = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(mensagem())}`;
      enviar.setAttribute('aria-disabled', itens.length ? 'false' : 'true');
    }

    function salvar() { guardado.gravar(CHAVE, JSON.stringify(itens)); }

    function desenhar() {
      const n = itens.length;
      total.textContent = n === 1 ? '1 item' : `${n} itens`;
      barra.classList.toggle('lista-barra--ativa', n > 0);
      document.body.classList.toggle('tem-lista', n > 0);
      ul.textContent = '';
      itens.forEach((item, indice) => {
        const li = document.createElement('li');
        const qtd = document.createElement('span');
        qtd.className = 'romaneio__qtd';
        qtd.textContent = item.qtd;
        const desc = document.createElement('div');
        desc.className = 'romaneio__desc';
        const forte = document.createElement('strong');
        forte.textContent = descricao(item);
        const fraco = document.createElement('span');
        fraco.textContent = item.comp ? `${item.comp} de comprimento` : 'Comprimento a definir';
        desc.append(forte, fraco);
        const remover = document.createElement('button');
        remover.type = 'button';
        remover.className = 'romaneio__remover';
        remover.textContent = 'Remover';
        remover.setAttribute('aria-label', `Remover ${descricao(item)} da lista`);
        remover.addEventListener('click', () => {
          itens.splice(indice, 1);
          salvar();
          desenhar();
        });
        li.append(qtd, desc, remover);
        ul.appendChild(li);
      });
      vazio.hidden = n > 0;
      atualizarEnvio();
    }

    function adicionar(novo) {
      const igual = itens.find((i) => i.peca === novo.peca && i.bitola === novo.bitola && i.comp === novo.comp);
      if (igual) igual.qtd = Math.min(999, igual.qtd + novo.qtd);
      else itens.push(novo);
      salvar();
      desenhar();
      barra.classList.remove('lista-barra--pulso');
      void barra.offsetWidth;
      barra.classList.add('lista-barra--pulso');
    }

    document.querySelectorAll('.peca').forEach((linha) => {
      const svg = linha.querySelector('.peca__secao svg');
      const forma = linha.dataset.forma;
      const bitolaAtual = () => linha.querySelector('.bitolas input:checked').value;
      const campoQtd = linha.querySelector('.qtd input');
      const comp = linha.querySelector('select');
      const botao = linha.querySelector('.peca__add');
      const lerQtd = () => limitar(parseInt(campoQtd.value, 10) || 1, 1, 999);

      desenharSecao(svg, lerBitola(forma, bitolaAtual()));
      linha.querySelectorAll('.bitolas input').forEach((radio) => {
        radio.addEventListener('change', () => animarSecao(svg, lerBitola(forma, bitolaAtual())));
      });
      linha.querySelector('[data-menos]').addEventListener('click', () => { campoQtd.value = Math.max(1, lerQtd() - 1); });
      linha.querySelector('[data-mais]').addEventListener('click', () => { campoQtd.value = Math.min(999, lerQtd() + 1); });
      campoQtd.addEventListener('change', () => { campoQtd.value = lerQtd(); });

      let volta;
      botao.addEventListener('click', () => {
        adicionar({ peca: linha.dataset.peca, bitola: bitolaAtual(), comp: comp.value, qtd: lerQtd() });
        campoQtd.value = 1;
        botao.dataset.ok = '';
        botao.textContent = 'Na lista ✓';
        clearTimeout(volta);
        volta = setTimeout(() => { delete botao.dataset.ok; botao.textContent = 'Adicionar'; }, 1600);
      });
    });

    barra.querySelector('[data-abrir-lista]').addEventListener('click', () => {
      aviso.hidden = true;
      atualizarEnvio();
      if (typeof dialogo.showModal === 'function') dialogo.showModal();
      else dialogo.setAttribute('open', '');
    });
    dialogo.addEventListener('click', (e) => { if (e.target === dialogo) dialogo.close(); });
    form.addEventListener('input', atualizarEnvio);
    form.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && e.target.tagName === 'INPUT') e.preventDefault();
    });
    enviar.addEventListener('click', (e) => {
      if (!itens.length) { e.preventDefault(); return; }
      aviso.hidden = false;
    });
    dialogo.querySelector('[data-limpar]').addEventListener('click', () => {
      itens = [];
      salvar();
      desenhar();
      aviso.hidden = true;
    });

    desenhar();
  }

  /* ---------- topo, menu e botão flutuante ---------- */
  function navegacao() {
    const topo = document.getElementById('topo');
    const hero = document.querySelector('.hero');
    const flutuante = document.querySelector('.wa-flutuante');
    const botaoMenu = topo.querySelector('.menu-botao');
    const menu = document.getElementById('menu-movel');
    let aberto = false;
    let pendente = false;

    function aoRolar() {
      pendente = false;
      const y = window.scrollY;
      topo.classList.toggle('topo--solido', y > 24 || aberto);
      flutuante.classList.toggle('wa-flutuante--visivel', y > hero.offsetHeight * 0.7 && !document.body.classList.contains('tem-lista'));
    }
    window.addEventListener('scroll', () => {
      if (!pendente) { pendente = true; requestAnimationFrame(aoRolar); }
    }, { passive: true });

    function alternar(estado) {
      aberto = estado;
      menu.hidden = !estado;
      botaoMenu.setAttribute('aria-expanded', String(estado));
      botaoMenu.textContent = estado ? 'Fechar' : 'Menu';
      aoRolar();
    }
    botaoMenu.addEventListener('click', () => alternar(!aberto));
    menu.addEventListener('click', (e) => { if (e.target.closest('a')) alternar(false); });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && aberto) { alternar(false); botaoMenu.focus(); }
    });
    new MutationObserver(aoRolar).observe(document.body, { attributes: true, attributeFilter: ['class'] });
    aoRolar();
  }

  /* ---------- trilho de projetos ---------- */
  function trilho() {
    const faixa = document.getElementById('trilho');
    if (!faixa) return;
    const [voltar, avancar] = document.querySelectorAll('.trilho__controles .seta');
    const largura = () => {
      const f = faixa.querySelector('figure');
      return f ? f.getBoundingClientRect().width + 20 : 300;
    };
    const mover = (sentido) => faixa.scrollBy({ left: sentido * largura() * 2, behavior: calmo.matches ? 'auto' : 'smooth' });
    voltar.addEventListener('click', () => mover(-1));
    avancar.addEventListener('click', () => mover(1));
    let pendente = false;
    function estado() {
      pendente = false;
      voltar.disabled = faixa.scrollLeft < 8;
      avancar.disabled = faixa.scrollLeft + faixa.clientWidth >= faixa.scrollWidth - 8;
    }
    faixa.addEventListener('scroll', () => {
      if (!pendente) { pendente = true; requestAnimationFrame(estado); }
    }, { passive: true });
    window.addEventListener('resize', estado);
    estado();
  }

  /* ---------- aberto agora? ---------- */
  function situacaoDasLojas() {
    const alvo = document.querySelector('[data-status]');
    if (!alvo) return;
    const HORARIO = { 0: null, 1: [7, 17], 2: [7, 17], 3: [7, 17], 4: [7, 17], 5: [7, 17], 6: [7, 12] };
    const DIAS = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'];
    let dia, minutos;
    try {
      const partes = new Intl.DateTimeFormat('en-US', { timeZone: 'America/Sao_Paulo', weekday: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(new Date());
      const pegar = (tipo) => partes.find((p) => p.type === tipo).value;
      dia = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(pegar('weekday'));
      minutos = parseInt(pegar('hour'), 10) * 60 + parseInt(pegar('minute'), 10);
    } catch {
      const agora = new Date();
      dia = agora.getDay();
      minutos = agora.getHours() * 60 + agora.getMinutes();
    }

    document.querySelectorAll('.horario__tabela tr').forEach((tr) => {
      if (tr.dataset.dias.split(',').includes(String(dia))) tr.setAttribute('data-hoje', '');
    });

    const hoje = HORARIO[dia];
    if (hoje && minutos >= hoje[0] * 60 && minutos < hoje[1] * 60) {
      alvo.textContent = `Aberto agora, fecha às ${hoje[1]}h`;
      alvo.dataset.aberto = 'sim';
      return;
    }
    let proxima = '';
    if (hoje && minutos < hoje[0] * 60) proxima = `abre hoje às ${hoje[0]}h`;
    else {
      for (let k = 1; k <= 7; k++) {
        const d = (dia + k) % 7;
        if (HORARIO[d]) { proxima = k === 1 ? `abre amanhã às ${HORARIO[d][0]}h` : `abre ${DIAS[d]} às ${HORARIO[d][0]}h`; break; }
      }
    }
    alvo.textContent = `Fechado agora, ${proxima}`;
    alvo.dataset.aberto = 'nao';
  }

  /* ---------- rolagem compartilhada (um único rAF por quadro) ---------- */
  const aoRolar = [];
  let rolagemPendente = false;
  function rodarRolagem() {
    rolagemPendente = false;
    aoRolar.forEach((fn) => fn());
  }
  window.addEventListener('scroll', () => {
    if (!rolagemPendente) { rolagemPendente = true; requestAnimationFrame(rodarRolagem); }
  }, { passive: true });
  window.addEventListener('resize', () => requestAnimationFrame(rodarRolagem));

  /* ---------- trena: a fita estica conforme a página rola ---------- */
  function trena() {
    const fita = document.querySelector('.trena');
    if (!fita) return;
    const marcas = fita.querySelector('.trena__marcas');
    const CAIXA = 44;
    let largura = 0;

    function numerar() {
      const w = document.documentElement.clientWidth;
      if (w === largura) return;
      largura = w;
      marcas.textContent = '';
      for (let x = 100, cm = 10; x < w + 100; x += 100, cm += 10) {
        const numero = document.createElement('span');
        numero.style.left = `${x}px`;
        numero.textContent = cm;
        marcas.appendChild(numero);
      }
    }

    function medir() {
      numerar();
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const p = max > 0 ? limitar(window.scrollY / max, 0, 1) : 0;
      fita.style.setProperty('--trena-x', `${(p * (largura - CAIXA)).toFixed(1)}px`);
    }
    aoRolar.push(medir);
    medir();
  }

  /* ---------- antes e depois: a prancha bruta vira mesa ---------- */
  function comparador() {
    const caixa = document.querySelector('[data-comparador]');
    if (!caixa) return;
    const controle = caixa.querySelector('.comparador__controle');
    const posicionar = (v) => caixa.style.setProperty('--pos', `${v}%`);
    let tocou = false;
    controle.addEventListener('input', () => { tocou = true; posicionar(controle.value); });

    // uma dica única de que dá pra arrastar, quando a prancha aparece
    if (calmo.matches || !('IntersectionObserver' in window)) return;
    const observador = new IntersectionObserver((entradas) => {
      if (!entradas[0].isIntersecting) return;
      observador.disconnect();
      const inicio = performance.now();
      const passo = (agora) => {
        if (tocou) return;
        const t = limitar((agora - inicio) / 1600, 0, 1);
        const v = 50 + Math.sin(t * Math.PI * 2) * 22 * (1 - t);
        posicionar(v.toFixed(2));
        controle.value = v;
        if (t < 1) requestAnimationFrame(passo);
      };
      setTimeout(() => requestAnimationFrame(passo), 350);
    }, { threshold: 0.6 });
    observador.observe(caixa);
  }

  /* ---------- anéis: um por ano, até 40, conforme a rolagem ---------- */
  function aneis() {
    const secao = document.getElementById('historia');
    if (!secao) return;
    const svg = secao.querySelector('.aneis__svg');
    const trilho = secao.querySelector('.aneis__trilho');
    const contador = secao.querySelector('[data-contador]');
    const r = sorteio(4040);
    const ANOS = 40, RMAX = 430, PT = 240;
    const miolo = { x: 16, y: -12 };
    const partida = -Math.PI / 3;

    const harmonicos = [2, 3, 5].map((k, i) => ({ k, a: [0.022, 0.013, 0.006][i] * (0.6 + 0.8 * r()), f: r() * Math.PI * 2 }));
    const forma = (th) => 1 + harmonicos.reduce((s, h) => s + h.a * Math.sin(h.k * th + h.f), 0);
    const ponto = (raio, cx, cy, th) => [cx + Math.cos(th) * raio * forma(th), cy + Math.sin(th) * raio * forma(th)];

    const larguras = Array.from({ length: ANOS }, (_, i) => (1.3 - (0.7 * i) / ANOS) * (0.65 + 0.7 * r()));
    const soma = larguras.reduce((a, b) => a + b, 0);
    const aneisSvg = [];
    const marcas = [];
    let raio = 10;

    el('circle', { cx: miolo.x, cy: miolo.y, r: 5, fill: '#efe5cf' }, svg);
    larguras.forEach((l, i) => {
      raio += (l / soma) * (RMAX - 10);
      const k = 1 - raio / RMAX;
      const cx = miolo.x * k, cy = miolo.y * k;
      let d = '';
      for (let j = 0; j <= PT; j++) {
        const [x, y] = ponto(raio, cx, cy, partida + (j / PT) * Math.PI * 2);
        d += `${j ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`;
      }
      const dezena = (i + 1) % 10 === 0;
      const anel = el('path', {
        d,
        class: `aneis__anel${dezena ? ' aneis__anel--dezena' : ''}`,
        pathLength: 1,
        'stroke-dasharray': '1 1',
        'stroke-width': dezena ? 3 : (1 + r() * 1.6).toFixed(2),
        'stroke-opacity': dezena ? 1 : (0.35 + r() * 0.35).toFixed(2),
      }, svg);
      aneisSvg.push(anel);
      if (dezena) {
        const [x, y] = ponto(raio, cx, cy, partida);
        const g = el('g', { class: 'aneis__marca' }, svg);
        el('circle', { cx: x, cy: y, r: 6, fill: '#f2b632' }, g);
        const texto = el('text', { x: x + 14, y: y - 12, 'paint-order': 'stroke', stroke: '#0a1f13', 'stroke-width': 8, 'stroke-linejoin': 'round' }, g);
        texto.textContent = `${i + 1} anos`;
        marcas.push([i + 1, g]);
      }
    });
    let casca = '';
    for (let j = 0; j <= PT; j++) {
      const th = (j / PT) * Math.PI * 2;
      const rr = (RMAX + 16) * forma(th) + 4 * Math.sin(29 * th) + 3 * Math.sin(47 * th);
      casca += `${j ? 'L' : 'M'}${(Math.cos(th) * rr).toFixed(1)} ${(Math.sin(th) * rr).toFixed(1)}`;
    }
    const cascaSvg = el('path', { d: casca + 'Z', class: 'aneis__casca', fill: 'none', stroke: '#efe5cf', 'stroke-opacity': 0.5, 'stroke-width': 7, 'stroke-dasharray': '2 9' }, svg);

    function mostrar(n) {
      aneisSvg.forEach((anel, i) => {
        const f = limitar(n - i, 0, 1);
        if (anel._f === f) return;
        anel._f = f;
        anel.style.strokeDashoffset = String(1 - f);
        anel.style.opacity = f > 0 ? '' : '0';
      });
      marcas.forEach(([ano, g]) => g.classList.toggle('aneis__marca--visivel', n >= ano));
      const completo = n >= ANOS;
      cascaSvg.style.opacity = completo ? '1' : '0';
      contador.textContent = Math.min(ANOS, Math.floor(n + 1e-6));
      secao.classList.toggle('aneis--completo', completo);
    }

    if (calmo.matches) { mostrar(ANOS); return; }
    function medir() {
      // começa quando a seção passa de 60% da tela e termina um pouco antes de soltar o palco
      const antes = window.innerHeight * 0.6;
      const total = trilho.offsetHeight - window.innerHeight + antes;
      const p = total > 0 ? limitar((antes - trilho.getBoundingClientRect().top) / total, 0, 1) : 1;
      mostrar(limitar(p * 1.12, 0, 1) * ANOS);
    }
    aoRolar.push(medir);
    medir();
  }

  /* ---------- início ---------- */
  const ano = document.querySelector('[data-ano]');
  if (ano) ano.textContent = new Date().getFullYear();

  toraDoHero();
  listaDeMateriais();
  navegacao();
  trilho();
  situacaoDasLojas();
  trena();
  comparador();
  aneis();
})();
