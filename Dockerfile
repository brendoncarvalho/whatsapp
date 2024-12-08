# Usar a imagem base do Node.js com a versão 18 LTS (leve)
FROM node:20-alpine

# Instalar as dependências necessárias para Puppeteer
RUN apk add --no-cache \
    gconf-service \
    libgbm \
    libasound2 \
    libatk \
    libc6-compat \
    cairo \
    cups-libs \
    dbus \
    expat \
    fontconfig \
    libgcc \
    gdk-pixbuf \
    glib \
    gtk+3.0 \
    nspr \
    pango \
    libstdc++ \
    libx11 \
    libxcomposite \
    libxcursor \
    libxdamage \
    libxext \
    libxfixes \
    libxi \
    libxrandr \
    libxrender \
    libxss \
    libxtst \
    ca-certificates \
    ttf-freefont \
    chromium \
    nss \
    && rm -rf /var/cache/apk/*

# Configurar o diretório de trabalho no container
WORKDIR /usr/src/app

# Copiar os arquivos do projeto para o container
COPY package*.json ./

# Instalar as dependências do projeto
RUN npm install

# Copiar o restante do código para o container
COPY . .

# Expor a porta (opcional)
EXPOSE 3000

# Comando para rodar o bot
CMD ["node", "index.js"]
