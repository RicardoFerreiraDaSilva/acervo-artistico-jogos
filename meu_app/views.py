from django.shortcuts import render

def index(request):
    return render(request, 'index.html')

def memoria(request):
    return render(request, 'memoria.html')

def galo(request):
    return render(request, 'galo.html')

def monta_cabecas(request):
    return render(request, 'monta-cabecas.html')

def sete_erros(request):
    return render(request, '7erros.html')

def bingo(request):
    return render(request, 'bingo.html')

def dixit(request):
    return render(request, 'dixit.html')

def quebra_cabecas(request):
    return render(request, 'quebra-cabecas.html')

def caca_palavras(request):
    return render(request, 'caca-palavras.html')

# bingo_app/views.py

import json
import random
from django.shortcuts import render, get_object_or_404
from .models import Categoria, Dificuldade, Pergunta
from django.http import Http404

def selecao_bingo(request):
    """View inicial para o usuário escolher o tema e a dificuldade."""
    categorias = Categoria.objects.all()
    dificuldades = Dificuldade.objects.all()
    
    # Adapte o nome do template se for diferente (Ex: 'bingo_app/index.html')
    return render(request, 'bingo_app/selecao.html', {
        'categorias': categorias,
        'dificuldades': dificuldades
    })


def jogar_bingo(request, dificuldade_id, categoria_slug):
    """View principal que carrega os dados e renderiza a cartela de Bingo."""
    
    dificuldade = get_object_or_404(Dificuldade, pk=dificuldade_id)
    categoria = get_object_or_404(Categoria, slug=categoria_slug)
    
    todas_perguntas = list(Pergunta.objects.filter(categoria=categoria))

    tamanho = dificuldade.tamanho_cartela
    num_celulas = tamanho * tamanho
    
    # Número de respostas que devem aparecer na cartela (se tiver Espaço Livre)
    num_respostas_cartela = num_celulas - 1 if num_celulas > 1 else num_celulas

    if len(todas_perguntas) < num_respostas_cartela:
        raise Http404(f"A categoria '{categoria.nome}' não tem perguntas suficientes para uma cartela {tamanho}x{tamanho}.")

    # 1. Seleciona N perguntas para aparecerem na cartela (N = num_respostas_cartela)
    cartela_perguntas = random.sample(todas_perguntas, num_respostas_cartela)
    
    # 2. As demais perguntas são as que serão sorteadas
    perguntas_sorteio = [p for p in todas_perguntas if p not in cartela_perguntas]
    
    # 3. Formata os dados para o JavaScript
    respostas_cartela_js = [p.resposta for p in cartela_perguntas]
    
    perguntas_sorteio_js = [
        {'question': p.pergunta, 'answer': p.resposta} 
        for p in perguntas_sorteio
    ]

    context = {
        'categoria': categoria,
        'dificuldade': dificuldade,
        'tamanho_cartela': tamanho,
        
        # Dados injetados no JS
        'respostas_cartela_json': json.dumps(respostas_cartela_js),
        'perguntas_sorteio_json': json.dumps(perguntas_sorteio_js),
    }

    # Use o seu template HTML existente aqui, apenas adapte o nome
    return render(request, 'bingo_app/jogo.html', context)
