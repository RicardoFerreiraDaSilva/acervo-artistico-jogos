document.addEventListener('DOMContentLoaded', () => {
    // --- 1. CONFIGURAÇÃO DO JOGO ---
    const wordsToFind = ['PICASSO', 'MONALISA', 'RENOIR', 'ARTE', 'MUSEU', 'TARSILA', 'CUBISMO', 'DALI', 'PINCEL', 'TELA'];
    const gridSize = 12;

    // NOVO: Grade corrigida com todas as 10 palavras presentes.
    const gridLayout = [
        ['C', 'P', 'Z', 'W', 'V', 'L', 'E', 'C', 'N', 'I', 'P', 'R'],
        ['U', 'I', 'T', 'A', 'R', 'S', 'I', 'L', 'A', 'X', 'B', 'R'],
        ['B', 'C', 'L', 'R', 'Y', 'F', 'J', 'G', 'D', 'A', 'L', 'I'],
        ['I', 'A', 'Q', 'T', 'K', 'S', 'O', 'M', 'B', 'I', 'S', 'O'],
        ['S', 'S', 'V', 'E', 'B', 'D', 'A', 'L', 'I', 'P', 'M', 'N'],
        ['M', 'S', 'R', 'W', 'X', 'Z', 'V', 'B', 'N', 'M', 'U', 'E'],
        ['O', 'O', 'Y', 'F', 'G', 'H', 'J', 'K', 'L', 'Q', 'S', 'R'],
        ['N', 'A', 'S', 'I', 'L', 'A', 'N', 'O', 'M', 'X', 'E', 'Z'],
        ['A', 'C', 'V', 'B', 'N', 'M', 'Q', 'W', 'E', 'R', 'U', 'P'],
        ['R', 'T', 'Y', 'U', 'I', 'O', 'P', 'A', 'S', 'D', 'F', 'G'],
        ['H', 'J', 'K', 'L', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'Q'],
        ['W', 'E', 'T', 'E', 'L', 'A', 'I', 'O', 'P', 'A', 'S', 'D']
    ];

    // --- 2. ELEMENTOS DA PÁGINA ---
    const gridContainer = document.getElementById('grid-container');
    const wordListUl = document.getElementById('word-list');
    const winMessage = document.getElementById('win-message');

    let isSelecting = false;
    let selectedCells = [];
    let foundWords = [];

    // --- 3. FUNÇÕES DE CRIAÇÃO ---
    function createGrid() {
        for (let row = 0; row < gridSize; row++) {
            for (let col = 0; col < gridSize; col++) {
                const cell = document.createElement('div');
                cell.classList.add('grid-cell');
                cell.textContent = gridLayout[row][col];
                cell.dataset.row = row;
                cell.dataset.col = col;
                gridContainer.appendChild(cell);
            }
        }
    }

    function populateWordList() {
        wordsToFind.forEach(word => {
            const li = document.createElement('li');
            li.textContent = word;
            li.id = `word-${word}`;
            wordListUl.appendChild(li);
        });
    }

    // --- 4. LÓGICA DE SELEÇÃO (CLICAR E ARRASTAR) ---
    gridContainer.addEventListener('mousedown', (e) => {
        if (e.target.classList.contains('grid-cell')) {
            isSelecting = true;
            selectedCells = [e.target];
            e.target.classList.add('selecting');
        }
    });

    gridContainer.addEventListener('mouseover', (e) => {
        if (isSelecting && e.target.classList.contains('grid-cell')) {
            if (!selectedCells.includes(e.target)) {
                selectedCells.push(e.target);
                e.target.classList.add('selecting');
            }
        }
    });

    window.addEventListener('mouseup', () => {
        if (isSelecting) {
            isSelecting = false;
            checkSelectedWord();
        }
    });

    // --- 5. VERIFICAÇÃO E VITÓRIA ---
    function checkSelectedWord() {
        let selectedWord = '';
        selectedCells.forEach(cell => {
            selectedWord += cell.textContent;
        });

        const reversedWord = selectedWord.split('').reverse().join('');
        let correctWord = null;

        if (wordsToFind.includes(selectedWord)) {
            correctWord = selectedWord;
        } else if (wordsToFind.includes(reversedWord)) {
            correctWord = reversedWord;
        }

        if (correctWord && !foundWords.includes(correctWord)) {
            // Palavra correta!
            foundWords.push(correctWord);
            selectedCells.forEach(cell => {
                cell.classList.remove('selecting');
                cell.classList.add('found');
            });
            document.getElementById(`word-${correctWord}`).classList.add('found');

            if (foundWords.length === wordsToFind.length) {
                winMessage.classList.remove('hidden');
            }
        } else {
            // Palavra errada
            selectedCells.forEach(cell => {
                cell.classList.remove('selecting');
            });
        }
        selectedCells = [];
    }

    // --- INICIALIZAÇÃO ---
    createGrid();
    populateWordList();
});