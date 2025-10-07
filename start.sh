#!/usr/bin/env bash

# Ativa o ambiente virtual para que o gunicorn seja encontrado.
source venv/bin/activate

# Inicia o servidor Gunicorn
gunicorn acervo_projeto.wsgi --log-file -