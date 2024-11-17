#!/bin/bash

echo "🚀 Iniciando setup..."

# Instalar dependencias
echo "📦 Instalando dependencias..."
npm install

# Verificar que todos los archivos necesarios estén presentes
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json no encontrado"
    exit 1
fi

# Construir la aplicación React
echo "🔨 Construyendo la aplicación..."
npm run build

# Verificar que el build se creó correctamente
if [ ! -d "build" ]; then
    echo "❌ Error: La construcción falló"
    exit 1
fi

# Ejecutar el servidor
echo "✅ Setup completado exitosamente"