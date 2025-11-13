document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. CARREGAR DADOS DINÂMICOS DO DJANGO ---
    const dataElement = document.getElementById('caca-palavras-data');
    if (!dataElement) {
        console.error("Dados do caça-palavras não carregados. Verifique o template e a view.");
        return;
    }
    const gameData = JSON.parse(dataElement.textContent.trim());

    // Fallbacks para evitar erros se os dados estiverem vazios
    const wordsData = gameData.palavras || [];
    const gridLayout = gameData.layout || [];
    const gridSize = gameData.size || 12;

    if (wordsData.length === 0 || gridLayout.length === 0) {
        alert("Erro: Não há palavras ou grade para este tema. Verifique o Admin.");
        return;
    }

    const wordsToFind = wordsData.map(d => d.palavra);

    // --- 2. ELEMENTOS DA PÁGINA ---
    const gridContainer = document.getElementById('grid-container');
    const wordListUl = document.getElementById('word-list');
    const winMessage = document.getElementById('win-message');
    const descDisplay = document.getElementById('word-description'); 
    
    // Configurar o GRID CSS com o tamanho correto
    gridContainer.style.gridTemplateColumns = `repeat(${gridSize}, 1fr)`;

    let isSelecting = false;
    let selectedCells = [];
    let foundWords = [];
    let startCell = null; 

    // --- 3. FUNÇÕES DE CRIAÇÃO ---
    function createGrid() {
        gridLayout.forEach((rowArray, row) => {
             rowArray.forEach((letter, col) => {
                 const letterText = typeof letter === 'string' ? letter : ''; 
                 
                 const cell = document.createElement('div');
                 cell.classList.add('grid-cell');
                 cell.textContent = letterText;
                 cell.dataset.row = row;
                 cell.dataset.col = col;
                 gridContainer.appendChild(cell);
            });
        });
    }

    function populateWordList() {
        wordsData.forEach(item => {
            const li = document.createElement('li');
            li.textContent = item.palavra;
            li.id = `word-${item.palavra}`;
            li.dataset.description = item.descricao;
            
            // NOVO: Exibe a descrição ao clicar/tocar
            li.addEventListener('click', () => {
                descDisplay.innerHTML = `<strong>${item.palavra}:</strong> ${item.descricao}`;
            });
            
            wordListUl.appendChild(li);
        });
        descDisplay.innerHTML = `<strong>Dica:</strong> Selecione uma palavra da lista acima.`;
    }
    
    // --- FUNÇÃO DE INTERPOLAÇÃO LINEAR (CORREÇÃO DE SELEÇÃO) ---
    /**
     * Retorna um array de todas as células que formam uma linha reta entre startCell e endCell.
     */
    function getCellsInLine(startCell, endCell) {
        const r1 = parseInt(startCell.dataset.row);
        const c1 = parseInt(startCell.dataset.col);
        const r2 = parseInt(endCell.dataset.row);
        const c2 = parseInt(endCell.dataset.col);

        const rowDiff = r2 - r1;
        const colDiff = c2 - c1;

        // Verifica linearidade (Horizontal: r=0, Vertical: c=0, Diagonal: |r|=|c|)
        if (rowDiff !== 0 && colDiff !== 0 && Math.abs(rowDiff) !== Math.abs(colDiff)) {
            return []; // Não é uma linha reta válida
        }

        // Calcula os passos e o comprimento da linha
        const rowStep = rowDiff === 0 ? 0 : (rowDiff > 0 ? 1 : -1);
        const colStep = colDiff === 0 ? 0 : (colDiff > 0 ? 1 : -1);
        const length = Math.max(Math.abs(rowDiff), Math.abs(colDiff));

        const cells = [];
        
        for (let i = 0; i <= length; i++) {
            const currentRow = r1 + i * rowStep;
            const currentCol = c1 + i * colStep;

            const cell = gridContainer.querySelector(`[data-row="${currentRow}"][data-col="${currentCol}"]`);
            
            if (cell) {
                cells.push(cell);
            }
        }
        return cells;
    }
    

    // --- 4. LÓGICA DE SELEÇÃO E EVENTOS ---
    
    function resetSelection() {
        document.querySelectorAll('.grid-cell.selecting').forEach(cell => {
            if (!cell.classList.contains('found')) { 
                cell.classList.remove('selecting');
            }
        });
        selectedCells = [];
        isSelecting = false;
        startCell = null;
    }
    
    function getCellFromEvent(e) {
        let target = e.target;
        if (e.touches && e.touches[0]) {
            const touch = e.touches[0];
            target = document.elementFromPoint(touch.clientX, touch.clientY);
        }
        if (target && target.classList.contains('grid-cell')) {
            return target;
        }
        return null;
    }

    
    // Início da Seleção (Mouse Down / Touch Start)
    const handleStart = (e) => {
        const cell = getCellFromEvent(e);
        if (cell && !cell.classList.contains('found')) { 
            resetSelection();
            isSelecting = true;
            startCell = cell;
            cell.classList.add('selecting');
        }
    };
    
    // Arrastar/Mover (Mouse Move / Touch Move)
    const handleMove = (e) => {
        if (!isSelecting || !startCell) return;
        e.preventDefault(); 
        
        const currentCell = getCellFromEvent(e);
        if (!currentCell || currentCell.classList.contains('found')) return;
        
        // CORREÇÃO: Usa a função de interpolação para selecionar todas as letras no caminho
        const potentialCells = getCellsInLine(startCell, currentCell);
        
        // 1. Limpa todas as seleções temporárias (apenas as não encontradas)
        document.querySelectorAll('.grid-cell.selecting').forEach(cell => {
            if (!cell.classList.contains('found')) {
                cell.classList.remove('selecting');
            }
        });
        
        // 2. Aplica a classe 'selecting' a TODAS as células interpoladas
        if (potentialCells.length > 0) {
            potentialCells.forEach(cell => {
                cell.classList.add('selecting');
            });
            selectedCells = potentialCells; // Atualiza o estado
        } else {
            // Se o movimento não for reto, garante que apenas a célula inicial está selecionada
            startCell.classList.add('selecting');
            selectedCells = [startCell];
        }
    };
    
    // Fim da Seleção (Mouse Up / Touch End)
    const handleEnd = () => {
        if (isSelecting) {
            checkSelectedWord();
        }
        resetSelection();
    };

    // --- Aplicar Listeners ---
    gridContainer.addEventListener('mousedown', handleStart);
    gridContainer.addEventListener('touchstart', handleStart, { passive: false }); 
    
    gridContainer.addEventListener('mouseover', handleMove); 
    gridContainer.addEventListener('touchmove', handleMove, { passive: false }); 

    window.addEventListener('mouseup', handleEnd);
    window.addEventListener('touchend', handleEnd);


    // --- 5. VERIFICAÇÃO FINAL ---
    function checkSelectedWord() {
        if (selectedCells.length < 2) return; 

        // Concatena as letras na ordem de seleção.
        let selectedWord = selectedCells.map(cell => cell.textContent).join('');

        const reversedWord = selectedWord.split('').reverse().join('');
        let correctWord = null;

        // Verifica a palavra na direção de leitura e na direção inversa
        if (wordsToFind.includes(selectedWord)) {
            correctWord = selectedWord;
        } else if (wordsToFind.includes(reversedWord)) {
            correctWord = reversedWord;
        }
        
        if (correctWord && !foundWords.includes(correctWord)) {
            // SUCESSO!
            foundWords.push(correctWord);
            
            // Marca a palavra como encontrada na grade e na lista
            selectedCells.forEach(cell => {
                cell.classList.remove('selecting');
                cell.classList.add('found');
            });
            document.getElementById(`word-${correctWord}`).classList.add('found');

            // Verifica Vitória
            if (foundWords.length === wordsToFind.length) {
                winMessage.classList.remove('hidden');
                // Remove todos os listeners para parar o jogo
                gridContainer.style.pointerEvents = 'none';
            }
        } 
    }

    // --- INICIALIZAÇÃO ---
    createGrid();
    populateWordList();
});