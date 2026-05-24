class Logger {
    static init() {
        this.container = document.getElementById('log-container');
    }

    static log(message, type = 'normal') {
        if (!this.container) return;
        
        const el = document.createElement('p');
        el.className = `log-entry ${type}`;
        el.innerHTML = `[${new Date().toLocaleTimeString()}] ${message}`;
        
        this.container.appendChild(el);
        
        // Keep only last 20 logs
        while (this.container.children.length > 20) {
            this.container.removeChild(this.container.firstChild);
        }
        
        // Auto scroll to bottom
        const bottomBar = document.getElementById('bottom-bar');
        bottomBar.scrollTop = bottomBar.scrollHeight;
    }
}
