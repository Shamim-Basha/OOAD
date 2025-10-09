export function convertByteToImage(image, placeholder = 'https://via.placeholder.com/300?text=No+Image') {
  if (!image) return placeholder;
  // If image already looks like a data URI, return directly
  if (typeof image === 'string' && image.startsWith('data:')) return image;
  return `data:image/png;base64,${image}`;
}
