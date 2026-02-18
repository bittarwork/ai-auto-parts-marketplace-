/**
 * Intelligent Search Ranking Service
 * 
 * Ranks search results using multiple signals:
 * - Text relevance (from MongoDB text score)
 * - Compatibility with user's vehicles ★★★
 * - Product popularity (views, purchases)
 * - Product quality (ratings, reviews)
 * - User preferences and history
 * - Stock availability
 * - Recency
 */

class SearchRankingService {
  
  /**
   * ★★★ Main ranking function
   * 
   * @param {Array} products - Products to rank
   * @param {Object} nlpResult - NLP analysis result
   * @param {Array} userVehicles - User's vehicles
   * @param {string} userId - User ID for personalization
   * @returns {Array} Ranked products
   */
  async rankSearchResults(products, nlpResult, userVehicles = [], userId = null) {
    console.log(`[Ranking] Ranking ${products.length} products`);
    
    // Calculate relevance score for each product
    const rankedProducts = products.map(product => {
      let score = 0;
      const scoreBreakdown = {};
      
      // 1. Text relevance score (from MongoDB) - Weight: 20%
      if (product.textScore) {
        const textScore = Math.min(product.textScore, 10) * 2; // Normalize to 0-20
        score += textScore;
        scoreBreakdown.textRelevance = textScore;
      }
      
      // 2. Exact brand match - Weight: 15%
      if (nlpResult.brand && product.compatibility) {
        const brandMatch = product.compatibility.some(
          c => c.brand === nlpResult.brand
        );
        if (brandMatch) {
          score += 15;
          scoreBreakdown.brandMatch = 15;
        }
      }
      
      // 3. Exact model match - Weight: 10%
      if (nlpResult.model && product.compatibility) {
        const modelMatch = product.compatibility.some(c =>
          c.model.toLowerCase().includes(nlpResult.model.toLowerCase())
        );
        if (modelMatch) {
          score += 10;
          scoreBreakdown.modelMatch = 10;
        }
      }
      
      // 4. Year match - Weight: 5%
      if (nlpResult.year && product.compatibility) {
        const yearMatch = product.compatibility.some(c =>
          c.yearFrom <= nlpResult.year && c.yearTo >= nlpResult.year
        );
        if (yearMatch) {
          score += 5;
          scoreBreakdown.yearMatch = 5;
        }
      }
      
      // 5. ★★★ Compatibility with user's vehicle - Weight: 30% (HIGHEST)
      if (product.compatibilityStatus && product.compatibilityStatus.isCompatible) {
        score += 30;
        scoreBreakdown.vehicleCompatibility = 30;
      }
      
      // 6. Product popularity - Weight: 10%
      const popularityScore = this.calculatePopularityScore(product);
      score += popularityScore;
      scoreBreakdown.popularity = popularityScore;
      
      // 7. Product quality (rating) - Weight: 5%
      if (product.averageRating) {
        const qualityScore = (product.averageRating / 5) * 5;
        score += qualityScore;
        scoreBreakdown.quality = qualityScore;
      }
      
      // 8. Stock availability - Weight: 3%
      if (product.stock > 0) {
        score += 3;
        scoreBreakdown.availability = 3;
      }
      
      // 9. Featured product - Weight: 2%
      if (product.isFeatured) {
        score += 2;
        scoreBreakdown.featured = 2;
      }
      
      // 10. Recency boost for new products (within 30 days) - Weight: 2%
      if (product.createdAt) {
        const daysSinceCreation = (Date.now() - new Date(product.createdAt)) / (1000 * 60 * 60 * 24);
        if (daysSinceCreation <= 30) {
          const recencyScore = 2 * (1 - daysSinceCreation / 30);
          score += recencyScore;
          scoreBreakdown.recency = recencyScore;
        }
      }
      
      return {
        ...product,
        relevanceScore: Math.round(score * 100) / 100,
        scoreBreakdown // Useful for debugging and transparency
      };
    });
    
    // Sort by relevance score (descending)
    rankedProducts.sort((a, b) => b.relevanceScore - a.relevanceScore);
    
    if (rankedProducts.length > 0) {
      console.log(`[Ranking] Top 3 scores:`, rankedProducts.slice(0, 3).map(p => ({
        name: p.name.en || p.name.ar,
        score: p.relevanceScore,
        breakdown: p.scoreBreakdown
      })));
    }
    
    return rankedProducts;
  }
  
  /**
   * Calculate popularity score based on views and purchases
   */
  calculatePopularityScore(product) {
    const viewWeight = 0.3;
    const purchaseWeight = 0.7;
    
    // Normalize views (assume max 10000 views)
    const normalizedViews = Math.min(product.viewCount || 0, 10000) / 10000;
    
    // Normalize purchases (assume max 1000 purchases)
    const normalizedPurchases = Math.min(product.purchaseCount || 0, 1000) / 1000;
    
    // Calculate weighted popularity score (max 10 points)
    const popularityScore = 
      (normalizedViews * viewWeight + normalizedPurchases * purchaseWeight) * 10;
    
    return popularityScore;
  }
  
  /**
   * Get personalized score based on user history
   * (Can be expanded with user purchase history, preferences, etc.)
   */
  async getPersonalizationScore(product, userId) {
    if (!userId) return 0;
    
    try {
      // Check if user has purchased from this supplier before
      // Check if user has viewed similar products
      // Check user's preferred brands from their vehicles
      
      // Placeholder for future implementation
      return 0;
      
    } catch (error) {
      console.error('[Ranking] Error calculating personalization score:', error);
      return 0;
    }
  }
}

module.exports = new SearchRankingService();
