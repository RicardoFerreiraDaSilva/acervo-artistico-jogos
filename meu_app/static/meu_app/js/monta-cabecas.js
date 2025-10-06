document.addEventListener('DOMContentLoaded', () => {

    // --- 1. DEFINIÇÃO DAS PARTES DO JOGO ---
    const parts = {
        cabeca: ['cabeca1.png', 'cabeca2.png', 'cabeca3.png'],
        olhos: ['olhos1.png', 'olhos2.png', 'olhos3.png', 'olhos4.png'],
        nariz: ['nariz1.png', 'nariz2.png', 'nariz3.png'],
        boca: ['boca1.png', 'boca2.png', 'boca3.png'],
        paisagem: ['paisagem1.png', 'paisagem2.png']
    };

    // --- 2. ESTADO ATUAL DO JOGO ---
    let currentState = {
        cabeca: 0,
        olhos: 0,
        nariz: 0,
        boca: 0,
        paisagem: 0
    };

    // --- 3. MAPEAMENTO DOS ELEMENTOS HTML ---
    const layers = {
        cabeca: document.getElementById('cabeca-layer'),
        olhos: document.getElementById('olhos-layer'),
        nariz: document.getElementById('nariz-layer'),
        boca: document.getElementById('boca-layer'),
        paisagem: document.getElementById('paisagem-layer')
    };

    // --- 4. FUNÇÃO PRINCIPAL PARA ATUALIZAR A TELA ---
    function updateCanvas() {
        for (const key in currentState) {
            const index = currentState[key];
            const partArray = parts[key];
            const imageName = partArray[index];
            
            // --- LÓGICA DE PLURAL CORRIGIDA ---
            let folderName = key; // Começa com o nome da chave (ex: "olhos")
            if (key.endsWith('s')) {
                // Se a chave já termina com 's' (como "olhos"), não faz nada.
            } else if (key === 'nariz') {
                folderName = 'narizes'; // Exceção para "nariz" -> "narizes"
            } else {
                folderName = `${key}s`; // Para o resto, adiciona "s" (ex: "boca" -> "bocas")
            }
            
            layers[key].src = `imagens/${folderName}/${imageName}`;
        }
    }

    // --- 5. LÓGICA DO MODO LIVRE (BOTÕES) ---
    function setupSelectors(partKey) {
        const prevButton = document.getElementById(`prev-${partKey}`);
        const nextButton = document.getElementById(`next-${partKey}`);
        const partArray = parts[partKey];

        prevButton.addEventListener('click', () => {
            currentState[partKey]--;
            if (currentState[partKey] < 0) {
                currentState[partKey] = partArray.length - 1;
            }
            updateCanvas();
        });

        nextButton.addEventListener('click', () => {
            currentState[partKey]++;
            if (currentState[partKey] >= partArray.length) {
                currentState[partKey] = 0;
            }
            updateCanvas();
        });
    }

    setupSelectors('cabeca');
    setupSelectors('olhos');
    setupSelectors('nariz');
    setupSelectors('boca');
    setupSelectors('paisagem');
    
    // --- 6. LÓGICA DO MODO ALEATÓRIO (DADO) ---
    const diceButton = document.getElementById('roll-dice');
    
    diceButton.addEventListener('click', () => {
        for (const key in currentState) {
            const partArray = parts[key];
            const randomIndex = Math.floor(Math.random() * partArray.length);
            currentState[key] = randomIndex;
        }
        updateCanvas();
    });

    // --- 7. INICIALIZAÇÃO ---
    updateCanvas();
});