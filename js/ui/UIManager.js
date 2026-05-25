class UIManager {
    constructor() {
        this.hubView = document.getElementById('hub-view');
        this.expeditionView = document.getElementById('expedition-view');
        this.topBar = document.getElementById('top-bar');
        
        this.hpText = document.getElementById('hp-text');
        this.hpBar = document.getElementById('hp-bar');
        this.statusContainer = document.getElementById('status-container');
        this.statusList = document.getElementById('status-list');
        
        this.radText = document.getElementById('rad-text');
        this.radBar = document.getElementById('rad-bar');
        this.scrapText = document.getElementById('scrap-text');
        this.depthText = document.getElementById('depth-text');
        
        this.eventIcon = document.getElementById('event-image');
        this.eventTitle = document.getElementById('event-title');
        this.eventDesc = document.getElementById('event-desc');
        this.eventChoices = document.getElementById('event-choices');

        // Combat Elements
        this.combatView = document.getElementById('combat-view');
        this.enemyName = document.getElementById('enemy-name');
        this.enemyHpText = document.getElementById('enemy-hp-text');
        this.enemyHpBar = document.getElementById('enemy-hp-bar');
        this.prepStacksText = document.getElementById('prep-stacks');
        
        this.combatMain = document.getElementById('combat-main-actions');
        this.combatDefend = document.getElementById('combat-defend-actions');
        this.combatSkill = document.getElementById('combat-skill-actions');

        // Inventory Elements
        this.inventoryModal = document.getElementById('inventory-modal');
        this.inventoryList = document.getElementById('inventory-list');
        
        // Bookshelf Elements
        this.bookshelfModal = document.getElementById('bookshelf-modal');
        this.bookshelfList = document.getElementById('bookshelf-list');
        
        // Camp Notes Elements
        this.campNotesModal = document.getElementById('camp-notes-modal');
        this.campNotesList = document.getElementById('camp-notes-list');
    }

    showHub() {
        this.hubView.classList.remove('hidden');
        this.expeditionView.classList.add('hidden');
    }

    showExpedition() {
        this.hubView.classList.add('hidden');
        this.expeditionView.classList.remove('hidden');
    }

    showTopBar() {
        this.topBar.classList.remove('hidden');
    }

    hideTopBar() {
        this.topBar.classList.add('hidden');
    }

    updateStats(state) {
        document.getElementById('hp-text').innerText = `${state.hp}/${state.maxHp}`;
        document.getElementById('hp-bar').style.width = `${(state.hp/state.maxHp)*100}%`;
        document.getElementById('rad-text').innerText = `${state.rad}/100`;
        document.getElementById('rad-bar').style.width = `${(state.rad/100)*100}%`;
        
        const combatHpText = document.getElementById('combat-hp-text');
        if (combatHpText) {
            combatHpText.innerText = `${state.hp}/${state.maxHp}`;
            document.getElementById('combat-hp-bar').style.width = `${(state.hp/state.maxHp)*100}%`;
            document.getElementById('combat-rad-text').innerText = `${state.rad}/100`;
            document.getElementById('combat-rad-bar').style.width = `${(state.rad/100)*100}%`;
        }

        document.getElementById('depth-text').innerText = `${state.depth}/${state.maxDepth}`;
        document.getElementById('scrap-text').innerText = `${state.scrap}`;

        // Buffs/Status rendering
        const statusList = document.getElementById('status-list');
        const combatStatusList = document.getElementById('combat-status-container');
        statusList.innerHTML = '';
        if (combatStatusList) combatStatusList.innerHTML = '';

        let activeBuffs = [];

        if (state.armor && state.armor > 0) {
            activeBuffs.push({ text: `🛡️ 護甲 (${state.armor})`, type: 'buff', details: `護甲可以抵擋受到的傷害。<br><br>目前擁有 <b>${state.armor}</b> 點護甲。` });
        }
        if (state.buffs && state.buffs.weaknessTurns > 0) {
            activeBuffs.push({ text: `⚠️ 虛弱 (${state.buffs.weaknessTurns}回合)`, type: 'debuff', details: `你感到渾身無力，攻擊力與防禦力下降。<br><br>剩餘回合：<b>${state.buffs.weaknessTurns}</b>` });
        }
        if (state.buffs && state.buffs.prepStacks > 0) {
            activeBuffs.push({ text: `⚡ 準備 (${state.buffs.prepStacks}層)`, type: 'buff', details: `蓄勢待發，可用來施放強大的武器技能。<br><br>目前層數：<b>${state.buffs.prepStacks}</b>` });
        }

        // 輻射狀態徽章
        if (state.rad >= 90) {
            activeBuffs.push({ text: `☢️ 輻射中毒`, type: 'debuff', details: `身體劇痛無法集中精神。<br><br><span style="color:var(--accent-red);">戰鬥中無法使用「準備」指令。</span><br>每走 1 步失去 1 點生命。<br>戰鬥開場附加 2 回合虛弱。` });
        } else if (state.rad >= 60) {
            activeBuffs.push({ text: `☢️ 重度輻射`, type: 'debuff', details: `細胞發生病變。<br><br><span style="color:var(--accent-orange);">每走 1 步失去 1 點生命。<br>戰鬥開場附加 2 回合虛弱。</span>` });
        } else if (state.rad >= 30) {
            activeBuffs.push({ text: `☢️ 輕度輻射`, type: 'debuff', details: `身體開始排斥食物。<br><br><span style="color:var(--accent-orange);">所有恢復效果降低 30%。</span>` });
        }

        const maxDisplay = 2;
        const displayBuffs = activeBuffs.slice(0, maxDisplay);

        const openStatusModal = (e) => {
            e.stopPropagation();
            if (activeBuffs.length === 0) return;
            let fullHtml = '<div style="display:flex; flex-direction:column; gap:12px; width:100%; text-align:left; white-space: normal;">';
            activeBuffs.forEach(b => {
                const parts = b.details.split('<br><br>');
                const shortDesc = parts[0] || '';
                const effects = parts[1] || '';
                const color = b.type === 'buff' ? 'var(--accent-green)' : 'var(--accent-red)';
                
                fullHtml += `<div style="padding:15px; border:1px solid #333; border-left:4px solid ${color}; border-radius:6px; background:rgba(20,20,20,0.8); width:100%; box-sizing:border-box;">
                                <div style="display:flex; align-items: baseline; gap: 15px; margin-bottom: 12px;">
                                    <div style="font-weight:bold; font-size: 1.1rem; color:#fff;">${b.text}</div>
                                    <div style="font-size:0.85rem; color:#aaa;">${shortDesc}</div>
                                </div>
                                <div style="font-size:0.95rem; color:#ccc; line-height:1.6;">${effects}</div>
                             </div>`;
            });
            fullHtml += '</div>';
            if (this.showResultModal) this.showResultModal("當前狀態 (Status)", fullHtml);
        };

        displayBuffs.forEach(b => {
            const badge = document.createElement('span');
            badge.className = `status-badge ${b.type}`;
            badge.innerText = b.text;
            badge.onclick = openStatusModal;
            statusList.appendChild(badge);
            
            if (combatStatusList) {
                const cb = badge.cloneNode(true);
                cb.onclick = openStatusModal;
                combatStatusList.appendChild(cb);
            }
        });

        if (activeBuffs.length > maxDisplay) {
            const moreBadge = document.createElement('span');
            moreBadge.className = `status-badge`;
            moreBadge.innerText = `+${activeBuffs.length - maxDisplay}`;
            moreBadge.onclick = openStatusModal;
            moreBadge.style.cursor = 'pointer';
            statusList.appendChild(moreBadge);
            if (combatStatusList) {
                const cm = moreBadge.cloneNode(true);
                cm.onclick = openStatusModal;
                combatStatusList.appendChild(cm);
            }
        }

        if (activeBuffs.length > 0) {
            document.getElementById('status-container').style.display = 'block';
        } else {
            document.getElementById('status-container').style.display = 'none';
            if (combatStatusList) {
                combatStatusList.innerHTML = '<span style="font-size: 0.9rem; color: #888;">無狀態</span>';
            }
        }
    }

    updateEvent(icon, title, desc, choices) {
        this.eventIcon.innerText = icon;
        this.eventTitle.innerText = title;
        this.eventDesc.innerText = desc;
        
        this.eventChoices.innerHTML = '';
        choices.forEach(choice => {
            const btn = document.createElement('button');
            btn.className = 'btn primary';
            btn.innerText = choice.text;
            
            if (choice.disabled) {
                btn.disabled = true;
                btn.style.opacity = '0.5';
                btn.style.cursor = 'not-allowed';
                btn.style.borderColor = '#555';
                btn.style.color = '#777';
            } else {
                btn.onclick = () => {
                    // 只有當此動作是推進事件時才清空按鈕防連點
                    if (!choice.keepUI) {
                        this.eventChoices.innerHTML = ''; 
                    }
                    choice.action();
                };
            }
            this.eventChoices.appendChild(btn);
        });
    }

    showCombatView() {
        this.eventChoices.innerHTML = '';
        this.expeditionView.classList.add('hidden');
        this.combatView.classList.remove('hidden');
        
        const topBarLeft = document.getElementById('top-bar-left');
        if (topBarLeft) topBarLeft.style.display = 'none';

        this.topBar.classList.add('hidden');

        const btnToggle = document.getElementById('btn-toggle-topbar');
        if (btnToggle) {
            btnToggle.classList.remove('hidden');
            btnToggle.innerText = '⬇️';
            btnToggle.onclick = () => {
                if (this.topBar.classList.contains('hidden')) {
                    this.topBar.classList.remove('hidden');
                    btnToggle.innerText = '⬆️';
                } else {
                    this.topBar.classList.add('hidden');
                    btnToggle.innerText = '⬇️';
                }
            };
        }

        const logAnchor = document.getElementById('combat-log-anchor');
        const bottomBar = document.getElementById('bottom-bar');
        if (logAnchor && bottomBar) {
            logAnchor.appendChild(bottomBar);
            bottomBar.classList.add('in-combat');
        }

        this.showCombatMenu('main');
    }

    hideCombatView() {
        this.combatView.classList.add('hidden');
        this.expeditionView.classList.remove('hidden');

        const topBarLeft = document.getElementById('top-bar-left');
        if (topBarLeft) topBarLeft.style.display = '';
        
        this.topBar.classList.remove('hidden');
        
        const btnToggle = document.getElementById('btn-toggle-topbar');
        if (btnToggle) btnToggle.classList.add('hidden');
        
        // Restore bottom-bar
        const gameContainer = document.getElementById('game-container');
        const bottomBar = document.getElementById('bottom-bar');
        if (gameContainer && bottomBar) {
            gameContainer.appendChild(bottomBar);
            bottomBar.classList.remove('in-combat');
        }
    }

    renderCombatState(enemies, prepStacks, queuedActions, turnState, selectedActionType, ap = 3, maxAp = 3) {
        this.updatePrepStacks(prepStacks);

        const container = document.getElementById('enemies-container');
        if (!container) return;

        // AP update
        const apText = document.getElementById('ap-text');
        if (apText) apText.innerText = `${ap}/${maxAp}`;
        
        const apPips = document.getElementById('ap-pip-container');
        if (apPips) {
            apPips.innerHTML = '';
            for(let i=0; i<maxAp; i++) {
                apPips.innerHTML += `<div style="width: 12px; height: 12px; border-radius: 50%; background: ${i < ap ? 'var(--accent-orange)' : '#444'}; border: 1px solid #222;"></div>`;
            }
        }

        const isCrowded = enemies.length > 2;
        const titleSize = isCrowded ? '1.1rem' : '1.3rem';
        const iconSize = isCrowded ? '2rem' : '2.5rem';
        const intentTitleSize = isCrowded ? '0.75rem' : '0.9rem';
        const intentTextSize = isCrowded ? '0.7rem' : '0.8rem';
        const cardPadding = isCrowded ? '10px' : '20px';

        container.innerHTML = '';

        enemies.forEach(enemy => {
            if (enemy.isDead) return;

            const card = document.createElement('div');
            card.id = `enemy-card-${enemy.id}`;
            card.className = 'content-box glass-panel enemy-card';
            card.style.flex = '1 1 calc(50% - 15px)';
            card.style.minWidth = '140px';
            if (enemies.length === 1) {
                card.style.maxWidth = '300px';
            } else {
                card.style.maxWidth = 'calc(50% - 7.5px)';
            }
            card.style.position = 'relative';
            card.style.padding = cardPadding;
            card.style.display = 'flex';
            card.style.flexDirection = 'column';
            card.style.justifyContent = 'flex-start';
            card.style.minHeight = isCrowded ? '200px' : '260px'; // Make cards shorter if crowded
            card.style.cursor = turnState === 'SELECTING_TARGET' ? 'pointer' : 'default';
            if (turnState === 'SELECTING_TARGET') {
                card.style.borderColor = 'var(--accent-orange)';
                card.style.boxShadow = '0 0 10px rgba(255, 111, 0, 0.3)';
            } else {
                card.style.borderColor = '';
                card.style.boxShadow = '';
            }

            card.onclick = () => {
                if (this.game && this.game.combatSystem) {
                    this.game.combatSystem.selectTarget(enemy.id);
                }
            };

            const enemyActions = queuedActions.filter(a => a.targetId === enemy.id);
            let actionHtml = '';
            if (enemyActions.length > 0) {
                let iconsHtml = enemyActions.map((a, idx) => {
                    let icon = '';
                    if (a.type === 'attack') icon = '⚔️';
                    else if (a.type === 'prepare') icon = '⚡';
                    else if (a.type === 'skill') icon = '💥';
                    else if (a.type === 'block') icon = '🛡️';
                    else if (a.type === 'dodge') icon = '💨';
                    return `<div style="position: absolute; top: -10px; right: ${-10 + idx * 25}px; background: var(--accent-orange); border-radius: 50%; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; font-size: 1.2rem; z-index: ${10 - idx}; border: 2px solid #222;">${icon}</div>`;
                }).join('');
                actionHtml = iconsHtml;
            }

            const nextAction = enemy.nextAction;
            let intentTitle = '即將到來的動作';
            let intentText = '無';
            if (nextAction) {
                if (nextAction.type === 'attack') {
                    intentText = `凶狠的眼神`;
                } else if (nextAction.type === 'charge') {
                    intentText = `<span style="color:var(--accent-red);font-weight:bold;">蓄力中</span>`;
                } else if (nextAction.type === 'prepare') {
                    intentText = '前腳刨地';
                } else if (nextAction.type === 'mud') {
                    intentText = '在泥濘中打滾';
                } else if (nextAction.type === 'stunned') {
                    intentText = '暈眩中';
                } else if (nextAction.type === 'heal_spore') {
                    intentText = '<span style="color:var(--accent-green);">散發治癒氣息</span>';
                } else if (nextAction.type === 'frenzy_spore') {
                    intentText = '<span style="color:var(--accent-red);">散發危險氣息</span>';
                } else if (nextAction.type === 'burrow') {
                    intentText = '<span style="color:var(--accent-orange);">準備鑽地</span>';
                }
            }

            let armorHtml = enemy.armor > 0 ? `<span style="color: var(--accent-orange); font-size: 0.75rem; font-weight: bold; margin-left: 5px;">[護甲: ${enemy.armor}]</span>` : '';
            let frenzyHtml = enemy.atkBuff > 0 ? `<span id="frenzy-badge-${enemy.id}" style="color: var(--accent-red); font-size: 0.75rem; font-weight: bold; cursor: pointer; text-decoration: underline;">[狂暴: ${enemy.atkBuff/2}層]</span>` : '';
            let dodgeHtml = enemy.dodgeNext ? `<span id="dodge-badge-${enemy.id}" style="color: var(--accent-orange); font-size: 0.75rem; font-weight: bold; cursor: pointer; text-decoration: underline;">[縮地]</span>` : '';
            
            let displayIcon = '🐗';
            if (enemy.type === 'green_mushroom' || enemy.type === 'red_mushroom') {
                displayIcon = '🍄';
            }

            let adjustedTitleSize = enemies.length > 2 ? '0.85rem' : '0.95rem';

            card.innerHTML = `
                ${actionHtml}
                <h2 class="combat-title" style="font-size: ${adjustedTitleSize}; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-bottom: 2px;">${enemy.name}</h2>
                <div style="display: flex; gap: 4px; justify-content: center; min-height: 16px; margin-bottom: 5px; flex-wrap: wrap;">
                    ${frenzyHtml}
                    ${dodgeHtml}
                </div>
                <div class="event-icon" style="font-size: ${iconSize}; margin-bottom: 5px;">${displayIcon}</div>
                <div class="stat-item" style="margin-bottom: 8px;">
                    <span class="stat-label" style="font-size:0.7rem;">敵人 HP</span>
                    <div class="bar-container" style="width: 100%; height: 6px;">
                        <div class="bar hp-fill" style="width: ${(enemy.hp / enemy.maxHp) * 100}%; background-color: var(--accent-red);"></div>
                    </div>
                    <span class="stat-value" style="font-size:0.75rem;">${enemy.hp}/${enemy.maxHp}${armorHtml}</span>
                </div>
                <div class="glass-panel" style="padding: 4px; border-color: var(--accent-orange); margin-top: auto;">
                    <h3 style="color: var(--accent-orange); margin-bottom: 2px; text-align: center; font-size: ${intentTitleSize}; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${intentTitle}</h3>
                    <p style="text-align: center; font-size: ${intentTextSize}; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${intentText}</p>
                </div>
            `;

            container.appendChild(card);
            
            // Attach click events for badges
            const frenzyBadge = document.getElementById(`frenzy-badge-${enemy.id}`);
            if (frenzyBadge) {
                frenzyBadge.onclick = (e) => {
                    e.stopPropagation(); // 避免觸發選擇目標
                    const modal = document.getElementById('item-detail-modal');
                    const nameEl = document.getElementById('item-detail-name');
                    const descEl = document.getElementById('item-detail-desc');
                    const btnConfirm = document.getElementById('btn-item-confirm');
                    const btnCancel = document.getElementById('btn-item-cancel');
                    
                    nameEl.innerText = '狀態：狂暴';
                    nameEl.style.color = 'var(--accent-red)';
                    const stacks = enemy.atkBuff / 2;
                    descEl.innerHTML = `目前擁有 <span style="color:var(--accent-red);font-weight:bold;">${stacks} 層</span> 狂暴效果。<br><br>每層增加 2 點攻擊力，總計增加 <span style="color:var(--accent-red);font-weight:bold;">${enemy.atkBuff} 點</span> 基礎攻擊力。<br>此狀態會永久持續且可無限疊加。`;
                    
                    btnConfirm.style.display = 'none';
                    btnCancel.innerText = '關閉';
                    btnCancel.onclick = () => {
                        modal.classList.add('hidden');
                        nameEl.style.color = 'var(--accent-orange)';
                    };
                    modal.classList.remove('hidden');
                };
            }
            
            const dodgeBadge = document.getElementById(`dodge-badge-${enemy.id}`);
            if (dodgeBadge) {
                dodgeBadge.onclick = (e) => {
                    e.stopPropagation();
                    const modal = document.getElementById('item-detail-modal');
                    const nameEl = document.getElementById('item-detail-name');
                    const descEl = document.getElementById('item-detail-desc');
                    const btnConfirm = document.getElementById('btn-item-confirm');
                    const btnCancel = document.getElementById('btn-item-cancel');
                    
                    nameEl.innerText = '狀態：縮地';
                    nameEl.style.color = 'var(--accent-orange)';
                    descEl.innerHTML = '此單位已經縮入地底或處於特殊閃避姿態。<br><br><span style="color:var(--accent-orange);font-weight:bold;">下一次受到的任何傷害都會被完美迴避</span>。<br>迴避成功後狀態即解除。';
                    
                    btnConfirm.style.display = 'none';
                    btnCancel.innerText = '關閉';
                    btnCancel.onclick = () => {
                        modal.classList.add('hidden');
                        nameEl.style.color = 'var(--accent-orange)';
                    };
                    modal.classList.remove('hidden');
                };
            }
        });

        const mainBtns = document.querySelectorAll('#combat-main-actions .btn');
        const defBtns = document.querySelectorAll('#combat-defend-actions .btn');
        const skillBtns = document.querySelectorAll('#combat-skill-actions .btn');
        const btnUndo = document.getElementById('btn-undo-action');
        const btnEndTurn = document.getElementById('btn-end-turn');
        
        // Update skill button text dynamically based on equipped weapon
        const btnSkill = document.getElementById('btn-skill');
        let skillCost = 0;
        if (btnSkill && this.game && this.game.combatSystem) {
            const skill = this.game.combatSystem.getWeaponSkill();
            skillCost = skill.cost;
            btnSkill.innerText = `${skill.name} (消耗 1 AP + ${skill.cost} 層)`;
        }

        const disableBtns = (btns, disabled) => btns.forEach(b => {
            if (b.id !== 'btn-open-bag') {
                b.disabled = disabled;
                b.style.opacity = disabled ? '0.5' : '1';
                b.style.cursor = disabled ? 'not-allowed' : 'pointer';
            }
        });

        if (turnState === 'EXECUTING') {
            disableBtns(mainBtns, true);
            disableBtns(defBtns, true);
            disableBtns(skillBtns, true);
            if(btnUndo) { btnUndo.disabled = true; btnUndo.style.opacity = '0.5'; }
            if(btnEndTurn) { btnEndTurn.disabled = true; btnEndTurn.style.opacity = '0.5'; }
        } else if (turnState === 'SELECTING_TARGET') {
            disableBtns(mainBtns, true);
            disableBtns(defBtns, true);
            disableBtns(skillBtns, true);
            if(btnUndo) { btnUndo.disabled = true; btnUndo.style.opacity = '0.5'; }
            if(btnEndTurn) { btnEndTurn.disabled = true; btnEndTurn.style.opacity = '0.5'; }
        } else {
            disableBtns(mainBtns, false);
            disableBtns(defBtns, false);
            disableBtns(skillBtns, false);

            const btnAttack = document.getElementById('btn-attack');
            if(btnAttack) { btnAttack.disabled = ap < 1; btnAttack.style.opacity = ap < 1 ? '0.5' : '1'; }
            
            const btnBlock = document.getElementById('btn-block');
            if(btnBlock) { btnBlock.disabled = ap < 1; btnBlock.style.opacity = ap < 1 ? '0.5' : '1'; }
            
            const btnPrepare = document.getElementById('btn-prepare');
            if(btnPrepare) { btnPrepare.disabled = ap < 1; btnPrepare.style.opacity = ap < 1 ? '0.5' : '1'; }
            
            const btnDodge = document.getElementById('btn-dodge');
            if(btnDodge) { btnDodge.disabled = ap < 2; btnDodge.style.opacity = ap < 2 ? '0.5' : '1'; }
            
            if(btnSkill) { 
                let canSkill = (ap >= 1 && prepStacks >= skillCost);
                btnSkill.disabled = !canSkill; 
                btnSkill.style.opacity = !canSkill ? '0.5' : '1'; 
            }

            if(btnUndo) {
                btnUndo.disabled = queuedActions.length === 0;
                btnUndo.style.opacity = queuedActions.length === 0 ? '0.5' : '1';
            }
            if(btnEndTurn) {
                btnEndTurn.disabled = false;
                btnEndTurn.style.opacity = '1';
            }
        }
    }

    updatePrepStacks(stacks) {
        if(this.prepStacksText) {
            let color = stacks > 3 ? 'var(--accent-orange)' : 'inherit';
            this.prepStacksText.innerHTML = `<span style="color: ${color};">${stacks}</span>/3`;
        }
    }

    showCombatMenu(menuType) {
        this.combatMain.classList.add('hidden');
        this.combatDefend.classList.add('hidden');
        this.combatSkill.classList.add('hidden');

        if (menuType === 'main') this.combatMain.classList.remove('hidden');
        if (menuType === 'defend') this.combatDefend.classList.remove('hidden');
        if (menuType === 'skill') this.combatSkill.classList.remove('hidden');

        const btnPrepareMenu = document.getElementById('btn-prepare-menu');
        const btnPrepare = document.getElementById('btn-prepare');
        if (this.game && this.game.state.rad >= 90) {
            if (btnPrepareMenu) {
                btnPrepareMenu.style.opacity = '0.5';
                btnPrepareMenu.style.textDecoration = 'line-through';
            }
            if (btnPrepare) {
                btnPrepare.style.opacity = '0.5';
                btnPrepare.style.textDecoration = 'line-through';
            }
        } else {
            if (btnPrepareMenu) {
                btnPrepareMenu.style.opacity = '1';
                btnPrepareMenu.style.textDecoration = 'none';
            }
            if (btnPrepare) {
                btnPrepare.style.opacity = '1';
                btnPrepare.style.textDecoration = 'none';
            }
        }
    }

    showInventory() {
        this.inventoryModal.classList.remove('hidden');
    }

    hideInventory() {
        this.inventoryModal.classList.add('hidden');
    }

    showBookshelf() {
        if(this.bookshelfModal) this.bookshelfModal.classList.remove('hidden');
    }

    hideBookshelf() {
        if(this.bookshelfModal) this.bookshelfModal.classList.add('hidden');
    }

    showCampNotes() {
        if(this.campNotesModal) this.campNotesModal.classList.remove('hidden');
    }

    hideCampNotes() {
        if(this.campNotesModal) this.campNotesModal.classList.add('hidden');
    }

    renderCampNotes(buildSystem) {
        if (!buildSystem || !this.campNotesList) return;

        const memorySlotsText = document.getElementById('camp-memory-slots-text');
        if (memorySlotsText) {
            memorySlotsText.innerText = `${buildSystem.equippedNotes.length}/${buildSystem.maxSlots}`;
        }

        this.campNotesList.innerHTML = '';
        
        // Allowed notes: startingEquippedNotes + runDiscoveredNotes + currently equipped notes
        const allowedIds = new Set([
            ...buildSystem.startingEquippedNotes, 
            ...buildSystem.runDiscoveredNotes,
            ...buildSystem.equippedNotes
        ]);
        
        if (allowedIds.size === 0) {
            this.campNotesList.innerHTML = '<p style="color:#aaa;">你目前沒有攜帶任何筆記...</p>';
            return;
        }

        allowedIds.forEach(id => {
            const note = buildSystem.noteDictionary[id];
            if (!note) return;

            const isEquipped = buildSystem.hasActiveNote(id);

            const card = document.createElement('div');
            card.className = 'note-card';
            if (isEquipped) {
                card.classList.add('equipped');
            }

            let descHtml = note.desc.replace(/\n/g, '<br>');
            
            let actionBtnHtml = '';
            if (isEquipped) {
                actionBtnHtml = `<button class="btn secondary action-btn" onclick="document.dispatchEvent(new CustomEvent('camp-note-unequip', {detail:'${id}'}))">卸下</button>`;
            } else {
                actionBtnHtml = `<button class="btn primary action-btn" onclick="document.dispatchEvent(new CustomEvent('camp-note-equip', {detail:'${id}'}))">裝備</button>`;
            }

            const count = buildSystem.craftedNotes.get(id) || 1;
            const countStr = count > 1 ? ` <span style="font-size:0.8rem; color:#aaa;">x${count}</span>` : '';

            card.innerHTML = `
                <div style="font-weight: bold; font-size: 1.1rem; color: var(--accent-green); margin-bottom: 5px;">${note.name}${countStr}</div>
                <div style="font-size: 0.9rem; color: #ccc; margin-bottom: 10px;">${descHtml}</div>
                <div style="display: flex; justify-content: flex-end; align-items: center; gap: 10px; margin-top: auto;">
                    ${actionBtnHtml}
                </div>
            `;
            this.campNotesList.appendChild(card);
        });
    }

    renderBookshelf(buildSystem) {
        if (!buildSystem || !this.bookshelfList) return;

        const memorySlotsText = document.getElementById('memory-slots-text');
        if (memorySlotsText) {
            memorySlotsText.innerText = `${buildSystem.equippedNotes.length}/${buildSystem.maxSlots}`;
        }

        this.bookshelfList.innerHTML = '';
        const dict = buildSystem.noteDictionary;

        for (const [id, note] of Object.entries(dict)) {
            const itemDiv = document.createElement('div');
            
            if (!buildSystem.discoveredNotes.has(id)) {
                // Not discovered
                itemDiv.className = 'note-item';
                itemDiv.style.opacity = '0.5';
                itemDiv.innerHTML = `
                    <div class="note-title" style="color: #666;">【 ??? 】</div>
                    <div class="note-desc">尚未在荒野中發現此筆記的線索。</div>
                `;
            } else if (!buildSystem.craftedNotes.has(id)) {
                // Discovered but not crafted
                itemDiv.className = 'note-item';
                let costTexts = [];
                if (note.cost.scrap) costTexts.push(`${note.cost.scrap} 舊世幣`);
                
                for (let [matId, amt] of Object.entries(note.cost)) {
                    if (matId === 'scrap') continue;
                    let itemName = matId;
                    if (matId === 'boar_pelt') itemName = '毛皮';
                    if (matId === 'strange_spore') itemName = '奇異孢子';
                    costTexts.push(`${amt}x ${itemName}`);
                }
                const canCraft = buildSystem.canCraft(id);
                
                itemDiv.innerHTML = `
                    <div class="note-title">${note.name}</div>
                    <div class="note-desc">${note.desc}</div>
                    <div class="note-cost">裝訂需求：${costTexts.join(', ')}</div>
                    <div class="note-actions">
                        <button class="btn primary btn-craft" style="padding: 5px 15px; font-size: 0.9rem;">裝訂</button>
                    </div>
                `;
                const btnCraft = itemDiv.querySelector('.btn-craft');
                if (canCraft) {
                    btnCraft.onclick = () => {
                        if (buildSystem.craftNote(id)) {
                            this.renderBookshelf(buildSystem);
                        }
                    };
                } else {
                    btnCraft.disabled = true;
                    btnCraft.style.opacity = '0.5';
                    btnCraft.style.cursor = 'not-allowed';
                }
            } else {
                // Crafted
                const count = buildSystem.craftedNotes.get(id) || 1;
                const countStr = count > 1 ? ` <span style="font-size:0.8rem; color:#aaa;">x${count}</span>` : '';
                const isEquipped = buildSystem.equippedNotes.includes(id);
                itemDiv.className = `note-item crafted ${isEquipped ? 'equipped' : ''}`;
                itemDiv.innerHTML = `
                    <div class="note-title">${note.name}${countStr}</div>
                    <div class="note-desc">${note.desc}</div>
                    <div class="note-actions">
                        <button class="btn secondary btn-equip" style="padding: 5px 15px; font-size: 0.9rem;">
                            ${isEquipped ? '卸下' : '裝備'}
                        </button>
                    </div>
                `;
                itemDiv.querySelector('.btn-equip').onclick = () => {
                    if (isEquipped) {
                        buildSystem.unequipNote(id);
                    } else {
                        buildSystem.equipNote(id);
                    }
                    this.renderBookshelf(buildSystem);
                };
            }
            this.bookshelfList.appendChild(itemDiv);
        }
    }

    showResultModal(title, desc, confirmCb) {
        const modal = document.getElementById('result-modal');
        const titleEl = document.getElementById('result-modal-title');
        const descEl = document.getElementById('result-modal-desc');
        const btnConfirm = document.getElementById('btn-result-confirm');

        if (!modal) return;

        titleEl.innerText = title;
        descEl.innerHTML = desc; // Use innerHTML to allow colored text like <span style="...">

        btnConfirm.onclick = () => {
            modal.classList.add('hidden');
            if (confirmCb) confirmCb();
        };

        modal.classList.remove('hidden');
    }

    renderInventory(equipment, items, useItemCb, equipItemCb, unequipItemCb) {
        try {
            const itemDetailModal = document.getElementById('item-detail-modal');
            const itemDetailName = document.getElementById('item-detail-name');
            const itemDetailDesc = document.getElementById('item-detail-desc');
            const btnItemConfirm = document.getElementById('btn-item-confirm');
            const btnItemCancel = document.getElementById('btn-item-cancel');

            if (btnItemCancel) {
                btnItemCancel.onclick = () => {
                    itemDetailModal.classList.add('hidden');
                };
            }

        const showItemDetail = (item, actionName, confirmCb) => {
            itemDetailName.innerText = item.name;
            let desc = "";
            if (item.type === 'note') {
                desc = item.desc.replace(/\n/g, '<br>');
                btnItemConfirm.style.display = 'none';
            } else if (item.type === 'consumable' || item.type === 'material') {
                let useText = "";
                if (this.game && this.game.state.inCombat && this.game.inventorySystem) {
                    const sys = this.game.inventorySystem;
                    const left = Math.max(0, sys.maxItemsPerTurn - sys.itemsUsedThisTurn);
                    useText = `\n\n<span style="color:var(--accent-red);">本回合剩餘道具使用次數: ${left}</span>`;
                } else if (this.game && !this.game.state.inCombat && this.game.inventorySystem) {
                    const state = this.game.state;
                    const isCamp = state.depth > 0 && state.depth % 10 === 0 && state.depth !== 50;
                    const isHub = state.depth === 0;
                    
                    if (!isCamp && !isHub) {
                        useText = `\n\n<span style="color:var(--accent-red);">（探索中無法使用消耗品，請至營地使用）</span>`;
                        btnItemConfirm.style.display = 'none';
                    } else if (this.game.inventorySystem.campConsumablesUsed.includes(item.id)) {
                        useText = `\n\n<span style="color:var(--accent-red);">（本次營地休息已使用過此類消耗品）</span>`;
                        btnItemConfirm.style.display = 'none';
                    }
                }
                
                let effectTxts = [];
                if (item.heal) effectTxts.push(`回復 ${item.heal} 點生命`);
                if (item.armorBonus) effectTxts.push(`獲得 ${item.armorBonus} 點護甲`);
                if (item.debuff === 'weakness') effectTxts.push(`<span style="color:var(--accent-red);">獲得 1 回合【虛弱】(攻擊力-1)</span>`);
                
                if (effectTxts.length === 0) {
                    desc = `這是一項素材，未來可用於強化或售賣。`;
                    btnItemConfirm.style.display = 'none';
                } else {
                    desc = `效果：${effectTxts.join('，')}${useText}\n\n確定要${actionName}嗎？`;
                    if (useText === "") {
                        btnItemConfirm.style.display = 'inline-block';
                    }
                }
            } else {
                btnItemConfirm.style.display = 'inline-block';
                let statsTxt = [];
                if (item.attackBonus) statsTxt.push(`攻擊力 +${item.attackBonus}`);
                if (item.defenseBonus) statsTxt.push(`防禦力 +${item.defenseBonus}`);
                desc = `效果：${statsTxt.length > 0 ? statsTxt.join(', ') : '無特殊效果'}\n\n確定要${actionName}嗎？`;
            }
            itemDetailDesc.innerHTML = desc; // Changed to innerHTML to support span
            btnItemConfirm.innerText = actionName;
            btnItemConfirm.onclick = () => {
                itemDetailModal.classList.add('hidden');
                confirmCb();
            };
            itemDetailModal.classList.remove('hidden');
        };

        // Render slots
        const slots = ['upperBody', 'lowerBody', 'weapon', 'necklace', 'ring', 'accessory'];
        slots.forEach(slot => {
            const slotEl = document.getElementById(`slot-${slot}`);
            if (!slotEl) return;
            const contentEl = slotEl.querySelector('.slot-content');
            const item = equipment[slot];
            
            if (item) {
                contentEl.innerText = item.name;
                slotEl.onclick = () => {
                    if (this.game && this.game.state.inCombat) {
                        Logger.log("戰鬥中無法卸下裝備！", "negative");
                    } else {
                        showItemDetail(item, '卸下', () => unequipItemCb(slot));
                    }
                };
                slotEl.style.borderColor = 'var(--accent-green)';
            } else {
                contentEl.innerText = '';
                slotEl.onclick = null;
                slotEl.style.borderColor = '';
            }
        });

        // Render inventory list
        this.inventoryList.innerHTML = '';
        let hasItems = false;
        
        if (items.length > 0) {
            hasItems = true;
            items.forEach(item => {
                const btn = document.createElement('button');
                btn.className = 'btn secondary';
                
                if (item.type === 'consumable' || item.type === 'material') {
                    btn.innerHTML = `${item.name} <span style="color:#aaa;">x${item.count}</span>`;
                    if (item.count <= 0) {
                        btn.disabled = true;
                        btn.style.opacity = '0.5';
                    } else {
                        const actionName = (item.heal || item.armorBonus || item.debuff) ? '使用' : '查看';
                        btn.onclick = () => showItemDetail(item, actionName, () => useItemCb(item.id));
                    }
                } else {
                    // Equipment piece
                    let statsTxt = [];
                    if (item.attackBonus) statsTxt.push(`ATK+${item.attackBonus}`);
                    if (item.defenseBonus) statsTxt.push(`DEF+${item.defenseBonus}`);
                    let statsStr = statsTxt.length > 0 ? ` <span style="font-size:0.8rem; color:#888;">(${statsTxt.join(', ')})</span>` : '';
                    
                    btn.innerHTML = `${item.name}${statsStr}`;
                    btn.onclick = () => {
                        if (this.game && this.game.state.inCombat) {
                            Logger.log("戰鬥中無法切換裝備！", "negative");
                        } else {
                            showItemDetail(item, '裝備', () => equipItemCb(item.id));
                        }
                    };
                }
                
                this.inventoryList.appendChild(btn);
            });
        }

        // Render discovered notes in inventory
        if (this.game && this.game.buildSystem) {
            this.game.buildSystem.craftedNotes.forEach((count, noteId) => {
                const note = this.game.buildSystem.noteDictionary[noteId];
                if (note && count > 0) {
                    hasItems = true;
                    const btn = document.createElement('button');
                    btn.className = 'btn secondary';
                    btn.style.borderColor = 'var(--accent-orange)';
                    
                    const countStr = count > 1 ? ` <span style="color:#aaa;">x${count}</span>` : '';
                    btn.innerHTML = `📄 ${note.name}${countStr}`;
                    
                    const itemLikeObj = {
                        name: note.name,
                        type: 'note',
                        desc: note.desc
                    };
                    btn.onclick = () => showItemDetail(itemLikeObj, '關閉', () => {});
                    this.inventoryList.appendChild(btn);
                }
            });
        }
        
        if (!hasItems) {
            this.inventoryList.innerHTML = '<p style="color:#aaa;">背包空空如也...</p>';
        }

        // Update Stats Display
        let totalAtkBonus = 0;
        let totalDefBonus = 0;
        slots.forEach(slot => {
            const item = equipment[slot];
            if (item) {
                if (item.attackBonus) totalAtkBonus += item.attackBonus;
                if (item.defenseBonus) totalDefBonus += item.defenseBonus;
            }
        });

        const statAtk = document.getElementById('stat-atk');
        const statDef = document.getElementById('stat-def');
        if (statAtk) {
            let baseMinAtk = 7 + totalAtkBonus;
            let baseMaxAtk = 11 + totalAtkBonus;
            
            if (this.game && this.game.state.buffs && this.game.state.buffs.weaknessTurns > 0) {
                baseMinAtk = Math.max(1, baseMinAtk - 1);
                baseMaxAtk = Math.max(1, baseMaxAtk - 1);
                statAtk.innerHTML = `<span style="color:var(--accent-red);">${baseMinAtk}~${baseMaxAtk}(虛弱)</span>`;
            } else {
                statAtk.innerText = `${baseMinAtk}~${baseMaxAtk}`;
            }
        }
        if (statDef) {
            statDef.innerText = `${totalDefBonus}`;
        }
        } catch (e) {
            console.error("renderInventory Error:", e);
            Logger.log(`渲染背包時發生錯誤: ${e.message}`, "negative");
        }
    }

    showFloatingText(enemyId, text, color) {
        const card = document.getElementById(`enemy-card-${enemyId}`);
        if (!card) return;

        const rect = card.getBoundingClientRect();
        const floatEl = document.createElement('div');
        floatEl.className = 'floating-text';
        floatEl.style.color = color;
        floatEl.innerText = text;
        
        // Position globally so it survives DOM rebuilds
        // Scatter the text randomly within the card's dimensions
        const offsetX = (Math.random() - 0.5) * (rect.width * 0.8); // ±40% of card width
        const offsetY = Math.random() * (rect.height * 0.6); // 0% to 60% down the card
        
        floatEl.style.position = 'fixed';
        floatEl.style.left = (rect.left + rect.width / 2 + offsetX) + 'px';
        floatEl.style.top = (rect.top + 10 + offsetY) + 'px';
        floatEl.style.transform = 'translateX(-50%)';
        floatEl.style.zIndex = '9999';

        document.body.appendChild(floatEl);

        setTimeout(() => {
            if (floatEl.parentNode === document.body) {
                document.body.removeChild(floatEl);
            }
        }, 1500);
    }
}
