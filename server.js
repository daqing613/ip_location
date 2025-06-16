const express = require('express');
const axios = require('axios');
const path = require('path');
require('dotenv').config();
const { detectLanguageFromIP, normalizeLangCode } = require('./utils/languageDetector');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// 获取客户端 IP 地址（纯文本）
app.get('/myip', (req, res) => {
  const ip = req.headers['x-forwarded-for'] ||
             req.connection.remoteAddress ||
             req.socket.remoteAddress ||
             (req.connection.socket ? req.connection.socket.remoteAddress : null);
  res.type('text').send(ip);
});

// API to get location by IP
app.get('/location/:ip', async (req, res) => {
  try {
    const ipAddress = req.params.ip;
    
    // Using ipinfo.io API for IP geolocation
    const response = await axios.get(`https://ipinfo.io/${ipAddress}/json`);
    
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching location data:', error.message);
    res.status(500).json({ error: 'Failed to fetch location data' });
  }
});

// API to get recommended language based on IP
app.get('/api/language-detect', async (req, res) => {
  try {
    const ip = req.headers['x-forwarded-for'] ||
               req.connection.remoteAddress ||
               req.socket.remoteAddress ||
               (req.connection.socket ? req.connection.socket.remoteAddress : null);
    
    // Get accept-language header for browser preference
    const acceptLanguage = req.headers['accept-language'] || '';
    
    // First try to detect from browser's accept-language header
    let detectedLanguage = normalizeLangCode(acceptLanguage.split(',')[0]);
    
    // If no valid language detected from browser, try IP-based detection
    if (detectedLanguage === 'en') {
      detectedLanguage = await detectLanguageFromIP(ip);
    }
    
    res.json({ 
      detectedLanguage,
      ip
    });
  } catch (error) {
    console.error('Error detecting language:', error.message);
    res.status(500).json({ error: 'Failed to detect language', language: 'en' });
  }
});

// 静态文件服务放在 API 路由之后
app.use(express.static(path.join(__dirname, 'public')));

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
