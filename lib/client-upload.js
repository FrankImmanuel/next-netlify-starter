export async function prepareImage(file) {
  if (!file || file.size > 40000000) throw new Error('Välj en bild på högst 40 MB.');
  let bitmap;
  try { bitmap = await createImageBitmap(file); }
  catch { throw new Error('Bilden kunde inte öppnas. Exportera den som JPEG från Bilder och försök igen.'); }
  try {
    const scale = Math.min(1, 2200 / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    const context = canvas.getContext('2d');
    context.fillStyle = '#fff'; context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    let blob;
    for (const quality of [0.9, 0.8, 0.65]) {
      blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', quality));
      if (blob && blob.size <= 3000000) break;
    }
    if (!blob || blob.size > 3000000) throw new Error('Bilden är för stor. Välj en mindre webbexport.');
    const image = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result.split(',')[1]);
      reader.onerror = () => reject(new Error('Bilden kunde inte läsas.'));
      reader.readAsDataURL(blob);
    });
    return { image, preview: URL.createObjectURL(blob), requestId: crypto.randomUUID(), name: file.name };
  } finally { bitmap.close(); }
}
