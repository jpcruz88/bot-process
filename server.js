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

app.listen(port, () => {
    console.log(`Servidor escuchando en el puerto ${port}`);
});
