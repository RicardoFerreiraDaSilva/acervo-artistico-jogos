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
    path('', views.home, name='home'),
]