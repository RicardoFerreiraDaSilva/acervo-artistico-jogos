#!/usr/bin/env bash

# Executa o gunicorn usando o Python do ambiente do Render
python -m gunicorn acervo_projeto.wsgi --log-file -