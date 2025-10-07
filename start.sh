#!/usr/bin/env bash

# Inicia o servidor Gunicorn
gunicorn acervo_projeto.wsgi --bind 0.0.0.0 --log-file -