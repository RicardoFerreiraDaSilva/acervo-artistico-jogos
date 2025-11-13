document.addEventListener('DOMContentLoaded', () => {

    // --- 1. CARREGAMENTO DE DADOS DINÂMICOS DO DJANGO ---
    const dataElement = document.getElementById('monta-cabecas-data');
    if (!dataElement) {
        console.error("Elemento 'monta-cabecas-data' não encontrado. Verifique o template Django.");
        return;
    }
    
    // O objeto 'parts' agora conterá TODOS os dados da obra, não apenas os nomes dos arquivos.
    const parts = JSON.parse(dataElement.textContent);
    
    // --- 2. ESTADO ATUAL DO JOGO (Agora rastreia o índice) ---
    // Usaremos as chaves 'cabeca', 'olhos', 'nariz', 'boca', 'paisagem'
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
    
    // Elementos para exibir os metadados (Informações da Obra)
    const infoDisplay = document.getElementById('info-display');
    const saveButton = document.getElementById('save-montage-btn'); // Botão de salvar

    // --- 4. FUNÇÃO PRINCIPAL PARA ATUALIZAR A TELA E METADADOS ---
    function updateCanvas() {
        // Inicializa o HTML para os metadados
        let infoHTML = '<h3>Informações da Montagem</h3>';
        let montageData = {}; // Objeto para armazenar IDs para salvar no Django

        for (const key in currentState) {
            const index = currentState[key];
            const partArray = parts[key];
            
            // Pega o objeto completo da parte (imagem_url, obra, artista, id)
            const currentPart = partArray[index]; 
            
            if (currentPart) {
                // A) Atualizar a Imagem
                // A imagem_url já deve ser o caminho completo do Django (ex: /media/partes/x.jpg)
                layers[key].src = currentPart.imagem_url; 
                
                // B) Atualizar os Metadados
                infoHTML += `
                    <div class="part-info">
                        <strong>${key.toUpperCase()}:</strong> ${currentPart.obra}
                        <br><small>(${currentPart.artista})</small>
                    </div>
                `;
                
                // C) Rastrear o ID da Parte para o salvamento
                montageData[`${key}_id`] = currentPart.id;
            } else {
                 // Caso a lista de partes esteja vazia ou o índice seja inválido
                 layers[key].src = ''; // Limpa a imagem
                 infoHTML += `<div class="part-info"><strong>${key.toUpperCase()}:</strong> Nenhuma parte disponível.</div>`;
            }
        }
        
        infoDisplay.innerHTML = infoHTML;
        
        // Armazena os IDs das peças em um atributo do botão de salvar,
        // para que possam ser enviados no formulário de publicação (Próximo Passo)
        saveButton.dataset.montageIds = JSON.stringify(montageData);
    }

    // --- 5. LÓGICA DO MODO LIVRE (BOTÕES) ---
    // Mantém a lógica de rotação (circular) para cada parte
    function setupSelectors(partKey) {
        const prevButton = document.getElementById(`prev-${partKey}`);
        const nextButton = document.getElementById(`next-${partKey}`);
        
        // Verifica se a chave existe e há partes disponíveis
        if (!parts[partKey] || parts[partKey].length === 0) {
            // Desabilita os botões se não houver partes
            if (prevButton) prevButton.disabled = true;
            if (nextButton) nextButton.disabled = true;
            return;
        }

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

    // Inicializa os seletores para todas as partes
    setupSelectors('cabeca');
    setupSelectors('olhos');
    setupSelectors('nariz');
    setupSelectors('boca');
    setupSelectors('paisagem');
    
    // --- 6. LÓGICA DO MODO ALEATÓRIO (DADO) ---
    const diceButton = document.getElementById('roll-dice');
    
    if (diceButton) {
        diceButton.addEventListener('click', () => {
            for (const key in currentState) {
                const partArray = parts[key];
                if (partArray && partArray.length > 0) {
                    const randomIndex = Math.floor(Math.random() * partArray.length);
                    currentState[key] = randomIndex;
                }
            }
            updateCanvas();
        });
    }

    // --- 7. LÓGICA DO BOTÃO DE SALVAR (Próximo Passo: Abrir Modal de Publicação) ---
    // Este botão precisará abrir um modal/formulário para o usuário preencher o nome da montagem e autor.
    if (saveButton) {
        saveButton.addEventListener('click', () => {
            const idsJson = saveButton.dataset.montageIds;
            console.log("Montagem pronta para salvar. IDs das partes:", idsJson);
            
            // TODO: Aqui você chamaria a função para abrir o modal de submissão do formulário.
            // Exemplo: openSubmissionModal(idsJson);
            alert("Montagem Salva (Simulação)! Próximo passo: modal de publicação.");
        });
    }


    // --- 8. INICIALIZAÇÃO ---
    // Define as imagens e metadados iniciais
    updateCanvas();
});