const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
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
app.post("/recibir-url", (req, res) => {
    const ngrokUrl = req.body.url; // Asegúrate de tener un middleware para parsear el body
    console.log("URL de ngrok recibida:", ngrokUrl);

    // Aquí puedes hacer lo que necesites con la URL, como guardarla en una base de datos, etc.

    res.send({ message: "URL recibida con éxito" });
});

app.listen(port, () => {
    console.log(`Servidor escuchando en el puerto ${port}`);
});
