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
