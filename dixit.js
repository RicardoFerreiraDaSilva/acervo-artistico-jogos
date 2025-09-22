document.addEventListener('DOMContentLoaded', () => {
    // --- 1. PALAVRAS E PISTAS ---
    const gameWords = [
        {
            word: 'PINCEL',
            clues: [
                'Sou um instrumento, mas não toco música.',
                'Tenho pelos ou cerdas em uma ponta.',
                'Sirvo para aplicar cor sobre uma superfície.',
                'Sou o melhor amigo do pintor.'
            ]
        },
        {
            word: 'MURAL',
            clues: [
                'Não sou um quadro, mas mostro uma grande pintura.',
                'Minha tela é uma parede.',
                'Artistas de rua me usam com frequência.',
                'Posso contar uma história em um espaço público.'
            ]
        },
        {
            word: 'PALETA',
            clues: [
                'Sou um objeto plano, muitas vezes de madeira.',
                'É em mim que as cores se encontram e se misturam.',
                'Tenho um buraco para o polegar do artista.',
                'Sou o local de nascimento de um novo tom.'
            ]
        }
    ];

    // --- 2. ELEMENTOS DA PÁGINA ---
    const clueList = document.getElementById('clue-list');
    const attemptsLeftSpan = document.getElementById('attempts-left');
    const scoreSpan = document.getElementById('score');
    const guessInput = document.getElementById('guess-input');
    const guessButton = document.getElementById('guess-button');
    const feedbackMessage = document.getElementById('feedback-message');
    const endGameMessage = document.getElementById('end-game-message');
    const endGameTitle = document.getElementById('end-game-title');
    const endGameText = document.getElementById('end-game-text');
    const playAgainButton = document.getElementById('play-again-button');

    // --- 3. VARIÁVEIS DE ESTADO DO JOGO ---
    let secretWordObj;
    let attemptsLeft;
    let revealedCluesCount;

    // --- 4. FUNÇÕES DO JOGO ---
    function startGame() {
        // Seleciona uma nova palavra aleatória
        secretWordObj = gameWords[Math.floor(Math.random() * gameWords.length)];
        
        // Reseta o estado do jogo
        attemptsLeft = 5;
        revealedCluesCount = 0;
        
        // Reseta a interface
        attemptsLeftSpan.textContent = attemptsLeft;
        scoreSpan.textContent = 100;
        clueList.innerHTML = '';
        guessInput.value = '';
        guessInput.disabled = false;
        guessButton.disabled = false;
        feedbackMessage.textContent = '';
        endGameMessage.classList.add('hidden');

        // Revela a primeira pista
        revealNextClue();
    }

    function revealNextClue() {
        if (revealedCluesCount < secretWordObj.clues.length) {
            const clue = secretWordObj.clues[revealedCluesCount];
            const li = document.createElement('li');
            li.textContent = clue;
            clueList.appendChild(li);
            revealedCluesCount++;
        }
    }

    function handleGuess() {
        const userGuess = guessInput.value.trim().toUpperCase();
        if (!userGuess) return;

        attemptsLeft--;
        attemptsLeftSpan.textContent = attemptsLeft;
        scoreSpan.textContent = attemptsLeft * 20; // Atualiza a pontuação máxima possível

        if (userGuess === secretWordObj.word) {
            // ACERTOU
            const finalScore = (attemptsLeft + 1) * 20;
            feedbackMessage.textContent = `Correto! Você fez ${finalScore} pontos!`;
            feedbackMessage.style.color = '#1b5e20';
            endGame(true, finalScore);
        } else {
            // ERROU
            if (attemptsLeft > 0) {
                feedbackMessage.textContent = 'Incorreto. Tente novamente! Nova pista revelada.';
                feedbackMessage.style.color = '#D62828';
                revealNextClue();
            } else {
                feedbackMessage.textContent = 'Fim de jogo!';
                feedbackMessage.style.color = '#D62828';
                endGame(false);
            }
        }
        guessInput.value = '';
    }
    
    function endGame(isWinner, score) {
        guessInput.disabled = true;
        guessButton.disabled = true;
        endGameMessage.classList.remove('hidden');

        if(isWinner) {
            endGameTitle.textContent = 'Parabéns, você acertou!';
            endGameText.textContent = `A palavra era "${secretWordObj.word}". Sua pontuação foi ${score} pontos.`;
        } else {
            endGameTitle.textContent = 'Não foi desta vez!';
            endGameText.textContent = `A palavra secreta era "${secretWordObj.word}".`;
        }
    }

    // --- 5. EVENT LISTENERS ---
    guessButton.addEventListener('click', handleGuess);
    guessInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            handleGuess();
        }
    });
    playAgainButton.addEventListener('click', startGame);

    // --- INICIALIZAÇÃO ---
    startGame();
});