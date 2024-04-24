# Usa la imagen oficial de Node.js como base
FROM node:latest

# Establece el directorio de trabajo en /app
WORKDIR /app

# Copia el package.json y package-lock.json para instalar dependencias
COPY package*.json ./

# Instala las dependencias
RUN npm install

# Copia el resto de los archivos de la aplicación
COPY . .

# Expone el puerto 3000 para que la aplicación pueda ser accedida externamente
EXPOSE 3000

# Comando para ejecutar la aplicación cuando se inicie el contenedor
CMD ["node", "app.js"]
