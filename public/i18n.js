// i18n.js - Internationalization configuration
document.addEventListener('DOMContentLoaded', function() {
    // Initialize i18next
    i18next
        .use(i18nextHttpBackend)
        .use(i18nextBrowserLanguageDetector)
        .init({
            fallbackLng: 'en',
            debug: false,
            backend: {
                loadPath: '/locales/{{lng}}/{{ns}}.json',
            },
            detection: {
                order: ['localStorage', 'navigator'],
                lookupLocalStorage: 'i18nextLng',
                caches: ['localStorage']
            },
            ns: ['translation'],
            defaultNS: 'translation',
        }, function(err, t) {
            // Translate all elements with data-i18n attributes
            updateContent();
            
            // After initialization, check if we should recommend a different language
            checkLanguageDetection();
        });

    // Function to update the content with translations
    function updateContent() {
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            element.innerHTML = i18next.t(key) || element.innerHTML;
        });

        // Update placeholders
        document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
            const key = element.getAttribute('data-i18n-placeholder');
            element.placeholder = i18next.t(key) || element.placeholder;
        });
    }

    // Function to check if we should recommend a different language
    async function checkLanguageDetection() {
        try {
            // Get the server's language suggestion based on IP
            const response = await fetch('/api/language-detect');
            const data = await response.json();
            
            const currentLang = i18next.language.split('-')[0]; // e.g., 'en' from 'en-US'
            const detectedLang = data.detectedLanguage;
            
            // If current language is different from detected, suggest changing
            if (detectedLang && currentLang !== detectedLang) {
                showLanguageSuggestion(detectedLang);
            }
            
        } catch (error) {
            console.error('Error checking language detection:', error);
        }
    }

    // Function to show language suggestion
    function showLanguageSuggestion(suggestedLang) {
        const suggestionElem = document.getElementById('languageSuggestion');
        const suggestionTextElem = document.getElementById('suggestionText');
        
        // Get the language name in the current language
        const langName = i18next.t(`language.${suggestedLang}`);
        
        // Set the suggestion text
        suggestionTextElem.textContent = i18next.t('language.suggestion', { language: langName });
        
        // Store the suggested language code for the accept button
        suggestionElem.setAttribute('data-suggested-lang', suggestedLang);
        
        // Show the suggestion
        suggestionElem.classList.remove('hidden');
    }

    // Language selector functionality
    const languageBtn = document.getElementById('languageBtn');
    const languageOptions = document.getElementById('languageOptions');
    const languageOptionElems = document.querySelectorAll('.language-option');
    const acceptLanguageBtn = document.getElementById('acceptLanguage');
    const declineLanguageBtn = document.getElementById('declineLanguage');
    const languageSuggestion = document.getElementById('languageSuggestion');

    // Toggle language options
    languageBtn.addEventListener('click', function() {
        languageOptions.classList.toggle('show');
    });

    // Close language options when clicking elsewhere
    document.addEventListener('click', function(e) {
        if (!languageBtn.contains(e.target) && !languageOptions.contains(e.target)) {
            languageOptions.classList.remove('show');
        }
    });

    // Language selection
    languageOptionElems.forEach(option => {
        option.addEventListener('click', function() {
            const lang = this.getAttribute('data-lang');
            changeLanguage(lang);
            languageOptions.classList.remove('show');
        });
    });

    // Accept suggested language
    acceptLanguageBtn.addEventListener('click', function() {
        const suggestedLang = languageSuggestion.getAttribute('data-suggested-lang');
        changeLanguage(suggestedLang);
        languageSuggestion.classList.add('hidden');
    });

    // Decline suggested language
    declineLanguageBtn.addEventListener('click', function() {
        languageSuggestion.classList.add('hidden');
    });

    // Function to change language
    function changeLanguage(lang) {
        i18next.changeLanguage(lang, (err, t) => {
            if (err) return console.error('Error changing language:', err);
            document.documentElement.lang = lang;
            updateContent();
        });
    }

    // Initialize with the current language
    document.documentElement.lang = i18next.language;
});
