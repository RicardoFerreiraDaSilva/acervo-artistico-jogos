#!/usr/bin/env bash

# Inicia o servidor Gunicorn
gunicorn acervo_projeto.wsgi --log-file - --bind 0.0.0.0 --timeout 600