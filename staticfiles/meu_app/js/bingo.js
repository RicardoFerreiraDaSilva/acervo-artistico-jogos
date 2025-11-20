document.addEventListener('DOMContentLoaded', () => {
    // --- 1. PERGUNTAS E RESPOSTAS ---
    const allQuestions = [
        { question: 'Qual artista renascentista italiano pintou a famosa "Mona Lisa"?', answer: 'Leonardo da Vinci' },
        { question: 'Que pintor holandês é famoso por "A Noite Estrelada" e por ter cortado parte da própria orelha?', answer: 'Van Gogh' },
        { question: 'Qual movimento artístico, liderado por Pablo Picasso, representa objetos de vários ângulos ao mesmo tempo?', answer: 'Cubismo' },
        { question: 'Qual artista brasileira é famosa pelo quadro "Abaporu", um marco do Movimento Antropofágico?', answer: 'Tarsila do Amaral' },
        { question: 'Que pintora mexicana é conhecida por seus intensos autorretratos e por sua vida marcada por dores físicas?', answer: 'Frida Kahlo' },
        { question: 'Que artista é famoso pela escultura de "Davi" e por pintar o teto da Capela Sistina?', answer: 'Michelangelo' },
        { question: 'Qual estilo artístico explora o mundo dos sonhos e do inconsciente, com obras famosas de Salvador Dalí?', answer: 'Surrealismo' },
        { question: 'Quais são as três cores primárias, que não podem ser criadas pela mistura de outras cores?', answer: 'Vermelho, Azul e Amarelo' },
        { question: 'Como é chamada a forma de arte visual feita em locais públicos, como muros e paredes?', answer: 'Grafite / Arte de Rua' },
        { question: 'Qual o apelido do importante escultor do Barroco mineiro no Brasil, famoso por suas obras em pedra-sabão?', answer: 'Aleijadinho' }
    ];

    let shuffledQuestions = allQuestions.sort(() => 0.5 - Math.random());
    let currentQuestionIndex = -1;
    let currentAnswer = '';
    let gameWon = false; // NOVO: Variável para controlar se o jogo já foi ganho.

    const cardAnswers = shuffledQuestions.slice(0, 8).map(q => q.answer);
    cardAnswers.push('ESPAÇO LIVRE');
    const shuffledCardAnswers = cardAnswers.sort(() => 0.5 - Math.random());

    // NOVO: Array com todas as combinações de vitória (baseado nos índices das células de 0 a 8)
    const winningCombos = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // Linhas
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // Colunas
        [0, 4, 8], [2, 4, 6]             // Diagonais
    ];

    // --- 2. ELEMENTOS DA PÁGINA ---
    const bingoCard = document.getElementById('bingo-card');
    const questionDisplay = document.getElementById('question-display');
    const answerDisplay = document.getElementById('answer-display');
    const drawButton = document.getElementById('draw-question-btn');
    const revealButton = document.getElementById('reveal-answer-btn');

    // --- 3. CRIAR A CARTELA ---
    function createCard() {
        for (const answerText of shuffledCardAnswers) {
            const cell = document.createElement('div');
            cell.classList.add('bingo-cell');
            cell.textContent = answerText;

            if (answerText === 'ESPAÇO LIVRE') {
                cell.classList.add('free-space', 'marked');
            }

            cell.addEventListener('click', () => {
                if (gameWon || answerText === 'ESPAÇO LIVRE') return; // Se o jogo acabou, não faz nada

                cell.classList.toggle('marked');

                // NOVO: Chama a função de verificação após cada clique
                if (checkForWin()) {
                    gameWon = true;
                    // Usamos um pequeno delay para que o jogador veja a última célula ser marcada
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

    // NOVO: Função que verifica se há um vencedor
    function checkForWin() {
        const allCells = document.querySelectorAll('.bingo-cell');
        
        // Itera sobre cada combinação vencedora
        for (const combo of winningCombos) {
            // "every" checa se TODOS os elementos da combinação satisfazem a condição
            const didWin = combo.every(index => {
                return allCells[index].classList.contains('marked');
            });

            if (didWin) {
                return true; // Se encontrou uma combinação completa, retorna verdadeiro
            }
        }
        return false; // Se checou todas e não encontrou, retorna falso
    }

    // --- 4. LÓGICA DO JOGO ---
    drawButton.addEventListener('click', () => {
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

    // --- INICIALIZAÇÃO ---
    createCard();
});