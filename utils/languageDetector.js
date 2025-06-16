// Language detection utility based on IP and country information
const axios = require('axios');

// Map of country codes to languages
// This could be expanded for more accurate mapping
const countryToLanguageMap = {
  // Chinese-speaking regions
  'CN': 'zh', // China
  'HK': 'zh', // Hong Kong
  'TW': 'zh', // Taiwan
  'SG': 'zh', // Singapore (one of official languages)
  
  // Spanish-speaking regions (most common ones)
  'ES': 'es', // Spain
  'MX': 'es', // Mexico
  'AR': 'es', // Argentina
  'CO': 'es', // Colombia
  'PE': 'es', // Peru
  'VE': 'es', // Venezuela
  'CL': 'es', // Chile
  'EC': 'es', // Ecuador
  'GT': 'es', // Guatemala
  'CU': 'es', // Cuba
  'BO': 'es', // Bolivia
  'DO': 'es', // Dominican Republic
  'HN': 'es', // Honduras
  'PY': 'es', // Paraguay
  'SV': 'es', // El Salvador
  'NI': 'es', // Nicaragua
  'CR': 'es', // Costa Rica
  'PR': 'es', // Puerto Rico
  'PA': 'es', // Panama
  'UY': 'es', // Uruguay
  
  // Default to English for other countries
  'US': 'en', // United States
  'GB': 'en', // United Kingdom
  'CA': 'en', // Canada
  'AU': 'en', // Australia
  'NZ': 'en'  // New Zealand
  // More mappings can be added as needed
};

// Fallback language if detection fails
const DEFAULT_LANGUAGE = 'en';

// Supported languages in the application
const SUPPORTED_LANGUAGES = ['en', 'zh', 'es'];

async function detectLanguageFromIP(ip) {
  try {
    // Using the existing ipinfo.io integration
    const response = await axios.get(`https://ipinfo.io/${ip}/json`);
    
    if (response.data && response.data.country) {
      const countryCode = response.data.country;
      const detectedLanguage = countryToLanguageMap[countryCode];
      
      // Return detected language if supported, otherwise fall back to default
      if (detectedLanguage && SUPPORTED_LANGUAGES.includes(detectedLanguage)) {
        return detectedLanguage;
      }
    }
    
    return DEFAULT_LANGUAGE;
  } catch (error) {
    console.error('Error detecting language from IP:', error.message);
    return DEFAULT_LANGUAGE;
  }
}

// Helper to get standard language code from a more complex code
// e.g., 'en-US' -> 'en', 'zh-CN' -> 'zh'
function normalizeLangCode(langCode) {
  if (!langCode) return DEFAULT_LANGUAGE;
  
  // Extract the base language code
  const baseCode = langCode.split('-')[0].toLowerCase();
  
  // Check if the base language is supported
  if (SUPPORTED_LANGUAGES.includes(baseCode)) {
    return baseCode;
  }
  
  return DEFAULT_LANGUAGE;
}

// Get language name for display
function getLanguageName(langCode, targetLang = 'en') {
  const langNames = {
    en: { en: 'English', zh: '英语', es: 'Inglés' },
    zh: { en: 'Chinese', zh: '中文', es: 'Chino' },
    es: { en: 'Spanish', zh: '西班牙语', es: 'Español' }
  };
  
  return langNames[langCode]?.[targetLang] || langCode;
}

module.exports = {
  detectLanguageFromIP,
  normalizeLangCode,
  getLanguageName,
  SUPPORTED_LANGUAGES,
  DEFAULT_LANGUAGE
};
