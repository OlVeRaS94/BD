# Node-RED JSON Examples Repository

## Descripción
Este repositorio contiene una colección de archivos JSON diseñados para ser utilizados en Node-RED, una herramienta de programación visual basada en flujos. Los archivos incluyen configuraciones y ejemplos para crear dashboards, manejar formularios, trabajar con APIs, y realizar tareas básicas con Node-RED.

## Contenido del repositorio

### Archivos principales
- **`1_Dashboard_controles_basicos.json`**
  - Incluye elementos básicos del dashboard de Node-RED, como botones, interruptores, campos de entrada y listas desplegables.

- **`2.- Formulario.json`**
  - Configuración para un formulario de Node-RED que captura datos como texto y números.

- **`6.- ISS people.json`**
  - Realiza una solicitud a la API pública [Open Notify](http://api.open-notify.org/astros.json) para obtener datos de la tripulación actual en la Estación Espacial Internacional (ISS).

- Otros archivos adicionales que muestran configuraciones y ejemplos útiles para principiantes y usuarios intermedios de Node-RED.

## Requisitos previos

- **Node.js** instalado en tu sistema. Puedes descargarlo desde [Node.js](https://nodejs.org/).
- **Node-RED** instalado globalmente. Instálalo ejecutando el siguiente comando:

  ```bash
  npm install -g node-red
  ```

## Cómo utilizar este repositorio

1. Clona el repositorio en tu máquina local:

   ```bash
   git clone https://github.com/OlVeRaS94/BD.git
   ```

2. Navega al directorio clonado:

   ```bash
   cd BD
   ```

3. Abre Node-RED en tu máquina ejecutando:

   ```bash
   node-red
   ```

4. Accede al editor de Node-RED en tu navegador en [http://localhost:1880](http://localhost:1880).

5. Importa los archivos JSON en Node-RED:
   - Copia el contenido de un archivo JSON.
   - En el editor de Node-RED, selecciona "Importar" en el menú y pega el contenido.
   - Ajusta el flujo según tus necesidades.

## Ejemplo destacado: Solicitud a la API de la ISS
El archivo `6.- ISS people.json` incluye un ejemplo práctico para obtener datos de la tripulación de la ISS mediante una solicitud HTTP.

1. Importa el archivo en Node-RED.
2. Conéctalo a un nodo "debug" para visualizar la respuesta.
3. Ejecuta el flujo para recibir la información en tiempo real sobre los astronautas a bordo de la ISS.

## Contribuciones
Si tienes ejemplos adicionales o mejoras, no dudes en hacer un fork del repositorio, realizar tus cambios y enviar un pull request.

## Licencia
Este proyecto se distribuye bajo la licencia MIT. Consulta el archivo `LICENSE` para más detalles.

## Autor
[Antonio Oliveira García](https://github.com/OlVeRaS94)
