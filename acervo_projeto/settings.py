import os
from pathlib import Path
import dj_database_url

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

# ========================================
# 1. CONFIGURAÇÕES DE SEGURANÇA E AMBIENTE
# ========================================

# SECRET_KEY deve ser definida como uma variável de ambiente no Render.
# NUNCA use a chave fixa em produção.
SECRET_KEY = os.environ.get('SECRET_KEY', 'django-insecure-@8b85*q+*2_t!k_u1-a$g#x^01j#e-j(9e&k4c^n1z%t!t*z')

# A variável RENDER_EXTERNAL_HOSTNAME é definida automaticamente pelo Render.
RENDER_EXTERNAL_HOSTNAME = os.environ.get('RENDER_EXTERNAL_HOSTNAME')

if RENDER_EXTERNAL_HOSTNAME:
    # Modo de Produção
    DEBUG = False
    ALLOWED_HOSTS = [RENDER_EXTERNAL_HOSTNAME]
else:
    # Modo de Desenvolvimento Local
    DEBUG = True
    ALLOWED_HOSTS = ['*'] # Permite acesso local e testes

# ========================================
# 2. APPLICATION DEFINITION (Ajuste o 'meu_app' se necessário)
# ========================================

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    'meu_app', # Certifique-se de que este é o nome correto do seu aplicativo
]

# ========================================
# 3. MIDDLEWARE (WhiteNoise inserido corretamente)
# ========================================

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    # WhiteNoise deve vir logo após SecurityMiddleware
    'whitenoise.middleware.WhiteNoiseMiddleware', 
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

# IMPORTANTE: Mantenha este nome correto
ROOT_URLCONF = 'acervo_projeto.urls' 

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [os.path.join(BASE_DIR, 'templates')],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

# IMPORTANTE: Mantenha este nome correto
WSGI_APPLICATION = 'acervo_projeto.wsgi.application'

# ========================================
# 4. DATABASE (Alternância entre Render e Local)
# ========================================

# Usa a DATABASE_URL do Render se existir (PostgreSQL),
# ou o SQLite local como padrão (fallback) para desenvolvimento.
DATABASES = {
    'default': dj_database_url.config(
        # Fallback para SQLite local
        default=f'sqlite:///{BASE_DIR / "db.sqlite3"}',
        conn_max_age=600 # Configuração para persistência da conexão
    )
}

# ========================================
# 5. VALIDAÇÃO DE SENHAS, I18N, TIMEZONE (Manter como estava)
# ========================================

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

LANGUAGE_CODE = 'pt-br'
TIME_ZONE = 'America/Sao_Paulo'
USE_I18N = True
USE_TZ = True

# ========================================
# 6. ARQUIVOS ESTÁTICOS E DE MÍDIA (Configuração WhiteNoise)
# ========================================

# URL que o navegador usa para referenciar arquivos estáticos
STATIC_URL = '/static/'
# Diretório onde o `collectstatic` irá copiar todos os arquivos estáticos para produção
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles') 
# Configuração do WhiteNoise para comprimir e cachear estáticos
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

# URL pública para arquivos de mídia (uploads)
MEDIA_URL = '/media/'
# Caminho absoluto onde os uploads são armazenados
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'