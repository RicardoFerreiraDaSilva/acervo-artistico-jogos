document.addEventListener('DOMContentLoaded', () => {

    const board = document.getElementById('memory-game-board');
    const triesCounter = document.getElementById('tries-counter');
    const winMessage = document.getElementById('win-message');
    const winText = document.getElementById('win-text');
    const playAgainBtn = document.getElementById('play-again-btn');
    
    const cardImages = [
        'yeddo1.png', 'yeddo2.png', 'yeddo3.png', 'yeddo4.png', 
        'yeddo5.png', 'yeddo6.png', 'yeddo7.png', 'yeddo8.png', 
        'yeddo9.png', 'yeddo10.png', 'yeddo11.png', 'yeddo12.png'
    ];
    
    const cardList = [...cardImages, ...cardImages];
    
    let hasFlippedCard = false;
    let lockBoard = false;
    let firstCard, secondCard;
    let matchesFound = 0;
    let tries = 0; // NOVO: Variável para o contador de tentativas
    
    function shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }
    
    function createBoard() {
        shuffle(cardList);
        cardList.forEach(cardImage => {
            const cardElement = document.createElement('div');
            cardElement.classList.add('memory-card');
            cardElement.dataset.name = cardImage.split('.')[0];
            
            cardElement.innerHTML = `
                <img class="front-face" src="imagens/jogo_memoria/${cardImage}" alt="${cardImage}">
                <img class="back-face" src="imagens/jogo_memoria/inverso.png" alt="Verso da Carta">
            `;
            
            cardElement.addEventListener('click', flipCard);
            board.appendChild(cardElement);
        });
    }

    function flipCard() {
        if (lockBoard) return;
        if (this === firstCard) return;

        this.classList.add('flip');

        if (!hasFlippedCard) {
            hasFlippedCard = true;
            firstCard = this;
            return;
        }

        secondCard = this;
        tries++; // NOVO: Incrementa o contador de tentativas
        triesCounter.textContent = tries; // NOVO: Atualiza o texto na tela
        
        checkForMatch();
    }

    function checkForMatch() {
        const isMatch = firstCard.dataset.name === secondCard.dataset.name;

        if (isMatch) {
            disableCards();
            matchesFound++;
            if (matchesFound === cardImages.length) {
                showWinMessage(); // NOVO: Mostra a mensagem de vitória na tela
            }
        } else {
            unflipCards();
        }
    }

    function disableCards() {
        firstCard.removeEventListener('click', flipCard);
        secondCard.removeEventListener('click', flipCard);
        resetCards(); // Renomeado para maior clareza
    }

    function unflipCards() {
        lockBoard = true;
        setTimeout(() => {
            firstCard.classList.remove('flip');
            secondCard.classList.remove('flip');
            resetCards(); // Renomeado para maior clareza
        }, 1000);
    }

    function resetCards() {
        [hasFlippedCard, lockBoard] = [false, false];
        [firstCard, secondCard] = [null, null];
    }

    // NOVO: Função para mostrar a mensagem de vitória
    function showWinMessage() {
        board.style.display = 'none'; // Esconde o tabuleiro
        winMessage.classList.remove('hidden');
        winText.textContent = `Você completou o jogo em ${tries} tentativas!`;
    }

    // NOVO: Lógica do botão "Jogar Novamente"
    playAgainBtn.addEventListener('click', () => {
        location.reload(); // Recarrega a página para reiniciar o jogo
    });
    
    // Inicia o jogo
    createBoard();

});