document.addEventListener('DOMContentLoaded', () => {

    // --- INJEÇÃO DO VERSO ESTÁTICO DO DJANGO ---
    // Você deve garantir que a URL para 'inverso.png' está sendo injetada no HTML (ver seção abaixo)
    const VERSO_ESTATICO_URL = document.getElementById('verso-url-data').textContent.trim();


    // --- 1. CARREGAR DADOS DINÂMICOS DO DJANGO ---
    const dataElement = document.getElementById('memory-game-data');
    if (!dataElement) {
        console.error("Dados do jogo da memória não carregados. Verifique a view e o template.");
        return;
    }
    const gameData = JSON.parse(dataElement.textContent.trim());

    // Dados essenciais vindos do Django:
    const cardsData = gameData.cards_data || []; 
    const numRows = parseFloat(gameData.num_linhas) || 4; // Usando parseFloat para segurança
    const numCols = parseFloat(gameData.num_colunas) || 4;

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

    let flippedCards = []; 
    let matchedPairs = 0; 
    let tries = 0;
    const totalPairs = cardsData.length / 2; 

    // Configura o GRID CSS com o tamanho correto
    board.style.gridTemplateColumns = `repeat(${numCols}, 1fr)`;
    board.style.gridTemplateRows = `repeat(${numRows}, 1fr)`;

    // --- 3. CRIAÇÃO DO TABULEIRO DINÂMICO ---
    function createBoard() {
        cardsData.forEach((cardObj) => {
            const card = document.createElement('div');
            card.classList.add('memory-card');
            
            card.dataset.parId = cardObj.par_id; 
            card.dataset.info = cardObj.informacao_acerto;

            card.innerHTML = `
                <div class="card-inner">
                    <img class="front-face" src="${cardObj.frente_url}" alt="Frente ${cardObj.par_id}">
                    <img class="back-face" src="${VERSO_ESTATICO_URL}" alt="Verso da carta">
                </div>
            `;
            
            const inner = card.querySelector('.card-inner');
            card.addEventListener('click', () => flipCard(card, inner));
            board.appendChild(card);
        });
    }

    // --- 4. FUNÇÃO PRINCIPAL: VIRAR CARTA (Inalterada) ---
    function flipCard(card, inner) {
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
                
                first.classList.add('matched');
                second.classList.add('matched');
                
                const info = first.dataset.info;
                setTimeout(() => {
                    alert(`Par Encontrado! Curiosidade: \n\n${info}`);
                    flippedCards = [];
                    checkWin();
                }, 500); 
                
            } else {
                // PAR ERRADO
                setTimeout(() => {
                    first.querySelector('.card-inner').classList.remove('flip');
                    second.querySelector('.card-inner').classList.remove('flip');
                    flippedCards = [];
                }, 1000);
            }
        }
    }

    // --- 5. VERIFICAÇÃO DE VITÓRIA (Inalterada) ---
    function checkWin() {
        if (matchedPairs === totalPairs) {
            winMessage.classList.remove('hidden');
            winText.textContent = `Você venceu em ${tries} tentativas, encontrando ${totalPairs} pares!`;
        }
    }

    // --- 6. INICIALIZAÇÃO (Inalterada) ---
    createBoard();
    
    if(playAgainBtn) {
        playAgainBtn.addEventListener('click', () => {
            location.reload();
        });
    }
});