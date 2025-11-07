# bingo_app/models.py

from django.db import models

class Dificuldade(models.Model):
    """Define os níveis de dificuldade, que se relacionam ao tamanho da cartela (NxN)."""
    nome = models.CharField(max_length=50, unique=True, help_text="Ex: Fácil (3x3), Médio (4x4)")
    
    # Tamanho da cartela (Ex: 3 para 3x3 = 9 células; 4 para 4x4 = 16 células)
    tamanho_cartela = models.IntegerField(default=3, help_text="O lado da cartela (N para NxN). Mínimo 2.")
    
    # O número total de células é tamanho_cartela * tamanho_cartela
    # O número de respostas necessárias é (tamanho_cartela * tamanho_cartela) - 1 (se tiver espaço livre)
    
    class Meta:
        verbose_name_plural = "Dificuldades"

    def __str__(self):
        return self.nome

class Categoria(models.Model):
    """Define os temas específicos para os Bingos (Ex: Arte, História, Biologia)."""
    nome = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(unique=True, help_text="Versão 'amigável' do nome para URLs. Ex: acervo-artistico")
    
    class Meta:
        verbose_name_plural = "Categorias"

    def __str__(self):
        return self.nome

class Pergunta(models.Model):
    """Armazena a pergunta e a resposta que aparecerá na cartela."""
    categoria = models.ForeignKey(Categoria, on_delete=models.CASCADE, related_name='perguntas')
    pergunta = models.TextField()
    resposta = models.CharField(max_length=150, unique=True, help_text="Esta é a palavra/frase que aparecerá na cartela.")
    
    class Meta:
        ordering = ['categoria', 'resposta']
        verbose_name_plural = "Perguntas"

    def __str__(self):
        return f"{self.resposta} ({self.categoria.nome})"