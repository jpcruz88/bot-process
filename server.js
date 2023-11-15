const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const app = express();
const port = process.env.PORT || 3000;

// Función de filtro para validar tipos de archivo
const fileFilter = (req, file, cb) => {
    if (/\.(jpg|jpeg|png|gif|mp4|mov|pdf|docx|xlsx|pptx|txt|odt)$/i.test(file.originalname)) {
        cb(null, true);
    } else {
        cb(new Error("Tipo de archivo no permitido"), false);
    }
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
            <a href="/uploads/${file}" data-sub-html="<h4>${file}</h4>">
              <img src="/uploads/${file}" alt="${file}" width="100">
            </a>
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
            <link
              rel="stylesheet"
              href="https://cdn.jsdelivr.net/npm/lightgallery/dist/css/lightgallery.min.css"
            />
        </head>
        <body>
            <h1>Miniaturas de Archivos</h1>
            <div id="gallery">
                ${thumbnailsHTML}
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

app.listen(port, () => {
    console.log(`Servidor escuchando en el puerto ${port}`);
});
