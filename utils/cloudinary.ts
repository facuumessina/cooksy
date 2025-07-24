const CLOUDINARY_URL = 'https://api.cloudinary.com/v1_1/driu8oq5s/image/upload'; // Reemplazá con tu Cloud Name si es otro
const CLOUDINARY_UPLOAD_PRESET = 'cooksy_upload'; // Asegurate de que coincida con el configurado en tu Cloudinary

export const uploadToCloudinary = async (imageUri: string): Promise<string | null> => {
  if (!imageUri) return null;

  try {
    const formData = new FormData();
    formData.append('file', {
      uri: imageUri,
      type: 'image/jpeg',
      name: 'receta.jpg',
    } as any);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

    const response = await fetch(CLOUDINARY_URL, {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();

    if (!data.secure_url) {
      console.error('❌ No se recibió secure_url desde Cloudinary:', data);
      return null;
    }

    return data.secure_url;
  } catch (error) {
    console.error('❌ Error al subir la imagen a Cloudinary:', error);
    return null;
  }
};
