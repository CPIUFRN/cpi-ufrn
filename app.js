/* ─────────────────────────────────────────────
   CPI/UFRN — App de Solicitação de Demandas
   ───────────────────────────────────────────── */

'use strict';

// ─── CATÁLOGO DE PRODUTOS ────────────────────────────────────────────────────

const PRODUTOS = [
  {
    id: 'design_social',
    icon: '🖼️',
    nome: 'Arte para Redes Sociais',
    desc: 'Postagem única para Instagram, Facebook ou outras redes. Ideal para avisos e divulgações pontuais.',
    prazos: { 'arte_unica': 5, 'conjunto_artes': 10 },
    prazoMinimo: 5,
    subtipo: [
      { id: 'arte_unica', label: 'Arte única' },
      { id: 'conjunto_artes', label: 'Conjunto de artes (série)' },
    ],
  },
  {
    id: 'identidade',
    icon: '🎨',
    nome: 'Identidade Visual',
    desc: 'Logo, paleta de cores, tipografia e guia de marca para eventos, projetos ou setores.',
    prazoMinimo: 15,
    subtipo: [
      { id: 'logo_isolado', label: 'Logotipo isolado', prazo: 15 },
      { id: 'identidade_completa', label: 'Identidade visual completa', prazo: 30 },
    ],
  },
  {
    id: 'video',
    icon: '🎬',
    nome: 'Produção de Vídeo',
    desc: 'Vídeos institucionais, de eventos, reels, depoimentos ou tutoriais para qualquer plataforma.',
    prazoMinimo: 5,
    subtipo: [
      { id: 'animacao_logo', label: 'Animação de logo', prazo: 10 },
      { id: 'video_curto_completo', label: 'Vídeo curto (completo)', prazo: 10 },
      { id: 'video_curto_edicao', label: 'Vídeo curto (só edição)', prazo: 5 },
      { id: 'video_longo_completo', label: 'Vídeo longo (completo)', prazo: 20 },
      { id: 'video_longo_edicao', label: 'Vídeo longo (só edição)', prazo: 10 },
    ],
  },
  {
    id: 'fotografia',
    icon: '📷',
    nome: 'Cobertura Fotográfica',
    desc: 'Registro fotográfico de eventos, cerimônias, solenidades e atividades institucionais.',
    prazoMinimo: 7,
    subtipo: [
      { id: 'cobertura_foto', label: 'Cobertura fotográfica', prazo: 7 },
      { id: 'cobertura_av', label: 'Cobertura audiovisual (foto + vídeo)', prazo: 10 },
    ],
  },
  {
    id: 'campanha',
    icon: '📢',
    nome: 'Campanha de Comunicação',
    desc: 'Conjunto integrado de peças para um objetivo específico: lançamento, evento, conscientização.',
    prazoMinimo: 10,
    subtipo: [
      { id: 'campanha_artes', label: 'Campanha (só artes)', prazo: 10 },
      { id: 'campanha_artes_video', label: 'Campanha (artes + vídeo)', prazo: 15 },
      { id: 'campanha_completa', label: 'Campanha completa', prazo: 30 },
    ],
  },
  {
    id: 'colab',
    icon: '🤝',
    nome: 'Colaboração em Publicação',
    desc: 'Revisão, formatação ou apoio para publicações, notícias, releases e textos institucionais.',
    prazoMinimo: 3,
    subtipo: [
      { id: 'colab_publicacao', label: 'Colaboração em publicação', prazo: 3 },
    ],
  },
  {
    id: 'banner',
    icon: '🖥️',
    nome: 'Banner / Material Impresso',
    desc: 'Banners físicos ou digitais, faixas, folders, flyers, cartazes e outros materiais gráficos.',
    prazoMinimo: 5,
    subtipo: [
      { id: 'banner_digital', label: 'Banner digital', prazo: 5 },
      { id: 'material_impresso', label: 'Material impresso (folder, flyer…)', prazo: 7 },
    ],
  },
  {
    id: 'outro',
    icon: '✨',
    nome: 'Outro / Não sei ao certo',
    desc: 'Não encontrou o que precisa? Descreva e nossa equipe vai identificar o melhor formato.',
    prazoMinimo: 5,
    subtipo: [],
  },
];

// Mapa plano de prazo por subtipo id
const PRAZO_POR_SUBTIPO = {};
PRODUTOS.forEach(p => {
  (p.subtipo || []).forEach(s => {
    PRAZO_POR_SUBTIPO[s.id] = s.prazo ?? p.prazoMinimo;
  });
  if (!p.subtipo || p.subtipo.length === 0) {
    PRAZO_POR_SUBTIPO[p.id] = p.prazoMinimo;
  }
});

// ─── ESTADO DA APLICAÇÃO ─────────────────────────────────────────────────────

let state = {
  sessionId: null,
  currentScreen: 0,
  savedAt: null,
  // tela 1
  nome: '', email: '', telefone: '', setor: '', vinculo: '',
  // tela 2
  descricao: '', clareza: '',
  // tela 3
  produtoId: '', subtipoId: '',
  // tela 4
  nomeProjeto: '', objetivo: '', publicoAlvo: '', dataDesejada: '', urgencia: '',
  diasUteis: 0, prazoStatus: '',
  // tela 5
  materiais: [], linkMateriais: '', obsMateriais: '', aprovacao: '',
  // protocolo final
  protocolo: '',
};

// ─── UTILS ───────────────────────────────────────────────────────────────────

function generateSessionId() {
  const year = new Date().getFullYear();
  const num  = String(Math.floor(1000 + Math.random() * 9000));
  return `CPI-${year}-${num}`;
}

function generateProtocol(sessionId) {
  return sessionId || generateSessionId();
}

function countBusinessDays(from, to) {
  let count = 0;
  const d = new Date(from);
  d.setHours(0, 0, 0, 0);
  const end = new Date(to);
  end.setHours(0, 0, 0, 0);
  if (end <= d) return 0;
  const cur = new Date(d);
  cur.setDate(cur.getDate() + 1);
  while (cur <= end) {
    const day = cur.getDay();
    if (day !== 0 && day !== 6) count++;
    cur.setDate(cur.getDate() + 1);
  }
  return count;
}

function getPrazoMinimo() {
  if (state.subtipoId && PRAZO_POR_SUBTIPO[state.subtipoId]) {
    return PRAZO_POR_SUBTIPO[state.subtipoId];
  }
  const prod = PRODUTOS.find(p => p.id === state.produtoId);
  return prod ? prod.prazoMinimo : 5;
}

function avaliarPrazo(dias, minimo) {
  if (dias >= minimo) return 'verde';
  if (dias >= Math.ceil(minimo * 0.6)) return 'amarelo';
  return 'vermelho';
}

function prazoLabel(status) {
  if (status === 'verde')    return '✓ Prazo adequado';
  if (status === 'amarelo')  return '⚠ Prazo apertado';
  return '✕ Prazo crítico';
}

function prazoMsg(dias, minimo, status) {
  const produto = PRODUTOS.find(p => p.id === state.produtoId);
  const nomeProd = produto ? produto.nome : 'este produto';
  if (status === 'verde') {
    return `${dias} dias úteis disponíveis. O prazo mínimo recomendado para ${nomeProd} é de ${minimo} dias úteis. Tudo certo!`;
  }
  if (status === 'amarelo') {
    return `${dias} dias úteis disponíveis. O prazo mínimo recomendado é de ${minimo} dias úteis. Faremos o possível, mas pode ser necessário negociar.`;
  }
  return `${dias} dias úteis disponíveis, mas o mínimo recomendado é de ${minimo} dias úteis. Ao enviar, nossa equipe entrará em contato para alinhar o prazo.`;
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  const [y, m, d] = dateStr.split('-');
  return `${d}/${m}/${y}`;
}

function sanitize(str) {
  if (!str) return '';
  return String(str).replace(/[<>]/g, '');
}

// ─── PERSISTÊNCIA ─────────────────────────────────────────────────────────────

const STORAGE_KEY = 'cpi_demandas_draft';

function saveDraft() {
  const data = { ...state, savedAt: new Date().toISOString() };
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch (_) {}
}

function loadDraft(sessionId) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (data.sessionId !== sessionId) return null;
    if (!data.savedAt) return null;
    const age = (Date.now() - new Date(data.savedAt).getTime()) / 86400000;
    if (age > (CONFIG.app.draftExpiryDays || 30)) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return data;
  } catch (_) { return null; }
}

function clearDraft() {
  try { localStorage.removeItem(STORAGE_KEY); } catch (_) {}
}

// ─── NAVEGAÇÃO ────────────────────────────────────────────────────────────────

function showScreen(n) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const screen = document.getElementById(`screen-${n}`);
  if (screen) {
    screen.classList.add('active');
    window.scrollTo({ top: 0, behavior: 'instant' });
  }
  state.currentScreen = n;
  saveDraft();
}

function goBack(n) {
  showScreen(n);
  populateFormFromState(n);
}

// ─── POPULATE FORMS FROM STATE ────────────────────────────────────────────────

function populateFormFromState(screen) {
  if (screen === 1) {
    setVal('nome', state.nome);
    setVal('email', state.email);
    setVal('telefone', state.telefone);
    setVal('setor', state.setor);
    setRadio('vinculo', state.vinculo);
    checkVinculo();
  }
  if (screen === 2) {
    setVal('descricao', state.descricao);
    updateCharCount('descricao', 'char-descricao', 600);
    setRadio('clareza', state.clareza);
    updateClarityCards();
  }
  if (screen === 3) {
    renderCatalog();
  }
  if (screen === 4) {
    setVal('nome-projeto', state.nomeProjeto);
    setVal('objetivo', state.objetivo);
    setVal('publico', state.publicoAlvo);
    setVal('data-desejada', state.dataDesejada);
    setRadio('urgencia', state.urgencia);
    if (state.dataDesejada) updatePrazoDisplay();
  }
  if (screen === 5) {
    setCheckboxes('materiais', state.materiais);
    setVal('link-materiais', state.linkMateriais);
    setVal('obs-materiais', state.obsMateriais);
    setRadio('aprovacao', state.aprovacao);
  }
}

function setVal(id, val) {
  const el = document.getElementById(id);
  if (el && val !== undefined) el.value = val;
}

function setRadio(name, val) {
  if (!val) return;
  const el = document.querySelector(`input[name="${name}"][value="${val}"]`);
  if (el) el.checked = true;
}

function setCheckboxes(name, vals) {
  document.querySelectorAll(`input[name="${name}"]`).forEach(cb => {
    cb.checked = vals.includes(cb.value);
  });
}

// ─── VALIDAÇÃO ────────────────────────────────────────────────────────────────

function showError(id, msg) {
  const el = document.getElementById(id);
  if (el) { el.textContent = msg; el.style.display = msg ? 'block' : 'none'; }
}

function clearErrors(...ids) {
  ids.forEach(id => showError(id, ''));
}

function markInput(id, hasError) {
  const el = document.getElementById(id);
  if (el) el.classList.toggle('error', hasError);
}

function validateScreen1() {
  let ok = true;
  clearErrors('error-nome','error-email','error-telefone','error-setor','error-vinculo');

  const nome = state.nome.trim();
  if (nome.length < 3) { showError('error-nome', 'Informe seu nome completo.'); markInput('nome', true); ok = false; }
  else markInput('nome', false);

  const email = state.email.trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { showError('error-email', 'Informe um e-mail válido.'); markInput('email', true); ok = false; }
  else markInput('email', false);

  const tel = state.telefone.trim();
  if (tel.length < 8) { showError('error-telefone', 'Informe um telefone válido.'); markInput('telefone', true); ok = false; }
  else markInput('telefone', false);

  if (state.setor.trim().length < 2) { showError('error-setor', 'Informe o setor ou departamento.'); markInput('setor', true); ok = false; }
  else markInput('setor', false);

  if (!state.vinculo) { showError('error-vinculo', 'Selecione seu vínculo com a UFRN.'); ok = false; }

  if (state.vinculo === 'sem_vinculo') {
    document.getElementById('alert-no-vinculo').classList.remove('hidden');
    return false;
  } else {
    document.getElementById('alert-no-vinculo').classList.add('hidden');
  }

  return ok;
}

function validateScreen2() {
  clearErrors('error-descricao','error-clareza');
  let ok = true;
  if (state.descricao.trim().length < 20) {
    showError('error-descricao', 'Descreva sua necessidade com pelo menos 20 caracteres.');
    markInput('descricao', true); ok = false;
  } else markInput('descricao', false);
  if (!state.clareza) { showError('error-clareza', 'Selecione uma opção de clareza.'); ok = false; }
  return ok;
}

function validateScreen3() {
  clearErrors('error-produto');
  if (!state.produtoId) { showError('error-produto', 'Selecione um tipo de produto.'); return false; }
  return true;
}

function validateScreen4() {
  clearErrors('error-nome-projeto','error-objetivo','error-publico','error-data','error-urgencia');
  let ok = true;

  if (state.nomeProjeto.trim().length < 3) {
    showError('error-nome-projeto', 'Informe o nome do projeto.');
    markInput('nome-projeto', true); ok = false;
  } else markInput('nome-projeto', false);

  if (state.objetivo.trim().length < 10) {
    showError('error-objetivo', 'Descreva o objetivo da comunicação.');
    markInput('objetivo', true); ok = false;
  } else markInput('objetivo', false);

  if (state.publicoAlvo.trim().length < 3) {
    showError('error-publico', 'Informe o público-alvo.');
    markInput('publico', true); ok = false;
  } else markInput('publico', false);

  if (!state.dataDesejada) {
    showError('error-data', 'Informe a data de entrega desejada.');
    markInput('data-desejada', true); ok = false;
  } else {
    const sel = new Date(state.dataDesejada + 'T00:00:00');
    const today = new Date(); today.setHours(0,0,0,0);
    if (sel <= today) {
      showError('error-data', 'A data deve ser posterior a hoje.');
      markInput('data-desejada', true); ok = false;
    } else markInput('data-desejada', false);
  }

  if (!state.urgencia) { showError('error-urgencia', 'Selecione o nível de urgência.'); ok = false; }

  return ok;
}

function validateScreen5() {
  clearErrors('error-aprovacao','error-link');
  let ok = true;
  const link = state.linkMateriais.trim();
  if (link && !/^https?:\/\/.+/.test(link)) {
    showError('error-link', 'O link deve começar com http:// ou https://');
    markInput('link-materiais', true); ok = false;
  } else markInput('link-materiais', false);
  if (!state.aprovacao) { showError('error-aprovacao', 'Selecione uma opção de aprovação.'); ok = false; }
  return ok;
}

// ─── LEITURA DE FORMULÁRIOS ───────────────────────────────────────────────────

function readForm1() {
  state.nome      = sanitize(document.getElementById('nome').value);
  state.email     = sanitize(document.getElementById('email').value);
  state.telefone  = sanitize(document.getElementById('telefone').value);
  state.setor     = sanitize(document.getElementById('setor').value);
  const v = document.querySelector('input[name="vinculo"]:checked');
  state.vinculo   = v ? v.value : '';
}

function readForm2() {
  state.descricao = sanitize(document.getElementById('descricao').value);
  const c = document.querySelector('input[name="clareza"]:checked');
  state.clareza   = c ? c.value : '';
}

function readForm4() {
  state.nomeProjeto  = sanitize(document.getElementById('nome-projeto').value);
  state.objetivo     = sanitize(document.getElementById('objetivo').value);
  state.publicoAlvo  = sanitize(document.getElementById('publico').value);
  state.dataDesejada = document.getElementById('data-desejada').value;
  const u = document.querySelector('input[name="urgencia"]:checked');
  state.urgencia     = u ? u.value : '';
}

function readForm5() {
  const checked = [...document.querySelectorAll('input[name="materiais"]:checked')].map(c => c.value);
  state.materiais     = checked;
  state.linkMateriais = sanitize(document.getElementById('link-materiais').value);
  state.obsMateriais  = sanitize(document.getElementById('obs-materiais').value);
  const a = document.querySelector('input[name="aprovacao"]:checked');
  state.aprovacao     = a ? a.value : '';
}

// ─── CATÁLOGO ─────────────────────────────────────────────────────────────────

function renderCatalog() {
  const grid = document.getElementById('catalog-grid');
  grid.innerHTML = '';
  PRODUTOS.forEach(prod => {
    const card = document.createElement('div');
    card.className = 'catalog-card' + (state.produtoId === prod.id ? ' selected' : '');
    card.setAttribute('role', 'option');
    card.setAttribute('aria-selected', state.produtoId === prod.id ? 'true' : 'false');
    card.setAttribute('tabindex', '0');
    card.dataset.id = prod.id;
    card.innerHTML = `
      <span class="catalog-icon">${prod.icon}</span>
      <span class="catalog-name">${prod.nome}</span>
      <span class="catalog-desc">${prod.desc}</span>
    `;
    card.addEventListener('click', () => selectProduct(prod.id));
    card.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); selectProduct(prod.id); } });
    grid.appendChild(card);
  });
}

function selectProduct(id) {
  state.produtoId = id;
  state.subtipoId = '';
  document.querySelectorAll('.catalog-card').forEach(c => {
    const sel = c.dataset.id === id;
    c.classList.toggle('selected', sel);
    c.setAttribute('aria-selected', sel ? 'true' : 'false');
  });
  showError('error-produto', '');
  saveDraft();
}

// ─── PRAZO ────────────────────────────────────────────────────────────────────

function updatePrazoDisplay() {
  if (!state.dataDesejada || !state.produtoId) return;
  const today = new Date(); today.setHours(0,0,0,0);
  const target = new Date(state.dataDesejada + 'T00:00:00');
  const dias = countBusinessDays(today, target);
  const minimo = getPrazoMinimo();
  const status = avaliarPrazo(dias, minimo);

  state.diasUteis   = dias;
  state.prazoStatus = status;

  const display = document.getElementById('prazo-display');
  const badge   = document.getElementById('prazo-badge');
  const msg     = document.getElementById('prazo-msg');

  badge.textContent = prazoLabel(status);
  badge.className   = `prazo-badge ${status}`;
  msg.textContent   = prazoMsg(dias, minimo, status);
  display.classList.remove('hidden');
  saveDraft();
}

// ─── CHAR COUNT ───────────────────────────────────────────────────────────────

function updateCharCount(inputId, countId, max) {
  const input = document.getElementById(inputId);
  const count = document.getElementById(countId);
  if (!input || !count) return;
  const len = input.value.length;
  count.textContent = `${len} / ${max} caracteres`;
  count.style.color = len > max ? 'var(--red)' : 'var(--gray-400)';
}

// ─── CLARITY CARDS ────────────────────────────────────────────────────────────

function updateClarityCards() {
  document.querySelectorAll('.clarity-card').forEach(card => {
    const input = card.querySelector('input[type="radio"]');
    if (input) card.classList.toggle('selected', input.checked);
  });
}

// ─── VÍNCULO ──────────────────────────────────────────────────────────────────

function checkVinculo() {
  const noVin = document.getElementById('alert-no-vinculo');
  if (state.vinculo === 'sem_vinculo') {
    noVin.classList.remove('hidden');
  } else {
    noVin.classList.add('hidden');
  }
}

// ─── REVISÃO ─────────────────────────────────────────────────────────────────

function labelVinculo(v) {
  return { servidor: 'Servidor(a)', discente: 'Discente', sem_vinculo: 'Sem vínculo' }[v] || v;
}
function labelClareza(c) {
  return { claro: 'Bem definido', parcial: 'Tenho uma ideia', incerto: 'Estou em dúvida' }[c] || c;
}
function labelUrgencia(u) {
  return { normal: 'Normal', prioritario: 'Prioritário', urgente: 'Urgente' }[u] || u;
}
function labelAprovacao(a) {
  return { sim: 'Sim', nao: 'Não', nao_sei: 'Não sei' }[a] || a;
}
function labelMateriais(m) {
  const map = { texto: 'Texto / roteiro', fotos: 'Fotos', videos_brutos: 'Vídeos brutos', logo: 'Logo', referencias: 'Referências visuais', nenhum: 'Nenhum' };
  if (!m || m.length === 0) return 'Nenhum informado';
  return m.map(k => map[k] || k).join(', ');
}

function renderReview() {
  const prod = PRODUTOS.find(p => p.id === state.produtoId);
  const prodNome = prod ? prod.nome : '—';
  const subtipo = prod && state.subtipoId ? (prod.subtipo || []).find(s => s.id === state.subtipoId) : null;
  const prodDetalhado = subtipo ? `${prodNome} — ${subtipo.label}` : prodNome;

  const sections = [
    {
      title: 'Identificação',
      screen: 1,
      rows: [
        ['Nome', state.nome],
        ['E-mail', state.email],
        ['Telefone', state.telefone],
        ['Setor', state.setor],
        ['Vínculo', labelVinculo(state.vinculo)],
      ],
    },
    {
      title: 'Necessidade',
      screen: 2,
      rows: [
        ['Descrição', state.descricao],
        ['Clareza', labelClareza(state.clareza)],
      ],
    },
    {
      title: 'Produto solicitado',
      screen: 3,
      rows: [
        ['Produto', prodDetalhado],
      ],
    },
    {
      title: 'Projeto',
      screen: 4,
      rows: [
        ['Nome', state.nomeProjeto],
        ['Objetivo', state.objetivo],
        ['Público-alvo', state.publicoAlvo],
        ['Data desejada', formatDate(state.dataDesejada)],
        ['Prazo (dias úteis)', state.diasUteis ? `${state.diasUteis} dias úteis (${prazoLabel(state.prazoStatus)})` : '—'],
        ['Urgência', labelUrgencia(state.urgencia)],
      ],
    },
    {
      title: 'Materiais',
      screen: 5,
      rows: [
        ['Disponíveis', labelMateriais(state.materiais)],
        ['Link', state.linkMateriais || '—'],
        ['Observações', state.obsMateriais || '—'],
        ['Precisa de aprovação', labelAprovacao(state.aprovacao)],
      ],
    },
  ];

  const container = document.getElementById('review-container');
  container.innerHTML = sections.map(sec => `
    <div class="review-section">
      <div class="review-section-header">
        <span class="review-section-title">${sec.title}</span>
        <button class="review-edit-btn" data-screen="${sec.screen}" aria-label="Editar ${sec.title}">Editar</button>
      </div>
      <div class="review-rows">
        ${sec.rows.map(([k, v]) => `
          <div class="review-row">
            <span class="review-key">${k}</span>
            <span class="review-val">${v || '—'}</span>
          </div>
        `).join('')}
      </div>
    </div>
  `).join('');

  container.querySelectorAll('.review-edit-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const scr = parseInt(btn.dataset.screen, 10);
      goBack(scr);
    });
  });
}

// ─── MONTAGEM DO BRIEFING PARA ENVIO ─────────────────────────────────────────

function buildBriefingText() {
  const prod = PRODUTOS.find(p => p.id === state.produtoId);
  const prodNome = prod ? prod.nome : state.produtoId;
  const subtipo = prod && state.subtipoId ? (prod.subtipo || []).find(s => s.id === state.subtipoId) : null;
  const prodDetalhado = subtipo ? `${prodNome} — ${subtipo.label}` : prodNome;

  return `
PROTOCOLO: ${state.protocolo}
DATA DO ENVIO: ${new Date().toLocaleDateString('pt-BR')}

--- IDENTIFICAÇÃO ---
Nome: ${state.nome}
E-mail: ${state.email}
Telefone: ${state.telefone}
Setor: ${state.setor}
Vínculo UFRN: ${labelVinculo(state.vinculo)}

--- NECESSIDADE ---
Descrição: ${state.descricao}
Clareza sobre a demanda: ${labelClareza(state.clareza)}

--- PRODUTO SOLICITADO ---
Produto: ${prodDetalhado}

--- PROJETO ---
Nome do projeto: ${state.nomeProjeto}
Objetivo: ${state.objetivo}
Público-alvo: ${state.publicoAlvo}
Data de entrega desejada: ${formatDate(state.dataDesejada)}
Dias úteis disponíveis: ${state.diasUteis}
Status do prazo: ${prazoLabel(state.prazoStatus)}
Urgência: ${labelUrgencia(state.urgencia)}

--- MATERIAIS ---
Materiais disponíveis: ${labelMateriais(state.materiais)}
Link de materiais: ${state.linkMateriais || 'Não informado'}
Observações: ${state.obsMateriais || 'Nenhuma'}
Precisa de aprovação: ${labelAprovacao(state.aprovacao)}
`.trim();
}

function buildFormspreePayload() {
  const prod = PRODUTOS.find(p => p.id === state.produtoId);
  const prodNome = prod ? prod.nome : state.produtoId;
  return {
    protocolo:      state.protocolo,
    nome:           state.nome,
    email:          state.email,
    telefone:       state.telefone,
    setor:          state.setor,
    vinculo:        labelVinculo(state.vinculo),
    descricao:      state.descricao,
    clareza:        labelClareza(state.clareza),
    produto:        prodNome,
    subtipo:        state.subtipoId || '',
    nome_projeto:   state.nomeProjeto,
    objetivo:       state.objetivo,
    publico_alvo:   state.publicoAlvo,
    data_desejada:  formatDate(state.dataDesejada),
    dias_uteis:     String(state.diasUteis),
    prazo_status:   prazoLabel(state.prazoStatus),
    urgencia:       labelUrgencia(state.urgencia),
    materiais:      labelMateriais(state.materiais),
    link_materiais: state.linkMateriais || '',
    observacoes:    state.obsMateriais || '',
    aprovacao:      labelAprovacao(state.aprovacao),
    _subject:       `[${state.protocolo}] Nova demanda CPI/UFRN — ${prodNome}`,
    briefing_completo: buildBriefingText(),
  };
}

// ─── FORMSPREE ────────────────────────────────────────────────────────────────

async function sendToFormspree(payload) {
  const resp = await fetch(CONFIG.formspree.endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!resp.ok) {
    const err = await resp.json().catch(() => ({}));
    throw new Error(err.error || `Formspree error ${resp.status}`);
  }
  return resp.json();
}

// ─── TRELLO ───────────────────────────────────────────────────────────────────

async function getTrelloListId() {
  const { apiKey, token, boardId, listName } = CONFIG.trello;
  const url = `https://api.trello.com/1/boards/${boardId}/lists?key=${apiKey}&token=${token}`;
  const resp = await fetch(url);
  if (!resp.ok) throw new Error(`Trello lists error ${resp.status}`);
  const lists = await resp.json();
  const found = lists.find(l =>
    l.name.toLowerCase().includes('recebida') ||
    l.name === listName
  );
  return found ? found.id : (lists[0] ? lists[0].id : null);
}

async function createTrelloCard(briefing) {
  const { apiKey, token } = CONFIG.trello;
  const listId = await getTrelloListId();
  if (!listId) throw new Error('Lista do Trello não encontrada.');

  const prod = PRODUTOS.find(p => p.id === state.produtoId);
  const prodNome = prod ? prod.nome : state.produtoId;
  const cardName = `[${state.protocolo}] ${prodNome} — ${state.nomeProjeto}`;

  const params = new URLSearchParams({
    idList: listId,
    name:   cardName,
    desc:   briefing,
    due:    state.dataDesejada ? new Date(state.dataDesejada + 'T12:00:00').toISOString() : '',
    key:    apiKey,
    token:  token,
  });

  const resp = await fetch(`https://api.trello.com/1/cards?${params}`, { method: 'POST' });
  if (!resp.ok) {
    const err = await resp.json().catch(() => ({}));
    throw new Error(err.message || `Trello card error ${resp.status}`);
  }
  return resp.json();
}

// ─── ENVIO ────────────────────────────────────────────────────────────────────

function setOverlayMsg(msg) {
  const el = document.getElementById('submit-overlay-msg');
  if (el) el.textContent = msg;
}

async function submitForm() {
  const btn = document.getElementById('btn-submit');
  const overlay = document.getElementById('submit-overlay');
  btn.disabled = true;
  overlay.classList.remove('hidden');

  try {
    setOverlayMsg('Enviando sua solicitação…');
    const payload = buildFormspreePayload();
    await sendToFormspree(payload);

    setOverlayMsg('Registrando no sistema…');
    const briefing = buildBriefingText();
    try {
      await createTrelloCard(briefing);
    } catch (trelloErr) {
      console.warn('Trello card não criado:', trelloErr);
      // não bloqueia o fluxo se o Trello falhar
    }

    overlay.classList.add('hidden');
    clearDraft();
    showConfirmation();
  } catch (err) {
    overlay.classList.add('hidden');
    btn.disabled = false;
    alert(`Ocorreu um erro ao enviar sua solicitação. Por favor, tente novamente.\n\nDetalhe: ${err.message}`);
  }
}

function showConfirmation() {
  document.getElementById('protocol-number').textContent = state.protocolo;

  const prod = PRODUTOS.find(p => p.id === state.produtoId);
  const prodNome = prod ? prod.nome : '—';

  document.getElementById('confirm-details').innerHTML = `
    <p><strong>${state.nome}</strong></p>
    <p>${state.email}</p>
    <p>${prodNome} · ${state.nomeProjeto}</p>
    <p>Data desejada: ${formatDate(state.dataDesejada)}</p>
  `;

  showScreen(7);
}

// ─── SESSION CHIP ─────────────────────────────────────────────────────────────

function updateSessionChip() {
  const chip = document.getElementById('session-chip');
  if (!chip || !state.sessionId) return;
  chip.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" width="14" height="14" aria-hidden="true"><path fill-rule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clip-rule="evenodd" /></svg> Código de rascunho: <strong>${state.sessionId}</strong>`;
}

// ─── INICIALIZAÇÃO ────────────────────────────────────────────────────────────

function initApp() {
  // Tela 0 — entrada
  document.getElementById('btn-start').addEventListener('click', () => {
    state.sessionId = generateSessionId();
    saveDraft();
    updateSessionChip();
    showScreen(1);
    populateFormFromState(1);
  });

  document.getElementById('btn-resume').addEventListener('click', () => {
    const box = document.getElementById('resume-box');
    box.classList.toggle('hidden');
    if (!box.classList.contains('hidden')) {
      document.getElementById('resume-code').focus();
    }
  });

  document.getElementById('btn-resume-confirm').addEventListener('click', () => {
    const code = document.getElementById('resume-code').value.trim().toUpperCase();
    if (!code) return;
    const draft = loadDraft(code);
    if (!draft) {
      alert('Nenhum rascunho encontrado para este código, ou ele já expirou (30 dias).');
      return;
    }
    Object.assign(state, draft);
    updateSessionChip();
    showScreen(state.currentScreen || 1);
    populateFormFromState(state.currentScreen || 1);
  });

  document.getElementById('resume-code').addEventListener('keydown', e => {
    if (e.key === 'Enter') document.getElementById('btn-resume-confirm').click();
  });

  // Tela 1 — identificação
  ['nome','email','telefone','setor'].forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener('input', () => {
      state[id === 'nome' ? 'nome' : id === 'email' ? 'email' : id === 'telefone' ? 'telefone' : 'setor'] = sanitize(el.value);
      saveDraft();
    });
  });

  document.querySelectorAll('input[name="vinculo"]').forEach(radio => {
    radio.addEventListener('change', () => {
      state.vinculo = radio.value;
      checkVinculo();
      saveDraft();
    });
  });

  document.getElementById('btn-next-1').addEventListener('click', () => {
    readForm1();
    if (!validateScreen1()) return;
    showScreen(2);
    populateFormFromState(2);
  });

  // Tela 2 — diagnóstico
  const descEl = document.getElementById('descricao');
  if (descEl) {
    descEl.addEventListener('input', () => {
      state.descricao = sanitize(descEl.value);
      updateCharCount('descricao', 'char-descricao', 600);
      saveDraft();
    });
  }

  document.querySelectorAll('input[name="clareza"]').forEach(radio => {
    radio.addEventListener('change', () => {
      state.clareza = radio.value;
      updateClarityCards();
      saveDraft();
    });
  });

  document.getElementById('btn-next-2').addEventListener('click', () => {
    readForm2();
    if (!validateScreen2()) return;
    showScreen(3);
    renderCatalog();
  });

  // Tela 3 — catálogo
  document.getElementById('btn-next-3').addEventListener('click', () => {
    if (!validateScreen3()) return;
    showScreen(4);
    populateFormFromState(4);
  });

  // Tela 4 — dados do projeto
  ['nome-projeto', 'objetivo', 'publico'].forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener('input', () => {
      const key = id === 'nome-projeto' ? 'nomeProjeto' : id === 'objetivo' ? 'objetivo' : 'publicoAlvo';
      state[key] = sanitize(el.value);
      saveDraft();
    });
  });

  const dataEl = document.getElementById('data-desejada');
  if (dataEl) {
    // set min to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    dataEl.min = tomorrow.toISOString().split('T')[0];

    dataEl.addEventListener('change', () => {
      state.dataDesejada = dataEl.value;
      updatePrazoDisplay();
      saveDraft();
    });
  }

  document.querySelectorAll('input[name="urgencia"]').forEach(radio => {
    radio.addEventListener('change', () => { state.urgencia = radio.value; saveDraft(); });
  });

  document.getElementById('btn-next-4').addEventListener('click', () => {
    readForm4();
    if (!validateScreen4()) return;
    showScreen(5);
    populateFormFromState(5);
  });

  // Tela 5 — materiais
  document.querySelectorAll('input[name="materiais"]').forEach(cb => {
    cb.addEventListener('change', () => {
      readForm5();
      saveDraft();
    });
  });

  const linkEl = document.getElementById('link-materiais');
  if (linkEl) linkEl.addEventListener('input', () => { state.linkMateriais = sanitize(linkEl.value); saveDraft(); });

  const obsEl = document.getElementById('obs-materiais');
  if (obsEl) obsEl.addEventListener('input', () => { state.obsMateriais = sanitize(obsEl.value); saveDraft(); });

  document.querySelectorAll('input[name="aprovacao"]').forEach(radio => {
    radio.addEventListener('change', () => { state.aprovacao = radio.value; saveDraft(); });
  });

  document.getElementById('btn-next-5').addEventListener('click', () => {
    readForm5();
    if (!validateScreen5()) return;
    state.protocolo = generateProtocol(state.sessionId);
    renderReview();
    showScreen(6);
  });

  // Tela 6 — revisão
  document.getElementById('btn-submit').addEventListener('click', () => {
    submitForm();
  });

  // Tela 7 — confirmação
  document.getElementById('btn-copy-protocol').addEventListener('click', () => {
    const num = state.protocolo;
    if (!num) return;
    navigator.clipboard.writeText(num).then(() => {
      const btn = document.getElementById('btn-copy-protocol');
      const orig = btn.innerHTML;
      btn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" width="16" height="16"><path fill-rule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clip-rule="evenodd" /></svg>';
      setTimeout(() => { btn.innerHTML = orig; }, 2000);
    }).catch(() => {});
  });

  document.getElementById('btn-new-request').addEventListener('click', () => {
    state = {
      sessionId: generateSessionId(),
      currentScreen: 0,
      savedAt: null,
      nome: '', email: '', telefone: '', setor: '', vinculo: '',
      descricao: '', clareza: '',
      produtoId: '', subtipoId: '',
      nomeProjeto: '', objetivo: '', publicoAlvo: '', dataDesejada: '', urgencia: '',
      diasUteis: 0, prazoStatus: '',
      materiais: [], linkMateriais: '', obsMateriais: '', aprovacao: '',
      protocolo: '',
    };
    // reset all forms
    document.querySelectorAll('.input').forEach(el => { el.value = ''; el.classList.remove('error'); });
    document.querySelectorAll('input[type="radio"]').forEach(el => { el.checked = false; });
    document.querySelectorAll('input[type="checkbox"]').forEach(el => { el.checked = false; });
    document.getElementById('prazo-display').classList.add('hidden');
    document.getElementById('alert-no-vinculo').classList.add('hidden');
    document.getElementById('resume-box').classList.add('hidden');
    showScreen(0);
  });

  // Botões "Voltar" via data-back
  document.querySelectorAll('[data-back]').forEach(btn => {
    btn.addEventListener('click', () => {
      const target = parseInt(btn.dataset.back, 10);
      goBack(target);
    });
  });

  // Renderizar catálogo inicial (para quando a tela for mostrada)
  renderCatalog();
}

document.addEventListener('DOMContentLoaded', initApp);
