// ====================================================================
// === VARIÁVEIS DE ESTADO DO QUIZ ===

let currentQuizData = null; 
let currentQuestionIndex = 0;
let userScore = 0;
let isAnswerLocked = false; 

// ====================================================================
// === FUNÇÕES DE RENDERIZAÇÃO E LÓGICA ===

function renderMural(quizDataFromDjango){
    const muralGrid = document.getElementById('muralGrid');
    if (!muralGrid) return; 

    muralGrid.innerHTML = '';
    
    quizDataFromDjango.forEach(theme => {
        const t = document.createElement('div');
        t.className = 'thumb';
        t.dataset.themeId = theme.id;
        t.title = theme.title || '';
        const img = document.createElement('img');
        img.src = theme.thumb;
        img.alt = theme.title || theme.id;
        t.appendChild(img);
        
        t.addEventListener('click', () => {
            document.querySelectorAll('.thumb').forEach(x => x.classList.remove('selected'));
            t.classList.add('selected');
            const btnStartQuiz = document.getElementById('btnStartQuiz');
            if(btnStartQuiz) btnStartQuiz.dataset.selectedId = theme.id; 
        });
        muralGrid.appendChild(t);
    });
}

function startQuiz(){
    const btnStartQuiz = document.getElementById('btnStartQuiz');
    const selectedId = btnStartQuiz ? btnStartQuiz.dataset.selectedId : null;

    if(!selectedId) {
        alert('Selecione um tema do mural.'); 
        return; 
    }
    
    window.location.href = `/bingo/quiz/jogar/${selectedId}/`; 
}


// --- Funções de Jogo ---

function loadQuestion(){
    const currentQuestionNumberEl = document.getElementById('current-question-number');
    const paintingImage = document.getElementById('painting-image');
    const questionText = document.getElementById('question-text');
    const optionsGrid = document.getElementById('optionsGrid');
    const btnNext = document.getElementById('btnNext');
    
    if (!currentQuizData || !currentQuizData.questions || !optionsGrid) return;
    
    isAnswerLocked = false;
    if (btnNext) btnNext.style.display = 'none';
    optionsGrid.innerHTML = ''; 

    const question = currentQuizData.questions[currentQuestionIndex];
    if (!question) {
        showResults();
        return;
    }

    if (currentQuestionNumberEl) currentQuestionNumberEl.textContent = currentQuestionIndex + 1;
    if (paintingImage) paintingImage.src = question.image_url;
    if (questionText) questionText.textContent = question.text;

    question.options.forEach(option => {
        const btn = document.createElement('button');
        btn.className = 'btn-option';
        btn.textContent = option.text;
        btn.dataset.id = option.id;

        btn.addEventListener('click', () => handleAnswer(option.id, question.correct_id, btn));
        optionsGrid.appendChild(btn);
    });
}

function handleAnswer(selectedId, correctId, buttonElement){
    if(isAnswerLocked) return;
    isAnswerLocked = true;

    document.querySelectorAll('.btn-option').forEach(btn => btn.disabled = true);

    if (selectedId === correctId) {
        userScore++;
        buttonElement.classList.add('correct');
    } else {
        buttonElement.classList.add('incorrect');
        const correctButton = document.querySelector(`.btn-option[data-id="${correctId}"]`);
        if (correctButton) correctButton.classList.add('correct');
    }
    
    const btnNext = document.getElementById('btnNext');
    if (btnNext) btnNext.style.display = 'block';
}

function nextQuestion(){
    currentQuestionIndex++;
    if (currentQuizData && currentQuestionIndex < currentQuizData.questions.length) {
        loadQuestion();
    } else {
        showResults();
    }
}

function showResults(){
    const total = currentQuizData ? currentQuizData.questions.length : 0;
    alert(`Quiz finalizado! Você acertou ${userScore} de ${total} perguntas.`);
    
    const btnQuizBack = document.getElementById('btnQuizBack');
    if (btnQuizBack && btnQuizBack.tagName === 'A' && btnQuizBack.href) {
        window.location.href = btnQuizBack.href;
    } else {
        window.location.href = 'index.html'; 
    }
}

// ====================================================================
// === INICIALIZAÇÃO DO DOM E EVENT LISTENERS ===

document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. TENTA CARREGAR DADOS DE PERGUNTAS (Do quiz.html) ---
    const jsonScriptEl = document.getElementById('quiz-data-json');
    
    if (jsonScriptEl) {
        // Estamos na página de JOGO (quiz.html)
        
        try {
            // LÊ O CONTEÚDO PURO (corrigido para o problema do aninhamento)
            const jsonString = jsonScriptEl.textContent.trim(); 
            
            if (jsonString.length === 0) {
                 throw new Error("JSON injetado está vazio.");
            }
            
            const QUIZ_DATA_ARRAY = JSON.parse(jsonString); 
            
            // Atribui ao objeto de estado
            currentQuizData = { questions: QUIZ_DATA_ARRAY }; 
            
            if (currentQuizData.questions && currentQuizData.questions.length > 0) {
                const totalQuestionsEl = document.getElementById('total-questions');
                if (totalQuestionsEl) totalQuestionsEl.textContent = currentQuizData.questions.length;
                loadQuestion();
            } else {
                const quizArea = document.getElementById('quiz-area');
                if(quizArea) quizArea.innerHTML = '<p style="text-align:center;">Nenhuma pergunta encontrada para este tema.</p>';
            }
            
            const btnNext = document.getElementById('btnNext');
            if (btnNext) btnNext.addEventListener('click', nextQuestion);

        } catch (e) {
            console.error("Erro Crítico ao analisar JSON:", e);
            const quizArea = document.getElementById('quiz-area');
            if(quizArea) quizArea.innerHTML = '<p style="text-align:center; color:red;">Erro ao carregar dados do quiz. Verifique se a view injeta um JSON válido.</p>';
        }
        
    } else {
        // --- 2. ESTAMOS NA PÁGINA DE SELEÇÃO (selecao_quiz.html) ---
        
        // Usa a variável QUIZ_DATA definida no bloco <script> inline do selecao_quiz.html
        if (typeof QUIZ_DATA !== 'undefined' && QUIZ_DATA.length > 0) {
            renderMural(QUIZ_DATA); 
        } else {
            const muralGrid = document.getElementById('muralGrid');
            if (muralGrid) muralGrid.innerHTML = '<p>Nenhum tema de quiz encontrado.</p>';
        }
        
        const btnStartQuiz = document.getElementById('btnStartQuiz');
        if (btnStartQuiz) {
            btnStartQuiz.addEventListener('click', startQuiz);
        }
    }
    
    const btnHome = document.getElementById('btnHome');
    if (btnHome && btnHome.tagName === 'BUTTON') {
        btnHome.addEventListener('click', () => window.location.href = 'index.html');
    }
});