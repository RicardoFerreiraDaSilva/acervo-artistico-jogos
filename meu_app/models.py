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
    
from django.db import models
from django.utils import timezone

class ObraParte(models.Model):
    # Tipos de Partes — Mapeia diretamente para as chaves JS (minusculo)
    TIPOS_PARTE = [
        ('CABECA', 'Cabeça/Cabelo'),
        ('OLHOS', 'Olhos'),
        ('NARIZ', 'Nariz'),
        ('BOCA', 'Boca'),
        ('PAISAGEM','Paisagem') 
    ]
    
    nome = models.CharField(max_length=100)
    tipo_parte = models.CharField(max_length=10, choices=TIPOS_PARTE)
    
    # Informações da Obra Original
    obra_original = models.CharField(max_length=200)
    artista = models.CharField(max_length=100)
    descricao = models.TextField(blank=True, null=True)
    
    # Imagem (requer a biblioteca Pillow instalada)
    imagem = models.ImageField(upload_to='partes_cabecas/') 

    class Meta:
        verbose_name = "Parte da Obra"
        verbose_name_plural = "Partes das Obras"

    def __str__(self):
        return f"{self.nome} ({self.tipo_parte})"

class MontagemUsuario(models.Model):
    nome_montagem = models.CharField(max_length=100)
    autor = models.CharField(max_length=100)
    
    # Relações com ObraParte para cada segmento da montagem (Obrigatórias)
    cabeca_ref = models.ForeignKey(ObraParte, on_delete=models.CASCADE, related_name='montagens_cabeca', verbose_name='Cabeça/Base')
    olhos_ref = models.ForeignKey(ObraParte, on_delete=models.CASCADE, related_name='montagens_olhos', verbose_name='Olhos')
    nariz_ref = models.ForeignKey(ObraParte, on_delete=models.CASCADE, related_name='montagens_nariz', verbose_name='Nariz')
    boca_ref = models.ForeignKey(ObraParte, on_delete=models.CASCADE, related_name='montagens_boca', verbose_name='Boca')
    
    # CAMPO PAISAGEM MANTIDO
    paisagem_ref = models.ForeignKey(
        ObraParte, 
        on_delete=models.CASCADE, 
        related_name='montagens_paisagem', 
        verbose_name='Paisagem',
        null=True, 
        blank=True 
    )
    
  
    data_publicacao = models.DateTimeField(default=timezone.now)
    aprovada = models.BooleanField(default=False)
    
    class Meta:
        verbose_name = "Montagem do Usuário"
        verbose_name_plural = "Montagens dos Usuários"

    def __str__(self):
        return f"Montagem de {self.autor}: {self.nome_montagem}"
    
class TemaCacaPalavras(models.Model):
    """Define o tema principal (usado na tela de seleção)."""
    nome = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(unique=True)
    descricao = models.TextField(help_text="Breve descrição do tema para a tela de seleção.")

    def __str__(self):
        return self.nome
    
class PalavraCacaPalavras(models.Model):
    """Define as palavras a serem procuradas e suas descrições."""
    tema = models.ForeignKey(TemaCacaPalavras, on_delete=models.CASCADE, related_name='palavras')
    palavra = models.CharField(max_length=50, help_text="A palavra EXATA a ser procurada na grade (em MAIÚSCULAS).")
    descricao = models.TextField(help_text="Descrição ou dica sobre a palavra (exibida ao lado da lista).")

    def __str__(self):
        return f"{self.palavra} ({self.tema.nome})"

# --- NOVO MODELO PARA A GRADE GERADA (Opcional, mas Útil) ---
class GradeCacaPalavras(models.Model):
    """
    Armazena a grade gerada e as palavras, caso você queira salvar grades prontas 
    ou fazer a geração no Admin. Se a grade for sempre 12x12 e você a preenche 
    manualmente no código (como no protótipo), você pode pular este modelo.
    """
    tema = models.OneToOneField(TemaCacaPalavras, on_delete=models.CASCADE, related_name='grade')
    tamanho = models.IntegerField(default=12)
    # JSONField para armazenar a matriz 2D da grade (ex: [["C","P",...], [...]])
    layout_json = models.JSONField(blank=True, null=True)

    def __str__(self):
        return f"Grade {self.tamanho}x{self.tamanho} - {self.tema.nome}"