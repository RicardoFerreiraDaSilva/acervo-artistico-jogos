# meu_app/views.py

from django.shortcuts import render, get_object_or_404, redirect
from django.http import Http404, HttpRequest, HttpResponseRedirect
from django.urls import reverse # Adicionado para uso em redirects
import json
import random

# Importe os modelos do seu aplicativo (Ajuste conforme a sua estrutura real)
from .models import (
    Categoria, Dificuldade, Pergunta, ObraParte, MontagemUsuario,
    TemaCacaPalavras, PalavraCacaPalavras, GradeCacaPalavras,
    TemaMemoria, DificuldadeMemoria, CartaMemoria,
    QuizTema
)

# --- VIEWS ESTÁTICAS (ORIGINAIS CONSOLIDADAS) ---
## 🎮 Jogos Simples/Estáticos

def index(request):
    """Renderiza a página inicial (index.html)."""
    return render(request, 'meu_app/index.html')

def home(request: HttpRequest):
    """Renderiza a página inicial (index.html), mantida por compatibilidade."""
    return render(request, 'index.html', {})

def memoria(request):
    """View estática (Pode ser removida se 'jogar_memoria' for a única usada)"""
    return render(request, 'meu_app/memoria.html')

def galo(request):
    return render(request, 'meu_app/galo.html')

# A view monta_cabecas agora é dinâmica (ver abaixo)

def sete_erros(request):
    return render(request, 'meu_app/7erros.html')

def dixit(request):
    return render(request, 'meu_app/dixit.html')

def quebra_cabecas(request):
    return render(request, 'meu_app/quebra-cabecas.html')

def caca_palavras(request):
    """View estática (Pode ser removida se 'selecao_caca_palavras' for a única usada)"""
    return render(request, 'meu_app/caca-palavras.html')


# --- VIEWS DINÂMICAS DE JOGO (LÓGICA PRESERVADA E CONSOLIDADA) ---

## 🧩 Monta Cabeças (Dinâmica)

def monta_cabecas(request):
    """
    Carrega todas as partes de obras de arte, agrupa-as por tipo e serializa para JSON.
    """
    # 1. Inicializa o dicionário com TODAS as chaves esperadas pelo JavaScript.
    partes_agrupadas = {
        'cabeca': [],
        'olhos': [],
        'nariz': [],
        'boca': [],
        'paisagem': [] 
    }
    
    todas_partes = ObraParte.objects.all()
    
    for parte in todas_partes:
        tipo = parte.tipo_parte.lower() 
        
        if tipo in partes_agrupadas: 
            dados_parte = {
                'id': parte.id,
                'imagem_url': parte.imagem.url,
                'obra': parte.obra_original,
                'artista': parte.artista,
                'descricao': parte.descricao,
            }
            
            partes_agrupadas[tipo].append(dados_parte)
            
    partes_montagem_json = json.dumps(partes_agrupadas)
    
    context = {
        'partes_montagem_json': partes_montagem_json
    }
    
    return render(request, 'meu_app/monta-cabecas.html', context)


## 🎲 Bingo de Perguntas

def selecao_bingo(request):
    """View inicial: Lista categorias e dificuldades para o usuário escolher."""
    
    categorias = Categoria.objects.all()
    dificuldades = Dificuldade.objects.all()
    
    context = { 
        'categorias': categorias,
        'dificuldades': dificuldades
    }
    
    if not categorias.exists() or not dificuldades.exists():
        context['mensagem_erro'] = "É preciso cadastrar Categorias e Dificuldades no Admin antes de jogar!"
        
    return render(request, 'meu_app/selecao_bingo.html', context)


def jogar_bingo(request, dificuldade_id, categoria_slug):
    """View principal: Monta a lógica e renderiza a cartela de Bingo."""
    
    dificuldade = get_object_or_404(Dificuldade, pk=dificuldade_id)
    categoria = get_object_or_404(Categoria, slug=categoria_slug)
    
    todas_perguntas = list(Pergunta.objects.filter(categoria=categoria))

    tamanho = dificuldade.tamanho_cartela
    num_celulas = tamanho * tamanho
    num_respostas_cartela = num_celulas - 1 

    if len(todas_perguntas) < num_respostas_cartela:
        raise Http404(f"A categoria '{categoria.nome}' não tem perguntas suficientes para {tamanho}x{tamanho}.")

    # Seleciona as perguntas cujas respostas VÃO PREENCHER A CARTELA
    cartela_perguntas = random.sample(todas_perguntas, num_respostas_cartela)
    
    # Define o conjunto de sorteio: Usa todas as perguntas da categoria
    perguntas_sorteio = todas_perguntas[:]
    random.shuffle(perguntas_sorteio)

    # Formata os dados para o JavaScript (JSON)
    respostas_cartela_js = [p.resposta for p in cartela_perguntas]
    perguntas_sorteio_js = [
        {'question': p.pergunta, 'answer': p.resposta} 
        for p in perguntas_sorteio
    ]

    context = {
        'categoria': categoria,
        'dificuldade': dificuldade,
        'tamanho_cartela': tamanho,
        'respostas_cartela_json': json.dumps(respostas_cartela_js),
        'perguntas_sorteio_json': json.dumps(perguntas_sorteio_js),
    }

    return render(request, 'meu_app/bingo.html', context)


## 🔍 Caça-Palavras

def selecao_caca_palavras(request):
    """View para a seleção de temas de Caça-Palavras."""
    temas = TemaCacaPalavras.objects.all()
    context = {'temas': temas}
    return render(request, 'meu_app/selecao_caca_palavras.html', context)

def jogar_caca_palavras(request, tema_slug):
    """
    View principal: Carrega dados do tema e grade, consolidando tudo em um único JSON.
    """
    tema = get_object_or_404(TemaCacaPalavras, slug=tema_slug)
    
    # 1. Obter Palavras e Descrições
    palavras_query = tema.palavras.all()
    palavras_data = [{
        'palavra': p.palavra,
        'descricao': p.descricao
    } for p in palavras_query]
    
    # 2. Obter Grade (com tratamento de erro)
    try:
        grade = tema.grade 
        grid_layout = grade.layout_json
        grid_size = grade.tamanho
        
    except GradeCacaPalavras.DoesNotExist:
        grid_layout = [] 
        grid_size = 12
    
    # 3. Consolidação dos dados
    game_data = {
        'tema_nome': tema.nome,
        'grid_size': grid_size,
        'palavras': palavras_data,
        'layout': grid_layout,
    }
    
    caca_palavras_data_json = json.dumps(game_data)
    
    context = {
        'tema': tema,
        'caca_palavras_data_json': caca_palavras_data_json,
    }
    
    return render(request, 'meu_app/caca-palavras.html', context)


## 🖼️ Jogo da Memória

def selecao_memoria(request):
    """Exibe a lista de Temas e Dificuldades para o Jogo da Memória."""
    temas = TemaMemoria.objects.all()
    dificuldades = DificuldadeMemoria.objects.all()
    
    context = {
        'temas': temas,
        'dificuldades': dificuldades,
        'jogo_selecionado': 'Memória'
    }
    return render(request, 'meu_app/selecao_memoria.html', context)

def jogar_memoria(request, tema_slug, dificuldade_id):
    """
    Carrega os dados do tema e da dificuldade, e prepara o array de cartas 
    (duplicado e embaralhado) para o JavaScript.
    """
    # 1. Recuperar Tema e Dificuldade
    tema = get_object_or_404(TemaMemoria, slug=tema_slug)
    dificuldade = get_object_or_404(DificuldadeMemoria, pk=dificuldade_id)
    
    # 2. Calcular Parâmetros do Jogo
    total_slots = dificuldade.total_slots()
    pares_necessarios = total_slots // 2

    # 3. Selecionar Cartas (Pares)
    cartas_disponiveis = CartaMemoria.objects.filter(tema=tema).order_by('?')
    
    if cartas_disponiveis.count() < pares_necessarios:
        print("Erro: O tema não tem pares suficientes para esta dificuldade!")
        # Redireciona de volta para a seleção
        return HttpResponseRedirect(reverse('bingo_app:selecao_memoria')) 

    cartas_selecionadas = list(cartas_disponiveis[:pares_necessarios])

    # 4. Duplicar e Preparar Dados para o JavaScript
    cartas_para_js = []
    
    for carta_par in cartas_selecionadas:
        frente_url = carta_par.imagem.url if carta_par.imagem else ''
        
        if not frente_url:
            print(f"Aviso: Par '{carta_par.par_id}' pulado devido à URL da frente vazia.")
            continue
            
        par_data = {
            'par_id': carta_par.par_id,
            'frente_url': frente_url,
            'informacao_acerto': carta_par.informacao_acerto,
        }
        
        # Duplicação: Cria 2 instâncias do mesmo par
        cartas_para_js.append(par_data.copy())
        cartas_para_js.append(par_data.copy())
            
    # 5. Embaralhar
    random.shuffle(cartas_para_js)

    # 6. Contexto e Renderização
    context = {
        'tema': tema,
        'dificuldade': dificuldade,
        'num_colunas': dificuldade.num_colunas,
        'num_linhas': dificuldade.num_linhas,
        'cartas_json': json.dumps(cartas_para_js),
    }
    
    return render(request, 'meu_app/memoria.html', context)


## 🧠 Quiz de Pinturas

def selecao_quiz(request):
    """Renderiza a página onde o usuário seleciona um tema para iniciar o Quiz."""
    temas = QuizTema.objects.all()
    
    context = {
        'temas_quiz': temas,
        'title': 'Seleção de Quiz',
    }
    return render(request, 'meu_app/selecao_quiz.html', context)


def jogar_quiz(request, tema_slug):
    """Carrega a página principal do quiz, baseada no tema selecionado."""
    tema = get_object_or_404(QuizTema, slug=tema_slug)
    perguntas = tema.perguntas.all().prefetch_related('opcoes_incorretas') 
    
    quiz_data_array = []
    
    for pergunta in perguntas:
        pintura_correta = pergunta.pintura_pergunta
        opcoes = list(pergunta.opcoes_incorretas.all())
        
        opcoes.append(pintura_correta)
        
        random.shuffle(opcoes)

        # Monta o objeto de pergunta
        quiz_data_array.append({
            'q_id': pergunta.id,
            'image_url': pintura_correta.imagem.url,
            'text': pergunta.texto_pergunta,
            'correct_id': pintura_correta.id, 
            'options': [
                {'id': opt.id, 'text': opt.titulo} 
                for opt in opcoes
            ]
        })
    
    # Serializa o array Python explicitamente em uma string JSON.
    quiz_data_json_string = json.dumps(quiz_data_array)
    
    context = {
        'tema': tema,
        'quiz_data_json': quiz_data_json_string, 
        'title': f'Quiz: {tema.nome}',
    }
    
    return render(request, 'meu_app/quiz.html', context)