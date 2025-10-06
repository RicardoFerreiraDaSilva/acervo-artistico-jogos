from django.contrib import admin
from django.urls import path
from meu_app import views

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', views.index, name='index'),
    path('memoria/', views.memoria, name='memoria'),
    path('galo/', views.galo, name='galo'),
    path('monta-cabecas/', views.monta_cabecas, name='monta_cabecas'),
    path('7erros/', views.sete_erros, name='sete_erros'),
    path('bingo/', views.bingo, name='bingo'),
    path('dixit/', views.dixit, name='dixit'),
    path('quebra-cabecas/', views.quebra_cabecas, name='quebra_cabecas'),
    path('caca-palavras/', views.caca_palavras, name='caca_palavras'),
]
