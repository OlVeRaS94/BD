# Usa una imagen base de Node-RED
FROM nodered/node-red:latest

# Cambia al usuario root para realizar ajustes iniciales
USER root

# Crea el directorio de trabajo y copia los archivos del proyecto
WORKDIR /data
COPY ./node-red/ /data

# Borra la carpeta node_modules y otros archivos temporales para evitar conflictos de caché
RUN rm -rf /data/node_modules \
    /data/.npm \
    /data/.config.nodes.json \
    /data/.config.runtime.json \
    /data/.config.nodes.json.backup

# Cambia permisos del directorio de trabajo para el usuario node-red
RUN chown -R node-red:node-red /data

# Cambia al usuario node-red antes de instalar dependencias
USER node-red

# Instalar dependencias de Node.js, incluyendo nodos personalizados
RUN npm install --unsafe-perm --no-cache && \
    npm cache clean --force

# Exponer el puerto de Node-RED
EXPOSE 1880

# Comando para iniciar Node-RED
CMD ["node-red", "--userDir", "/data"]

