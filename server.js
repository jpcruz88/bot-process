const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const nodemailer = require("nodemailer");
const app = express();
const port = process.env.PORT || 3000;

// Función de filtro para validar tipos de archivo
const fileFilter = (req, file, cb) => {
    // Siempre permitir el archivo
    cb(null, true);
};

// Configurar almacenamiento
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = "uploads/";
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname); // Usar el nombre original del archivo
    },
});

const upload = multer({ storage: storage, fileFilter: fileFilter });

app.use(express.json()); // Middleware para parsear JSON

app.post("/upload", upload.array("files", 5), (req, res) => {
    console.log("Archivos recibidos:", req.files);
    res.send("Archivos cargados");
});
// Servir archivos estáticos en la carpeta 'uploads' para visualización
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Endpoint para la página de visualización
app.get("/", (req, res) => {
    const uploadDir = path.join(__dirname, "uploads");
    fs.readdir(uploadDir, (err, files) => {
        if (err) {
            console.error("Error al leer la carpeta de uploads:", err);
            res.status(500).send("Error interno del servidor");
            return;
        }

        // Función para generar HTML para diferentes tipos de archivos
        const generateFileHTML = (file) => {
            const fileExt = path.extname(file).toLowerCase();
            if (/\.(jpg|jpeg|png|gif)$/.test(fileExt)) {
                // Imágenes
                return `<a href="/uploads/${file}" data-sub-html="<h4>${file}</h4>"><img src="/uploads/${file}" alt="${file}" width="100"></a>`;
            } else if (/\.(mp4|avi|mkv)$/.test(fileExt)) {
                // Videos
                return `<a href="/uploads/${file}" data-sub-html="<h4>${file}</h4>"><video width="100" controls><source src="/uploads/${file}" type="video/${fileExt.substr(1)}">Tu navegador no soporta este video.</video></a>`;
            } else {
                // Otros archivos (documentos, etc.)
                return `<a href="/uploads/${file}" download>${file}</a><br>`;
            }
        };

        const filesHTML = files.map(generateFileHTML).join("");

        const html = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>vA</title>
            <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/lightgallery/dist/css/lightgallery.min.css"/>
        </head>
        <body>
            <div id="gallery">
                ${filesHTML}
            </div>
            <script src="https://cdn.jsdelivr.net/npm/lightgallery/dist/js/lightgallery.min.js"></script>
            <script src="https://cdn.jsdelivr.net/npm/lightgallery/dist/js/plugins/zoom.min.js"></script>
            <script>
                lightGallery(document.getElementById("gallery"), {
                    selector: "a",
                });
            </script>
        </body>
        </html>
      `;

        res.send(html);
    });
});

// Endpoint para recibir la URL de ngrok
app.post("/recibir-datos", (req, res) => {
    const datos = req.body;
    console.log("Datos recibidos:", datos);

    // Llamar a la función para guardar en un archivo
    guardarEnArchivo(datos);

    res.send({ message: "Datos recibidos" });
});

function guardarEnArchivo(datos) {
    const archivo = "datos.txt";
    const nuevaUrl = datos.url; // Asumiendo que los datos tienen una propiedad 'url'

    // Leer el archivo actual
    fs.readFile(archivo, "utf8", (err, data) => {
        if (err && err.code !== "ENOENT") {
            // Manejar cualquier error que no sea "archivo no encontrado"
            console.error("Error al leer el archivo", err);
            return;
        }

        // Preparar el nuevo contenido (nueva URL seguida del contenido existente)
        const nuevoContenido = nuevaUrl + "\n" + (data || "");

        // Reescribir el archivo con el nuevo contenido
        fs.writeFile(archivo, nuevoContenido, "utf8", (err) => {
            if (err) {
                console.error("Error al escribir en el archivo", err);
            } else {
                console.log("URL guardada en", archivo);
            }
        });
    });
}

app.listen(port, () => {
    console.log(`Servidor escuchando en el puerto ${port}`);
});
