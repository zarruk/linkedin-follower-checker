require('dotenv').config();
const express = require('express');
const multer = require('multer');
const axios = require('axios');
const cors = require('cors');
const path = require('path');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

// Configuración de CORS
app.use(cors());
app.use(express.json());

// Servir archivos estáticos de React
app.use(express.static(path.join(__dirname, 'build')));

// Configurar AWS S3
const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

app.post('/api/verificar-imagen', upload.single('imagen'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No se proporcionó ninguna imagen' });
    }

    const buffer = req.file.buffer;
    const fileName = Date.now() + '-' + req.file.originalname.replace(/\s+/g, '-');
    const { nombre, email } = req.body;

    console.log('Recibiendo archivo:', {
      nombre,
      email,
      fileName,
      fileSize: buffer.length
    });

    // Subir la imagen a S3
    const params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: fileName,
      Body: buffer,
      ContentType: req.file.mimetype
    };

    try {
      const command = new PutObjectCommand(params);
      await s3.send(command);
      const imageUrl = `https://${params.Bucket}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;

      console.log('Imagen subida a S3:', imageUrl);

      // Enviar la URL, nombre y email al webhook
      const webhookUrl = 'https://workflows.ops.sandbox.cuentamono.com/webhook/2c27d0b3-801f-4d6a-9352-de3400744040';
      const webhookResponse = await axios.post(webhookUrl, {
        url: imageUrl,
        nombre: nombre,
        email: email
      });

      console.log('Respuesta del webhook:', webhookResponse.data);

      res.json({ 
        mensaje: 'Imagen procesada correctamente',
        imageUrl,
        webhookResponse: webhookResponse.data 
      });
    } catch (s3Error) {
      console.error('Error al subir a S3:', s3Error);
      throw new Error('Error al subir la imagen a S3');
    }

  } catch (error) {
    console.error('Error en el servidor:', error);
    res.status(500).json({ 
      error: 'Error al procesar la imagen',
      details: error.message 
    });
  }
});

// Manejar todas las demás rutas para React
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
}); 