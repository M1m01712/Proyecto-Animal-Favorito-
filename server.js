/**
 * Archivo principal del servidor (Backend).
 * Utiliza Express.js para manejar las solicitudes HTTP y servir los archivos estáticos.
 */
const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const port = 3000;

// Middleware para procesar cuerpos de solicitud codificados en URL (enviados por formularios HTML)
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos desde el directorio 'public'
// Esto permite acceder a imágenes, CSS y HTML directamente
app.use(express.static(path.join(__dirname, 'public')));

// Lista de animales permitidos en la aplicación
// Se utiliza para validar la entrada del usuario
const allowedAnimals = [
    "Perro", "Gato", "Ratón", "Hámster", "Conejo", "Vaca", "Oveja", "Cerdo", "Caballo",
    "Gallina", "Gallo", "Pato", "Ganso", "Pavo", "Cabra", "Burro", "Leon", "Tigre",
    "Elefante", "Jirafa", "Cebra", "Oso", "Panda", "Koala", "Canguro", "Mono", "Gorila",
    "Lobo", "Zorro", "Ciervo", "Ardilla", "Mapache", "Hipopamo", "Rinoceronte",
    "Cocodrilo", "Tortuga", "Serpiente", "Rana", "Águila", "Búho", "Pingüino", "Loro",
    "Paloma", "Pez", "Tiburón", "Ballena", "Delfín", "Pulpo", "Cangrejo", "Mariposa"
];

/**
 * Manejador de la ruta POST '/submit'.
 * Procesa el formulario enviado por el usuario con el nombre de su animal favorito.
 */
app.post('/submit', (req, res) => {
    // Obtener el input del animal y limpiar espacios
    const animalInput = req.body.animal ? req.body.animal.trim() : "";

    // Validar si la entrada está en la lista de permitidos (insensible a mayúsculas/minúsculas)
    const isValid = allowedAnimals.some(animal => animal.toLowerCase() === animalInput.toLowerCase());

    // Ruta al archivo de plantilla HTML de resultados
    const resultPath = path.join(__dirname, 'public', 'result.html');

    // Leer el archivo result.html
    fs.readFile(resultPath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error leyendo result.html:', err);
            return res.status(500).send('Error interno del servidor al procesar la solicitud.');
        }

        let resultPage = data;

        if (isValid) {
            // == CASO VÁLIDO: El animal está en la lista ==

            // 1. Reemplazar el marcador de nombre del animal en el HTML
            resultPage = resultPage.replace('<!-- ANIMAL_NAME -->', animalInput);

            // 2. Normalizar el nombre del animal para buscar su imagen correspondiente
            // (Elimina acentos y convierte a minúsculas: Ej: "León" -> "leon")
            const normalizedAnimal = animalInput.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

            // 3. Limpiar inyecciones de estilo deprecadas (limpieza)
            resultPage = resultPage.replace('<!-- BACKGROUND_STYLE -->', '');

            // 4. Construir y verificar la ruta de la imagen generada
            const potentialGeneratedPath = path.join(__dirname, 'public', 'images', 'animals', `${normalizedAnimal}.png`);

            if (fs.existsSync(potentialGeneratedPath)) {
                // -- Opción A: Existe una imagen generada para este animal --

                // Estilo para colocar la imagen como fondo de la tarjeta con un overlay oscuro para legibilidad
                const cardStyle = `background-image: linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url('/images/animals/${normalizedAnimal}.png'); background-size: cover; background-position: center;`;

                // Inyectar el estilo en el contenedor de la tarjeta
                resultPage = resultPage.replace('class="result-card"', `class="result-card" style="${cardStyle}"`);

                // Eliminar el marcador de etiqueta IMG estándar ya que usamos fondo
                resultPage = resultPage.replace('<!-- ANIMAL_IMAGE -->', '');

            } else if (animalInput.toLowerCase() === 'perro') {
                // -- Opción B: Fallback específico para "Perro" (Legacy/Collage) --
                // Si no existe perro.png (aunque debería), se usa perro.jpg como imagen normal
                resultPage = resultPage.replace('<!-- ANIMAL_IMAGE -->', `<img src="/perro.jpg" alt="Perro" style="max-width: 100%; border-radius: 10px; margin-top: 1rem; box-shadow: 0 4px 8px rgba(0,0,0,0.2);">`);

            } else {
                // -- Opción C: No hay imagen para este animal --
                // Simplemente se elimina el marcador de imagen
                resultPage = resultPage.replace('<!-- ANIMAL_IMAGE -->', '');
            }
        } else {
            // == CASO INVÁLIDO: El animal no está en la lista ==

            // Mostrar mensaje de error
            resultPage = resultPage.replace('<p>Tu animal favorito es:</p>', '<p style="color: #ff4444;">Error:</p>');
            resultPage = resultPage.replace('<!-- ANIMAL_NAME -->', 'Por favor, ingresa un animal de la lista permitida.');

            // Limpiar marcadores restantes
            resultPage = resultPage.replace('<!-- ANIMAL_IMAGE -->', '');
            resultPage = resultPage.replace('<!-- BACKGROUND_STYLE -->', '');
        }

        // Enviar la respuesta HTML final al cliente
        res.send(resultPage);
    });
});

// Iniciar el servidor
app.listen(port, () => {
    console.log(`Servidor ejecutándose en http://localhost:${port}`);
    console.log('Presiona Ctrl+C para detener el servidor.');
});
