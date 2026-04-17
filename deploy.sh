#!/bin/bash

set -e  # si algo falla, se detiene

echo "🚀 Iniciando deploy..."

# 1. Instalar dependencias
echo "📦 Instalando dependencias..."
npm ci

# 2. Build
echo "🏗️ Construyendo proyecto..."
npm run build

# 3. Limpiar servidor
echo "🧹 Limpiando servidor..."
ssh ubuntu@148.113.182.92 "mkdir -p /var/www/todo-app && rm -rf /var/www/todo-app/*"

# 4. Subir archivos
echo "📤 Subiendo archivos..."
scp -r dist/* ubuntu@148.113.182.92:/var/www/todo-app/

echo "✅ Deploy completado!"