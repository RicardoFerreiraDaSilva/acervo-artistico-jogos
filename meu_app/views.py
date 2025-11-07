# meu_app/views.py

from django.shortcuts import render, get_object_or_404, redirect
from django.http import Http404
import json
import random

# Importe os modelos do seu aplicativo
from .models import Categoria, Dificuldade, Pergunta 

# --- VIEWS ESTÁTICAS ORIGINAIS ---

def index(request):
    return render(request, 'meu_app/index.html') # Ajuste o caminho se necessário

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

# (Removi a view 'bingo' antiga pois ela será substituída pelas dinâmicas abaixo)


# --- NOVAS VIEWS DINÂMICAS DE BINGO ---

def selecao_bingo(request):
    """View inicial: Lista categorias e dificuldades para o usuário escolher."""
    categorias = Categoria.objects.all()
    dificuldades = Dificuldade.objects.all()
    
    if not categorias.exists() or not dificuldades.exists():
        # Lidar com a falta de dados
        return render(request, 'meu_app/selecao.html', {
            'mensagem_erro': "É preciso cadastrar Categorias e Dificuldades no Admin antes de jogar!",
            'categorias': categorias,
            'dificuldades': dificuldades
        })
        
    return render(request, 'meu_app/selecao.html', { 
        'categorias': categorias,
        'dificuldades': dificuldades
    })


def jogar_bingo(request, dificuldade_id, categoria_slug):
    """View principal: Carrega dados, monta a lógica e renderiza a cartela de Bingo."""
    
    dificuldade = get_object_or_404(Dificuldade, pk=dificuldade_id)
    categoria = get_object_or_404(Categoria, slug=categoria_slug)
    
    todas_perguntas = list(Pergunta.objects.filter(categoria=categoria))

    tamanho = dificuldade.tamanho_cartela
    num_celulas = tamanho * tamanho
    
    # Número de respostas que devem aparecer na cartela (Ex: 8 para 3x3)
    num_respostas_cartela = num_celulas - 1 

    if len(todas_perguntas) < num_respostas_cartela:
        raise Http404(f"A categoria '{categoria.nome}' não tem perguntas suficientes para {tamanho}x{tamanho}.")

    # 1. Seleciona as respostas para a cartela (sem repetição)
    cartela_perguntas = random.sample(todas_perguntas, num_respostas_cartela)
    
    # 2. Define as perguntas para o sorteio
    perguntas_sorteio = [p for p in todas_perguntas if p not in cartela_perguntas]
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