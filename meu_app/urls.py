# meu_app/urls.py

from django.urls import path
from . import views

# Define o namespace. Isso é fundamental se você tiver um 'selecao_bingo' em outro app.
app_name = 'bingo_app'

urlpatterns = [
    # 1. /bingo/
    # Esta rota é a tela inicial do Bingo, onde o usuário escolhe Dificuldade e Tema.
    path('', views.selecao_bingo, name='selecao_bingo'), 
    
    # 2. /bingo/jogar/<dificuldade_id>/<categoria_slug>/
    # Esta rota processa a seleção e carrega o jogo dinamicamente.
    path('jogar/<int:dificuldade_id>/<slug:categoria_slug>/', views.jogar_bingo, name='jogar_bingo'),
    path('monta-cabecas/', views.monta_cabecas, name='monta_cabecas'),
    # Rota da Seleção: /caca-palavras/
    path('caca-palavras/', views.selecao_caca_palavras, name='selecao_caca_palavras'), 
    # Rota do Jogo (recebe o slug após a seleção)
    path('caca-palavras/jogar/<slug:tema_slug>/', views.jogar_caca_palavras, name='jogar_caca_palavras'),
]