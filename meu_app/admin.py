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

from .models import ObraParte, MontagemUsuario

# Registra o modelo ObraParte
@admin.register(ObraParte)
class ObraParteAdmin(admin.ModelAdmin):
    list_display = ('nome', 'tipo_parte', 'artista', 'obra_original')
    list_filter = ('tipo_parte', 'artista')
    search_fields = ('nome', 'artista')

# Registra o modelo MontagemUsuario
@admin.register(MontagemUsuario)
class MontagemUsuarioAdmin(admin.ModelAdmin):
    list_display = ('nome_montagem', 'autor', 'data_publicacao', 'aprovada')
    list_filter = ('aprovada', 'data_publicacao')
    actions = ['marcar_como_aprovada']
    
    # Ação customizada para aprovar montagens rapidamente
    @admin.action(description='Marcar montagens selecionadas como Aprovada')
    def marcar_como_aprovada(self, request, queryset):
        queryset.update(aprovada=True)

from .models import TemaCacaPalavras, PalavraCacaPalavras, GradeCacaPalavras
# Registro dos modelos de Caça-Palavras
@admin.register(TemaCacaPalavras)
class TemaCacaPalavrasAdmin(admin.ModelAdmin):
    list_display = ('nome', 'slug', 'descricao')
    prepopulated_fields = {'slug': ('nome',)} # Ajuda a preencher o slug

@admin.register(PalavraCacaPalavras)
class PalavraCacaPalavrasAdmin(admin.ModelAdmin):
    list_display = ('palavra', 'tema', 'descricao')
    list_filter = ('tema',)

@admin.register(GradeCacaPalavras)
class GradeCacaPalavrasAdmin(admin.ModelAdmin):
    list_display = ('tema', 'tamanho')
    # Pode ser necessário adicionar um widget JSON para 'layout_json' se for muito complexo

from django.contrib import admin
from .models import TemaMemoria, DificuldadeMemoria, CartaMemoria 

# -----------------------------------------------
# 1. Registro da Dificuldade (Tamanho do Tabuleiro)
# -----------------------------------------------
@admin.register(DificuldadeMemoria)
class DificuldadeMemoriaAdmin(admin.ModelAdmin):
    list_display = ('nome', 'num_linhas', 'num_colunas', 'total_slots')
    # Método para exibir total_slots na lista
    def total_slots(self, obj):
        return obj.total_slots()

# -----------------------------------------------
# 2. Registro dos Temas
# -----------------------------------------------
@admin.register(TemaMemoria)
class TemaMemoriaAdmin(admin.ModelAdmin):
    list_display = ('nome', 'slug', 'descricao')
    prepopulated_fields = {'slug': ('nome',)} # Preenche o slug automaticamente

# -----------------------------------------------
# 3. Registro das Cartas
# -----------------------------------------------
@admin.register(CartaMemoria)
class CartaMemoriaAdmin(admin.ModelAdmin):
    list_display = ('tema', 'par_id', 'informacao_acerto')
    list_filter = ('tema',)
    search_fields = ('par_id', 'informacao_acerto')

from django.contrib import admin
from .models import QuizTema, QuizPintura, QuizPergunta

# 1. ADMIN para o Modelo QuizPintura
@admin.register(QuizPintura)
class QuizPinturaAdmin(admin.ModelAdmin):
    # Campos que serão exibidos na lista (visão geral) do Admin
    list_display = ('titulo', 'artista', 'ano', 'imagem_thumbnail')
    # Adiciona campos de pesquisa rápida
    search_fields = ('titulo', 'artista')
    # Adiciona filtros laterais
    list_filter = ('artista', 'ano')

    # Função customizada para exibir uma miniatura da imagem no painel de lista
    def imagem_thumbnail(self, obj):
        if obj.imagem:
            # Esta linha renderiza o HTML para exibir a imagem no Admin
            return f'<img src="{obj.imagem.url}" width="100" height="auto" />'
        return "Sem Imagem"
    
    # Informa ao Django para permitir que o HTML retornado seja renderizado (seguro)
    imagem_thumbnail.allow_tags = True
    imagem_thumbnail.short_description = 'Miniatura'


# 2. ADMIN para o Modelo QuizTema
@admin.register(QuizTema)
class QuizTemaAdmin(admin.ModelAdmin):
    # Campos na lista
    list_display = ('nome', 'slug')
    # Preenche automaticamente o campo 'slug' com base no campo 'nome'
    prepopulated_fields = {'slug': ('nome',)}
    
    
# 3. ADMIN para o Modelo QuizPergunta
@admin.register(QuizPergunta)
class QuizPerguntaAdmin(admin.ModelAdmin):
    # Campos na lista
    list_display = ('texto_pergunta', 'get_pintura_titulo', 'tema')
    # Filtros laterais
    list_filter = ('tema',)
    # Campos de pesquisa
    search_fields = ('texto_pergunta', 'pintura_pergunta__titulo')
    
    # Melhora a interface para selecionar as opções incorretas (muitas-para-muitas)
    filter_horizontal = ('opcoes_incorretas',)
    
    # Campo customizado para exibir o título da pintura de forma mais limpa na lista
    def get_pintura_titulo(self, obj):
        return obj.pintura_pergunta.titulo
    get_pintura_titulo.short_description = 'Pintura da Pergunta'