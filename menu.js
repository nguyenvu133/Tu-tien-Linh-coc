const homeMenu = document.getElementById('home-menu');
const gameActions = document.getElementById('game-actions');
const quitScreen = document.getElementById('quit-screen');
const defeatScreen = document.getElementById('defeat-screen');
const loadingScreen = document.getElementById('loading-screen');
const loadingTitle = document.getElementById('loading-title');
const loadingProgress = document.getElementById('loading-progress');
const stageSelect = document.getElementById('stage-select');
const stageGrid = document.getElementById('stage-grid');
const defeatLevel = document.getElementById('defeat-level');
const menuPanel = document.getElementById('menu-panel');
const panelTitle = document.getElementById('panel-title');
const panelKicker = document.getElementById('panel-kicker');
const panelCopy = document.getElementById('panel-copy');
const topStats = document.querySelector('.player-stats');
const scene = () => window.spiritGame.scene.getScene('SpiritValleyScene');
const SHOP_KEY = 'linh-coc-shop-v1';
const DAILY_KEY = 'linh-coc-daily-v1';
const shopState = JSON.parse(localStorage.getItem(SHOP_KEY) || '{"coins":250,"items":[]}');
const skillLevels = JSON.parse(localStorage.getItem('linh-coc-skills-v1') || '[1,1,1,1,1,1]');

function pauseSceneIfActive() {
    const currentScene = scene();
    if (currentScene && currentScene.scene.isActive()) currentScene.scene.pause();
}

const panels = {
    character: ['NHÂN VẬT', 'Character', ''],
    shop: ['TỊNH BẢO CÁC', 'Shop', ''],
    skill: ['CÔNG PHÁP', 'Skill', ''],
    pet: ['LINH THÚ', 'Pet', ''],
    daily: ['PHÚC LỘC HÔM NAY', 'Daily Gift', '']
};

function saveShop() { localStorage.setItem(SHOP_KEY, JSON.stringify(shopState)); }

function renderShop() {
    panelCopy.innerHTML = '<div class="shop-balance">Kim tệ: <strong>' + shopState.coins + '</strong></div><div class="shop-list">'
        + [['Linh đan hồi phục', 'Hồi 30 HP', 60], ['Tụ khí đan', 'Cộng 25 linh lực', 80], ['Bùa hộ thân', '+5 Phòng trong stage', 120]].map((item, index) => '<div class="shop-item"><span><strong>' + item[0] + '</strong><small>' + item[1] + '</small></span><button class="panel-action shop-buy" data-item="' + index + '" data-cost="' + item[2] + '"' + (shopState.coins < item[2] ? ' disabled' : '') + '>Mua ' + item[2] + '</button></div>').join('') + '</div>';
    panelCopy.querySelectorAll('.shop-buy').forEach((button) => button.addEventListener('click', () => {
        const cost = Number(button.dataset.cost);
        if (shopState.coins < cost) return;
        shopState.coins -= cost;
        shopState.items.push(Number(button.dataset.item));
        saveShop();
        renderShop();
    }));
}

function renderSkills() {
    const currentScene = scene();
    panelCopy.innerHTML = '<div class="skill-list">' + SKILLS.map((skill, index) => '<div class="skill-row"><span class="skill-glyph" style="color:#' + skill.color.toString(16).padStart(6, '0') + '">' + skill.icon + '</span><span><strong>' + skill.name + '</strong><small>Lv.' + skillLevels[index] + ' · Damage ' + (skill.damage + (skillLevels[index] - 1) * 4) + ' · Tầm ' + skill.range + '</small></span><button class="panel-action skill-up" data-index="' + index + '"' + (skillLevels[index] >= 10 ? ' disabled' : '') + '>Nâng</button></div>').join('') + '</div>';
    panelCopy.querySelectorAll('.skill-up').forEach((button) => button.addEventListener('click', () => {
        const index = Number(button.dataset.index);
        skillLevels[index] = Math.min(10, skillLevels[index] + 1);
        localStorage.setItem('linh-coc-skills-v1', JSON.stringify(skillLevels));
        if (currentScene) SKILLS[index].damage += 4;
        renderSkills();
    }));
}

function renderPets() {
    const currentScene = scene();
    panelCopy.innerHTML = '<div class="pet-list">' + PetSystem.catalog.map((pet) => '<button class="pet-choice' + (currentScene && currentScene.petId === pet.id ? ' selected' : '') + '" data-pet="' + pet.id + '"><strong>' + pet.name + '</strong><small>Công +' + pet.attack + ' · Phòng +' + pet.defense + ' · Hồi +' + pet.regen + '/s</small></button>').join('') + '</div>';
    panelCopy.querySelectorAll('.pet-choice').forEach((button) => button.addEventListener('click', () => {
        if (!currentScene || currentScene.petId === button.dataset.pet) return;
        currentScene.petId = button.dataset.pet;
        currentScene.scene.restart();
        currentScene.scene.resume();
        renderPets();
    }));
}

function renderDailyGift() {
    const today = new Date().toISOString().slice(0, 10);
    const claimed = localStorage.getItem(DAILY_KEY) === today;
    panelCopy.innerHTML = '<div class="daily-gift"><strong>Quà đăng nhập hôm nay</strong><p>+100 linh lực · +250 kim tệ · +10 VIP point</p><button class="primary-button daily-claim"' + (claimed ? ' disabled' : '') + '>' + (claimed ? 'Đã nhận hôm nay' : 'Nhận quà') + '</button></div>';
    const claim = panelCopy.querySelector('.daily-claim');
    if (!claimed) claim.addEventListener('click', () => {
        localStorage.setItem(DAILY_KEY, today);
        const currentScene = scene();
        if (currentScene) { currentScene.qi = Math.min(100, currentScene.qi + 100); currentScene.vipPoints += 10; }
        shopState.coins += 250;
        saveShop();
        renderDailyGift();
    });
}

function updateTopStats() {
    const currentScene = scene();
    if (!currentScene || !topStats) return;
    topStats.innerHTML = '<span>Lv. ' + currentScene.level + '</span>'
        + '<span>HP ' + Math.floor(currentScene.health) + '/' + currentScene.maxHealth + '</span>'
        + '<span>Linh lực ' + Math.floor(currentScene.qi) + '/100</span>'
        + '<span>Công ' + currentScene.stats.attack + ' · Phòng ' + currentScene.stats.defense + '</span>'
        + '<span>VIP ' + currentScene.vip.level + ' · ' + currentScene.vip.name + '</span>'
        + '<span>Kim tệ ' + shopState.coins + '</span>';
}

function showHome() {
    pauseSceneIfActive();
    updateTopStats();
    homeMenu.hidden = false;
    gameActions.hidden = true;
    quitScreen.hidden = true;
    defeatScreen.hidden = true;
    menuPanel.hidden = true;
    stageSelect.hidden = true;
    GameAudio.play('home');
    GameAds.show('home');
}

function startNewGame() {
    showStageSelect(1);
}

function showStageSelect(unlockStage) {
    const currentScene = scene();
    if (currentScene && currentScene.scene.isActive()) currentScene.scene.pause();
    homeMenu.hidden = true;
    gameActions.hidden = true;
    quitScreen.hidden = true;
    defeatScreen.hidden = true;
    menuPanel.hidden = true;
    stageSelect.hidden = false;
    stageGrid.innerHTML = '';
    const highestUnlocked = Math.max(1, Math.min(100, unlockStage || (currentScene ? currentScene.level + 1 : 1)));
    for (let stage = 0; stage <= 100; stage++) {
        const button = document.createElement('button');
        button.type = 'button';
        const isBossStage = stage > 0 && stage % 5 === 0;
        button.className = 'stage-button' + (stage === (currentScene && currentScene.level) ? ' current' : '') + (isBossStage ? ' boss' : '');
        button.textContent = isBossStage ? 'BOSS ' + stage : 'STAGE ' + stage;
        button.disabled = stage > highestUnlocked;
        button.title = button.disabled ? 'Chưa mở khóa' : 'Vào stage ' + stage;
        if (!button.disabled) button.addEventListener('click', () => startStage(stage));
        stageGrid.appendChild(button);
    }
}

function startStage(stage) {
    const currentScene = scene();
    if (window.showLoading) window.showLoading('Đang tải stage ' + stage + '...');
    homeMenu.hidden = true;
    stageSelect.hidden = true;
    quitScreen.hidden = true;
    defeatScreen.hidden = true;
    gameActions.hidden = false;
    if (currentScene) {
        currentScene.pendingSave = null;
        currentScene.pendingStage = stage;
        currentScene.scene.restart();
        currentScene.scene.resume();
    }
    GameAudio.play('newgame');
    GameAds.show('battle');
    window.setTimeout(() => GameAudio.play('battle'), 1800);
    window.setTimeout(() => { if (window.hideLoading) window.hideLoading(); }, 550);
}

function loadGame() {
    const snapshot = window.GameSave.load();
    if (!snapshot) {
        window.showLoading('Chưa có dữ liệu save...');
        window.setTimeout(window.hideLoading, 700);
        return;
    }
    const currentScene = scene();
    if (window.showLoading) window.showLoading('Đang khôi phục hành trình...');
    homeMenu.hidden = true;
    gameActions.hidden = false;
    if (currentScene) currentScene.loadGame(snapshot);
    window.setTimeout(() => { if (window.hideLoading) window.hideLoading(); }, 650);
}

window.showLoading = (title) => {
    loadingTitle.textContent = title;
    loadingProgress.style.width = '15%';
    loadingScreen.hidden = false;
    window.requestAnimationFrame(() => { loadingProgress.style.width = '92%'; });
};

window.hideLoading = () => {
    loadingProgress.style.width = '100%';
    window.setTimeout(() => { loadingScreen.hidden = true; }, 180);
};

function quitGame() {
    pauseSceneIfActive();
    homeMenu.hidden = true;
    gameActions.hidden = true;
    quitScreen.hidden = false;
    defeatScreen.hidden = true;
    stageSelect.hidden = true;
}

window.showDefeat = (level) => {
    const currentScene = scene();
    if (currentScene && currentScene.scene.isActive()) currentScene.scene.pause();
    defeatLevel.textContent = level;
    homeMenu.hidden = true;
    gameActions.hidden = true;
    quitScreen.hidden = true;
    defeatScreen.hidden = false;
    stageSelect.hidden = true;
};

window.showStageSelect = showStageSelect;

document.getElementById('new-game').addEventListener('click', startNewGame);
document.getElementById('game-new').addEventListener('click', startNewGame);
document.getElementById('stage-back').addEventListener('click', showHome);
document.getElementById('game-save').addEventListener('click', () => {
    const currentScene = scene();
    if (currentScene) {
        currentScene.saveGame();
        window.showLoading('Đã lưu hành trình');
        window.setTimeout(window.hideLoading, 500);
    }
});
document.getElementById('game-load').addEventListener('click', loadGame);
document.getElementById('game-home').addEventListener('click', showHome);
document.getElementById('quit-game').addEventListener('click', quitGame);
document.getElementById('game-quit').addEventListener('click', quitGame);
document.getElementById('audio-toggle').addEventListener('click', (event) => {
    const enabled = GameAudio.toggle();
    event.currentTarget.textContent = enabled ? '♫' : '♪×';
});
document.getElementById('quit-home').addEventListener('click', showHome);
document.getElementById('defeat-retry').addEventListener('click', startNewGame);
document.getElementById('defeat-home').addEventListener('click', showHome);

document.querySelectorAll('[data-panel]').forEach((button) => {
    button.addEventListener('click', () => {
        const panel = panels[button.dataset.panel];
        panelKicker.textContent = panel[0];
        panelTitle.textContent = panel[1];
        const currentScene = scene();
        if (button.dataset.panel === 'shop') renderShop();
        else if (button.dataset.panel === 'skill') renderSkills();
        else if (button.dataset.panel === 'pet') renderPets();
        else if (button.dataset.panel === 'daily') renderDailyGift();
        else if (button.dataset.panel === 'character' && currentScene) {
            const realm = currentScene.realm;
            const pet = currentScene.petData;
            panelCopy.innerHTML = '<div class="character-info-grid">'
                + '<span>Cảnh giới<strong>' + realm.name + '</strong></span>'
                + '<span>Danh hiệu<strong>' + realm.title + '</strong></span>'
                + '<span>Cấp stage<strong>' + currentScene.level + ' / 100</strong></span>'
                + '<span>VIP<strong>' + currentScene.vip.level + ' · ' + currentScene.vip.name + '</strong></span>'
                + '<span>Sinh lực<strong>' + Math.floor(currentScene.health) + ' / ' + currentScene.maxHealth + '</strong></span>'
                + '<span>Linh lực<strong>' + Math.floor(currentScene.qi) + ' / 100</strong></span>'
                + '<span>Công<strong>' + Math.round(currentScene.stats.attack + currentScene.buffs.attack) + '</strong></span>'
                + '<span>Phòng<strong>' + Math.round(currentScene.stats.defense + currentScene.buffs.defense) + '</strong></span>'
                + '<span>Trí lực<strong>' + currentScene.stats.intelligence + '</strong></span>'
                + '<span>Bạo kích<strong>' + currentScene.stats.crit + '%</strong></span>'
                + '<span>Tốc độ<strong>' + currentScene.stats.haste + '%</strong></span>'
                + '<span>May mắn<strong>' + currentScene.stats.luck + '</strong></span>'
                + '<span>Pet<strong>' + pet.name + ' · Công +' + pet.attack + '</strong></span>'
                + '<span>Hồi linh lực<strong>+' + Math.round(currentScene.qiRegen + currentScene.stats.intelligence * .08) + '/s</strong></span>'
                + '</div>';
        } else {
            panelCopy.textContent = panel[2];
        }
        menuPanel.hidden = false;
    });
});

document.getElementById('close-panel').addEventListener('click', () => {
    menuPanel.hidden = true;
});

window.setInterval(updateTopStats, 500);
homeMenu.hidden = false;
gameActions.hidden = true;
quitScreen.hidden = true;
defeatScreen.hidden = true;
menuPanel.hidden = true;
loadingScreen.hidden = true;
stageSelect.hidden = true;
window.addEventListener('load', () => {
    updateTopStats();
    GameAudio.play('home');
    GameAds.show('home');
    window.setTimeout(pauseSceneIfActive, 250);
});
