class GameController {
    constructor(uiManager) {
        this.ui = uiManager;
        this.ui.game = this;
        this.eventSystem = new EventSystem(this);
        this.inventorySystem = new InventorySystem(this);
        this.combatSystem = new CombatSystem(this);
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

    init() {
        this.ui.updateStats(this.state);
        this.ui.showHub();
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
        this.ui.updateStats(this.state);
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
        
        this.ui.updateStats(this.state);
    }

    heal(amount) {
        this.state.hp += amount;
        if(this.state.hp > this.state.maxHp) this.state.hp = this.state.maxHp;
        this.ui.updateStats(this.state);
    }

    takeRad(amount) {
        this.state.rad += amount;
        if(this.state.rad > 100) this.state.rad = 100;
        this.ui.updateStats(this.state);
        Logger.log(`輻射值增加了 ${amount}。`, "system");
    }

    addArmor(amount) {
        this.state.armor += amount;
        this.ui.updateStats(this.state);
        Logger.log(`獲得了 ${amount} 點護甲！(目前護甲: ${this.state.armor})`, "positive");
    }

    addScrap(amount) {
        this.state.scrap += amount;
        this.ui.updateStats(this.state);
    }

    die() {
        this.state.inExpedition = false;
        this.state.inCombat = false;
        Logger.log("你眼前一黑，暈了過去...失去了一部分物資回到獵人小屋。", "important");
        this.state.hp = this.state.maxHp;
        this.state.rad = 0;
        this.state.scrap = Math.floor(this.state.scrap * 0.5); // Lose half scrap
        
        if (this.combatSystem) this.combatSystem.endCombat();
        
        this.ui.updateStats(this.state);

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

    winChapter() {
        this.state.inExpedition = false;
        this.state.hp = this.state.maxHp;
        this.state.rad = 0;
        
        this.ui.updateStats(this.state);
        this.ui.hideTopBar();
        this.ui.showHub();
    }
}
