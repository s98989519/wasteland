class EventSystem {
    constructor(gameController) {
        this.game = gameController;
        this.lastStep = -1;
        this.restState = { rested: false, built: false };
    }

    generateEvent(step) {
        // Reset state if it's a new step
        if (this.lastStep !== step) {
            this.restState = { rested: false, built: false };
            this.lastStep = step;
        }

        // 每 10 步觸發休息事件
        if (step > 0 && step % 10 === 0 && step !== 50) {
            return this.getRestEvent();
        }
        
        // 第 50 步觸發關卡 Boss (暫定)
        if (step === 50) {
            return this.getBossEvent();
        }

        // 隨機抽取一般事件 (戰鬥 60%, 搜刮 10%, 正面 15%, 負面 15%)
        const rand = Math.random();
        if (rand < 0.60) {
            return this.getCombatEvent();
        } else if (rand < 0.70) {
            return this.getScavengeEvent();
        } else if (rand < 0.85) {
            return this.getPositiveEvent();
        } else {
            return this.getNegativeEvent();
        }
    }

    getRestEvent() {
        const choices = [];

        if (this.restState.rested) {
            choices.push({
                text: "你已回復些許",
                disabled: true
            });
        } else {
            choices.push({
                text: "休息 (回復 30 HP)",
                keepUI: true,
                action: () => {
                    this.game.heal(30);
                    Logger.log("你在火堆旁休息，感覺體力恢復了一些。", "positive");
                    this.restState.rested = true;
                    this.game.triggerCurrentEvent(); // Refresh UI
                    
                    if (this.game.ui && this.game.ui.showResultModal) {
                        this.game.ui.showResultModal(
                            "休息",
                            "你在溫暖的火堆旁稍微喘息，精神好多了。\n\n<span style='color:var(--accent-green);'>恢復了 30 點生命</span>",
                            null
                        );
                    }
                }
            });
        }

        choices.push({
            text: "研讀舊筆記 (Build 選擇)",
            keepUI: true,
            action: () => {
                Logger.log("你翻閱著撿到的筆記，似乎領悟了什麼...(Build系統尚未實作)", "system");
                // Future build logic
            }
        });

        choices.push({
            text: "準備出發",
            action: () => {
                this.game.proceedToNextStep();
            }
        });

        return {
            icon: "⛺",
            title: "舊時代的營地",
            desc: "你找到了一個廢棄的營地，這裡似乎相對安全。你可以在這裡稍微喘息，並整理你找到的物資。",
            choices: choices
        };
    }

    getBossEvent() {
        return {
            icon: "💀",
            title: "未知的巨獸",
            desc: "一隻體型龐大的變異野獸擋在了你的面前。牠的皮膚像是岩石，眼睛散發著詭異的紅光。這是第一章的終點。",
            choices: [
                {
                    text: "拔出武器！",
                    action: () => {
                        Logger.log("戰鬥爆發！(Boss戰尚未實作)", "system");
                        this.game.takeDamage(50);
                        if (this.game.ui && this.game.ui.showResultModal) {
                            this.game.ui.showResultModal(
                                "硬碰硬",
                                "你衝向巨獸，但實力相差太過懸殊...(Boss戰尚未實作)\n\n<span style='color:var(--accent-red);'>受到了 50 點傷害</span>",
                                () => this.game.proceedToNextStep()
                            );
                        } else {
                            this.game.proceedToNextStep();
                        }
                    }
                }
            ]
        };
    }

    getCombatEvent() {
        const encounterTypes = [
            { id: 'boar', name: '野生豬', minHp: 20, maxHp: 30, minAtk: 3, maxAtk: 5 },
            { id: 'green_mushroom', name: '綠色巨菇', minHp: 16, maxHp: 26, minAtk: 3, maxAtk: 6 },
            { id: 'red_mushroom', name: '紅色巨菇', minHp: 12, maxHp: 22, minAtk: 4, maxAtk: 7 }
        ];

        return {
            icon: "⚠️",
            title: "你感到前方有威脅",
            desc: "四周的空氣突然變得沉重，你感覺到有危險的生物正在靠近...",
            choices: [
                {
                    text: "繼續",
                    action: () => {
                        if (this.game.combatSystem) {
                            const rand = Math.random();
                            let numEnemies = 1;
                            if (rand < 0.10) numEnemies = 4;
                            else if (rand < 0.30) numEnemies = 3;
                            else if (rand < 0.75) numEnemies = 2;
                            else numEnemies = 1;
                            
                            const enemyList = [];
                            const typeCounts = {}; // Track counts for labeling (A, B, C, D)

                            for (let i = 0; i < numEnemies; i++) {
                                const enc = encounterTypes[Math.floor(Math.random() * encounterTypes.length)];
                                typeCounts[enc.id] = (typeCounts[enc.id] || 0) + 1;
                                
                                let label = '';
                                if (numEnemies > 1) {
                                    const labels = ["A", "B", "C", "D"];
                                    label = ` ${labels[typeCounts[enc.id] - 1]}`;
                                }

                                enemyList.push({ 
                                    type: enc.id, 
                                    name: `${enc.name}${label}`, 
                                    minHp: enc.minHp, maxHp: enc.maxHp, minAtk: enc.minAtk, maxAtk: enc.maxAtk 
                                });
                            }

                            this.game.combatSystem.startCombat(enemyList);
                        }
                    }
                }
            ]
        };
    }

    getScavengeEvent() {
        return {
            icon: "📦",
            title: "廢棄的車輛",
            desc: "一台生鏽的舊時代金屬車輛停在路邊，後車廂半掩著。",
            choices: [
                {
                    text: "仔細搜刮",
                    action: () => {
                        const scrapFound = Math.floor(Math.random() * 20) + 10;
                        Logger.log(`你在車廂裡找到了一些舊世幣 (${scrapFound})！`, "important");
                        this.game.addScrap(scrapFound);
                        if (this.game.ui && this.game.ui.showResultModal) {
                            this.game.ui.showResultModal(
                                "搜刮成功",
                                `你翻遍了生鏽的車廂，在副駕駛座下的鐵盒裡發現了戰利品。\n\n<span style='color:var(--accent-green);'>獲得了 ${scrapFound} 舊世幣</span>`,
                                () => this.game.proceedToNextStep()
                            );
                        } else {
                            this.game.proceedToNextStep();
                        }
                    }
                },
                {
                    text: "直接離開",
                    action: () => {
                        Logger.log("為了避免潛在的危險，你決定不靠近它。");
                        if (this.game.ui && this.game.ui.showResultModal) {
                            this.game.ui.showResultModal(
                                "離開",
                                "你決定不冒險，安靜地繞過了這輛廢棄車輛。",
                                () => this.game.proceedToNextStep()
                            );
                        } else {
                            this.game.proceedToNextStep();
                        }
                    }
                }
            ]
        };
    }

    getPositiveEvent() {
        return {
            icon: "🍄",
            title: "奇異的發光植物",
            desc: "你看到一株散發著微光的植物，根據獵人的教導，這是一種能治癒傷口的草藥。",
            choices: [
                {
                    text: "採集並食用",
                    action: () => {
                        Logger.log("草藥的味道很苦，但傷口癒合了。", "positive");
                        this.game.heal(20);
                        if (this.game.ui && this.game.ui.showResultModal) {
                            this.game.ui.showResultModal(
                                "採集植物",
                                "你採集發光植物後直接食用，你感覺到味道很苦，但傷口奇蹟似地癒合了。\n\n<span style='color:var(--accent-green);'>恢復 20 點生命</span>",
                                () => this.game.proceedToNextStep()
                            );
                        } else {
                            this.game.proceedToNextStep();
                        }
                    }
                }
            ]
        };
    }

    getNegativeEvent() {
        return {
            icon: "☢️",
            title: "輻射坑洞",
            desc: "你不小心踏入了一個充滿刺鼻氣味的坑洞，皮膚感到一陣灼熱。",
            choices: [
                {
                    text: "趕緊爬出來",
                    action: () => {
                        Logger.log("你沾染了微量的輻射。", "negative");
                        this.game.takeRad(10);
                        if (this.game.ui && this.game.ui.showResultModal) {
                            this.game.ui.showResultModal(
                                "輻射傷害",
                                "你趕緊爬出坑洞，但刺鼻的氣味依舊殘留在皮膚上，讓你感到噁心。\n\n<span style='color:var(--accent-orange);'>輻射值增加了 10 點</span>",
                                () => this.game.proceedToNextStep()
                            );
                        } else {
                            this.game.proceedToNextStep();
                        }
                    }
                }
            ]
        };
    }
}
