document.addEventListener('DOMContentLoaded', function() {
    const ipInput = document.getElementById('ipInput');
    const searchBtn = document.getElementById('searchBtn');
    const myIpBtn = document.getElementById('myIpBtn');
    const loading = document.getElementById('loading');
    const result = document.getElementById('result');
    const locationInfo = document.getElementById('locationInfo');
    
    // 自动显示客户端IP地址
    displayClientIp();

    // Function to fetch location data by IP
    async function getLocationByIp(ip) {
        try {
            showLoading();
            
            const response = await fetch(`/location/${ip}`);
            if (!response.ok) {
                throw new Error('Failed to fetch location data');
            }
            
            const data = await response.json();
            displayLocationData(data);
        } catch (error) {
            console.error('Error:', error);
            displayError(error.message);
        } finally {
            hideLoading();
        }
    }    // Function to get client's IP address
    async function getMyIp() {
        try {
            showLoading();
            
            const response = await fetch('/myip');
            if (!response.ok) {
                throw new Error('Failed to fetch IP address');
            }
            
            const ip = await response.text();
            ipInput.value = ip;
            
            // After getting IP, get location data
            await getLocationByIp(ip);
        } catch (error) {
            console.error('Error:', error);
            displayError(error.message);
            hideLoading();
        }
    }   // 获取并显示客户端IP
   async function displayClientIp() {
       try {
           const response = await fetch('/myip');
           if (!response.ok) {
               throw new Error('Failed to fetch IP address');
           }
           
           const ip = await response.text();
           
           // 创建IP显示元素
           const ipDisplay = document.createElement('div');
           ipDisplay.className = 'ip-display';
           ipDisplay.innerHTML = `<i class="fas fa-info-circle"></i> ${i18next.t('ipDisplay.currentIp', { ip: `<strong>${ip}</strong>` })}`;
           
           // 在第一个卡片顶部插入
           const card = document.querySelector('.card');
           card.insertBefore(ipDisplay, card.firstChild);
           
           // 预填充IP输入框
           ipInput.value = ip;
           
           // 自动加载用户IP的位置信息
           getLocationByIp(ip);
       } catch (error) {
           console.error('Error fetching IP:', error);
       }
   }// Function to display location data
    function displayLocationData(data) {
        result.style.display = 'block';
        
        // Create structured HTML content
        let html = '';
        
        if (data.ip) {
            html += `<div><span class="label"><i class="fas fa-network-wired"></i> IP:</span> <span>${data.ip}</span></div>`;
        }
        if (data.hostname) {
            html += `<div><span class="label"><i class="fas fa-server"></i> Hostname:</span> <span>${data.hostname}</span></div>`;
        }
        if (data.city) {
            html += `<div><span class="label"><i class="fas fa-city"></i> City:</span> <span>${data.city}</span></div>`;
        }
        if (data.region) {
            html += `<div><span class="label"><i class="fas fa-map"></i> Region:</span> <span>${data.region}</span></div>`;
        }
        if (data.country) {
            html += `<div><span class="label"><i class="fas fa-flag"></i> Country:</span> <span>${data.country}</span></div>`;
        }
        if (data.loc) {
            html += `<div><span class="label"><i class="fas fa-map-marker-alt"></i> Coordinates:</span> <span>${data.loc}</span></div>`;
        }
        if (data.org) {
            html += `<div><span class="label"><i class="fas fa-building"></i> Organization:</span> <span>${data.org}</span></div>`;
        }
        if (data.postal) {
            html += `<div><span class="label"><i class="fas fa-mail-bulk"></i> Postal:</span> <span>${data.postal}</span></div>`;
        }
        if (data.timezone) {
            html += `<div><span class="label"><i class="fas fa-clock"></i> Timezone:</span> <span>${data.timezone}</span></div>`;
        }
        
        // If no data is available
        if (html === '') {
            html = '<div>No location data available for this IP.</div>';
        }
        
        locationInfo.innerHTML = html;
    }    // Function to display error
    function displayError(message) {
        result.style.display = 'block';
        locationInfo.innerHTML = `<div class="error"><i class="fas fa-exclamation-triangle"></i> Error: ${message}</div>`;
    }

    // Show loading spinner
    function showLoading() {
        loading.style.display = 'flex';
        result.style.display = 'none';
    }

    // Hide loading spinner
    function hideLoading() {
        loading.style.display = 'none';
    }

    // Event listeners
    searchBtn.addEventListener('click', function() {
        const ip = ipInput.value.trim();
        if (ip) {
            getLocationByIp(ip);
        } else {
            alert('Please enter an IP address');
        }
    });

    myIpBtn.addEventListener('click', function() {
        getMyIp();
    });

    // Allow pressing Enter key in input field
    ipInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            searchBtn.click();
        }
    });
});
