// simple-loader.js - ИСПРАВЛЕННАЯ ВЕРСИЯ
console.log('🎯 Загрузчик лицензий загружен!');

window.SimpleLicenseChecker = class SimpleLicenseChecker {
    constructor(licenseKey) {
        console.log('🔧 Конструктор вызван с ключом:', licenseKey);
        this.licenseKey = licenseKey;
        this.domain = window.location.hostname;
        
        // Список разрешенных доменов
        this.validDomains = {
            'rstart.rusff.me': 'F1K3Y9A8B7C6',
            'test-forum.ru': 'T3S7K2Y4X5Z6'
        };
        
        console.log('🌐 Текущий домен:', this.domain);
        console.log('📋 Разрешенные домены:', Object.keys(this.validDomains));
    }
    
    async loadScript() {
        console.log('🚀 Начало загрузки скрипта...');
        
        // Проверяем лицензию
        if (!this.checkLicense()) {
            console.error('⛔ Лицензия недействительна, останавливаемся');
            this.showError('Лицензия недействительна для ' + this.domain);
            return;
        }
        
        console.log('✅ Лицензия проверена, загружаем скрипт...');
        
        // Генерируем имя файла (ИСПРАВЛЕНО!)
        const fileName = this.generateFileName();
        console.log('📄 Имя файла скрипта:', fileName);
        
        // URL на GitHub
        const scriptUrl = `https://raw.githubusercontent.com/seiline-grey/my-scripts-licenses/main/scripts/${fileName}`;
        console.log('🌍 Загружаем из:', scriptUrl);
        
        try {
            // Загружаем файл
            const response = await fetch(scriptUrl);
            console.log('📡 Ответ сервера:', response.status, response.statusText);
            
            if (!response.ok) {
                throw new Error(`Не удалось загрузить скрипт: ${response.status}`);
            }
            
            // Получаем закодированный скрипт
            const encodedScript = await response.text();
            console.log('✅ Скрипт загружен, размер:', encodedScript.length, 'символов');
            console.log('📝 Первые 50 символов:', encodedScript.substring(0, 50));
            
            // Декодируем и выполняем
            this.executeScript(encodedScript);
            
        } catch (error) {
            console.error('❌ Ошибка загрузки:', error);
            this.showError('Ошибка загрузки скрипта: ' + error.message);
        }
    }
    
    checkLicense() {
        console.log('🔍 Проверяем лицензию...');
        
        const expectedKey = this.validDomains[this.domain];
        const isValid = expectedKey === this.licenseKey;
        
        console.log('Ожидаемый ключ для', this.domain + ':', expectedKey);
        console.log('Предоставленный ключ:', this.licenseKey);
        console.log(isValid ? '✅ Лицензия действительна' : '❌ Лицензия недействительна');
        
        return isValid;
    }
    
    generateFileName() {
        // ИСПРАВЛЕНО: domain + licenseKey
        const str = this.domain + this.licenseKey;
        console.log('🔤 Строка для кодирования:', str);
        
        const base64 = btoa(str);
        console.log('📊 Base64:', base64);
        
        const clean = base64.replace(/[=+/]/g, '');
        console.log('🧹 Очищенный:', clean);
        
        const fileName = clean.substring(0, 20) + '.js';
        console.log('📄 Финальное имя файла:', fileName);
        
        return fileName;
    }
    
    executeScript(encodedScript) {
        console.log('🔓 Декодируем скрипт...');
        
        try {
            // Декодируем из base64
            const decodedScript = atob(encodedScript);
            console.log('✅ Скрипт декодирован, размер:', decodedScript.length, 'символов');
            console.log('🔍 Проверяем подпись...');
            
            // Проверяем подпись
            if (!decodedScript.includes('/* SIGNED:F1K3Y9A8 */')) {
                console.error('❌ Неверная подпись скрипта!');
                console.log('Первые 200 символов скрипта:', decodedScript.substring(0, 200));
                this.showError('Неверная подпись скрипта');
                return;
            }
            
            console.log('✅ Подпись верна');
            
            // Выполняем скрипт
            console.log('⚡ Выполняем скрипт...');
            const scriptElement = document.createElement('script');
            scriptElement.textContent = decodedScript;
            document.head.appendChild(scriptElement);
            
            console.log('🎉 Скрипт успешно выполнен!');
            
        } catch (error) {
            console.error('❌ Ошибка выполнения скрипта:', error);
            this.showError('Ошибка выполнения: ' + error.message);
        }
    }
    
    showError(message) {
        console.error('💥 Ошибка:', message);
        
        // Показываем сообщение на странице
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: #ff4444;
            color: white;
            padding: 15px;
            border-radius: 5px;
            z-index: 10000;
            max-width: 300px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            font-family: Arial, sans-serif;
        `;
        errorDiv.innerHTML = `
            <strong>⚠️ Ошибка скрипта</strong><br>
            <small>${message}</small>
            <button onclick="this.parentNode.remove()" style="
                margin-top: 10px;
                padding: 5px 10px;
                background: white;
                border: none;
                border-radius: 3px;
                cursor: pointer;
            ">Закрыть</button>
        `;
        
        document.body.appendChild(errorDiv);
    }
};

console.log('✅ SimpleLicenseChecker готов к использованию');
