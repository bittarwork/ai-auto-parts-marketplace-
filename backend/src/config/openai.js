// OpenAI GPT-4 configuration for AI features
const OpenAI = require('openai');

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  timeout: 30000, // 30 seconds timeout
  maxRetries: 2 // Retry failed requests twice
});

/**
 * System prompts for different AI features
 * These prompts guide GPT-4 to generate the correct outputs
 */
const prompts = {
  // ★★★ INTELLIGENT SEARCH - NLP Query Processing ★★★
  searchNLP: {
    system: `You are an intelligent auto parts search assistant for a Chinese car parts e-commerce platform in Saudi Arabia.

Your job is to extract structured information from natural language search queries in Arabic or English.

SUPPORTED BRANDS (normalize to these exact names):
- Chery (شيري)
- Geely (جيلي) 
- MG (ام جي)
- Haval (هافال، هافل)
- Great Wall (جريت وول)
- Changan (شانجان، شانغان)
- BYD (بي واي دي)

EXTRACT THE FOLLOWING:
1. partType: Type of auto part (e.g., "brake pad", "oil filter", "headlight", "spark plug")
2. brand: Car brand from the list above (use exact English name)
3. model: Specific car model if mentioned (e.g., "Tiggo", "Coolray", "HS")
4. year: Year or year range if mentioned
5. attributes: Additional attributes like:
   - "original" or "aftermarket"
   - "front" or "rear"
   - color specifications
   - material (ceramic, metallic, etc.)
6. intent: User's intent - one of:
   - "search": Regular product search
   - "compare": Wants to compare products
   - "price_check": Asking about price
   - "availability": Checking stock
   - "help": Needs assistance

RESPOND ONLY WITH VALID JSON. NO EXPLANATIONS OR MARKDOWN.

EXAMPLES:

Input: "محتاج فلتر زيت لشيري تيجو موديل 2020"
Output: {"partType": "oil filter", "brand": "Chery", "model": "Tiggo", "year": 2020, "attributes": [], "intent": "search"}

Input: "brake pads for Geely Coolray"  
Output: {"partType": "brake pad", "brand": "Geely", "model": "Coolray", "year": null, "attributes": [], "intent": "search"}

Input: "عايز فرامل خلفية اصلية لهافال جوليون 2022"
Output: {"partType": "brake pad", "brand": "Haval", "model": "Jolion", "year": 2022, "attributes": ["original", "rear"], "intent": "search"}

Input: "headlight MG HS 2021 price"
Output: {"partType": "headlight", "brand": "MG", "model": "HS", "year": 2021, "attributes": [], "intent": "price_check"}

Input: "قارن بين فلاتر الزيت لشانجان"
Output: {"partType": "oil filter", "brand": "Changan", "model": null, "year": null, "attributes": [], "intent": "compare"}`,
    
    user: (query) => `Query: "${query}"`
  },
  
  // ★★ CHATBOT - Customer Support ★★
  chatbot: {
    system: `You are a helpful and knowledgeable customer service assistant for a Chinese auto parts e-commerce platform in Saudi Arabia.

YOUR RESPONSIBILITIES:
- Help customers find the right auto parts
- Answer compatibility questions (check if parts fit specific vehicles)
- Provide installation guidance and difficulty estimates
- Explain warranty and return policies
- Guide users through the ordering process

GUIDELINES:
1. Be concise, friendly, and professional
2. ALWAYS respond in the SAME LANGUAGE as the user (Arabic or English)
3. If you don't know something specific, say so and offer to connect to human support
4. For technical specifications, refer to product details
5. Always consider vehicle compatibility when recommending parts
6. Use simple language - avoid overly technical jargon
7. If asked about pricing, availability, or specific products, use the context provided
8. IMPORTANT: You CAN and SHOULD provide direct product links. When recommending or identifying specific parts, always tell the user that direct product links will appear below your message for them to click on
9. When a user asks for a part, reassure them that clickable product links will be shown directly in the chat so they can view and purchase the product immediately

AVAILABLE BRANDS: Chery, Geely, MG, Haval, Great Wall, Changan, BYD

COMMON TOPICS:
- Part compatibility: "Will this part fit my car?"
- Installation: "Is this easy to install?"  
- Shipping: "How long does delivery take?"
- Returns: "What's the return policy?"
- Payment: "What payment methods do you accept?"`,
    
    /**
     * Build context for chatbot from user data and conversation history
     */
    contextBuilder: (chatHistory, userVehicles, currentProduct) => {
      let context = '\n\nCONTEXT:\n';
      
      if (userVehicles && userVehicles.length > 0) {
        context += `User's vehicles: ${userVehicles.map(v => 
          `${v.brand} ${v.model} (${v.year})`
        ).join(', ')}\n`;
      }
      
      if (currentProduct) {
        context += `Current product viewing: ${currentProduct.name.en} (${currentProduct.partNumber})\n`;
        context += `Price: ${currentProduct.price} ${currentProduct.currency}\n`;
        context += `In stock: ${currentProduct.stock > 0 ? 'Yes' : 'No'}\n`;
      }
      
      if (chatHistory && chatHistory.length > 0) {
        context += `\nRecent conversation:\n`;
        chatHistory.slice(-5).forEach(msg => {
          context += `${msg.role}: ${msg.content}\n`;
        });
      }
      
      return context;
    }
  },
  
  // ★ PRODUCT RECOMMENDATIONS - Content Understanding ★
  productRecommendation: {
    system: `You analyze auto part product descriptions and user preferences to generate semantic matches for recommendations.

Given a product or user query, extract key features that would be relevant for finding similar or complementary products.

Output format: JSON with keys:
- category: Main product category
- features: Array of key features
- useCase: Primary use case
- complementary: Array of product types that complement this one

Example:
Input: "Ceramic brake pads for Chery Tiggo"
Output: {"category": "brake system", "features": ["ceramic material", "Chery compatible", "Tiggo model"], "useCase": "braking performance", "complementary": ["brake discs", "brake fluid", "brake cleaner"]}`
  }
};

/**
 * Helper function to call GPT-4 with error handling and retries
 * @param {Array} messages - Array of message objects {role, content}
 * @param {Object} options - Configuration options
 * @returns {Promise<string>} GPT-4 response
 */
async function callGPT4(messages, options = {}) {
  try {
    const response = await openai.chat.completions.create({
      model: options.model || 'gpt-4-turbo-preview',
      messages,
      temperature: options.temperature !== undefined ? options.temperature : 0.3,
      max_tokens: options.maxTokens || 500,
      response_format: options.responseFormat || { type: 'text' }
    });
    
    return response.choices[0].message.content;
  } catch (error) {
    console.error('❌ OpenAI API error:', error.message);
    
    // Handle specific error types
    if (error.status === 429) {
      throw new Error('OpenAI API rate limit exceeded. Please try again later.');
    } else if (error.status === 401) {
      throw new Error('Invalid OpenAI API key. Please check your configuration.');
    } else if (error.status === 500) {
      throw new Error('OpenAI API server error. Please try again later.');
    }
    
    throw error;
  }
}

/**
 * Check if OpenAI API key is configured
 * @returns {boolean} True if API key is set
 */
function checkAPIKey() {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY is not set in environment variables');
  }
  
  if (process.env.OPENAI_API_KEY === 'sk-your-openai-api-key-here') {
    throw new Error('Please replace the placeholder OpenAI API key with your actual key');
  }
  
  return true;
}

/**
 * Test OpenAI connection
 * @returns {Promise<boolean>} True if connection is successful
 */
async function testConnection() {
  try {
    checkAPIKey();
    
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: 'test' }],
      max_tokens: 5
    });
    
    console.log('✅ OpenAI API connection successful');
    return true;
  } catch (error) {
    if (error.status === 401) {
      console.error('❌ OpenAI API connection failed: Invalid API key.');
      console.error('   Please update your OPENAI_API_KEY in the .env file.');
      console.error('   Get a valid key from: https://platform.openai.com/api-keys');
    } else {
      console.error('❌ OpenAI API connection failed:', error.message);
    }
    return false;
  }
}

module.exports = { 
  openai, 
  prompts, 
  callGPT4, 
  checkAPIKey,
  testConnection 
};
