class BuildSystem {
    constructor(gameController) {
        this.game = gameController;
        this.maxSlots = 2;

        // Note Definitions
        this.noteDictionary = {
            'beast_instinct': {
                id: 'beast_instinct',
                name: '【野獸直覺】',
                desc: '與野獸搏鬥的經驗讓你變得更敏銳。\n效果：基礎攻擊力 +2，閃避機率 +5%。',
                cost: { scrap: 30, boar_pelt: 2 }
            },
            'spore_resistance': {
                id: 'spore_resistance',
                name: '【孢子抗性】',
                desc: '反覆吸入微量孢子，你的身體產生了抗性。\n效果：每次受到的輻射傷害固定為原本的一半，戰鬥中每回合回復 1 HP。',
                cost: { scrap: 40, strange_spore: 3 }
            },
            'scrap_recycling': {
                id: 'scrap_recycling',
                name: '【廢料加工】',
                desc: '你懂得如何把廢棄物發揮最大價值。\n效果：獲得舊世幣時額外增加 30%。',
                cost: { scrap: 50 }
            }
        };

        // Persistent State across runs
        this.discoveredNotes = new Set(); // IDs of notes discovered ever (unlocks in gallery)
        this.craftedNotes = new Map();    // IDs of notes crafted to their counts
        
        // Preparation State (set in Hub or Camp)
        this.equippedNotes = [];          // IDs of notes currently equipped in slots (max 2)
        
        // Run specific state
        this.startingEquippedNotes = [];  // Notes equipped at the start of the current run
        this.runDiscoveredNotes = new Set(); // Notes discovered in the current run
    }

    startRun() {
        this.startingEquippedNotes = [...this.equippedNotes];
        this.runDiscoveredNotes.clear();
    }

    resetRunState() {
        this.startingEquippedNotes = [];
        this.runDiscoveredNotes.clear();
    }

    // Call this when discovering a note in expedition
    discoverNote(id) {
        if (!this.noteDictionary[id]) return;

        let isNewDiscovery = false;
        if (!this.discoveredNotes.has(id)) {
            this.discoveredNotes.add(id);
            isNewDiscovery = true;
        }

        // Add to craftedNotes directly so it can be equipped in Camp without cost
        const currentCount = this.craftedNotes.get(id) || 0;
        this.craftedNotes.set(id, currentCount + 1);
        
        // Mark as discovered in this run
        this.runDiscoveredNotes.add(id);
    }

    // Get notes that are active right now (equipped)
    getActiveNotes() {
        const active = new Set(this.equippedNotes);
        return Array.from(active).map(id => this.noteDictionary[id]);
    }

    hasActiveNote(id) {
        return this.equippedNotes.includes(id);
    }

    canCraft(id) {
        if (this.craftedNotes.has(id)) return false;
        if (!this.discoveredNotes.has(id)) return false;
        
        const note = this.noteDictionary[id];
        if (!note || !note.cost) return false;

        if (note.cost.scrap && this.game.state.scrap < note.cost.scrap) return false;
        
        if (this.game.inventorySystem) {
            const invSys = this.game.inventorySystem;
            for (let [materialId, amount] of Object.entries(note.cost)) {
                if (materialId === 'scrap') continue;
                const item = invSys.items.find(i => i.id === materialId);
                if (!item || item.count < amount) return false;
            }
        }
        return true;
    }

    craftNote(id) {
        if (!this.canCraft(id)) {
            Logger.log("資源不足，無法裝訂筆記。", "negative");
            return false;
        }

        const note = this.noteDictionary[id];
        
        // Deduct resources
        if (note.cost.scrap) {
            this.game.state.scrap -= note.cost.scrap;
        }
        if (this.game.inventorySystem) {
            const invSys = this.game.inventorySystem;
            for (let [materialId, amount] of Object.entries(note.cost)) {
                if (materialId === 'scrap') continue;
                const item = invSys.items.find(i => i.id === materialId);
                if (item) item.count -= amount;
            }
        }

        // Mark as crafted
        const currentCount = this.craftedNotes.get(id) || 0;
        this.craftedNotes.set(id, currentCount + 1);
        if (this.game.updateUI) this.game.updateUI(); // update scrap UI and save
        Logger.log(`成功裝訂了實體筆記：${note.name}。`, "positive");
        return true;
    }

    equipNote(id) {
        if (!this.craftedNotes.has(id) || this.craftedNotes.get(id) <= 0) return false;
        if (this.equippedNotes.includes(id)) return false;
        
        if (this.equippedNotes.length >= this.maxSlots) {
            Logger.log("記憶槽位已滿，無法裝備更多筆記。", "negative");
            return false;
        }

        this.equippedNotes.push(id);
        if (this.game.saveSystem) this.game.saveSystem.save();
        return true;
    }

    unequipNote(id) {
        const index = this.equippedNotes.indexOf(id);
        if (index > -1) {
            this.equippedNotes.splice(index, 1);
            if (this.game.saveSystem) this.game.saveSystem.save();
            return true;
        }
        return false;
    }

    exportData() {
        return {
            discoveredNotes: Array.from(this.discoveredNotes),
            craftedNotes: Array.from(this.craftedNotes.entries()),
            equippedNotes: this.equippedNotes,
            startingEquippedNotes: this.startingEquippedNotes,
            runDiscoveredNotes: Array.from(this.runDiscoveredNotes)
        };
    }

    importData(data) {
        if (data.discoveredNotes) this.discoveredNotes = new Set(data.discoveredNotes);
        if (data.craftedNotes) {
            if (Array.isArray(data.craftedNotes)) {
                if (data.craftedNotes.length > 0 && Array.isArray(data.craftedNotes[0])) {
                    this.craftedNotes = new Map(data.craftedNotes);
                } else {
                    this.craftedNotes = new Map();
                    data.craftedNotes.forEach(id => this.craftedNotes.set(id, 1));
                }
            }
        }
        if (data.equippedNotes) this.equippedNotes = data.equippedNotes;
        
        if (data.startingEquippedNotes) {
            this.startingEquippedNotes = data.startingEquippedNotes;
        } else if (this.equippedNotes && this.equippedNotes.length > 0) {
            // Backward compatibility for old saves
            this.startingEquippedNotes = [...this.equippedNotes];
        }
        
        if (data.runDiscoveredNotes) this.runDiscoveredNotes = new Set(data.runDiscoveredNotes);
    }
}
