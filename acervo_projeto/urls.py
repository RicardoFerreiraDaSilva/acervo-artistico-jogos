# acervo_projeto/urls.py

from django.contrib import admin
from django.urls import path, include
from meu_app import views # Importa as views do seu app para as rotas estáticas
from django.conf import settings
from django.conf.urls.static import static


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
if settings.DEBUG:
    # Esta linha diz ao Django para rotear URLs que começam com MEDIA_URL 
    # para o diretório MEDIA_ROOT, onde suas imagens de boca, nariz, etc., estão salvas.
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)