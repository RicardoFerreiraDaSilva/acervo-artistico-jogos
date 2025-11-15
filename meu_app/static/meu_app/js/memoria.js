document.addEventListener('DOMContentLoaded', () => {

    // --- 1. CARREGAR DADOS DINÂMICOS DO DJANGO ---
    const dataElement = document.getElementById('memory-game-data');
    if (!dataElement) {
        console.error("Dados do jogo da memória não carregados. Verifique a view e o template.");
        return;
    }
    const gameData = JSON.parse(dataElement.textContent.trim());

    // Dados essenciais vindos do Django:
    const cardsData = gameData.cards_data || []; // Lista de 16 (ou N) objetos de cartas embaralhadas
    const numRows = gameData.num_linhas || 4;
    const numCols = gameData.num_colunas || 4;

    if (cardsData.length === 0) {
        alert("Erro: Não há cartas suficientes para iniciar o jogo. Verifique o tema e a dificuldade.");
        return;
    }

    // --- 2. ELEMENTOS DA PÁGINA E ESTADO ---
    const board = document.getElementById('memory-game-board');
    const triesCounter = document.getElementById('tries-counter');
    const winMessage = document.getElementById('win-message');
    const winText = document.getElementById('win-text');
    const playAgainBtn = document.getElementById('play-again-btn');

    let flippedCards = []; // Cartas viradas atualmente
    let matchedPairs = 0; // Pares acertados
    let tries = 0;
    const totalPairs = cardsData.length / 2; // O número total de pares no jogo

    // Configura o GRID CSS com o tamanho correto (do Django)
    board.style.gridTemplateColumns = `repeat(${numCols}, 1fr)`;
    board.style.gridTemplateRows = `repeat(${numRows}, 1fr)`;

    // --- 3. CRIAÇÃO DO TABULEIRO DINÂMICO ---
    function createBoard() {
        // O array cardsData JÁ VEM DUPLICADO e EMBARALHADO do Python
        cardsData.forEach((cardObj, index) => {
            const card = document.createElement('div');
            card.classList.add('memory-card');
            
            // Usamos o par_id para comparação, não o URL do arquivo.
            card.dataset.parId = cardObj.par_id; 
            
            // Armazenamos a informação educativa diretamente no dataset
            card.dataset.info = cardObj.informacao_acerto;

            card.innerHTML = `
                <div class="card-inner">
                    <img class="front-face" src="${cardObj.frente_url}" alt="Frente ${cardObj.par_id}">
                    <img class="back-face" src="${cardObj.verso_url}" alt="Verso da carta">
                </div>
            `;
            
            // Adicionamos a classe 'flip' à inner div para o efeito 3D
            const inner = card.querySelector('.card-inner');
            card.addEventListener('click', () => flipCard(card, inner));
            board.appendChild(card);
        });
    }

    // --- 4. FUNÇÃO PRINCIPAL: VIRAR CARTA ---
    function flipCard(card, inner) {
        // Impede virar se: 2 cartas já viradas, carta já virada, ou carta já combinada
        if (flippedCards.length >= 2 || card.classList.contains('matched') || inner.classList.contains('flip')) return;

        inner.classList.add('flip');
        flippedCards.push(card);

        if (flippedCards.length === 2) {
            tries++;
            triesCounter.textContent = tries;

            const [first, second] = flippedCards;

            if (first.dataset.parId === second.dataset.parId) {
                // PAR CERTO (MATCHED)
                matchedPairs++;
                
                // Marca ambas como permanentes (para não serem viradas de novo)
                first.classList.add('matched');
                second.classList.add('matched');
                
                // AQUI: Exibir a informação educativa (usamos alert como modal simples)
                const info = first.dataset.info;
                setTimeout(() => {
                    alert(`Par Encontrado! Curiosidade: \n\n${info}`);
                    flippedCards = [];
                    checkWin();
                }, 500); // Dá um pequeno tempo para o usuário ver o par
                
            } else {
                // PAR ERRADO
                setTimeout(() => {
                    // Vira as cartas de volta
                    first.querySelector('.card-inner').classList.remove('flip');
                    second.querySelector('.card-inner').classList.remove('flip');
                    flippedCards = [];
                }, 1000);
            }
        }
    }

    // --- 5. VERIFICAÇÃO DE VITÓRIA ---
    function checkWin() {
        if (matchedPairs === totalPairs) {
            winMessage.classList.remove('hidden');
            winText.textContent = `Você venceu em ${tries} tentativas, encontrando ${totalPairs} pares!`;
        }
    }

    // --- 6. INICIALIZAÇÃO ---
    createBoard();
    
    // Botão jogar novamente (Recarrega a página para novo jogo/embaralhamento)
    if(playAgainBtn) {
        playAgainBtn.addEventListener('click', () => {
            location.reload();
        });
    }
});