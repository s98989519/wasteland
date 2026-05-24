document.addEventListener('DOMContentLoaded', () => {
    Logger.init();
    Logger.log("系統啟動中... 歡迎來到新世界。", "system");
    
    const ui = new UIManager();
    const game = new GameController(ui);
    
    // Bind global buttons
    document.getElementById('btn-start-expedition').addEventListener('click', () => {
        game.startExpedition();
    });

    document.getElementById('btn-upgrades').addEventListener('click', () => {
        Logger.log("資源不足，無法升級。", "system");
    });

    document.getElementById('btn-logs').addEventListener('click', () => {
        Logger.log("筆記上寫著：『不要相信螢光綠色的真菌。』", "important");
    });

    // Combat Main Menu
    document.getElementById('btn-attack').addEventListener('click', () => {
        if(game.combatSystem) game.combatSystem.selectAction('attack');
    });
    document.getElementById('btn-prepare-menu').addEventListener('click', () => {
        ui.showCombatMenu('skill');
    });
    document.getElementById('btn-defend-menu').addEventListener('click', () => {
        ui.showCombatMenu('defend');
    });
    document.getElementById('btn-open-bag').addEventListener('click', () => {
        if(game.inventorySystem) {
            game.inventorySystem._refreshUI();
            ui.showInventory();
        }
    });

    // Combat Defend Menu
    document.getElementById('btn-block').addEventListener('click', () => {
        if(game.combatSystem) game.combatSystem.selectAction('block');
        ui.showCombatMenu('main');
    });
    document.getElementById('btn-dodge').addEventListener('click', () => {
        if(game.combatSystem) game.combatSystem.selectAction('dodge');
        ui.showCombatMenu('main');
    });
    document.getElementById('btn-back-defend').addEventListener('click', () => {
        if(game.combatSystem) game.combatSystem.cancelActionSelection();
        ui.showCombatMenu('main');
    });

    // Combat Skill Menu
    document.getElementById('btn-prepare').addEventListener('click', () => {
        if(game.combatSystem) game.combatSystem.selectAction('prepare');
        ui.showCombatMenu('main');
    });
    document.getElementById('btn-skill').addEventListener('click', () => {
        if(game.combatSystem) game.combatSystem.selectAction('skill');
        ui.showCombatMenu('main');
    });
    document.getElementById('btn-back-skill').addEventListener('click', () => {
        if(game.combatSystem) game.combatSystem.cancelActionSelection();
        ui.showCombatMenu('main');
    });

    // Inventory Modal Close
    document.getElementById('btn-close-bag').addEventListener('click', () => {
        ui.hideInventory();
    });
});
