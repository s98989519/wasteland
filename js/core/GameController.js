class GameController {
    constructor(uiManager) {
        this.ui = uiManager;
        this.ui.game = this;
        this.eventSystem = new EventSystem(this);
        this.inventorySystem = new InventorySystem(this);
        this.combatSystem = new CombatSystem(this);
        this.buildSystem = new BuildSystem(this);
        this.saveSystem = new SaveSystem(this);
        this.state = {
            inExpedition: false,
            inCombat: false,
            hp: 100,
            maxHp: 100,
            rad: 0,
            scrap: 0,
            depth: 0,
            maxDepth: 50,
            armor: 0,
            buffs: { weaknessTurns: 0 }
        };
        
        this.init();
    }

    exportData() {
        return this.state;
    }

    importData(data) {
        this.state = { ...this.state, ...data };
    }

    init() {
        if (this.saveSystem && this.saveSystem.load()) {
            if (this.state.inCombat) {
                this.ui.showExpedition();
                this.ui.showCombatView();
                
                // --- Recovery logic for broken saves ---
                if (this.combatSystem.turnState === 'EXECUTING') {
                    this.combatSystem.turnState = 'SELECTING_ACTION';
                    this.combatSystem.selectedActionType = null;
                }
                const aliveEnemies = this.combatSystem.enemies.filter(e => !e.isDead);
                if (aliveEnemies.length > 0 && aliveEnemies.some(e => !e.nextAction)) {
                    this.combatSystem.turn = Math.max(0, this.combatSystem.turn - 1);
                    this.combatSystem.startPlayerTurn();
                } else {
                    this.combatSystem.updateUI();
                }
                // ----------------------------------------

                Logger.log("從戰鬥中恢復記憶。", "important");
            } else if (this.state.inExpedition) {
                this.ui.showExpedition();
                this.ui.hideCombatView();
                this.ui.showTopBar();
                Logger.log(`回到探索深度 ${this.state.depth}。`, "important");
                this.triggerCurrentEvent();
            } else {
                this.ui.showHub();
            }
            this.updateUI();
        } else {
            this.ui.showHub();
            this.updateUI();
        }
        
        if (this.saveSystem) this.saveSystem.isSavingEnabled = true;
    }

    updateUI() {
        this.ui.updateStats(this.state);
        if (this.saveSystem) this.saveSystem.save();
    }

    startExpedition() {
        this.state.inExpedition = true;
        this.state.depth = 1;
        Logger.log("你推開沉重的鐵門，踏入了未知的荒野...", "important");
        
        this.ui.showExpedition();
        this.ui.showTopBar();
        
        this.triggerCurrentEvent();
    }

    triggerCurrentEvent() {
        this.updateUI();
        const eventData = this.eventSystem.generateEvent(this.state.depth);
        this.ui.updateEvent(eventData.icon, eventData.title, eventData.desc, eventData.choices);
    }

    proceedToNextStep() {
        if (this.state.hp <= 0) {
            this.die();
            return;
        }

        if (this.state.depth >= this.state.maxDepth) {
            Logger.log("你完成了第一章的探索！活著回到了小屋。", "important");
            this.winChapter();
            return;
        }

        this.state.depth++;
        this.triggerCurrentEvent();
    }

    takeDamage(amount) {
        if (this.state.armor > 0) {
            const blocked = Math.min(this.state.armor, amount);
            this.state.armor -= blocked;
            amount -= blocked;
            if (amount > 0) {
                Logger.log(`護甲抵擋了 ${blocked} 點傷害，你受到了 ${amount} 點傷害。`, "important");
            } else {
                Logger.log(`護甲完全抵擋了傷害！(剩餘護甲: ${this.state.armor})`, "positive");
            }
        } else if (amount > 0) {
            Logger.log(`你受到了 ${amount} 點傷害。`, "important");
        }

        if (amount > 0) {
            this.state.hp -= amount;
            if(this.state.hp < 0) this.state.hp = 0;
        }
        
        this.updateUI();
    }

    heal(amount) {
        this.state.hp += amount;
        if(this.state.hp > this.state.maxHp) this.state.hp = this.state.maxHp;
        this.updateUI();
    }

    takeRad(amount) {
        if (this.buildSystem && this.buildSystem.hasActiveNote('spore_resistance')) {
            amount = Math.ceil(amount / 2);
            Logger.log("【孢子抗性】發揮作用，輻射傷害減半！", "positive");
        }
        this.state.rad += amount;
        if(this.state.rad > 100) this.state.rad = 100;
        this.updateUI();
        Logger.log(`輻射值增加了 ${amount}。`, "system");
    }

    addArmor(amount) {
        this.state.armor += amount;
        this.updateUI();
        Logger.log(`獲得了 ${amount} 點護甲！(目前護甲: ${this.state.armor})`, "positive");
    }

    addScrap(amount) {
        if (this.buildSystem && this.buildSystem.hasActiveNote('scrap_recycling')) {
            amount = Math.floor(amount * 1.3);
        }
        this.state.scrap += amount;
        this.updateUI();
    }

    die() {
        this.state.inExpedition = false;
        this.state.inCombat = false;
        Logger.log("你眼前一黑，暈了過去...失去了一部分物資回到獵人小屋。", "important");
        this.state.hp = this.state.maxHp;
        this.state.rad = 0;
        this.state.scrap = Math.floor(this.state.scrap * 0.5); // Lose half scrap
        if (this.buildSystem) this.buildSystem.resetRunState();
        
        if (this.combatSystem) this.combatSystem.endCombat();
        
        this.updateUI();

        if (this.ui.showResultModal) {
            this.ui.showResultModal(
                "失去意識",
                "你受到過多的傷害，<br><br><span style='color:var(--accent-red); font-weight:bold;'>你眼前一黑，暈了過去...</span><br><br>當你再次醒來時，發現自己已經回到了獵人小屋，但身上的一部分物資遺失了。",
                () => {
                    this.ui.hideTopBar();
                    this.ui.showHub();
                }
            );
        } else {
            this.ui.hideTopBar();
            this.ui.showHub();
        }
    }

    abandon() {
        if (!this.state.inExpedition) return;
        this.state.inExpedition = false;
        this.state.inCombat = false;
        Logger.log("你選擇了放棄，倉皇逃回了小屋...", "important");
        this.state.hp = this.state.maxHp;
        this.state.rad = 0;
        this.state.scrap = Math.floor(this.state.scrap * 0.5); // Lose half scrap
        if (this.buildSystem) this.buildSystem.resetRunState();
        
        if (this.combatSystem) this.combatSystem.endCombat();
        
        this.updateUI();

        if (this.ui.showResultModal) {
            this.ui.showResultModal(
                "中途放棄",
                "你感覺無法再繼續深入了。<br><br><span style='color:var(--accent-red); font-weight:bold;'>你選擇倉皇逃回小屋。</span><br><br>在逃跑的過程中，你遺失了一半的舊世幣。",
                () => {
                    this.ui.hideTopBar();
                    this.ui.showHub();
                }
            );
        } else {
            this.ui.hideTopBar();
            this.ui.showHub();
        }
    }

    winChapter() {
        this.state.inExpedition = false;
        this.state.hp = this.state.maxHp;
        this.state.rad = 0;
        if (this.buildSystem) this.buildSystem.resetRunState();
        
        this.updateUI();
        this.ui.hideTopBar();
        this.ui.showHub();
    }
}
