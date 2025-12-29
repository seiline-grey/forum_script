// simple-loader.js - Упрощенный загрузчик для GitHub
class SimpleLicenseChecker {
    constructor(licenseKey) {
        this.licenseKey = licenseKey;
        this.domain = window.location.hostname;
        this.validDomains = {
            'rstart.rusff.me': 'F1K3Y9A8B7C6',
            'test-forum.ru': 'T3S7K2Y4X5Z6'
        };
    }
    
    check() {
        console.log('🔍 Checking license for:', this.domain);
        console.log('🔑 License key:', this.licenseKey.substring(0, 8) + '...');
        
        const isValid = this.validDomains[this.domain] === this.licenseKey;
        console.log(isValid ? '✅ License valid!' : '❌ License invalid!');
        
        return isValid;
    }
    
    async loadScript() {
        if (!this.check()) {
            this.showLicenseError();
            return;
        }
        
        console.log('📥 Loading protected script...');
        
        // Генерируем имя файла
        const scriptName = this.createFileName();
        console.log('📄 Script filename:', scriptName);
        
        // Загружаем с GitHub
        const scriptUrl = `https://raw.githubusercontent.com/seiline-grey/my-scripts-licenses/main/scripts/${scriptName}`;
        
        try {
            const response = await fetch(scriptUrl);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            
            const encodedScript = await response.text();
            console.log('✅ Script loaded, size:', encodedScript.length, 'chars');
            
            // Декодируем и выполняем
            this.executeScript(encodedScript);
            
        } catch (error) {
            console.error('❌ Failed to load script:', error);
            this.showLoadError();
        }
    }
    
    createFileName() {
        // Генерируем имя файла из домена и ключа
        const str = this.domain + this.licenseKey;
        const base64 = btoa(str);
        const clean = base64.replace(/[=+/]/g, '');
        const short = clean.substring(0, 20);
        return short + '.js';
    }
    
    executeScript(encodedScript) {
        try {
            // Декодируем из base64
            const decodedScript = atob(encodedScript);
            
            // Проверяем цифровую подпись
            if (!decodedScript.includes('/* SIGNED:F1K3Y9A8 */')) {
                console.error('❌ Invalid script signature!');
                this.showError('Invalid script signature');
                return;
            }
            
            // Создаем и выполняем скрипт
            const script = document.createElement('script');
            script.textContent = decodedScript;
            document.head.appendChild(script);
            
            console.log('🚀 Script executed successfully!');
            
        } catch (error) {
            console.error('❌ Script execution error:', error);
            this.showError('Script execution failed');
        }
    }
    
    showLicenseError() {
        // Показываем ошибку только админам или в консоли
        console.error('LICENSE ERROR: This script is not licensed for ' + this.domain);
        
        // Можно показать сообщение на странице (только админам)
        if (this.isAdmin()) {
            const errorDiv = document.createElement('div');
            errorDiv.style.cssText = `
                position: fixed;
                top: 10px;
                right: 10px;
                background: #ff4444;
                color: white;
                padding: 10px;
                border-radius: 5px;
                z-index: 9999;
                font-size: 12px;
                max-width: 300px;
            `;
            errorDiv.innerHTML = `
                <strong>License Error</strong><br>
                Script not licensed for ${this.domain}<br>
                <small>Please contact the developer</small>
            `;
            document.body.appendChild(errorDiv);
        }
    }
    
    showLoadError() {
        console.error('Failed to load protected script');
    }
    
    showError(message) {
        console.error('Error:', message);
    }
    
    isAdmin() {
        // Простая проверка на админа (можно адаптировать под PHPBB)
        return document.cookie.includes('phpbb') || 
               document.querySelector('[href*="admin"]') ||
               document.querySelector('.administrator');
    }
}

// Автоматическая инициализация при наличии data-атрибута
document.addEventListener('DOMContentLoaded', function() {
    const scriptElement = document.querySelector('script[data-license-key]');
    
    if (scriptElement) {
        const licenseKey = scriptElement.getAttribute('data-license-key');
        if (licenseKey) {
            const checker = new SimpleLicenseChecker(licenseKey);
            checker.loadScript();
        }
    }
});
