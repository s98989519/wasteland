class InventorySystem {
    constructor(gameController) {
        this.game = gameController;
        this.items = [
            { id: 'bandage', name: '舊繃帶', type: 'consumable', heal: 20, count: 3 },
            { id: 'rusty_pipe', name: '生鏽的鐵管', type: 'weapon', attackBonus: 2, count: 1 },
            { id: 'worn_jacket', name: '破舊皮衣', type: 'upperBody', defenseBonus: 1, count: 1 }
        ];

        this.equipment = {
            upperBody: null,
            lowerBody: null,
            weapon: null,
            necklace: null,
            ring: null,
            accessory: null
        };
        
        this.itemsUsedThisTurn = 0;
        this.maxItemsPerTurn = 1;
    }

    resetTurnUsage() {
        this.itemsUsedThisTurn = 0;
    }

    useItem(itemId) {
        const item = this.items.find(i => i.id === itemId);
        if (item && item.count > 0 && (item.type === 'consumable' || item.type === 'material')) {
            if (this.game.state.inCombat && this.itemsUsedThisTurn >= this.maxItemsPerTurn) {
                Logger.log("本回合無法再使用更多道具！", "system");
                return;
            }

            let used = false;
            
            if (item.heal) {
                this.game.heal(item.heal);
                Logger.log(`你使用了 ${item.name}，回復了 ${item.heal} 點生命。`, "positive");
                used = true;
            }
            if (item.debuff === 'weakness') {
                this.game.state.buffs.weaknessTurns = 1;
                Logger.log(`生食產生了副作用...你獲得了 1 回合的【虛弱】(攻擊力-1)！`, "negative");
                used = true;
            }
            if (item.armorBonus) {
                this.game.addArmor(item.armorBonus);
                used = true;
            }

            if (!used) {
                Logger.log(`${item.name} 目前無法使用。`, "system");
                return;
            }

            item.count--;
            
            if (this.game.state.inCombat) {
                this.itemsUsedThisTurn++;
            }
            
            this.game.ui.updateStats(this.game.state);
            this._refreshUI();
        }
    }

    equipItem(itemId) {
        const itemIndex = this.items.findIndex(i => i.id === itemId);
        if (itemIndex > -1) {
            const item = this.items[itemIndex];
            const slot = item.type;
            
            if (this.equipment[slot] !== undefined) {
                // Unequip current item in slot
                if (this.equipment[slot]) {
                    this.items.push(this.equipment[slot]);
                }
                
                // Remove from inventory and equip
                this.items.splice(itemIndex, 1);
                this.equipment[slot] = item;
                
                Logger.log(`裝備了 ${item.name}。`, "system");
                this._refreshUI();
            }
        }
    }

    unequipItem(slot) {
        const item = this.equipment[slot];
        if (item) {
            this.equipment[slot] = null;
            this.items.push(item);
            Logger.log(`卸下了 ${item.name}。`, "system");
            this._refreshUI();
        }
    }

    _refreshUI() {
        this.game.ui.renderInventory(
            this.equipment, 
            this.items, 
            (id) => this.useItem(id),
            (id) => this.equipItem(id),
            (slot) => this.unequipItem(slot)
        );
    }

    addItem(itemId, name, type, stats, count = 1) {
        const item = this.items.find(i => i.id === itemId);
        if (item && (item.type === 'consumable' || item.type === 'material')) {
            item.count += count;
        } else {
            this.items.push({ id: itemId, name: name, type: type, ...stats, count: count });
        }
    }

    getItems() {
        return this.items;
    }
}
