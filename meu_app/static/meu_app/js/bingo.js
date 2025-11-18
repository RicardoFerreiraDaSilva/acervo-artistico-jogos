// // bingo.js (Versão Final com Bloqueio Inicial de Cliques)

document.addEventListener('DOMContentLoaded', () => {
    // =========================================================
    // 1. DADOS INJETADOS PELO DJANGO
    // =========================================================

    let shuffledQuestions = [];
    let cardAnswers = [];
    let tamanhoCartela = 3; 
    
    try {
        const qsData = JSON.parse(document.getElementById('shuffled-questions-data')?.textContent || '[]');
        const caData = JSON.parse(document.getElementById('card-answers-data')?.textContent || '[]');
        const tcData = parseInt(document.getElementById('tamanho-cartela-data')?.textContent || '3');

        if (qsData.length > 0) shuffledQuestions = qsData.sort(() => 0.5 - Math.random());
        if (caData.length > 0) cardAnswers = caData;
        tamanhoCartela = tcData;
    } catch (e) {
        console.warn("Erro ao carregar dados do Django. Usando dados de protótipo.");
        // PROTÓTIPO DE DADOS 
        shuffledQuestions = [
            { question: 'P: Leonardo da Vinci?', answer: 'Leonardo da Vinci' },
            { question: 'P: Van Gogh?', answer: 'Van Gogh' },
            { question: 'P: O que é cubismo?', answer: 'Cubismo' },
            { question: 'P: Artista brasileira?', answer: 'Tarsila do Amaral' },
            { question: 'P: Não está na cartela?', answer: 'Pablo Picasso' }, 
            { question: 'P: Outro artista', answer: 'Michelangelo' },
        ];
        cardAnswers = ['Leonardo da Vinci', 'Van Gogh', 'Cubismo', 'Tarsila do Amaral', 'Frida Kahlo', 'Michelangelo', 'Surrealismo', 'Aleijadinho'];
        tamanhoCartela = 3;
    }

    // =========================================================
    // 2. VARIÁVEIS DE ESTADO E INICIALIZAÇÃO
    // =========================================================

    let currentQuestionIndex = -1;
    let currentAnswer = '';
    let gameWon = false;

    let score = 0;
    let attemptsRemaining = 3; 
    
    // CRÍTICO: isQuestionActive começa como false
    let isQuestionActive = false; 
    let isAnswerRevealed = false; 

    let startTime = null;
    let timerInterval = null;
    let totalTimeElapsed = '';

    cardAnswers.push('ESPAÇO LIVRE');
    const shuffledCardAnswers = cardAnswers.sort(() => 0.5 - Math.random());

    // Elementos do DOM
    const bingoCard = document.getElementById('bingo-card');
    const questionDisplay = document.getElementById('question-display');
    const answerDisplay = document.getElementById('answer-display');
    const drawButton = document.getElementById('draw-question-btn');
    const revealButton = document.getElementById('reveal-answer-btn');
    const notOnCardButton = document.getElementById('not-on-card-btn');
    const scoreDisplay = document.getElementById('score-display');
    const timerDisplay = document.getElementById('timer-display');
    
    // Elementos do Modal (Adicionei placeholders aqui, se você não tem o modal, remova estas linhas ou adicione os elementos ao HTML)
    const howToPlayButton = document.getElementById('how-to-play-btn');
    const overlay = document.getElementById('overlay');
    const closeModalButton = document.getElementById('close-modal-btn');


    const winningCombos = generateWinningCombos(tamanhoCartela);

    // =========================================================
    // 3. FUNÇÕES DE SUPORTE
    // =========================================================

    function generateWinningCombos(N) {
        const combos = [];
        for (let i = 0; i < N; i++) {
            const row = [];
            const col = [];
            for (let j = 0; j < N; j++) {
                row.push(i * N + j);
                col.push(j * N + i);
            }
            combos.push(row);
            combos.push(col);
        }
        const diag1 = [];
        const diag2 = [];
        for (let i = 0; i < N; i++) {
            diag1.push(i * N + i);
            diag2.push(i * N + (N - 1 - i));
        }
        combos.push(diag1);
        combos.push(diag2);
        return combos;
    }

    function findCellByAnswer(answer) {
        const allCells = document.querySelectorAll('#bingo-card .bingo-cell');
        for (const cell of allCells) {
            if (cell.textContent === answer) {
                return cell;
            }
        }
        return null;
    }

    function updateScore(points) {
        score += points;
        scoreDisplay.textContent = score;
    }

    function startTimer() {
        if (!startTime) {
            startTime = Date.now();
        }
        if (timerInterval) return;

        timerInterval = setInterval(() => {
            const elapsed = Date.now() - startTime;
            const minutes = String(Math.floor(elapsed / 60000)).padStart(2, '0');
            const seconds = String(Math.floor((elapsed % 60000) / 1000)).padStart(2, '0');
            timerDisplay.textContent = `${minutes}:${seconds}`;
        }, 1000);
    }

    function stopTimer() {
        clearInterval(timerInterval);
        const elapsed = Date.now() - startTime;
        const minutes = String(Math.floor(elapsed / 60000)).padStart(2, '0');
        const seconds = String(Math.floor((elapsed % 60000) / 1000)).padStart(2, '0');
        totalTimeElapsed = `${minutes}:${seconds}`;
    }

    // =========================================================
    // 4. CRIAÇÃO DA CARTELA E LÓGICA DE CLIQUE
    // =========================================================

    function createCard() {
        bingoCard.style.gridTemplateColumns = `repeat(${tamanhoCartela}, 1fr)`;
        bingoCard.innerHTML = '';

        for (const answerText of shuffledCardAnswers) {
            const cell = document.createElement('div');
            cell.classList.add('bingo-cell');
            cell.textContent = answerText;
            
            // 🛑 CORREÇÃO 1: Bloqueia cliques iniciais ao criar a cartela
            if (!isQuestionActive && answerText !== 'ESPAÇO LIVRE') {
                cell.classList.add('disabled-click');
            }

            if (answerText === 'ESPAÇO LIVRE') {
                cell.classList.add('free-space', 'marked');
            }

            cell.addEventListener('click', () => {
                if (gameWon) return;
                
                // 🛑 CORREÇÃO 2A: Bloqueia o clique se não houver pergunta ativa E a célula não estiver marcada
                if (!isQuestionActive && !cell.classList.contains('marked')) {
                    return; 
                }

                // Célula já marcada ou Espaço Livre
                if (cell.classList.contains('marked')) {
                    if (checkForWin()) { /* ... */ } 
                    return;
                }
                
                // Se a resposta foi revelada, permite marcar/desmarcar livremente (sem pontuação)
                if (isAnswerRevealed) {
                    cell.classList.toggle('marked');
                    if (checkForWin()) { /* ... */ }
                    return;
                }

                // Lógica de Pontuação e Chances
                if (isQuestionActive && attemptsRemaining > 0) {
                    if (answerText === currentAnswer) {
                        let points = 0;
                        if (attemptsRemaining === 3) points = 100;
                        else if (attemptsRemaining === 2) points = 50;
                        else if (attemptsRemaining === 1) points = 10;

                        updateScore(points);
                        cell.classList.add('marked');
                        cell.classList.remove('wrong-guess');
                        
                        questionDisplay.innerHTML = `<p>${shuffledQuestions[currentQuestionIndex].question}</p><p style="color: green; font-weight: bold;">Acerto! +${points} pontos!</p>`;

                        endRound(); 

                    } else {
                        attemptsRemaining--;
                        cell.classList.add('wrong-guess'); 

                        if (attemptsRemaining > 0) {
                            questionDisplay.innerHTML = `<p>${shuffledQuestions[currentQuestionIndex].question}</p><p style="color: red; font-size: 0.9em;">Resposta errada. ${attemptsRemaining} chances restantes.</p>`;
                        } else {
                            questionDisplay.innerHTML = `<p>${shuffledQuestions[currentQuestionIndex].question}</p><p style="color: red; font-weight: bold;">Chances esgotadas. 0 pontos.</p>`;
                            endRound();
                        }
                    }
                }
            });
            bingoCard.appendChild(cell);
        }
    }

    function endRound() {
        isQuestionActive = false;
        attemptsRemaining = 3; 
        isAnswerRevealed = false;
        drawButton.disabled = false;
        revealButton.classList.add('hidden');
        notOnCardButton.classList.add('hidden');
        
        // 🛑 CORREÇÃO 3: Bloqueia cliques na cartela novamente (entre rodadas)
        document.querySelectorAll('.bingo-cell:not(.marked)').forEach(cell => cell.classList.add('disabled-click'));

        if (checkForWin()) {
            gameWon = true;
            stopTimer();
            // Bloqueia todos os cliques após a vitória
            document.querySelectorAll('.bingo-cell').forEach(cell => cell.classList.add('disabled-click'));
            
            setTimeout(() => {
                questionDisplay.innerHTML = `<h2 style="color: #D62828;">BINGO! VOCÊ VENCEU!</h2><p>Tempo final: ${totalTimeElapsed}</p><p>Pontuação final: ${score}</p>`;
                answerDisplay.classList.add('hidden');
                drawButton.disabled = true;
            }, 100);
        }
    }

    function checkForWin() {
        if (gameWon) return true;
        
        const allCells = document.querySelectorAll('#bingo-card .bingo-cell');
        
        for (const combo of winningCombos) {
            const didWin = combo.every(index => {
                return allCells[index] && allCells[index].classList.contains('marked');
            });

            if (didWin) {
                combo.forEach(index => {
                    allCells[index].classList.add('winning-combo');
                });
                return true;
            }
        }
        return false;
    }

    // =========================================================
    // 5. LÓGICA DE SORTEIO DE PERGUNTAS E BOTÕES
    // =========================================================
    
    drawButton.addEventListener('click', () => {
        if (gameWon) return; 

        startTimer();

        currentQuestionIndex++;
        if (currentQuestionIndex >= shuffledQuestions.length) {
            questionDisplay.innerHTML = '<p>Fim de jogo! Todas as perguntas foram sorteadas.</p>';
            drawButton.disabled = true;
            revealButton.classList.add('hidden');
            notOnCardButton.classList.add('hidden');
            return;
        }

        const questionObj = shuffledQuestions[currentQuestionIndex];
        currentAnswer = questionObj.answer;

        questionDisplay.innerHTML = `<p>${questionObj.question}</p>`;
        answerDisplay.classList.add('hidden');
        
        revealButton.classList.remove('hidden');
        notOnCardButton.classList.remove('hidden'); 
        drawButton.disabled = true; 
        
        // Ativa a rodada e libera o clique nas células
        isQuestionActive = true;
        isAnswerRevealed = false;
        attemptsRemaining = 3; 
        
        // 🛑 CORREÇÃO 4: Remove a classe que bloqueia cliques (liberando a cartela para o jogo)
        document.querySelectorAll('.bingo-cell').forEach(cell => cell.classList.remove('disabled-click'));

        document.querySelectorAll('.wrong-guess').forEach(cell => cell.classList.remove('wrong-guess'));
        document.querySelectorAll('.missed-answer').forEach(cell => cell.classList.remove('missed-answer'));
    });

    // Ver Resposta (0 Pontos)
    revealButton.addEventListener('click', () => {
        if (gameWon || !isQuestionActive || isAnswerRevealed) return;

        isAnswerRevealed = true;
        updateScore(0); 
        
        answerDisplay.innerHTML = `<p><strong>Resposta:</strong> ${currentAnswer}</p><p style="color: red; font-weight: bold;">0 pontos por ter revelado a resposta.</p>`;
        answerDisplay.classList.remove('hidden');
        
        findCellByAnswer(currentAnswer)?.classList.add('missed-answer');

        endRound();
    });

    // Botão "A Resposta Não Está na Cartela" (Lógica de +10 ou -50)
    notOnCardButton.addEventListener('click', () => {
        if (gameWon || !isQuestionActive || isAnswerRevealed) return;

        const isAnswerPresent = shuffledCardAnswers.includes(currentAnswer); 

        if (isAnswerPresent) {
            updateScore(-50);
            questionDisplay.innerHTML = `<p>${shuffledQuestions[currentQuestionIndex].question}</p><p style="color: red; font-weight: bold;">ERRO! A resposta "${currentAnswer}" estava na cartela! -50 pontos.</p>`;
            findCellByAnswer(currentAnswer)?.classList.add('missed-answer');
        } else {
            updateScore(10);
            questionDisplay.innerHTML = `<p>${shuffledQuestions[currentQuestionIndex].question}</p><p style="color: green; font-weight: bold;">CORRETO! A resposta não estava na cartela. +10 pontos.</p>`;
        }
        
        endRound();
    });

    // =========================================================
    // 6. LÓGICA DO MODAL (Manter para evitar quebra, mesmo que não seja a sua prioridade)
    // =========================================================
    
    // As linhas abaixo são essenciais para que o script não falhe se o seu HTML tiver o botão "Como Jogar".
    if (howToPlayButton && overlay && closeModalButton) {
        howToPlayButton.addEventListener('click', () => {
            overlay.classList.remove('hidden');
        });

        closeModalButton.addEventListener('click', () => {
            overlay.classList.add('hidden');
        });

        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                overlay.classList.add('hidden');
            }
        });
    }

    // =========================================================
    // 7. INICIALIZAÇÃO
    // =========================================================
    createCard();
    scoreDisplay.textContent = score; 
    timerDisplay.textContent = '00:00';
});