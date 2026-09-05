# DRAFT FC26 - Copa do mundo

## Sobre o projeto

DRAFT FC26 é um jogo de draft de futebol criado para simular a montagem de duas seleções para a Copa do Mundo de 2026.

A ideia do jogo é colocar dois jogadores para disputar cartas de jogadores de futebol e montar suas próprias seleções. Cada jogador precisa escolher seus atletas, definir onde cada um vai jogar e completar uma formação 4-3-3 com titulares e reservas.

O projeto foi desenvolvido como uma aplicação web estática utilizando HTML, CSS e JavaScript puro.

Os jogadores ficam armazenados em um arquivo JSON, assim como os técnicos. Toda a lógica da partida acontece no navegador, sem banco de dados e sem servidor próprio.

A aplicação possui três etapas principais:

1. Tela inicial
2. Draft
3. Resultado das seleções

## Objetivo do jogo

Cada jogador precisa montar uma seleção com 18 jogadores.

São 11 titulares e 7 reservas.

A formação principal utiliza o esquema 4 3 3.

Os titulares são:

1. Goleiro
2. Lateral Direito
3. Zagueiro
4. Zagueiro
5. Lateral Esquerdo
6. Meia Direita
7. Meio Campista
8. Meia Esquerda
9. Ponta Esquerda
10. Atacante
11. Ponta Direita

As reservas possuem vagas específicas para goleiro, defesa, meio campo e ataque.

A ideia não é simplesmente escolher sempre o jogador com maior GER.

O posicionamento interfere diretamente na nota do jogador. A perna dominante também pode alterar o GER e o técnico escolhido pode aumentar a nota de determinados jogadores.

Por isso, uma carta com GER menor pode acabar sendo uma escolha melhor dependendo da posição disponível.

## Como funciona o draft

Quando uma partida começa, o sistema carrega os jogadores do arquivo `jogadores.json` e os técnicos do arquivo `tecnicos.json`.

Depois disso, o estado da partida é criado novamente.

Os dois times começam vazios e o Jogador 1 começa escolhendo o capitão.

O draft possui três momentos importantes:

1. Escolha do capitão
2. Escolha do técnico
3. Draft dos jogadores

## Escolha do capitão

Antes do draft normal existe uma escolha especial de capitão.

O sistema procura os jogadores que possuem a propriedade `capitaoElegivel` marcada como verdadeira.

Esses jogadores são organizados pelo `overall_base`.

Os quatro melhores candidatos disponíveis são apresentados ao jogador.

O jogador escolhe uma das cartas e depois escolhe onde esse capitão será colocado.

O capitão não fica preso a uma posição específica. Ele pode ser colocado em qualquer posição compatível com as regras normais de posicionamento.

Depois que o Jogador 1 escolhe seu capitão, chega a vez do Jogador 2.

Os candidatos que já foram apresentados como opção de capitão são armazenados pelo sistema e não aparecem novamente para o segundo jogador.

Isso evita que os dois jogadores recebam exatamente as mesmas opções.

Depois que os dois capitães são definidos, a escolha de técnico começa.

## Escolha do técnico

Cada seleção pode escolher um técnico.

O arquivo `tecnicos.json` possui os técnicos disponíveis e suas informações.

Cada técnico possui:

1. Nome
2. Nacionalidade
3. Foto
4. Tipo
5. GER
6. Estilo de jogo

Existem três tipos de técnico:

### Ofensivo

O técnico ofensivo aumenta em 1 ponto o GER dos jogadores da categoria de ataque.

### Defensivo

O técnico defensivo aumenta em 1 ponto o GER dos jogadores da defesa e do goleiro.

### Equilibrado

O técnico equilibrado aumenta em 1 ponto o GER dos jogadores do meio campo.

O técnico escolhido por um jogador deixa de estar disponível para o outro.

Dessa maneira, os dois times não conseguem utilizar o mesmo técnico.

O bônus também é aplicado aos jogadores que já fazem parte do elenco.

Quando um novo jogador é colocado no time, o sistema também verifica se ele recebe o bônus do técnico.

## Escolha das cartas

Depois da escolha dos capitães e técnicos começa o draft principal.

Em cada rodada o sistema verifica quais posições ainda estão disponíveis no time atual.

Com base nisso, ele identifica quais categorias de jogadores ainda podem ser utilizadas.

Depois são selecionados quatro jogadores aleatoriamente entre os jogadores disponíveis.

O jogador recebe quatro cartas para escolher.

A escolha de uma carta não coloca automaticamente o jogador na escalação.

Primeiro é necessário escolher onde ele será utilizado.

Essa separação foi feita para permitir que o jogador veja o impacto de cada possível posição antes de confirmar a escolha.

## Sistema de posicionamento

Depois que uma carta é escolhida, o jogo mostra o campo 4 3 3.

Cada vaga possui sua própria posição.

O sistema verifica se o jogador pode ocupar aquela vaga.

Quando a posição é válida, a vaga mostra o GER que o jogador teria naquele local.

Quando a posição não é válida, a vaga fica indisponível.

O jogador também pode ser colocado em uma das vagas de reserva compatíveis.

Depois de confirmar a posição, o jogador é adicionado ao elenco e removido da lista de jogadores disponíveis.

O turno então passa para o outro jogador.

## Regras de posição

O sistema possui regras específicas para calcular o GER de cada jogador.

O goleiro possui uma regra especial.

Um goleiro só pode jogar como goleiro.

Um jogador de linha não pode ocupar a posição de goleiro.

Para os jogadores de linha, o sistema permite jogar fora da posição natural, mas aplica uma penalização.

Quando o jogador está em sua posição natural, ele mantém o `overall_base`.

Quando ele muda para outra posição dentro da mesma categoria, perde 3 pontos.

Quando muda entre categorias próximas, perde 6 pontos.

Quando vai de defesa para ataque ou de ataque para defesa, perde 18 pontos.

Depois disso, o bônus da perna dominante é aplicado.

O resultado final sempre fica entre 1 e 99.

## Categorias de posição

Internamente, o jogo trabalha com quatro categorias.

### GK

Representa goleiros.

### DEF

Representa jogadores de defesa.

Inclui:

1. Zagueiros
2. Lateral Direito
3. Lateral Esquerdo

### MEI

Representa jogadores de meio campo.

Inclui:

1. Meia Direita
2. Meio Campista
3. Meia Esquerda

### ATA

Representa jogadores de ataque.

Inclui:

1. Ponta Esquerda
2. Atacante
3. Ponta Direita

Essas categorias são utilizadas tanto para o sorteio das cartas quanto para os cálculos de posicionamento e bônus de técnico.

## Bônus de perna dominante

Algumas posições também levam em consideração a perna boa do jogador.

Nas posições pelo lado esquerdo, jogadores de perna esquerda recebem 1 ponto.

Jogadores de perna direita nessas posições recebem uma redução de 3 pontos.

Nas posições pelo lado direito acontece o contrário.

Jogadores de perna direita recebem 1 ponto.

Jogadores de perna esquerda recebem uma redução de 3 pontos.

Jogadores que possuem ambas as pernas recebem o bônus positivo nas posições consideradas pelo sistema.

Esse cálculo é realizado antes da definição final da nota da carta.

## Sistema de GER

O GER é calculado de acordo com a posição em que o jogador está sendo utilizado.

O sistema possui duas situações principais.

A primeira é o GER da carta.

Nesse caso o jogador é avaliado na sua posição natural.

A segunda é o GER do jogador dentro de uma vaga específica.

Nesse caso são aplicadas as penalizações ou bônus referentes à posição escolhida.

Isso significa que o mesmo jogador pode ter GER diferente dependendo de onde for colocado.

Por exemplo, um jogador com GER 85 na posição natural pode apresentar uma nota menor caso seja colocado em outra posição.

O técnico também pode aumentar essa nota.

## Raridade das cartas

A raridade da carta é definida automaticamente através do GER.

As categorias são:

### Ouro

GER igual ou superior a 80.

### Prata

GER igual ou superior a 70.

### Bronze

GER abaixo de 70.

As cores e características visuais da carta são definidas pelo JavaScript através dessas categorias.

O projeto não precisa cadastrar manualmente a cor de cada jogador.

A interface calcula o tipo da carta a partir da nota.

## Atributos

Os atributos apresentados na carta mudam de acordo com a posição do jogador.

Para goleiros são utilizados:

1. Reflexos
2. Elasticidade
3. Manejo
4. Chute
5. Posicionamento
6. Velocidade

Para defensores são utilizados:

1. Finalização
2. Passe
3. Dividida
4. Marcação
5. Físico
6. Velocidade

Para jogadores de meio campo são utilizados:

1. Finalização
2. Passe
3. Dividida
4. Visão
5. Drible
6. Fôlego

Para jogadores de ataque são utilizados:

1. Finalização
2. Passe
3. Dividida
4. Drible
5. Velocidade
6. Posicionamento

Isso permite que a carta mostre informações mais relevantes para a função que o jogador está desempenhando.

## Sorteio das cartas

O sorteio não escolhe simplesmente quatro jogadores aleatórios de toda a base.

Primeiro o sistema verifica as vagas que ainda estão abertas no time.

Depois transforma essas vagas em categorias.

Por exemplo, se o time ainda precisa de um goleiro, jogadores de defesa, meio campo e ataque, essas categorias entram na lista de possibilidades.

Somente jogadores pertencentes às categorias disponíveis entram no sorteio.

Depois dessa filtragem, a lista é embaralhada e quatro jogadores são escolhidos.

Isso evita que o jogador receba constantemente cartas que não podem ser utilizadas no momento.

## Controle dos dois jogadores

O jogo possui um estado central chamado `state`.

Esse objeto guarda todas as informações necessárias para continuar a partida.

Entre elas estão:

1. Jogadores disponíveis
2. Elenco do Jogador 1
3. Elenco do Jogador 2
4. Turno atual
5. Cartas da rodada
6. Jogador selecionado
7. Capitão
8. Técnico
9. Técnicos já escolhidos
10. Estado da escolha de capitão

Cada time também possui seu próprio objeto dentro do estado.

O elenco utiliza os identificadores das vagas como referência.

Isso facilita verificar se uma posição está ocupada e quais vagas ainda estão disponíveis.

## Estrutura do projeto

A aplicação possui uma estrutura simples.

```text
DRAFT FC26

index.html

style.css

script.js

data.js

jogadores.json

tecnicos.json

escudos

jogadores

tecnicos
```

## index.html

O `index.html` contém a estrutura visual principal da aplicação.

Existem três telas.

A primeira é a tela inicial.

A segunda é a tela onde acontece o draft.

A terceira apresenta as seleções completas.

Também existem elementos para mostrar:

1. Turno atual
2. Progresso dos dois jogadores
3. Cartas disponíveis
4. Carta selecionada
5. Campo de futebol
6. Reservas
7. Resultado final

O HTML também carrega as fontes utilizadas pela interface e os arquivos responsáveis pelo estilo e pela lógica.

## style.css

O `style.css` controla toda a aparência do jogo.

Ele define:

1. Layout
2. Cores
3. Cartas
4. Campo
5. Botões
6. Indicadores
7. Painéis
8. Técnicos
9. Reservas
10. Resultado final
11. Responsividade

As cartas utilizam variáveis CSS para receber automaticamente as cores correspondentes ao tipo Bronze, Prata ou Ouro.

Isso permite que a mesma estrutura HTML seja utilizada para diferentes tipos de carta.

## data.js

O `data.js` concentra as regras relacionadas aos dados e aos cálculos.

Entre suas responsabilidades estão:

1. Identificar atributos por posição
2. Identificar categorias
3. Corrigir posições antigas
4. Verificar compatibilidade de posição
5. Calcular GER
6. Aplicar bônus de perna dominante
7. Definir raridade da carta
8. Definir titulares
9. Definir reservas
10. Definir posições no campo
11. Carregar jogadores
12. Carregar técnicos
13. Calcular bônus de técnico

A separação dessas regras evita colocar todos os cálculos diretamente dentro do fluxo principal da partida.

## script.js

O `script.js` controla o funcionamento da partida.

Ele é responsável por:

1. Iniciar o draft
2. Alternar os turnos
3. Escolher capitães
4. Escolher técnicos
5. Sortear cartas
6. Renderizar cartas
7. Selecionar jogadores
8. Renderizar o campo
9. Confirmar posicionamento
10. Atualizar o progresso
11. Finalizar a partida
12. Renderizar o resultado

A lógica é baseada em funções pequenas que cuidam de partes específicas da partida.

Isso deixa o fluxo mais fácil de acompanhar e modificar.

## Carregamento dos jogadores

Os jogadores são carregados através do arquivo `jogadores.json`.

O navegador utiliza `fetch` para buscar os dados.

Depois que os dados são carregados, algumas informações são normalizadas.

Posições antigas podem ser corrigidas.

Informações que não possuem o tipo esperado recebem valores padrão.

A propriedade `ger` também é calculada novamente através das regras do jogo.

Isso significa que o valor utilizado pela interface não depende apenas do valor bruto salvo no JSON.

## Carregamento dos técnicos

Os técnicos são carregados de `tecnicos.json`.

Cada técnico possui informações próprias para aparecer na interface.

Entre elas estão nome, nacionalidade, foto, tipo, GER e estilo.

O sistema utiliza o tipo do técnico para determinar qual categoria de jogador receberá bônus.

## Tela de resultado

Quando os dois times terminam suas escalações, o jogo muda para a tela final.

Cada seleção é apresentada separadamente.

O sistema calcula o GER médio considerando apenas os 11 titulares.

As reservas não entram no cálculo do GER médio.

Também são exibidos:

1. GER médio
2. Capitão
3. Técnico
4. Titulares
5. Reservas
6. Formação 4 3 3

O botão NOVO DRAFT retorna para a tela inicial e permite começar outra partida.

## Tratamento de imagens

O projeto possui imagens para jogadores, seleções, técnicos e identidade visual.

Como imagens podem eventualmente não existir ou apresentar algum problema de carregamento, o projeto possui mecanismos de fallback.

Quando um escudo não consegue ser carregado, o sistema pode gerar uma representação alternativa utilizando a sigla da seleção.

Isso evita que uma imagem quebrada comprometa a apresentação da carta.

## Decisões de desenvolvimento

Uma das principais decisões foi não utilizar framework.

Para o tamanho atual do projeto, HTML, CSS e JavaScript puro são suficientes.

Isso também deixa a lógica mais fácil de estudar e entender.

Outra decisão importante foi separar os dados da lógica.

Os jogadores ficam em `jogadores.json`.

Os técnicos ficam em `tecnicos.json`.

As regras ficam em `data.js`.

O fluxo da partida fica em `script.js`.

A interface fica em `index.html` e `style.css`.

Essa organização permite alterar os dados sem precisar modificar a estrutura principal do jogo.

Também foi importante separar a escolha da carta do posicionamento.

Dessa forma, o jogador consegue escolher um atleta e depois comparar as diferentes posições disponíveis antes de confirmar.

## Tecnologias utilizadas

HTML5

CSS3

JavaScript

JSON

Google Fonts

O projeto não possui dependências de framework para funcionar.

## Como executar

O projeto não possui etapa de compilação.

É necessário executar os arquivos através de um servidor local porque o jogo utiliza `fetch` para carregar os arquivos JSON.

Uma forma simples de executar é utilizar a extensão Live Server no Visual Studio Code.

Também é possível utilizar um servidor local através do comando:

```bash
npx serve .
```

Depois basta acessar o endereço local fornecido pelo servidor.

Abrir o `index.html` diretamente pode causar bloqueios do navegador ao tentar carregar os arquivos JSON.

## Requisitos

Para executar o projeto é necessário apenas:

1. Um navegador moderno
2. Os arquivos do projeto
3. Um servidor local

Não é necessário banco de dados.

Não é necessário backend.

Não é necessário instalar um framework.

## Estado atual

O projeto já possui o sistema principal de draft funcionando com dois jogadores.

A partida possui:

1. Escolha de capitão
2. Escolha de técnico
3. Sorteio de quatro cartas
4. Escolha de jogador
5. Posicionamento
6. Titulares
7. Reservas
8. Cálculo de GER
9. Bônus de perna dominante
10. Bônus de técnico
11. Raridade de cartas
12. Formação 4 3 3
13. Tela de resultado
14. Reinício da partida

## Possíveis evoluções

O projeto pode receber novas funcionalidades futuramente.

Algumas possibilidades são:

1. Modo contra computador
2. Mais formações
3. Mais posições
4. Sistema de pontuação
5. Histórico de partidas
6. Salvamento das seleções
7. Sistema de mercado
8. Mais tipos de cartas
9. Cartas especiais
10. Animações adicionais
11. Sistema online
12. Banco de dados
13. Contas de jogadores
14. Ranking
15. Sistema de campeonato

Também seria possível transformar a aplicação em uma versão com backend e banco de dados caso o projeto passe a trabalhar com partidas online e contas de usuários.

## Créditos

Projeto desenvolvido por Marcos Gabriel de Queiroz Rosa.

1º M TEC Desenvolvimento de Sistemas.

ETEC Darcy Pereira de Moraes.

## Licença

Este projeto foi desenvolvido para fins educacionais e de estudo.
