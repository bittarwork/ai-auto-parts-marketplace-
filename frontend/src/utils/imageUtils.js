/**
 * Image utility functions
 * Handles product images, placeholders, and error states
 */

const PLACEHOLDER_SVG = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 200 200'%3E%3Crect fill='%23e5e7eb' width='200' height='200'/%3E%3Ctext fill='%239ca3af' font-family='sans-serif' font-size='14' x='50%25' y='50%25' text-anchor='middle' dy='.3em'%3ENo Image%3C/text%3E%3C/svg%3E`;

/**
 * Get product image URL or placeholder
 * @param {Object} product - Product object with images array
 * @returns {string} Image URL or placeholder
 */
export function getProductImageUrl(product) {
  if (!product) return PLACEHOLDER_SVG;
  const images = product.images;
  if (!images || images.length === 0) return PLACEHOLDER_SVG;
  const primary = images.find(img => img.isPrimary) || images[0];
  return primary?.url || PLACEHOLDER_SVG;
}

/**
 * Get primary image from images array
 * @param {Array} images - Images array
 * @returns {string|null} Image URL or null
 */
export function getPrimaryImage(images) {
  if (!images || images.length === 0) return null;
  const primary = images.find(img => img.isPrimary) || images[0];
  return primary?.url || null;
}

/**
 * Fallback for broken images
 * Use in img onError: (e) => handleImageError(e)
 */
export function handleImageError(e) {
  e.target.src = PLACEHOLDER_SVG;
  e.target.onerror = null;
}

export default { getProductImageUrl, getPrimaryImage, handleImageError, PLACEHOLDER_SVG };
