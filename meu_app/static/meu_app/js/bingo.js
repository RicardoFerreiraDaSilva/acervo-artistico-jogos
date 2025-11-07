// bingo.js

document.addEventListener('DOMContentLoaded', () => {
    // =========================================================
    // 1. DADOS INJETADOS PELO DJANGO NO TEMPLATE HTML
    // =========================================================
    
    // As variáveis abaixo DEVERÃO ser injetadas no seu template HTML (jogo.html)
    // a partir do contexto do Django, usando JSON.parse(variavel_django_json).
    // Exemplo de injeção no template:
    // <script> 
    //     const shuffledQuestions = JSON.parse("{{ perguntas_sorteio_json | safe }}");
    //     const cardAnswers = JSON.parse("{{ respostas_cartela_json | safe }}");
    //     const tamanhoCartela = {{ tamanho_cartela }};
    // </script>

    // IMPORTANTE: Para fins de demonstração neste script, usaremos dados fictícios
    // caso as variáveis não sejam injetadas, mas no seu ambiente Django, 
    // elas devem vir do backend.

    let shuffledQuestions = [];
    let cardAnswers = [];
    let tamanhoCartela = 3; // Default 3x3

    // Tenta obter os dados injetados
    try {
        // Assume que o Django injetou tags script com IDs específicos ou variáveis globais
        // Você pode ajustar isso para o método que preferir no seu template.
        const qsData = JSON.parse(document.getElementById('shuffled-questions-data')?.textContent || '[]');
        const caData = JSON.parse(document.getElementById('card-answers-data')?.textContent || '[]');
        const tcData = parseInt(document.getElementById('tamanho-cartela-data')?.textContent || '3');

        if (qsData.length > 0) shuffledQuestions = qsData.sort(() => 0.5 - Math.random());
        if (caData.length > 0) cardAnswers = caData;
        tamanhoCartela = tcData;
    } catch (e) {
        console.warn("Erro ao carregar dados do Django. Usando dados de protótipo.");
        // PROTÓTIPO DE DADOS (apenas para teste sem Django)
        shuffledQuestions = [
            { question: 'P: Leonardo da Vinci?', answer: 'Leonardo da Vinci' },
            { question: 'P: Van Gogh?', answer: 'Van Gogh' },
            // ... adicione mais para N > 3
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

    // Adiciona o ESPAÇO LIVRE e mistura as respostas da cartela
    cardAnswers.push('ESPAÇO LIVRE');
    const shuffledCardAnswers = cardAnswers.sort(() => 0.5 - Math.random());

    // Elementos do DOM
    const bingoCard = document.getElementById('bingo-card');
    const questionDisplay = document.getElementById('question-display');
    const answerDisplay = document.getElementById('answer-display');
    const drawButton = document.getElementById('draw-question-btn');
    const revealButton = document.getElementById('reveal-answer-btn');

    // Combinações de vitória dinâmicas baseadas no tamanho da cartela
    const winningCombos = generateWinningCombos(tamanhoCartela); 

    // =========================================================
    // 3. FUNÇÕES DINÂMICAS DE CARTELA E VITÓRIA
    // =========================================================

    /**
     * Gera os índices das combinações vencedoras (linhas, colunas, diagonais) 
     * para uma cartela de tamanho N x N.
     * @param {number} N - O lado da cartela (ex: 3 para 3x3).
     * @returns {number[][]} Array de arrays contendo índices das células vencedoras.
     */
    function generateWinningCombos(N) {
        const combos = [];

        // 1. Linhas e Colunas
        for (let i = 0; i < N; i++) {
            const row = [];
            const col = [];
            for (let j = 0; j < N; j++) {
                row.push(i * N + j); // Linha i (0, 1, 2), (3, 4, 5), ...
                col.push(j * N + i); // Coluna i (0, 3, 6), (1, 4, 7), ...
            }
            combos.push(row);
            combos.push(col);
        }

        // 2. Diagonais
        const diag1 = [];
        const diag2 = [];
        for (let i = 0; i < N; i++) {
            diag1.push(i * N + i);          // Diagonal principal: 0, 4, 8, 12...
            diag2.push(i * N + (N - 1 - i)); // Diagonal secundária: N-1, 2N-2, 3N-3...
        }
        combos.push(diag1);
        combos.push(diag2);

        return combos;
    }

    /**
     * Cria e renderiza a cartela de bingo no DOM.
     */
    function createCard() {
        // Define o layout do grid CSS para NxN
        bingoCard.style.gridTemplateColumns = `repeat(${tamanhoCartela}, 1fr)`;
        
        // Limpa a cartela existente
        bingoCard.innerHTML = ''; 

        for (const answerText of shuffledCardAnswers) {
            const cell = document.createElement('div');
            cell.classList.add('bingo-cell');
            cell.textContent = answerText;

            if (answerText === 'ESPAÇO LIVRE') {
                cell.classList.add('free-space', 'marked');
            }

            cell.addEventListener('click', () => {
                if (gameWon || answerText === 'ESPAÇO LIVRE') return;

                cell.classList.toggle('marked');

                if (checkForWin()) {
                    gameWon = true;
                    // Pequeno delay para a última célula ser marcada visualmente
                    setTimeout(() => {
                        questionDisplay.innerHTML = `<h2 style="color: #D62828;">BINGO! VOCÊ VENCEU!</h2>`;
                        answerDisplay.classList.add('hidden');
                        drawButton.disabled = true;
                        revealButton.classList.add('hidden');
                    }, 100);
                }
            });
            bingoCard.appendChild(cell);
        }
    }

    /**
     * Verifica se há alguma linha, coluna ou diagonal completa.
     * @returns {boolean} True se houver vitória, false caso contrário.
     */
    function checkForWin() {
        if (gameWon) return true;
        
        const allCells = document.querySelectorAll('#bingo-card .bingo-cell');
        
        for (const combo of winningCombos) {
            // Checa se TODOS os índices na combinação estão marcados
            const didWin = combo.every(index => {
                // Garante que o índice existe e está marcado
                return allCells[index] && allCells[index].classList.contains('marked');
            });

            if (didWin) {
                // Opcional: Destacar a combinação vencedora
                combo.forEach(index => {
                    allCells[index].classList.add('winning-combo');
                });
                return true;
            }
        }
        return false;
    }

    // =========================================================
    // 4. LÓGICA DE SORTEIO DE PERGUNTAS
    // =========================================================
    
    drawButton.addEventListener('click', () => {
        if (gameWon) return; 

        currentQuestionIndex++;
        if (currentQuestionIndex >= shuffledQuestions.length) {
            questionDisplay.innerHTML = '<p>Fim de jogo! Todas as perguntas foram sorteadas.</p>';
            drawButton.disabled = true;
            revealButton.classList.add('hidden');
            return;
        }

        const questionObj = shuffledQuestions[currentQuestionIndex];
        currentAnswer = questionObj.answer;

        questionDisplay.innerHTML = `<p>${questionObj.question}</p>`;
        answerDisplay.classList.add('hidden');
        revealButton.classList.remove('hidden');
    });

    revealButton.addEventListener('click', () => {
        answerDisplay.innerHTML = `<p><strong>Resposta:</strong> ${currentAnswer}</p>`;
        answerDisplay.classList.remove('hidden');
    });

    // =========================================================
    // 5. INICIALIZAÇÃO
    // =========================================================
    createCard();
});