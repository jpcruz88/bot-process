const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const app = express();
const port = process.env.PORT || 3000;

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
        cb(null, Date.now() + path.extname(file.originalname)); // Prefijo de fecha para evitar nombres duplicados
    },
});

const upload = multer({ storage: storage });

app.post("/upload", upload.array("files", 5), (req, res) => {
    console.log("Archivos recibidos:", req.files);
    res.send("Archivos subidos con éxito");
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

        // Filtrar archivos de imágenes y videos
        const imageAndVideoFiles = files.filter((file) => /\.(jpg|jpeg|png|gif|mp4|avi|mkv)$/i.test(file));

        // Generar la lista de miniaturas y enlaces de descarga
        const thumbnailsHTML = imageAndVideoFiles
            .map(
                (file) => `
            <li>
                <a href="/uploads/${file}" download="${file}">
                    <img src="/uploads/${file}" alt="${file}" width="100">
                    ${file}
                </a>
            </li>
        `
            )
            .join("");

        const html = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Visualizador de Archivos</title>
            </head>
            <body>
                <h1>Miniaturas de Archivos</h1>
                <ul>
                    ${thumbnailsHTML}
                </ul>
            </body>
            </html>
        `;

        res.send(html);
    });
});

app.listen(port, () => {
    console.log(`Servidor escuchando en el puerto ${port}`);
});
