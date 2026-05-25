document.addEventListener('DOMContentLoaded', () => {
    Logger.init();
    Logger.log("系統啟動中... 歡迎來到新世界。", "system");
    
    const ui = new UIManager();
    const game = new GameController(ui);
    
    // Bind global buttons
    document.getElementById('btn-start-expedition').addEventListener('click', () => {
        game.startExpedition();
    });

    const btnBookshelf = document.getElementById('btn-bookshelf');
    if (btnBookshelf) {
        btnBookshelf.addEventListener('click', () => {
            if (game.buildSystem) {
                ui.renderBookshelf(game.buildSystem);
                ui.showBookshelf();
            }
        });
    }

    const btnTopbarBag = document.getElementById('btn-topbar-bag');
    if (btnTopbarBag) {
        btnTopbarBag.addEventListener('click', () => {
            if(game.inventorySystem) {
                game.inventorySystem._refreshUI();
            }
            ui.showInventory();
        });
    }

    const btnSettings = document.getElementById('btn-settings-gear');
    const settingsModal = document.getElementById('settings-modal');
    const btnCloseSettings = document.getElementById('btn-close-settings');
    const btnAbandon = document.getElementById('btn-abandon');

    if (btnSettings) {
        btnSettings.addEventListener('click', () => {
            if (settingsModal) settingsModal.classList.remove('hidden');
        });
    }

    if (btnCloseSettings) {
        btnCloseSettings.addEventListener('click', () => {
            if (settingsModal) settingsModal.classList.add('hidden');
        });
    }

    if (btnAbandon) {
        btnAbandon.addEventListener('click', () => {
            if (settingsModal) settingsModal.classList.add('hidden');
            game.abandon();
        });
    }

    const btnCloseBookshelf = document.getElementById('btn-close-bookshelf');
    if (btnCloseBookshelf) {
        btnCloseBookshelf.addEventListener('click', () => {
            ui.hideBookshelf();
        });
    }

    const btnCloseCampNotes = document.getElementById('btn-close-camp-notes');
    if (btnCloseCampNotes) {
        btnCloseCampNotes.addEventListener('click', () => {
            ui.hideCampNotes();
        });
    }

    document.addEventListener('note-equip', (e) => {
        if(game.buildSystem) {
            game.buildSystem.equipNote(e.detail);
            ui.renderBookshelf(game.buildSystem);
        }
    });

    document.addEventListener('note-unequip', (e) => {
        if(game.buildSystem) {
            game.buildSystem.unequipNote(e.detail);
            ui.renderBookshelf(game.buildSystem);
        }
    });

    // Camp Notes Custom Events
    document.addEventListener('camp-note-equip', (e) => {
        if(game.buildSystem) {
            game.buildSystem.equipNote(e.detail);
            ui.renderCampNotes(game.buildSystem);
            ui.updateStats(game.state); // Make sure stats update immediately
        }
    });

    document.addEventListener('camp-note-unequip', (e) => {
        if(game.buildSystem) {
            game.buildSystem.unequipNote(e.detail);
            ui.renderCampNotes(game.buildSystem);
            ui.updateStats(game.state); // Make sure stats update immediately
        }
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
    });
    document.getElementById('btn-dodge').addEventListener('click', () => {
        if(game.combatSystem) game.combatSystem.selectAction('dodge');
    });
    document.getElementById('btn-back-defend').addEventListener('click', () => {
        if(game.combatSystem) game.combatSystem.cancelActionSelection();
        ui.showCombatMenu('main');
    });

    // Combat Skill Menu
    document.getElementById('btn-prepare').addEventListener('click', () => {
        if(game.combatSystem) game.combatSystem.selectAction('prepare');
    });
    document.getElementById('btn-skill').addEventListener('click', () => {
        if(game.combatSystem) game.combatSystem.selectAction('skill');
    });
    document.getElementById('btn-back-skill').addEventListener('click', () => {
        if(game.combatSystem) game.combatSystem.cancelActionSelection();
        ui.showCombatMenu('main');
    });

    // AP Controls
    document.getElementById('btn-undo-action').addEventListener('click', () => {
        if(game.combatSystem) game.combatSystem.undoLastAction();
    });
    document.getElementById('btn-end-turn').addEventListener('click', () => {
        if(game.combatSystem) game.combatSystem.endTurnQueue();
    });

    // Inventory Modal Close
    document.getElementById('btn-close-bag').addEventListener('click', () => {
        ui.hideInventory();
    });
});
