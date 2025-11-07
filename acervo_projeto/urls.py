# acervo_projeto/urls.py

from django.contrib import admin
from django.urls import path, include
from meu_app import views # Importa as views do seu app para as rotas estáticas

urlpatterns = [
    # Rotas do Admin
    path('admin/', admin.site.urls),
    
    # Rotas Estáticas (Jogos Simples e Index)
    path('', views.index, name='index'),
    path('memoria/', views.memoria, name='memoria'),
    path('galo/', views.galo, name='galo'),
    path('monta-cabecas/', views.monta_cabecas, name='monta_cabecas'),
    path('7erros/', views.sete_erros, name='sete_erros'),
    path('dixit/', views.dixit, name='dixit'),
    path('quebra-cabecas/', views.quebra_cabecas, name='quebra_cabecas'),
    path('caca-palavras/', views.caca_palavras, name='caca_palavras'),
    path('bingo/', include('meu_app.urls')), 
]