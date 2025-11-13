# meu_app/views.py

from django.shortcuts import render, get_object_or_404, redirect
from django.http import Http404
from django.http import HttpRequest
import json
import random

# Importe os modelos do seu aplicativo
from .models import Categoria, Dificuldade, Pergunta, ObraParte, MontagemUsuario

# --- VIEWS ESTÁTICAS ORIGINAIS ---

def index(request):
    return render(request, 'meu_app/index.html')

def memoria(request):
    return render(request, 'meu_app/memoria.html')

def galo(request):
    return render(request, 'meu_app/galo.html')

def monta_cabecas(request):
    return render(request, 'meu_app/monta-cabecas.html')

def sete_erros(request):
    return render(request, 'meu_app/7erros.html')

def dixit(request):
    return render(request, 'meu_app/dixit.html')

def quebra_cabecas(request):
    return render(request, 'meu_app/quebra-cabecas.html')

def caca_palavras(request):
    return render(request, 'meu_app/caca-palavras.html')


# --- NOVAS VIEWS DINÂMICAS DE BINGO ---

def selecao_bingo(request):
    """View inicial: Lista categorias e dificuldades para o usuário escolher."""
    
    categorias = Categoria.objects.all()
    dificuldades = Dificuldade.objects.all()
    
    context = { 
        'categorias': categorias,
        'dificuldades': dificuldades
    }
    
    # Adiciona mensagem de erro se faltarem dados no Admin
    if not categorias.exists() or not dificuldades.exists():
        context['mensagem_erro'] = "É preciso cadastrar Categorias e Dificuldades no Admin antes de jogar!"
        
    return render(request, 'meu_app/selecao_bingo.html', context)


def jogar_bingo(request, dificuldade_id, categoria_slug):
    """View principal: Carrega dados, monta a lógica e renderiza a cartela de Bingo."""
    
    dificuldade = get_object_or_404(Dificuldade, pk=dificuldade_id)
    categoria = get_object_or_404(Categoria, slug=categoria_slug)
    
    # Obtém todas as perguntas da categoria
    todas_perguntas = list(Pergunta.objects.filter(categoria=categoria))

    tamanho = dificuldade.tamanho_cartela
    num_celulas = tamanho * tamanho
    # Exige N*N - 1 respostas (para a célula livre)
    num_respostas_cartela = num_celulas - 1 

    if len(todas_perguntas) < num_respostas_cartela:
        raise Http404(f"A categoria '{categoria.nome}' não tem perguntas suficientes para {tamanho}x{tamanho}.")

    # 1. Seleciona as perguntas cujas respostas VÃO PREENCHER A CARTELA (subconjunto)
    cartela_perguntas = random.sample(todas_perguntas, num_respostas_cartela)
    
    # 2. DEFINE O CONJUNTO DE SORTEIO: Usa todas as perguntas da categoria para o sorteio.
    perguntas_sorteio = todas_perguntas[:] # Cria uma cópia da lista completa
    random.shuffle(perguntas_sorteio)

    # 3. Formata os dados para o JavaScript (JSON)
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

    # Renderiza o template de jogo (bingo.html)
    return render(request, 'meu_app/bingo.html', context)

def home(request: HttpRequest):
    """Renderiza a página inicial (index.html)."""
    return render(request, 'index.html', {})

# meu_app/views.py (APENAS A FUNÇÃO monta_cabecas FOI ALTERADA)

def monta_cabecas(request):
    """
    Carrega todas as partes de obras de arte, agrupa-as por tipo
    e as serializa para JSON para uso no JavaScript. Garante que todas 
    as chaves esperadas pelo JS existam.
    """
    
    # 1. Inicializa o dicionário com TODAS as chaves esperadas pelo JavaScript.
    partes_agrupadas = {
        'cabeca': [],
        'olhos': [],
        'nariz': [],
        'boca': [],
        'paisagem': []  # <--- CHAVE CRUCIAL ADICIONADA/GARANTIDA
    }
    
    # Busca todas as partes disponíveis no banco
    todas_partes = ObraParte.objects.all()
    
    for parte in todas_partes:
        # Pega o tipo e garante que é minúsculo (cabeca, olhos, etc.)
        tipo = parte.tipo_parte.lower() 
        
        # 2. Preenche APENAS se a chave for uma das esperadas
        if tipo in partes_agrupadas: 
            
            # Cria um dicionário com os dados necessários para o JS
            dados_parte = {
                'id': parte.id,
                'imagem_url': parte.imagem.url,
                'obra': parte.obra_original,
                'artista': parte.artista,
                'descricao': parte.descricao,
            }
            
            partes_agrupadas[tipo].append(dados_parte)
        # else: Se houver um 'tipo_parte' não mapeado, ele é ignorado.
        
    # 3. Serializar o dicionário Python para uma string JSON
    partes_montagem_json = json.dumps(partes_agrupadas)
    
    # 4. Passar a string JSON para o template
    context = {
        'partes_montagem_json': partes_montagem_json
    }
    
    return render(request, 'meu_app/monta-cabecas.html', context)