# acervo_projeto/urls.py

from django.contrib import admin
from django.urls import path, include
from meu_app import views 
from django.conf import settings
from django.conf.urls.static import static

# URLs Estáticas e Views que não precisam de prefixo
urlpatterns = [
    # Rotas do Admin
    path('admin/', admin.site.urls),
    
    # Rota Inicial do Projeto
    path('', views.index, name='index'), 
    
    # Rotas de Jogos Estáticos (views.memoria, views.galo, etc. são acessadas diretamente)
    path('memoria/', views.memoria, name='memoria'),
    path('galo/', views.galo, name='galo'),
    path('monta-cabecas/', views.monta_cabecas, name='monta_cabecas'),
    path('7erros/', views.sete_erros, name='sete_erros'),
    path('dixit/', views.dixit, name='dixit'),
    path('quebra-cabecas/', views.quebra_cabecas, name='quebra_cabecas'),
    path('caca-palavras/', views.caca_palavras, name='caca_palavras'), # Rota Estática
    
    # Rota principal para o aplicativo 'meu_app'. 
    # TUDO O QUE ESTÁ EM meu_app/urls.py será acessível a partir de /jogos/.
    # Isso evita a duplicação e resolve o problema de URL não única.
    path('jogos/', include('meu_app.urls')),
    
    # NOTA: As rotas 'bingo/' e 'caca-palavras/' (dinâmicas) foram movidas para o include 'jogos/'.
    # A rota estática 'caca-palavras/' (acima) será usada se você não quiser usar o app dinâmico.
]

# Configuração de Mídia (Correta e mantida no final)
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)