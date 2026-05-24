class SaveSystem {
    constructor(gameController) {
        this.game = gameController;
        this.saveKey = 'wasteland_save_v1';
        this.isSavingEnabled = false; // 初始載入時不觸發存檔
    }

    save() {
        if (!this.isSavingEnabled) return;
        
        try {
            const data = {
                state: this.game.exportData(),
                inventory: this.game.inventorySystem ? this.game.inventorySystem.exportData() : null,
                build: this.game.buildSystem ? this.game.buildSystem.exportData() : null,
                combat: this.game.combatSystem ? this.game.combatSystem.exportData() : null,
                event: this.game.eventSystem ? this.game.eventSystem.exportData() : null
            };
            
            localStorage.setItem(this.saveKey, JSON.stringify(data));
        } catch (e) {
            console.error("Save failed:", e);
        }
    }

    load() {
        try {
            const savedDataStr = localStorage.getItem(this.saveKey);
            if (!savedDataStr) {
                Logger.log("系統啟動中... 歡迎來到新世界。", "system");
                return false;
            }
            
            const data = JSON.parse(savedDataStr);
            
            if (data.state) this.game.importData(data.state);
            if (data.inventory && this.game.inventorySystem) this.game.inventorySystem.importData(data.inventory);
            if (data.build && this.game.buildSystem) this.game.buildSystem.importData(data.build);
            if (data.combat && this.game.combatSystem) this.game.combatSystem.importData(data.combat);
            if (data.event && this.game.eventSystem) this.game.eventSystem.importData(data.event);
            
            Logger.log("成功讀取前次探索的記憶。", "system");
            return true;
        } catch (e) {
            console.error("Load failed:", e);
            Logger.log("存檔損毀或不相容，記憶已重置。", "negative");
            return false;
        }
    }

    clear() {
        localStorage.removeItem(this.saveKey);
        Logger.log("已清除所有記憶。", "system");
    }
}
