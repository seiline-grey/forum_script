// loader.js - публичный файл, который клиенты вставляют на свои форумы
(function() {
    'use strict';
    
    const CONFIG = {
        GITHUB_USER: 'YourGitHubUsername',
        REPO: 'my-scripts-licenses',
        BRANCH: 'main',
        LICENSE_FILE: 'my-scripts-licenses/domains.json',
        SCRIPT_PATH: 'my-scripts-licenses/scripts/',
        TOKEN_PART1: 'github_pat_11B27L75Y01hZzt9UvbmgB',  // Разделите токен на части для безопасности
        TOKEN_PART2: '_iCDDG1fdH3FHUGcKrDJHKVycxI5kVS7jUIa1Q',
        TOKEN_PART3: 'v5zj3eGH7C3RVYsvOlz61K'
    };
    
    // Сборка полного токена (не показывается в коде полностью)
    const GITHUB_TOKEN = CONFIG.TOKEN_PART1 + CONFIG.TOKEN_PART2 + CONFIG.TOKEN_PART3;
    
    class ScriptLicenseManager {
        constructor(licenseKey) {
            this.licenseKey = licenseKey;
            this.currentDomain = window.location.hostname.replace(/^www\./, '');
            this.isValid = false;
            this.licenseData = null;
        }
        
        async validate() {
            try {
                // Получаем данные лицензий с GitHub
                const licenseUrl = `https://api.github.com/repos/${CONFIG.GITHUB_USER}/${CONFIG.REPO}/contents/${CONFIG.LICENSE_FILE}`;
                
                const response = await fetch(licenseUrl, {
                    headers: {
                        'Authorization': `token ${GITHUB_TOKEN}`,
                        'Accept': 'application/vnd.github.v3.raw'
                    }
                });
                
                if (!response.ok) throw new Error('License fetch failed');
                
                const licenses = await response.json();
                
                // Проверяем лицензию текущего домена
                if (licenses.clients[this.currentDomain]) {
                    const clientData = licenses.clients[this.currentDomain];
                    
                    if (clientData.key === this.licenseKey && 
                        clientData.active === true &&
                        (!clientData.expires || new Date(clientData.expires) > new Date())) {
                        
                        this.isValid = true;
                        this.licenseData = clientData;
                        return true;
                    }
                }
                
                return false;
                
            } catch (error) {
                console.error('License validation error:', error);
                return false;
            }
        }
        
        async loadProtectedScript() {
            if (!this.isValid) {
                this.showLicenseError();
                return;
            }
            
            try {
                // Загружаем защищенный скрипт
                const scriptName = btoa(this.currentDomain + this.licenseKey)
                    .replace(/[=+/]/g, '')
                    .substring(0, 20);
                
                const scriptUrl = `https://api.github.com/repos/${CONFIG.GITHUB_USER}/${CONFIG.REPO}/contents/${CONFIG.SCRIPT_PATH}${scriptName}.js`;
                
                const response = await fetch(scriptUrl, {
                    headers: {
                        'Authorization': `token ${GITHUB_TOKEN}`,
                        'Accept': 'application/vnd.github.v3.raw'
                    }
                });
                
                if (!response.ok) throw new Error('Script not found');
                
                const scriptCode = await response.text();
                
                // Расшифровываем и выполняем (простая base64)
                try {
                    const decodedScript = atob(scriptCode);
                    this.executeScript(decodedScript);
                } catch {
                    // Если не зашифровано, выполняем как есть
                    this.executeScript(scriptCode);
                }
                
            } catch (error) {
                console.error('Script loading error:', error);
                this.showLoadError();
            }
        }
        
        executeScript(code) {
            // Создаем изолированное выполнение
            const script = document.createElement('script');
            script.textContent = `
                (function(licenseData) {
                    ${code}
                })(${JSON.stringify(this.licenseData)});
            `;
            document.head.appendChild(script);
        }
        
        showLicenseError() {
            // Только админам показываем ошибку
            if (this.isAdminUser()) {
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
                    <strong>Ошибка лицензии</strong><br>
                    Скрипт не активирован для ${this.currentDomain}<br>
                    Ключ: ${this.licenseKey.substring(0, 8)}...
                `;
                document.body.appendChild(errorDiv);
                
                // Отправляем уведомление вам
                this.reportPiracy();
            }
        }
        
        showLoadError() {
            console.error('Не удалось загрузить защищенный скрипт');
        }
        
        isAdminUser() {
            // Определяем, является ли пользователь админом (адаптируйте под ваш форум)
            return document.cookie.includes('phpbb3_') || 
                   document.querySelector('[data-user-id="2"]') || // ID админа в PHPBB
                   document.querySelector('a[href*="mcp"]');
        }
        
        async reportPiracy() {
            // Отправляем уведомление о нелицензионном использовании
            try {
                await fetch(`https://api.github.com/repos/${CONFIG.GITHUB_USER}/${CONFIG.REPO}/issues`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `token ${GITHUB_TOKEN}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        title: `Piracy Alert: ${this.currentDomain}`,
                        body: `Domain: ${this.currentDomain}\nKey: ${this.licenseKey}\nTime: ${new Date().toISOString()}\nURL: ${window.location.href}`,
                        labels: ['piracy-alert']
                    })
                });
            } catch (e) {
                // silent fail
            }
        }
    }
    
    // Инициализация
    window.MyScriptLoader = {
        init: function(licenseKey) {
            const manager = new ScriptLicenseManager(licenseKey);
            
            // Проверяем и загружаем
            manager.validate().then(isValid => {
                if (isValid) {
                    manager.loadProtectedScript();
                }
            });
            
            return manager;
        }
    };
    
})();
