// ===== data.js =====
// Aqui ficam as coisas que o jogo usa pra calcular a nota dos jogadores,
// escolher a cor da carta, montar o time em campo, etc.
// Quem desenha a tela de verdade é o script.js, ele fica chamando as
// funções daqui toda hora.

// lista de seleções que aparecem no jogo (hoje isso nem é mais usado em
// nenhum lugar, ficou de um teste antigo, mas deixei aqui guardado)
const paises = [
  "Brasil", "Argentina", "França", "Inglaterra", "Espanha", "Portugal",
  "Alemanha", "Itália", "Holanda", "Bélgica", "Croácia", "Uruguai",
  "Colômbia", "Marrocos", "Escócia", "Japão", "EUA", "Noruega", "CaboVerde"
];

// devolve o caminho da imagem do escudo de uma seleção
function escudo(selecao) {
  let arq = "";
  if (selecao === "Brasil") arq = "brasil";
  else if (selecao === "Argentina") arq = "argentina";
  else if (selecao === "França") arq = "franca";
  else if (selecao === "Inglaterra") arq = "inglaterra";
  else if (selecao === "Espanha") arq = "espanha";
  else if (selecao === "Portugal") arq = "portugal";
  else if (selecao === "Alemanha") arq = "alemanha";
  else if (selecao === "Itália") arq = "italia";
  else if (selecao === "Holanda") arq = "holanda";
  else if (selecao === "Bélgica") arq = "belgica";
  else if (selecao === "Croácia") arq = "croacia";
  else if (selecao === "Uruguai") arq = "uruguai";
  else if (selecao === "Colômbia") arq = "colombia";
  else if (selecao === "Marrocos") arq = "marrocos";
  else if (selecao === "Japão") arq = "japao";
  else if (selecao === "EUA") arq = "eua";
  else if (selecao === "Escócia") arq = "escocia";
  else if (selecao === "Noruega") arq = "noruega";
  else if (selecao === "CaboVerde") arq = "cabo-verde";
  return "escudos/" + arq + ".webp";
}

// se o escudo não carregar (arquivo não existe), desenha um circulozinho
// com a sigla da seleção no lugar
function fbEscudo(img, selecao) {
  img.onerror = null;
  const sigla = (selecao || "??").normalize("NFD").replace(/[\u0300-\u036f]/g, "").slice(0, 3).toUpperCase();
  img.src = "data:image/svg+xml;utf8," + encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 60">
      <circle cx="30" cy="30" r="27" fill="#0f2a1f" stroke="#f2f5f1" stroke-width="2"/>
      <text x="30" y="36" font-family="Arial, sans-serif" font-size="16" font-weight="700" fill="#e8cd85" text-anchor="middle">${sigla}</text>
    </svg>`
  );
}

// nome curto (sigla) de cada atributo, pra mostrar na carta
const atributos = {
  finalizacao: "FIN",
  passe: "PAS",
  dividida: "DIV",
  marcacao: "MAR",
  fisico: "FIS",
  velocidade: "VEL",
  visao: "VIS",
  drible: "DRI",
  folego: "FOL",
  posicionamento: "POS",
  reflexos: "REF",
  elasticidade: "ELA",
  manejo: "MAN",
  chute: "CHU"
};

// devolve a lista de atributos que aquela posição usa
function pegaAttr(pos) {
  if (pos === "GK") {
    return ["reflexos", "elasticidade", "manejo", "chute", "posicionamento", "velocidade"];
  }
  if (pos === "ZAG" || pos === "LD" || pos === "LE") {
    return ["finalizacao", "passe", "dividida", "marcacao", "fisico", "velocidade"];
  }
  if (pos === "MEI" || pos === "ME" || pos === "MD") {
    return ["finalizacao", "passe", "dividida", "visao", "drible", "folego"];
  }
  // sobrou ATA, PE e PD
  return ["finalizacao", "passe", "dividida", "drible", "velocidade", "posicionamento"];
}

// devolve a categoria de uma posição: GK, DEF, MEI ou ATA
function categoria(pos) {
  if (pos === "GK") return "GK";
  if (pos === "ZAG" || pos === "LD" || pos === "LE") return "DEF";
  if (pos === "MEI" || pos === "ME" || pos === "MD") return "MEI";
  return "ATA"; // ATA, PE, PD
}

// só o goleiro pode jogar de goleiro, e o goleiro só pode jogar de goleiro
function podeJogar(jogador, posSlot) {
  if (jogador.posicao === "GK") return posSlot === "GK";
  if (posSlot === "GK") return false;
  return true;
}

// jogadores.json antigo usava outros nomes de posição (ex. PE1, PE2), essa
// função só corrige isso caso apareça algum jogador com o nome antigo
function corrigePos(pos) {
  if (pos === "PE1" || pos === "PE2") return "PE";
  if (pos === "PD1" || pos === "PD2") return "PD";
  if (pos === "ME1" || pos === "ME2") return "ME";
  if (pos === "MD1" || pos === "MD2") return "MD";
  if (pos === "LE1" || pos === "LE2") return "LE";
  if (pos === "LD1" || pos === "LD2") return "LD";
  return pos;
}

// bonus (ou penalidade) na nota por causa do pé dominante do jogador,
// só as posições de ponta e lateral tem essa variação
function bonusPerna(perna, pos) {
  if (pos === "PE" || pos === "ME" || pos === "LE") {
    if (perna === "Esquerda") return 1;
    if (perna === "Direita") return -3;
    if (perna === "Ambas") return 1;
    return 0;
  }
  if (pos === "PD" || pos === "MD" || pos === "LD") {
    if (perna === "Direita") return 1;
    if (perna === "Esquerda") return -3;
    if (perna === "Ambas") return 1;
    return 0;
  }
  return 0; // ZAG, MEI, ATA e GK não tem bonus de perna
}

// cor de fundo de cada raridade de carta (Bronze/Prata/Ouro)
function corTipo(nome) {
  if (nome === "Prata") {
    return { c1: "#dfe6ea", c2: "#aab6bd", c3: "#5c666c", texto: "#0f1417", moldura: "rgba(255,255,255,0.5)" };
  }
  if (nome === "Ouro") {
    return { c1: "#e8cd85", c2: "#c9a24b", c3: "#7a5f28", texto: "#1a1204", moldura: "rgba(255,255,255,0.28)" };
  }
  return { c1: "#a9754f", c2: "#7a4f30", c3: "#3f2717", texto: "#fbeee0", moldura: "rgba(255,255,255,0.28)" }; // Bronze
}

// nota alta = carta de ouro, nota média = prata, o resto = bronze
function tipoPorNota(ger) {
  if (ger >= 80) return "Ouro";
  if (ger >= 70) return "Prata";
  return "Bronze";
}

// vira "ouro", "prata" ou "bronze" (letra minuscula, sem acento), pra usar
// como nome de classe css
function tipoSlug(tipo) {
  let t = tipo || "bronze";
  t = t.toLowerCase();
  t = t.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  t = t.replace(/\s+/g, "-");
  return t;
}

// calcula a nota (GER) que um jogador teria numa posição (slot) do time.
// se ele jogar fora da posição dele, perde pontos.
function calcSlot(jogador, posSlot) {
  if (jogador.posicao === "GK" || posSlot === "GK") {
    if (jogador.posicao === posSlot) return jogador.overall_base;
    return null; // goleiro só pode ir pro GK, e ninguém de linha pode ir pro GK
  }

  let nota;

  if (jogador.posicao === posSlot) {
    nota = jogador.overall_base; // tá na posição natural dele, nota cheia
  } else {
    const catJ = categoria(jogador.posicao);
    const catS = categoria(posSlot);

    if (catJ === catS) {
      nota = jogador.overall_base - 3; // mesma categoria, posição diferente
    } else if ((catJ === "DEF" && catS === "ATA") || (catJ === "ATA" && catS === "DEF")) {
      nota = jogador.overall_base - 18; // categoria totalmente oposta
    } else {
      nota = jogador.overall_base - 6; // categoria vizinha (DEF-MEI ou MEI-ATA)
    }
  }

  nota = nota + bonusPerna(jogador.pernaBoa, posSlot);
  nota = Math.round(nota);
  if (nota < 1) nota = 1;
  if (nota > 99) nota = 99;
  return nota;
}

// calcula a nota "de carta" do jogador na posição natural dele
function calcGer(jogador) {
  let n = jogador.overall_base;
  n = n + bonusPerna(jogador.pernaBoa, jogador.posicao);
  n = Math.round(n);
  if (n < 1) n = 1;
  if (n > 99) n = 99;
  return n;
}

// os 11 titulares do 4-3-3
const titulares = [
  { slot: "GK", posicao: "GK", label: "Goleiro" },
  { slot: "LD", posicao: "LD", label: "Lateral Direito" },
  { slot: "ZAG1", posicao: "ZAG", label: "Zagueiro" },
  { slot: "ZAG2", posicao: "ZAG", label: "Zagueiro" },
  { slot: "LE", posicao: "LE", label: "Lateral Esquerdo" },
  { slot: "MD", posicao: "MD", label: "Meia Direita" },
  { slot: "MEI", posicao: "MEI", label: "Meio-Campista" },
  { slot: "ME", posicao: "ME", label: "Meia Esquerda" },
  { slot: "PE", posicao: "PE", label: "Ponta Esquerda" },
  { slot: "ATA", posicao: "ATA", label: "Atacante" },
  { slot: "PD", posicao: "PD", label: "Ponta Direita" }
];

// os 7 reservas do time
const reservas = [
  { slot: "RES_GK", posicao: "GK", label: "Reserva - Goleiro" },
  { slot: "RES_DEF1", posicao: "ZAG", label: "Reserva - Defensor" },
  { slot: "RES_DEF2", posicao: "ZAG", label: "Reserva - Defensor" },
  { slot: "RES_MEI1", posicao: "ME", label: "Reserva - Meio" },
  { slot: "RES_MEI2", posicao: "MD", label: "Reserva - Meio" },
  { slot: "RES_ATA1", posicao: "PD", label: "Reserva - Ataque" },
  { slot: "RES_ATA2", posicao: "PE", label: "Reserva - Ataque" }
];

// titulares + reservas juntos, na ordem que o draft vai preenchendo
const ordemDraft = titulares.concat(reservas);

// posição (em % da tela) de cada titular dentro do campinho verde
const posCampo = {
  GK: { top: 96, left: 50 },
  LD: { top: 74, left: 88 },
  ZAG1: { top: 80, left: 64 },
  ZAG2: { top: 80, left: 36 },
  LE: { top: 74, left: 12 },
  MD: { top: 46, left: 81 },
  MEI: { top: 53, left: 50 },
  ME: { top: 46, left: 19 },
  PE: { top: 15, left: 15 },
  ATA: { top: 9, left: 50 },
  PD: { top: 15, left: 85 }
};

// quantas cartas aparecem por vez na hora de escolher capitão / técnico
const nCapitao = 4;
const nTecnico = 4;

// busca a lista de jogadores no jogadores.json e arruma cada um deles
async function pegaJogadores() {
  const resp = await fetch("jogadores.json");
  const lista = await resp.json();

  for (let i = 0; i < lista.length; i++) {
    const j = lista[i];

    j.posicao = corrigePos(j.posicao);

    if (j.pernaBoa !== "Direita" && j.pernaBoa !== "Esquerda" && j.pernaBoa !== "Ambas") {
      j.pernaBoa = "Não Definido";
    }
    if (typeof j.altura !== "number") j.altura = 0;
    if (typeof j.peso !== "number") j.peso = 0;
    if (typeof j.idade !== "number") j.idade = 0;
    if (typeof j.peRuim !== "number") j.peRuim = 0;
    if (typeof j.skills !== "number") j.skills = 0;
    if (j.tipoCarta !== "Bronze" && j.tipoCarta !== "Prata" && j.tipoCarta !== "Ouro") j.tipoCarta = "Ouro";
    if (typeof j.capitaoElegivel !== "boolean") j.capitaoElegivel = false;
    if (!j.atributos) j.atributos = {};

    j.ger = calcGer(j);
  }

  return lista;
}

// o técnico dá +1 de bonus pros jogadores do estilo dele: ofensivo ajuda o
// ataque, defensivo ajuda a defesa (e o goleiro), equilibrado ajuda o meio
function bonusTec(jogador, tecnico) {
  if (!tecnico) return 0;

  const cat = categoria(jogador.posicao);

  if (tecnico.tipo === "Ofensivo") {
    if (cat === "ATA") return 1;
    return 0;
  }
  if (tecnico.tipo === "Defensivo") {
    if (cat === "DEF" || cat === "GK") return 1;
    return 0;
  }
  if (tecnico.tipo === "Equilibrado") {
    if (cat === "MEI") return 1;
    return 0;
  }
  return 0;
}

// busca a lista de técnicos no tecnicos.json
async function pegaTecnicos() {
  const resp = await fetch("tecnicos.json");
  if (!resp.ok) throw new Error("Não foi possível carregar tecnicos.json");
  return await resp.json();
}