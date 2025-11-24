import os
from pathlib import Path
import dj_database_url

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

# ========================================
# 1. CONFIGURAÇÕES DE SEGURANÇA E AMBIENTE
# ========================================

# SECRET_KEY deve ser definida como uma variável de ambiente no Render.
# O segundo valor é o fallback, usado apenas em desenvolvimento local.
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
# 2. APPLICATION DEFINITION (Manter como estava)
# ========================================

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    'meu_app', # Certifique-se de que este é o nome correto do seu aplicativo
    'storages'
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

WSGI_APPLICATION = 'acervo_projeto.wsgi.application'

# ========================================
# 4. DATABASE (Alternância entre Render e Local)
# ========================================

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
# 6. ARQUIVOS ESTÁTICOS E DE MÍDIA (WhiteNoise e AWS S3)
# ========================================

if DEBUG:
    # Configurações de Mídia Local (APENAS EM DEV)
    STATIC_URL = '/static/'
    STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles') 
    STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'
    MEDIA_URL = '/media/'
    MEDIA_ROOT = os.path.join(BASE_DIR, 'media')
else:
    # ----------------------------------------------------
    # CONFIGURAÇÃO DE PRODUÇÃO: ARMAZENAMENTO AWS S3
    # Requer que as vars de ambiente AWS_... estejam no Render
    # ----------------------------------------------------
    
    # 1. Credenciais do S3 (obtidas do Render Environment)
    AWS_ACCESS_KEY_ID = os.environ.get('AWS_ACCESS_KEY_ID')
    AWS_SECRET_ACCESS_KEY = os.environ.get('AWS_SECRET_ACCESS_KEY')
    AWS_STORAGE_BUCKET_NAME = os.environ.get('AWS_STORAGE_BUCKET_NAME')
    
    # IMPORTANTE: Altere esta região para a que você escolheu no AWS
    AWS_S3_REGION_NAME = os.environ.get('AWS_S3_REGION_NAME', 'sa-east-1') 
    
    # 2. Configura o domínio customizado para o S3
    AWS_S3_CUSTOM_DOMAIN = f'{AWS_STORAGE_BUCKET_NAME}.s3.{AWS_S3_REGION_NAME}.amazonaws.com'
    
    # 3. MÍDIA (Arquivos de upload do usuário/admin)
    # Define o S3 como o armazenamento padrão para arquivos de MÍDIA
    DEFAULT_FILE_STORAGE = 'storages.backends.s3.S3Storage'
    # Define a pasta dentro do bucket S3 onde a mídia será salva
    MEDIAFILES_LOCATION = 'media'
    # URL que o Django usará para servir a mídia (aponta para o S3)
    MEDIA_URL = f'https://{AWS_S3_CUSTOM_DOMAIN}/{MEDIAFILES_LOCATION}/'
    
    # 4. ESTÁTICOS (CSS/JS do projeto)
    # WhiteNoise ainda serve os estáticos de forma eficiente
    STATIC_URL = '/static/'
    STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')
    STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'


DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'