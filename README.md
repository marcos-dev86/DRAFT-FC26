<div align="center">

# DRAFT FC26 - Copa do Mundo 2026

<img src="escudos/logo.png" alt="DRAFT FC26" width="380">

**Jogo de montagem de elenco no estilo Draft, com 128 jogadores reais, técnicos e cálculo dinâmico de nota conforme a posição escolhida.**

</div>

## Sobre o projeto

O DRAFT FC26 é um jogo de montagem de elenco inspirado no sistema de Draft de jogos de futebol. A cada rodada o jogador escolhe uma carta e decide em qual posição usá la, até fechar um elenco completo em uma formação 4 3 3, com titulares, reservas, capitão e técnico.

Desenvolvido em HTML, CSS e JavaScript puro, com toda a base de jogadores e técnicos separada em arquivos JSON, mantendo os dados independentes da lógica do jogo.

## Como jogar

O jogo roda direto no navegador. Basta clonar ou baixar o repositório e abrir o `index.html`. Como os dados vêm de arquivos JSON, dependendo do navegador pode ser necessário servir os arquivos por um servidor local (uma extensão do editor de código já resolve).

```bash
git clone https://github.com/marcos-dev86/DRAFT-FC26.git
```

## Como funciona o Draft

* A cada rodada são apresentadas cartas de jogadores disponíveis. Ao escolher uma, ela sai da lista e não pode ser usada de novo.
* Depois de escolher a carta, o jogador define em qual posição ela vai atuar. A posição precisa ser compatível com a posição original do jogador.
* A nota (GER) muda conforme o encaixe: usar o jogador na posição natural mantém a nota cheia, na mesma categoria (por exemplo LD e LE) perde 3 pontos, em categoria vizinha (DEF e MEI, ou MEI e ATA) perde 6, e em categoria oposta perde 18.
* Em um momento específico do Draft, o jogador escolhe o capitão da equipe, entre os jogadores marcados como elegíveis.
* No fim, é escolhido o técnico. Cada um tem um estilo (ofensivo, defensivo ou equilibrado) que dá +1 de nota aos jogadores da área correspondente quando posicionados em campo.
* O resultado final mostra titulares, reservas, capitão, técnico e a média geral do elenco.

## Posições

| Posição | Função                  |
| ------- | ----------------------- |
| GK      | Goleiro                 |
| LD      | Lateral direito         |
| LE      | Lateral esquerdo        |
| ZAG     | Zagueiro                |
| MD      | Meio campista defensivo |
| MEI     | Meio campista           |
| PD      | Ponta direita           |
| PE      | Ponta esquerda          |
| ATA     | Atacante                |

## Dados e imagens dos jogadores

A base tem 128 jogadores reais, cada um com posição, atributos, perna boa, altura, peso, idade e elegibilidade para capitão. Os dados de cada jogador (e as fichas atualizadas) foram levantados um por um, manualmente, pesquisando na web. As fotos usadas nas cartas tiveram o fundo removido e deixado transparente com o remove.bg, pra manter o visual consistente com o resto da interface.

## Estrutura do projeto

```text
DRAFT-FC26/
├── jogadores/        # Fotos dos jogadores, organizadas por seleção
├── tecnicos/          # Fotos dos técnicos
├── escudos/           # Escudos e logo do projeto
├── jogadores.json     # Base de jogadores
├── tecnicos.json       # Base de técnicos
├── data.js             # Carregamento e cálculo de nota dos jogadores
├── script.js           # Lógica do Draft e da interface
├── index.html
└── style.css
```

## Tecnologias

HTML · CSS · JavaScript · JSON

## Possíveis evoluções

Ideias para versões futuras: mais formações, sistema de química de elenco, ligas e clubes, mercado de jogadores, salvamento do elenco e modo multiplayer.

## Créditos

Projeto desenvolvido por Marcos Rosa.

Repositório: <https://github.com/marcos-dev86/DRAFT-FC26>
