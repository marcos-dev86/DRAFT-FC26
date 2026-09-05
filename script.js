// ===== script.js =====

const state = {
  jogadoresDisponivel: [],       // jogadores ainda não escolhidos
  times: {
    1: { nome: "Jogador 1", elenco: {}, capitaoSlot: null, tecnico: null },
    2: { nome: "Jogador 2", elenco: {}, capitaoSlot: null, tecnico: null }
  },
  turnoAtual: 1,             // jogador 1 ou 2
  candidatosAtuais: [],      // as até 4 cartas sorteadas na rodada atual
  jogadorSelecionado: null,  // carta escolhida, aguardando posicionamento

  // ---- Sistema de Capitão ----
  modoEscolhaCapitao: true,     // true enquanto os 2 times ainda não escolheram capitão
  capitaoEmPosicionamento: false, // true quando a carta em posicionamento é um capitão
  capitaoCandidatosExibidos: [], // jogadores já oferecidos como opção de capitão (evita repetir entre J1 e J2)

  // ---- Sistema de Técnico ----
  modoEscolhaTecnico: false,  // true depois que os 2 times já escolheram capitão, até os 2 escolherem técnico
  tecnicosDisponiveis: [],    // lista carregada de tecnicos.json
  tecnicosEscolhidos: []      // técnicos já escolhidos (não aparecem de novo pro outro time)
};

const el = {
  telaInicio: document.getElementById("tela-inicio"),
  telaDraft: document.getElementById("tela-draft"),
  telaResultado: document.getElementById("tela-resultado"),
  btnJogar: document.getElementById("btn-jogar"),
  btnNovoDraft: document.getElementById("btn-novo-draft"),
  indicadorVez: document.getElementById("indicador-vez"),
  slotAtualLabel: document.getElementById("slot-atual-label"),
  cardsContainer: document.getElementById("cards-container"),
  progressoJ1: document.getElementById("progresso-j1"),
  progressoJ2: document.getElementById("progresso-j2"),
  resultadoTimes: document.getElementById("resultado-times"),
  posicionamentoContainer: document.getElementById("posicionamento-container"),
  cartaSelecionada: document.getElementById("carta-selecionada"),
  btnVoltarCarta: document.getElementById("btn-voltar-carta")
};

el.btnJogar.addEventListener("click", iniciarDraft);

el.btnNovoDraft.addEventListener("click", function () {
  mostrarTela("inicio");
});

el.btnVoltarCarta.addEventListener("click", function () {
  // Se o usuário estava posicionando um CAPITÃO e voltou atrás, o capitão
  // volta para o pool e as opções de capitão são exibidas novamente.
  if (state.capitaoEmPosicionamento) {
    if (state.jogadorSelecionado) {
      state.jogadorSelecionado.isCapitao = false;
      state.jogadoresDisponivel.push(state.jogadorSelecionado);
    }
    state.jogadorSelecionado = null;
    state.capitaoEmPosicionamento = false;
    esconderPosicionamento();
    iniciarEscolhaCapitao();
    return;
  }

  state.jogadorSelecionado = null;
  esconderPosicionamento();
  el.slotAtualLabel.textContent = "Escolha uma carta para o seu time";
});

// 
function mostrarTela(nome) {
  el.telaInicio.classList.toggle("ativa", nome === "inicio");
  el.telaDraft.classList.toggle("ativa", nome === "draft");
  el.telaResultado.classList.toggle("ativa", nome === "resultado");
}

async function iniciarDraft() {
  const jogadoresBase = await pegaJogadores();
  const tecnicosCarregados = await pegaTecnicos();

  state.jogadoresDisponivel = jogadoresBase.slice();

  state.times[1] = {
    nome: "Jogador 1",
    elenco: {},
    capitaoSlot: null,
    tecnico: null
  };

  state.times[2] = {
    nome: "Jogador 2",
    elenco: {},
    capitaoSlot: null,
    tecnico: null
  };
  state.turnoAtual = 1;
  state.jogadorSelecionado = null;
  state.modoEscolhaCapitao = true;
  state.capitaoEmPosicionamento = false;
  state.capitaoCandidatosExibidos = [];
  state.modoEscolhaTecnico = false;
  state.tecnicosDisponiveis = tecnicosCarregados;
  state.tecnicosEscolhidos = [];

  mostrarTela("draft");
  esconderPosicionamento();
  iniciarEscolhaCapitao();
}

function alternarTurno() {
  if (state.turnoAtual === 1) {
    state.turnoAtual = 2;
  } else {
    state.turnoAtual = 1;
  }
}

// ===== SISTEMA DE CAPITÃO =====
// Antes do draft normal começar, cada time escolhe 1 capitão dentre os
// jogadores marcados como "capitaoElegivel" no JSON. Reaproveita o mesmo
// fluxo de "escolher carta -> posicionar no campo" do draft normal.
function iniciarEscolhaCapitao() {
  let elegiveis = [];
  for (let i = 0; i < state.jogadoresDisponivel.length; i++) {
    const j = state.jogadoresDisponivel[i];
    if (j.capitaoElegivel && !state.capitaoCandidatosExibidos.includes(j)) {
      elegiveis.push(j);
    }
  }
  elegiveis.sort(function (a, b) {
    return b.overall_base - a.overall_base;
  });
  const candidatos = elegiveis.slice(0, nCapitao);

  // marca esses jogadores como "já oferecidos", pra nunca aparecerem
  // de novo como opção de capitão para o outro jogador
  for (let i = 0; i < candidatos.length; i++) {
    state.capitaoCandidatosExibidos.push(candidatos[i]);
  }

  if (candidatos.length === 0) {
    // segurança: se não sobrar nenhum candidato configurado no JSON,
    // pula a escolha de capitão para este time sem travar o jogo.
    if (state.turnoAtual === 1) {
      state.turnoAtual = 2;
      iniciarEscolhaCapitao();
    } else {
      state.modoEscolhaCapitao = false;
      state.turnoAtual = 1;
      proximaRodada();
    }
    return;
  }

  el.cardsContainer.classList.remove("oculto");
  el.indicadorVez.textContent = "Vez de: " + state.times[state.turnoAtual].nome + " — Escolha o Capitão";
  el.indicadorVez.className = "indicador-vez j" + state.turnoAtual;
  el.slotAtualLabel.textContent = "Escolha o CAPITÃO da sua seleção";

  renderizarCandidatosCapitao(candidatos);
}

function renderizarCandidatosCapitao(candidatos) {
  el.cardsContainer.innerHTML = "";
  el.cardsContainer.classList.add("cards-capitao");

  for (let i = 0; i < candidatos.length; i++) {
    const jogador = candidatos[i];
    const attrs = pegaAttr(jogador.posicao);

    let attrsHTML = "";
    for (let a = 0; a < attrs.length; a++) {
      const chave = attrs[a];
      attrsHTML += "<span><b>" + atributos[chave] + "</b> " + jogador.atributos[chave] + "</span>";
    }

    const card = document.createElement("button");
    card.className = "card-jogador card-capitao-opcao";
    card.innerHTML = cartaHTML(jogador) +
      '<div class="card-atributos">' + attrsHTML + '</div>' +
      '<div class="selo-capitao-opcao">Tornar Capitão</div>';

    card.addEventListener("click", function () {
      escolherCapitao(jogador);
    });
    el.cardsContainer.appendChild(card);
  }
}

function escolherCapitao(jogador) {
  state.jogadorSelecionado = jogador;
  state.capitaoEmPosicionamento = true;

  let restante = [];
  for (let i = 0; i < state.jogadoresDisponivel.length; i++) {
    if (state.jogadoresDisponivel[i] !== jogador) restante.push(state.jogadoresDisponivel[i]);
  }
  state.jogadoresDisponivel = restante;

  renderizarPosicionamento(jogador);
}

// ===== SISTEMA DE TÉCNICO =====
// Depois que os 2 times já escolheram capitão, cada um escolhe 1 técnico
// (Pep, Ancelotti, Zidane, etc.) dentro de tecnicos.json. Diferente do
// capitão, aqui não há posicionamento no campo: a escolha já efetiva o
// técnico direto no time. O técnico escolhido por um time nunca aparece
// como opção para o outro (evita repetir o mesmo treinador nos 2 lados).
function iniciarEscolhaTecnico() {
  state.modoEscolhaTecnico = true;

  let disponiveis = [];
  for (let i = 0; i < state.tecnicosDisponiveis.length; i++) {
    const t = state.tecnicosDisponiveis[i];
    if (!state.tecnicosEscolhidos.includes(t)) disponiveis.push(t);
  }
  disponiveis.sort(function () {
    return Math.random() - 0.5;
  });
  const candidatos = disponiveis.slice(0, nTecnico);

  el.cardsContainer.classList.remove("oculto");
  el.indicadorVez.textContent = "Vez de: " + state.times[state.turnoAtual].nome + " — Escolha o Técnico";
  el.indicadorVez.className = "indicador-vez j" + state.turnoAtual;
  el.slotAtualLabel.textContent = "Escolha o TÉCNICO da sua seleção";

  renderizarCandidatosTecnico(candidatos);
}

function renderizarCandidatosTecnico(candidatos) {
  el.cardsContainer.innerHTML = "";
  el.cardsContainer.classList.remove("cards-capitao");
  el.cardsContainer.classList.add("cards-tecnico");

  for (let i = 0; i < candidatos.length; i++) {
    const tecnico = candidatos[i];
    const card = document.createElement("button");
    card.className = "card-tecnico-opcao";
    card.innerHTML = tecnicoCardHTML(tecnico) + '<div class="selo-tecnico-opcao">Escolher Técnico</div>';
    card.addEventListener("click", function () {
      escolherTecnico(tecnico);
    });
    el.cardsContainer.appendChild(card);
  }
}

function tecnicoCardHTML(tecnico) {
  return `
    <div class="tecnico-card">
      <span class="tecnico-tipo tecnico-tipo--${tipoSlug(tecnico.tipo)}">${tecnico.tipo}</span>
      <img class="tecnico-foto" src="${tecnico.foto}" alt="${tecnico.nome}" onerror="fbFoto(this)">
      <div class="tecnico-ger">${tecnico.ger}</div>
      <h3 class="tecnico-nome">${tecnico.nome}</h3>
      <span class="tecnico-nacionalidade">${tecnico.nacionalidade}</span>
      <p class="tecnico-estilo">${tecnico.estilo}</p>
    </div>
  `;
}

// Efetiva a escolha do técnico: aplica o bonus dele nos jogadores do time
// que já foram escalados (até agora, só o capitão) e passa a vez.
function escolherTecnico(tecnico) {
  const time = state.times[state.turnoAtual];
  time.tecnico = tecnico;
  state.tecnicosEscolhidos.push(tecnico);

  const jogadoresDoTime = Object.values(time.elenco);
  for (let i = 0; i < jogadoresDoTime.length; i++) {
    const jogadorEscalado = jogadoresDoTime[i];
    const bonus = bonusTec(jogadorEscalado, tecnico);
    if (bonus) {
      let novaNota = jogadorEscalado.ger + bonus;
      if (novaNota > 99) novaNota = 99;
      if (novaNota < 1) novaNota = 1;
      jogadorEscalado.ger = novaNota;
      jogadorEscalado.bonusTecnico = bonus;
    }
  }

  if (state.turnoAtual === 1) {
    state.turnoAtual = 2;
    iniciarEscolhaTecnico();
  } else {
    finalizarEscolhaTecnico();
  }
}

function finalizarEscolhaTecnico() {
  state.modoEscolhaTecnico = false;
  state.turnoAtual = 1;
  el.cardsContainer.classList.remove("cards-tecnico");
  proximaRodada();
}

// Retorna os slots (titulares + reservas) que ainda estão vazios para um time
function obterSlotsAbertos(numJogador) {
  const elenco = state.times[numJogador].elenco;
  let abertos = [];
  for (let i = 0; i < ordemDraft.length; i++) {
    const slot = ordemDraft[i];
    if (!elenco[slot.slot]) abertos.push(slot);
  }
  return abertos;
}

// Retorna o conjunto de categorias (DEF/MEI/ATA/GK) que ainda têm pelo
// menos um slot vazio para aquele time — usado pra sortear só jogadores
// que aquele time ainda consegue encaixar em algum lugar.
function obterCategoriasAbertas(numJogador) {
  const abertos = obterSlotsAbertos(numJogador);
  let categorias = new Set();
  for (let i = 0; i < abertos.length; i++) {
    categorias.add(categoria(abertos[i].posicao));
  }
  return categorias;
}

// Decide a próxima rodada: sorteia cartas aleatórias (posições e times
// variados) entre os jogadores que o time da vez ainda consegue escalar
// em algum slot livre. `tentativas` é uma trava de segurança pra não
// entrar em loop caso nenhum dos dois times consiga mais jogar.
function proximaRodada(tentativas) {
  if (!tentativas) tentativas = 0;

  const total = ordemDraft.length;
  const cheio1 = Object.keys(state.times[1].elenco).length >= total;
  const cheio2 = Object.keys(state.times[2].elenco).length >= total;
  if (cheio1 && cheio2) {
    finalizarDraft();
    return;
  }
  if (tentativas > 4) {
    // ninguém mais consegue ser escalado (base de jogadores acabou) — encerra
    finalizarDraft();
    return;
  }

  const jog = state.turnoAtual;
  const timeCheio = Object.keys(state.times[jog].elenco).length >= total;
  if (timeCheio) {
    alternarTurno();
    proximaRodada(tentativas + 1);
    return;
  }

  const categoriasAbertas = obterCategoriasAbertas(jog);
  let elegiveis = [];
  for (let i = 0; i < state.jogadoresDisponivel.length; i++) {
    const j = state.jogadoresDisponivel[i];
    if (categoriasAbertas.has(categoria(j.posicao))) elegiveis.push(j);
  }

  if (elegiveis.length === 0) {
    if (state.jogadoresDisponivel.length === 0) {
      finalizarDraft();
      return;
    }
    alternarTurno();
    proximaRodada(tentativas + 1);
    return;
  }

  elegiveis.sort(function () {
    return Math.random() - 0.5;
  });
  const candidatos = elegiveis.slice(0, 4);
  state.candidatosAtuais = candidatos;

  esconderPosicionamento();
  el.indicadorVez.textContent = "Vez de: " + state.times[jog].nome;
  el.indicadorVez.className = "indicador-vez j" + jog;
  el.slotAtualLabel.textContent = "Escolha uma carta para o seu time";

  renderizarCards(candidatos);
  atualizarProgresso();
}

function renderizarCards(candidatos) {
  el.cardsContainer.classList.remove("cards-capitao");
  el.cardsContainer.innerHTML = "";

  for (let i = 0; i < candidatos.length; i++) {
    const jogador = candidatos[i];
    const attrs = pegaAttr(jogador.posicao);

    let attrsHTML = "";
    for (let a = 0; a < attrs.length; a++) {
      const chave = attrs[a];
      attrsHTML += "<span><b>" + atributos[chave] + "</b> " + jogador.atributos[chave] + "</span>";
    }

    const card = document.createElement("button");
    card.className = "card-jogador";
    card.innerHTML = cartaHTML(jogador) + '<div class="card-atributos">' + attrsHTML + '</div>';
    card.addEventListener("click", function () {
      selecionarCarta(jogador);
    });
    el.cardsContainer.appendChild(card);
  }
}

// Quando o técnico dá bonus pra um jogador, em vez de só colorir o número
// (o ciano ficava ilegível em cima do fundo dourado da carta), o GER
// alterna sozinho a cada 1/2s entre o valor base e o valor com bonus —
// igual ao efeito de "GER dinâmico" do FC Mobile — com setinhas douradas
// acompanhando o valor turbinado, sem nenhum texto/selo extra.
function gerAnimadoHTML(jogador) {
  if (!jogador.bonusTecnico) return "" + jogador.ger;
  const base = jogador.ger - jogador.bonusTecnico;
  return `
    <span class="ovr-flip">
      <span class="ovr-flip-base">${base}</span>
      <span class="ovr-flip-boost">${jogador.ger}<span class="ovr-seta">▲</span></span>
    </span>
  `;
}

// Marcação visual da carta (usada nas cartas de escolha e na prévia da
// carta selecionada). Mostra a POSIÇÃO no canto superior esquerdo (junto
// do OVR) e o ESCUDO da seleção no canto superior direito. A cor de fundo
// da carta é definida pela raridade (Ouro/Prata/Bronze), calculada
// automaticamente a partir do GER do jogador.
function cartaHTML(jogador) {
  const tipo = tipoPorNota(jogador.ger);
  const cfg = corTipo(tipo);
  const caminhoEscudo = escudo(jogador.selecao);
  const estiloTipo = "--c1:" + cfg.c1 + ";--c2:" + cfg.c2 + ";--c3:" + cfg.c3 + ";--ctxt:" + cfg.texto + ";--cborda:" + cfg.moldura + ";";

  let seloCapitao = "";
  if (jogador.isCapitao) {
    seloCapitao = '<span class="selo-capitao" title="Capitão">C</span>';
  }

  // O selo de capitão precisa ficar FORA da ".carta-visual": ela tem
  // "clip-path" + "overflow:hidden" pra cortar o formato diagonal da carta,
  // e isso corta QUALQUER coisa dentro dela que fique perto do topo — o
  // selo, sendo redondo e ficando bem no bico do recorte, era cortado quase
  // por completo (ficava praticamente invisível). Por isso ele vai dentro
  // do ".carta-wrap" (que não tem overflow escondido, só um espaço reservado
  // no topo), como um IRMÃO da carta-visual, e não um filho dela.
  return `
    <div class="carta-wrap">
      ${seloCapitao}
      <div class="carta-visual" data-tipo="${tipoSlug(tipo)}" style="${estiloTipo}">
        <div class="carta-topo">
          <div class="carta-topo-esq">
            <span class="carta-ovr">${gerAnimadoHTML(jogador)}</span>
            <span class="carta-pos">${jogador.posicao}</span>
          </div>
          <img class="carta-escudo-mini" src="${caminhoEscudo}" alt="${jogador.selecao}" onerror="fbEscudo(this,'${jogador.selecao}')">
        </div>
        <img class="carta-foto" src="${jogador.foto}" alt="${jogador.nome}" onerror="fbFoto(this)">
        <div class="carta-nome">${jogador.nome}</div>
      </div>
    </div>
  `;
}

// Passo 1 -> 2: jogador escolheu uma carta, agora precisa dizer onde ela
// vai jogar no time dele.
function selecionarCarta(jogador) {
  state.jogadorSelecionado = jogador;
  renderizarPosicionamento(jogador);
}

function esconderPosicionamento() {
  el.posicionamentoContainer.classList.add("oculto");
  el.cardsContainer.classList.remove("oculto");
}

function renderizarPosicionamento(jogador) {
  el.cardsContainer.classList.add("oculto");
  el.posicionamentoContainer.classList.remove("oculto");

  if (state.capitaoEmPosicionamento) {
    el.slotAtualLabel.textContent = "Onde o capitão " + jogador.nome + " vai jogar?";
  } else {
    el.slotAtualLabel.textContent = "Onde " + jogador.nome + " vai jogar?";
  }

  el.cartaSelecionada.innerHTML = cartaHTML(jogador);

  const time = state.times[state.turnoAtual];

  const campoEl = document.getElementById("campo-posicionamento");
  let campoHTML = '<div class="campo-grama"><div class="grande-area"></div></div>';
  for (let i = 0; i < titulares.length; i++) {
    const slot = titulares[i];
    campoHTML += slotCampoInterativoHTML(slot, time.elenco[slot.slot], jogador);
  }
  campoEl.innerHTML = campoHTML;

  const resEl = document.getElementById("reservas-posicionamento");
  let resHTML = "";
  for (let i = 0; i < reservas.length; i++) {
    const slot = reservas[i];
    resHTML += slotReservaInterativoHTML(slot, time.elenco[slot.slot], jogador);
  }
  resEl.innerHTML = resHTML;

  const camposClicaveis = campoEl.querySelectorAll(".campo-jogador.selecionavel");
  for (let i = 0; i < camposClicaveis.length; i++) {
    const elSlot = camposClicaveis[i];
    elSlot.addEventListener("click", function () {
      confirmarPosicionamento(elSlot.dataset.slot);
    });
  }

  const linhasClicaveis = resEl.querySelectorAll(".linha-jogador.selecionavel");
  for (let i = 0; i < linhasClicaveis.length; i++) {
    const elSlot = linhasClicaveis[i];
    elSlot.addEventListener("click", function () {
      confirmarPosicionamento(elSlot.dataset.slot);
    });
  }
}

// Gera o slot do campo durante a etapa de posicionamento: se já tem
// alguém, mostra a carta normal; se está vazio, mostra clicável (com o
// GER que o candidato teria ali) quando ele pode jogar ali, ou "apagado"
// quando a posição não é compatível com o jogador (ex.: linha em slot de GK).
function slotCampoInterativoHTML(slot, ocupante, jogadorCandidato) {
  if (ocupante) return cartaCampoHTML(ocupante, slot);

  const pos = posCampo[slot.slot] || { top: 50, left: 50 };
  const estilo = "top:" + pos.top + "%; left:" + pos.left + "%;";

  if (!podeJogar(jogadorCandidato, slot.posicao)) {
    return `
      <div class="campo-jogador vazio indisponivel" style="${estilo}">
        <div class="campo-carta"><span class="campo-vazio-label">${slot.posicao}</span></div>
        <div class="campo-nome">—</div>
      </div>
    `;
  }

  const gerBase = calcSlot(jogadorCandidato, slot.posicao);
  const tecnicoDoTime = state.times[state.turnoAtual].tecnico;
  let bonusPreview = 0;
  if (tecnicoDoTime) bonusPreview = bonusTec({ posicao: slot.posicao }, tecnicoDoTime);
  let gerPreview = gerBase + bonusPreview;
  if (gerPreview > 99) gerPreview = 99;
  if (gerPreview < 1) gerPreview = 1;

  return `
    <div class="campo-jogador vazio selecionavel" style="${estilo}" data-slot="${slot.slot}">
      <div class="campo-carta campo-carta--vazia">
        <span class="campo-vazio-ovr">${gerPreview}</span>
        <span class="campo-vazio-label">${slot.posicao}</span>
      </div>
      <div class="campo-nome">${slot.label}</div>
    </div>
  `;
}

function slotReservaInterativoHTML(slot, ocupante, jogadorCandidato) {
  if (ocupante) return linhaElenco(ocupante, slot);

  if (!podeJogar(jogadorCandidato, slot.posicao)) {
    return `<div class="linha-jogador vazio indisponivel" data-slot="${slot.slot}"><span></span><span>${slot.label}</span><span>—</span></div>`;
  }

  const gerBase = calcSlot(jogadorCandidato, slot.posicao);
  const tecnicoDoTime = state.times[state.turnoAtual].tecnico;
  let bonusPreview = 0;
  if (tecnicoDoTime) bonusPreview = bonusTec({ posicao: slot.posicao }, tecnicoDoTime);
  let gerPreview = gerBase + bonusPreview;
  if (gerPreview > 99) gerPreview = 99;
  if (gerPreview < 1) gerPreview = 1;

  return `
    <div class="linha-jogador vazio selecionavel" data-slot="${slot.slot}">
      <span></span>
      <span class="linha-pos">${slot.posicao}</span>
      <span class="linha-nome">${slot.label}</span>
      <span class="linha-selecao">Disponível</span>
      <span class="linha-ger">${gerPreview}</span>
    </div>
  `;
}

// Passo 2 concluído: efetiva a escalação do jogador no slot escolhido,
// gravando o GER específico daquela posição. Se o jogador em questão for
// um capitão sendo posicionado, trata o fluxo especial de escolha de
// capitão (ver iniciarEscolhaCapitao) em vez do fluxo normal do draft.
function confirmarPosicionamento(slotId) {
  let slot = null;
  for (let i = 0; i < ordemDraft.length; i++) {
    if (ordemDraft[i].slot === slotId) {
      slot = ordemDraft[i];
      break;
    }
  }
  const jogador = state.jogadorSelecionado;
  if (!slot || !jogador) return;
  if (!podeJogar(jogador, slot.posicao)) return;

  const ger = calcSlot(jogador, slot.posicao);
  const jogadorEscalado = Object.assign({}, jogador, { posicaoOriginal: jogador.posicao, posicao: slot.posicao, ger: ger });

  // se o time já tem técnico escolhido, aplica o bonus dele agora mesmo
  // (durante a fase de capitão isso nunca acontece, pois o técnico só é
  // escolhido depois — nesse caso o bonus é aplicado retroativamente em
  // escolherTecnico())
  const tecnicoDoTime = state.times[state.turnoAtual].tecnico;
  const bonus = bonusTec(jogadorEscalado, tecnicoDoTime);
  if (bonus) {
    let novaNota = jogadorEscalado.ger + bonus;
    if (novaNota > 99) novaNota = 99;
    if (novaNota < 1) novaNota = 1;
    jogadorEscalado.ger = novaNota;
    jogadorEscalado.bonusTecnico = bonus;
  }

  if (state.capitaoEmPosicionamento) {
    jogadorEscalado.isCapitao = true;
    state.times[state.turnoAtual].elenco[slot.slot] = jogadorEscalado;
    state.times[state.turnoAtual].capitaoSlot = slot.slot;
    state.jogadorSelecionado = null;
    state.capitaoEmPosicionamento = false;

    if (state.turnoAtual === 1) {
      state.turnoAtual = 2;
      esconderPosicionamento();
      iniciarEscolhaCapitao();
    } else {
      state.modoEscolhaCapitao = false;
      state.turnoAtual = 1;
      atualizarProgresso();
      esconderPosicionamento();
      iniciarEscolhaTecnico();
    }
    return;
  }

  state.times[state.turnoAtual].elenco[slot.slot] = jogadorEscalado;

  let restante = [];
  for (let i = 0; i < state.jogadoresDisponivel.length; i++) {
    if (state.jogadoresDisponivel[i] !== jogador) restante.push(state.jogadoresDisponivel[i]);
  }
  state.jogadoresDisponivel = restante;
  state.jogadorSelecionado = null;

  alternarTurno();
  atualizarProgresso();
  proximaRodada();
}

function atualizarProgresso() {
  const total = ordemDraft.length;
  el.progressoJ1.textContent = Object.keys(state.times[1].elenco).length + "/" + total;
  el.progressoJ2.textContent = Object.keys(state.times[2].elenco).length + "/" + total;
}

function finalizarDraft() {
  mostrarTela("resultado");
  el.resultadoTimes.innerHTML = "";

  for (let numJogador = 1; numJogador <= 2; numJogador++) {
    const time = state.times[numJogador];

    let somaGer = 0;
    let qtdTitulares = 0;
    for (let i = 0; i < titulares.length; i++) {
      const jogadorSlot = time.elenco[titulares[i].slot];
      if (jogadorSlot) {
        somaGer += jogadorSlot.ger;
        qtdTitulares++;
      }
    }
    let gerMedio = 0;
    if (qtdTitulares > 0) gerMedio = Math.round(somaGer / qtdTitulares);

    let capitao = null;
    if (time.capitaoSlot) capitao = time.elenco[time.capitaoSlot];

    let capitaoInfoHTML = "";
    if (capitao) capitaoInfoHTML = '<div class="capitao-info">Capitão: <b>' + capitao.nome + '</b></div>';

    let tecnicoInfoHTML = "";
    if (time.tecnico) {
      tecnicoInfoHTML = '<div class="tecnico-info">Técnico: <b>' + time.tecnico.nome + '</b> ' +
        '<span class="tecnico-tipo tecnico-tipo--' + tipoSlug(time.tecnico.tipo) + ' tecnico-tipo--mini">' + time.tecnico.tipo + '</span></div>';
    }

    let campoHTML = '<div class="campo-grama"><div class="grande-area"></div></div>';
    for (let i = 0; i < titulares.length; i++) {
      campoHTML += cartaCampoHTML(time.elenco[titulares[i].slot], titulares[i]);
    }

    let reservasHTML = "";
    for (let i = 0; i < reservas.length; i++) {
      reservasHTML += linhaElenco(time.elenco[reservas[i].slot], reservas[i]);
    }

    const bloco = document.createElement("div");
    bloco.className = "time-final";
    bloco.innerHTML = `
      <div class="time-final-topo">
        <h2>${time.nome}</h2>
        <div class="ger-medio">GER ${gerMedio}</div>
      </div>
      ${capitaoInfoHTML}
      ${tecnicoInfoHTML}
      <h3>Titulares (4-3-3)</h3>
      <div class="campo-formacao">${campoHTML}</div>
      <h3>Reservas</h3>
      <div class="lista-elenco">${reservasHTML}</div>
    `;
    el.resultadoTimes.appendChild(bloco);
  }
}

// Gera a "carta" compacta de um jogador posicionada no campo, no ponto
// definido por posCampo para aquele slot (ex.: "ATA", "MEI"...).
function cartaCampoHTML(jogador, slot) {
  const pos = posCampo[slot.slot] || { top: 50, left: 50 };
  const estilo = "top:" + pos.top + "%; left:" + pos.left + "%;";

  if (!jogador) {
    return `
      <div class="campo-jogador vazio" style="${estilo}">
        <div class="campo-carta"><span class="campo-vazio-label">${slot.posicao}</span></div>
        <div class="campo-nome">—</div>
      </div>
    `;
  }

  const tipo = tipoPorNota(jogador.ger);
  const cfg = corTipo(tipo);
  const estiloTipo = "--c1:" + cfg.c1 + ";--c2:" + cfg.c2 + ";--c3:" + cfg.c3 + ";--ctxt:" + cfg.texto + ";--cborda:" + cfg.moldura + ";";

  let seloCapitao = "";
  if (jogador.isCapitao) {
    seloCapitao = '<span class="selo-capitao selo-capitao--mini" title="Capitão">C</span>';
  }

  // Mesmo motivo da carta grande: o selo precisa ficar FORA do
  // ".campo-carta" (que também tem clip-path + overflow:hidden pro recorte
  // da mini-carta), senão ele é cortado quase todo. Aqui ele é um irmão,
  // direto dentro do ".campo-jogador" (que não corta nada), flutuando por
  // cima da carta com o "top" negativo definido em ".selo-capitao--mini".
  return `
    <div class="campo-jogador" style="${estilo}">
      ${seloCapitao}
      <div class="campo-carta" data-tipo="${tipoSlug(tipo)}" style="${estiloTipo}">
        <div class="campo-carta-topo">
          <span class="campo-ovr">${gerAnimadoHTML(jogador)}</span>
          <span class="campo-pos">${jogador.posicao}</span>
        </div>
        <img class="campo-foto" src="${jogador.foto}" alt="${jogador.nome}" onerror="fbFoto(this)">
      </div>
      <div class="campo-nome">${sobrenomeDeExibicao(jogador.nome)}</div>
    </div>
  `;
}

// Nome curto para caber embaixo da mini-carta (último nome, ex.: "Ronaldo")
function sobrenomeDeExibicao(nomeCompleto) {
  const partes = (nomeCompleto || "").trim().split(" ");
  return partes[partes.length - 1];
}

function linhaElenco(jogador, slot) {
  if (!jogador) {
    return '<div class="linha-jogador vazio"><span></span><span>' + slot.label + '</span><span>—</span></div>';
  }

  let posTexto = jogador.posicao;
  if (jogador.isCapitao) posTexto += " (C)";

  return `
    <div class="linha-jogador">
      <img class="linha-avatar" src="${jogador.foto}" alt="${jogador.nome}" onerror="fbFoto(this)">
      <span class="linha-pos">${posTexto}</span>
      <span class="linha-nome">${jogador.nome}</span>
      <span class="linha-selecao"></span>
      <span class="linha-ger">${gerAnimadoHTML(jogador)}</span>
    </div>
  `;
}