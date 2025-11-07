# bingo_app/admin.py

from django.contrib import admin
from .models import Dificuldade, Categoria, Pergunta

# Configura o display de perguntas relacionadas à Categoria
class PerguntaInline(admin.TabularInline):
    model = Pergunta
    extra = 1  # Quantas linhas vazias para adicionar

@admin.register(Categoria)
class CategoriaAdmin(admin.ModelAdmin):
    list_display = ('nome', 'slug')
    prepopulated_fields = {'slug': ('nome',)}
    inlines = [PerguntaInline] # Permite adicionar perguntas ao criar/editar a Categoria

@admin.register(Dificuldade)
class DificuldadeAdmin(admin.ModelAdmin):
    list_display = ('nome', 'tamanho_cartela')

# Registra o modelo Pergunta (apenas caso queira gerenciar fora da Categoria)
# @admin.register(Pergunta)
# class PerguntaAdmin(admin.ModelAdmin):
#     list_display = ('resposta', 'categoria')
#     list_filter = ('categoria',)