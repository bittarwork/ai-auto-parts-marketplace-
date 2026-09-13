// OpenAI configuration for AI features
const OpenAI = require('openai');

// Default model can be overridden from environment variables.
const DEFAULT_OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';

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
    system: `You are an intelligent search assistant for an electric vehicle (EV) spare parts e-commerce store.

Your job is to extract structured information from natural language search queries in Arabic or English.

SUPPORTED BRANDS (normalize to these exact names):
- Tesla (تسلا)
- BYD (بي واي دي)
- Hyundai (هيونداي)
- Kia (كيا)
- Nissan (نيسان)
- Volkswagen (فولكسفاغن، VW)
- MG (ام جي)
- BMW (بي ام دبليو)

SUPPORTED MODELS:
- Tesla: Model 3, Model Y, Model S, Model X
- BYD: Atto 3, Seal, Dolphin, Han
- Hyundai: Ioniq 5, Ioniq 6, Kona Electric
- Kia: EV6, Niro EV, EV9
- Nissan: Leaf, Ariya
- Volkswagen: ID.3, ID.4, ID.Buzz
- MG: MG4, MG ZS EV
- BMW: iX3, i4, iX

EXTRACT THE FOLLOWING:
1. partType: Type of EV part (e.g., "battery", "charger", "fast charger", "wallbox", "charging cable", "inverter", "BMS", "cabin filter", "brake pad")
2. brand: Car brand from the list above (use exact English name)
3. model: Specific car model if mentioned (use exact names above)
4. year: Year or year range if mentioned
5. attributes: Additional attributes like:
   - "original" or "aftermarket"
   - "fast" or "home" for chargers
   - connector types: CCS2, Type2, NACS, CHAdeMO
   - "12V" or "high-voltage"
6. intent: User's intent - one of:
   - "search": Regular product search
   - "compare": Wants to compare products
   - "price_check": Asking about price
   - "availability": Checking stock
   - "help": Asking what parts fit their car

RESPOND ONLY WITH VALID JSON. NO EXPLANATIONS OR MARKDOWN.

EXAMPLES:

Input: "أريد بطارية لسيارة تسلا موديل 2022"
Output: {"partType": "battery", "brand": "Tesla", "model": null, "year": 2022, "attributes": [], "intent": "search"}

Input: "I want a battery for a Tesla Model 3 2022"
Output: {"partType": "battery", "brand": "Tesla", "model": "Model 3", "year": 2022, "attributes": [], "intent": "search"}

Input: "ابحث عن شاحن سريع لسيارة كهربائية"
Output: {"partType": "fast charger", "brand": null, "model": null, "year": null, "attributes": ["fast"], "intent": "search"}

Input: "Find a fast charger for an electric car"
Output: {"partType": "fast charger", "brand": null, "model": null, "year": null, "attributes": ["fast"], "intent": "search"}

Input: "ما القطع المناسبة لسيارتي؟"
Output: {"partType": null, "brand": null, "model": null, "year": null, "attributes": [], "intent": "help"}

Input: "CCS2 cable for Hyundai Ioniq 5"
Output: {"partType": "charging cable", "brand": "Hyundai", "model": "Ioniq 5", "year": null, "attributes": ["CCS2"], "intent": "search"}

Input: "wallbox 11kW for VW ID.4 price"
Output: {"partType": "wallbox", "brand": "Volkswagen", "model": "ID.4", "year": null, "attributes": ["home"], "intent": "price_check"}`,
    
    user: (query) => `Query: "${query}"`
  },
  
  // ★★ CHATBOT - Customer Support ★★
  chatbot: {
    system: `You are a helpful customer service assistant for EV Auto Parts, an electric vehicle spare parts store.

YOUR RESPONSIBILITIES:
- Help customers find the right EV parts
- Answer compatibility questions for Tesla, BYD, Hyundai, Kia, Nissan, Volkswagen, MG, and BMW electric cars
- Explain charging connectors (CCS2, Type2, NACS, CHAdeMO)
- Provide installation guidance and difficulty estimates
- Explain warranty and return policies
- Guide users through the ordering process
- When the user asks "what parts fit my car?", use their saved vehicles from context

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
10. Prices are in Euro (EUR)

AVAILABLE BRANDS: Tesla, BYD, Hyundai, Kia, Nissan, Volkswagen, MG, BMW

COMMON TOPICS:
- Part compatibility: "Will this part fit my car?"
- Charging: "Which charger do I need?"
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
Input: "CCS2 fast charging cable for Tesla Model 3"
Output: {"category": "charging equipment", "features": ["CCS2 connector", "Tesla compatible", "fast charging"], "useCase": "DC fast charging", "complementary": ["wallbox", "charge port", "12V battery"]}`
  }
};

/**
 * Helper function to call OpenAI chat completion with error handling and retries
 * @param {Array} messages - Array of message objects {role, content}
 * @param {Object} options - Configuration options
 * @returns {Promise<string>} Model response text
 */
async function callGPT4(messages, options = {}) {
  try {
    const response = await openai.chat.completions.create({
      model: options.model || DEFAULT_OPENAI_MODEL,
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
      model: DEFAULT_OPENAI_MODEL,
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
