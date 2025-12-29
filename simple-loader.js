// simple-loader.js - полностью публичный
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
        return this.validDomains[this.domain] === this.licenseKey;
    }
    
    loadScript() {
        if (!this.check()) {
            this.showError();
            return;
        }
        
        // Динамически загружаем скрипт с GitHub (raw content)
        const scriptHash = this.createHash(this.domain + this.licenseKey);
        const scriptUrl = `https://raw.githubusercontent.com/YourGitHubUsername/protected-scripts/main/${scriptHash}.js`;
        
        fetch(scriptUrl)
            .then(r => r.text())
            .then(code => {
                // Проверяем цифровую подпись
                if (this.verifySignature(code, this.licenseKey)) {
                    this.execute(code);
                } else {
                    this.showError();
                }
            })
            .catch(() => this.showError());
    }
    
    createHash(str) {
        // Простая хэш-функция
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            hash = ((hash << 5) - hash) + str.charCodeAt(i);
            hash |= 0;
        }
        return Math.abs(hash).toString(36);
    }
    
    verifySignature(code, key) {
        // Проверяем, что скрипт подписан вами
        return code.includes(`/* SIGNED:${key.substring(0, 8)} */`);
    }
    
    execute(code) {
        const script = document.createElement('script');
        script.textContent = code;
        document.head.appendChild(script);
    }
    
    showError() {
        console.error('Лицензия недействительна');
    }
}

// Использование на форуме клиента:
const checker = new SimpleLicenseChecker('F1K3Y9A8B7C6');
checker.loadScript();
