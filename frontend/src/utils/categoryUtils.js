/**
 * Category utility functions
 * Flatten hierarchical categories for dropdowns and filters
 */

/**
 * Flatten hierarchical categories to a single array
 * @param {Array} categories - Hierarchical categories
 * @param {string} language - Language key (en/ar)
 * @returns {Array} Flat array of categories with depth info
 */
export function flattenCategories(categories, language = 'en') {
  if (!categories || !Array.isArray(categories)) return [];

  const result = [];

  function traverse(cats, depth = 0) {
    cats.forEach(cat => {
      result.push({
        ...cat,
        _id: cat._id,
        name: cat.name?.[language] || cat.name?.en || cat.name,
        slug: cat.slug,
        depth
      });
      if (cat.children && cat.children.length > 0) {
        traverse(cat.children, depth + 1);
      }
    });
  }

  traverse(categories);
  return result;
}

/**
 * Get top-level categories only (no children)
 */
export function getTopCategories(categories) {
  if (!categories || !Array.isArray(categories)) return [];
  return categories.filter(cat => !cat.parent);
}
