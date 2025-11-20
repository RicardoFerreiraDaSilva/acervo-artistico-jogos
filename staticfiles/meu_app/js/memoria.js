document.addEventListener('DOMContentLoaded', () => {
    const board = document.getElementById('memory-game-board');
    const triesCounter = document.getElementById('tries-counter');
    const winMessage = document.getElementById('win-message');
    const winText = document.getElementById('win-text');
    const playAgainBtn = document.getElementById('play-again-btn');

    // Caminho base para as imagens, passado pelo atributo data-base-url no <body>
    const baseImageUrl = document.body.dataset.baseUrl;

    // Lista das imagens (sem caminho, só o nome do arquivo)
    const cardImages = [
        'yeddo1.png', 'yeddo2.png', 'yeddo3.png', 'yeddo4.png',
        'yeddo5.png', 'yeddo6.png', 'yeddo7.png', 'yeddo8.png',
        'yeddo9.png', 'yeddo10.png', 'yeddo11.png', 'yeddo12.png'
    ];

    const cards = [...cardImages, ...cardImages]; // duplicando para pares

    let flippedCards = [];
    let tries = 0;

    // Embaralha as cartas
    function shuffle(array) {
        for(let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    shuffle(cards);

    // Cria o tabuleiro
    cards.forEach(imgName => {
        const card = document.createElement('div');
        card.classList.add('memory-card');
        card.dataset.name = imgName;

        card.innerHTML = `
            <img class="front-face" src="${baseImageUrl + imgName}" alt="${imgName}">
            <img class="back-face" src="${baseImageUrl}inverso.png" alt="Verso da carta">
        `;

        card.addEventListener('click', () => flipCard(card));
        board.appendChild(card);
    });

    // Função para virar carta
    function flipCard(card) {
        if (flippedCards.length >= 2 || card.classList.contains('flip')) return;

        card.classList.add('flip');
        flippedCards.push(card);

        if (flippedCards.length === 2) {
            tries++;
            triesCounter.textContent = tries;

            const [first, second] = flippedCards;

            if (first.dataset.name === second.dataset.name) {
                // Par certo
                flippedCards = [];
                checkWin();
            } else {
                // Par errado, vira as cartas de volta depois de 1s
                setTimeout(() => {
                    first.classList.remove('flip');
                    second.classList.remove('flip');
                    flippedCards = [];
                }, 1000);
            }
        }
    }

    // Verifica se venceu
    function checkWin() {
        const flipped = document.querySelectorAll('.memory-card.flip');
        if (flipped.length === cards.length) {
            winMessage.classList.remove('hidden');
            winText.textContent = `Você venceu em ${tries} tentativas!`;
        }
    }

    // Botão jogar novamente
    playAgainBtn.addEventListener('click', () => {
        location.reload();
    });
});
