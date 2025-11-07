from django.urls import path
from . import views

urlpatterns = [
    path('', views.home, name='home'),
]
# bingo_app/urls.py

from django.urls import path
from . import views

urlpatterns = [
    # Tela de seleção de dificuldade/tema
    path('', views.selecao_bingo, name='selecao_bingo'), 
    
    # URL para iniciar o jogo
    path('jogar/<int:dificuldade_id>/<slug:categoria_slug>/', views.jogar_bingo, name='jogar_bingo'),
]