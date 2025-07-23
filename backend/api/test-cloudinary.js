const cloudinary = require('../../configs/cloudinary');

cloudinary.uploader.upload(
  'C:/Users/camil/OneDrive/Imágenes/milanesita-de-pollo-con-pure.jpg', // Cambia por la ruta real de una imagen en tu PC
  { folder: 'mi_carpeta/' },
  (error, result) => {
    if (error) return console.error('Error:', error);
    console.log('URL pública:', result.secure_url);
  }
);
