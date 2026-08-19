const WIDTH = 360;
const HEIGHT = 640;
const WORLD_WIDTH = 1280;
const WORLD_HEIGHT = 1920;
const TOTAL_SPIRIT_HERBS = 10;
const MAX_LEVEL = 100;
const ENEMY_TYPES = [
    { name: 'Sơn Lang', color: 0xb85c6b, health: 1, speed: 1.08, damage: 1 },
    { name: 'Huyết Nha', color: 0xd46a5e, health: 1.18, speed: .92, damage: 1.25 },
    { name: 'Mộc Quỷ', color: 0x6fba82, health: 1.35, speed: .72, damage: .9 },
    { name: 'U Minh Điệp', color: 0x9d78c8, health: .82, speed: 1.28, damage: .8 },
    { name: 'Thạch Vệ', color: 0x8496a3, health: 1.7, speed: .55, damage: 1.5 },
    { name: 'Linh Xà', color: 0x53b7a1, health: 1.05, speed: 1.16, damage: 1.1 }
];
const BOSS_TYPES = [
    { name: 'Xích Viêm Hầu', color: 0xff694d, health: 2.8, speed: .72, damage: 1.8, animationIndex: 0 },
    { name: 'Hàn Nguyệt Hồ', color: 0x81d8ff, health: 3.4, speed: .9, damage: 1.65, animationIndex: 1 },
    { name: 'Thiên Lôi Long', color: 0xf2c879, health: 4.2, speed: .8, damage: 2.2, animationIndex: 2 }
];

function getBossForStage(stage) {
    if (stage <= 0 || stage % 5 !== 0) return null;
    const bossIndex = stage === MAX_LEVEL ? 2 : (stage / 5 - 1) % BOSS_TYPES.length;
    return BOSS_TYPES[bossIndex];
}
const SKILLS = [
    { name: 'Hỏa Cầu', icon: '火', damage: 18, range: 220, cooldown: 1.2, cost: 8, color: 0xff8a5b },
    { name: 'Băng Châm', icon: '❄', damage: 14, range: 280, cooldown: 1.5, cost: 10, color: 0x8de8ff },
    { name: 'Lôi Kích', icon: 'ϟ', damage: 26, range: 180, cooldown: 2.4, cost: 16, color: 0xf2c879 },
    { name: 'Mộc Đằng', icon: '木', damage: 12, range: 250, cooldown: 1.8, cost: 9, color: 0x7bc7a4 },
    { name: 'Phong Nhận', icon: '➤', damage: 20, range: 240, cooldown: 2, cost: 13, color: 0xd4a5ff },
    { name: 'Kiếm Khí', icon: '⚔', damage: 34, range: 150, cooldown: 3.2, cost: 22, color: 0xffffff }
];

class SpiritValleyScene extends Phaser.Scene {
    constructor() {
        super('SpiritValleyScene');
        this.level = 1;
        this.vipLevel = 0;
        this.vipPoints = 0;
        this.herbsCollected = 0;
        this.qi = 0;
        this.qiRegen = 4;
        this.stats = { attack: 24, defense: 8, intelligence: 16, crit: 8, haste: 0, luck: 5 };
        this.buffs = { attack: 0, defense: 0, haste: 0 };
        this.speed = 170;
        this.maxHealth = 100;
        this.health = this.maxHealth;
        this.nextSkillIndex = 0;
        this.skillTimers = SKILLS.map(() => 0);
        this.gameOver = false;
        this.levelTransition = false;
        this.pendingSave = null;
        this.pendingStage = null;
    }

    create() {
        const snapshot = this.pendingSave;
        this.level = this.pendingStage !== null ? this.pendingStage : snapshot ? Math.max(1, Math.min(MAX_LEVEL, snapshot.level || 1)) : 1;
        this.vipLevel = snapshot ? Math.max(0, Math.min(10, snapshot.vipLevel || 0)) : 0;
        this.vipPoints = snapshot ? snapshot.vipPoints || 0 : 0;
        this.petId = snapshot && snapshot.petId ? snapshot.petId : 'moon-fox';
        this.qiRegen = 4;
        this.speed = 170;
        this.stats = { attack: 24, defense: 8, intelligence: 16, crit: 8, haste: 0, luck: 5 };
        window.DynamicAssets.setup(this);
        this.realm = window.RealmSystem.get(this.level);
        this.maxHealth += this.realm.health;
        this.stats.attack += this.realm.attack;
        this.stats.defense += this.realm.defense;
        this.qi = this.realm.qi;
        window.VipSystem.apply(this);
        window.PetSystem.apply(this);
        this.cameras.main.setBackgroundColor('#111a27');
        this.createPlayer();
        window.DynamicWorld.setup(this);
        this.createHud();
        SKILLS.forEach((skill, index) => { skill.animation = this.assetAnimations.skills[index]; });
        this.createSpiritHerbs();
        this.createEnemies();
        this.createStatus();
        this.pendingStage = null;
        if (snapshot) {
            this.herbsCollected = snapshot.herbsCollected || 0;
            this.qi = Math.max(0, Math.min(100, snapshot.qi || 0));
            this.health = Math.max(1, Math.min(this.maxHealth, snapshot.health || this.maxHealth));
            this.player.x = Phaser.Math.Clamp(snapshot.player && snapshot.player.x || this.player.x, 42, WORLD_WIDTH - 42);
            this.player.y = Phaser.Math.Clamp(snapshot.player && snapshot.player.y || this.player.y, 125, WORLD_HEIGHT - 48);
            this.pendingSave = null;
            this.updateHud();
        }
    }

    drawValley() {
        const graphics = this.add.graphics();
        graphics.fillStyle(0x142b2d, 1);
        graphics.fillRect(0, 0, WIDTH, HEIGHT);
        graphics.fillStyle(0x1b3c38, 1);
        graphics.fillCircle(150, 420, 170);
        graphics.fillCircle(820, 120, 210);
        graphics.fillStyle(0x263f4a, 1);
        graphics.fillTriangle(0, 240, 210, 30, 420, 240);
        graphics.fillTriangle(550, 280, 790, 10, WIDTH, 280);
        graphics.lineStyle(1, 0xb58a4b, .2);
        for (let x = 0; x <= WIDTH; x += 40) graphics.lineBetween(x, 0, x, HEIGHT);
        for (let y = 0; y <= HEIGHT; y += 40) graphics.lineBetween(0, y, WIDTH, y);
        graphics.lineStyle(2, 0xd49b4a, .6);
        graphics.strokeRect(18, 18, WIDTH - 36, HEIGHT - 36);
    }

    createPlayer() {
        this.player = this.add.container(WIDTH / 2, HEIGHT / 2);
        const aura = this.add.circle(0, 0, 24, 0xf2c879, .16);
        const body = this.add.sprite(0, 0, 'character-sheet', 'frame0').setScale(.8);
        body.play(this.assetAnimations.character);
        this.buffAura = this.add.sprite(0, 0, 'buff-sheet', 'frame0').setScale(1.3).setAlpha(.35);
        this.buffAura.play(this.assetAnimations.buff);
        this.pet = this.add.sprite(28, 8, 'pet-sheet', 'frame0').setScale(.6);
        this.pet.setTint(this.petData.color);
        this.pet.play(this.assetAnimations.pet);
        this.player.add([aura, this.buffAura, body, this.pet]);
        this.player.setDepth(10);
        this.keys = this.input.keyboard.addKeys('W,A,S,D,UP,LEFT,DOWN,RIGHT');
    }

    createHud() {
        this.realmText = this.add.text(18, 22, this.realm.name + ' · Cấp ' + this.level + ' / 100', {
            fontFamily: 'Trebuchet MS, sans-serif', fontSize: '15px', color: '#f2c879'
        });
        this.qiText = this.add.text(18, 48, 'Linh lực  0 / 100', {
            fontFamily: 'Trebuchet MS, sans-serif', fontSize: '13px', color: '#e9fbff'
        });
        this.healthText = this.add.text(18, 70, 'Sinh lực  100 / 100', {
            fontFamily: 'Trebuchet MS, sans-serif', fontSize: '13px', color: '#ffaaa0'
        });
        this.progress = this.add.rectangle(18, 96, 150, 7, 0x274653).setOrigin(0, .5);
        this.progressFill = this.add.rectangle(18, 96, 0, 7, 0xf2c879).setOrigin(0, .5);
        this.statsText = this.add.text(18, 112, '', { fontFamily: 'Trebuchet MS, sans-serif', fontSize: '10px', color: '#a9c6bf', lineSpacing: 2 });
        this.buffText = this.add.text(18, 148, 'Buff: Hồi linh lực · +4/s', { fontFamily: 'Trebuchet MS, sans-serif', fontSize: '10px', color: '#7bc7a4' });
        this.scoreText = this.add.text(WIDTH - 18, 22, 'Linh thảo  0 / ' + TOTAL_SPIRIT_HERBS, {
            fontFamily: 'Trebuchet MS, sans-serif', fontSize: '13px', color: '#e9fbff'
        }).setOrigin(1, 0);
        this.skillText = this.add.text(WIDTH - 18, 46, 'Auto: Hỏa Cầu', {
            fontFamily: 'Trebuchet MS, sans-serif', fontSize: '11px', color: '#f2c879', align: 'right'
        }).setOrigin(1, 0);
        this.threatText = this.add.text(WIDTH - 18, 68, 'Linh thú: 5', {
            fontFamily: 'Trebuchet MS, sans-serif', fontSize: '11px', color: '#ffaaa0', align: 'right'
        }).setOrigin(1, 0);
        this.vipText = this.add.text(WIDTH - 18, 90, 'VIP ' + this.vip.level + ' · ' + this.vip.name, {
            fontFamily: 'Trebuchet MS, sans-serif', fontSize: '10px', color: '#f2c879', align: 'right'
        }).setOrigin(1, 0);
        this.skillIcons = SKILLS.map((skill, index) => {
            const x = 30 + index * 60;
            const background = this.add.rectangle(x, 585, 48, 42, 0x183138).setStrokeStyle(1, skill.color, .65);
            const icon = this.add.text(x, 575, skill.icon, {
                fontFamily: 'Segoe UI Symbol, sans-serif', fontSize: '20px', color: '#' + skill.color.toString(16).padStart(6, '0')
            }).setOrigin(.5);
            const state = this.add.text(x, 600, skill.name, {
                fontFamily: 'Trebuchet MS, sans-serif', fontSize: '8px', color: '#c6dfdc', align: 'center'
            }).setOrigin(.5);
            return { background, icon, state };
        });
        this.updateSkillIcons();
        [this.realmText, this.qiText, this.healthText, this.progress, this.progressFill, this.statsText, this.buffText, this.scoreText, this.skillText, this.threatText, this.vipText, ...this.skillIcons.flatMap((slot) => [slot.background, slot.icon, slot.state])].forEach((item) => { item.setScrollFactor(0); item.setDepth(1000); });
    }

    createSpiritHerbs() {
        if (this.herbs) this.herbs.forEach((herb) => herb.destroy());
        this.herbs = [];
        for (let index = 0; index < TOTAL_SPIRIT_HERBS; index++) {
            const herb = this.add.container(
                Phaser.Math.Between(45, WORLD_WIDTH - 45),
                Phaser.Math.Between(220, WORLD_HEIGHT - 115)
            );
            const glow = this.add.circle(0, 0, 18, 0xf2c879, .12);
            const crystal = this.add.polygon(0, 0, [0, -16, 10, 0, 0, 16, -10, 0], 0xf2c879);
            crystal.setStrokeStyle(2, 0xfff0b0);
            herb.add([glow, crystal]);
            herb.phase = Phaser.Math.FloatBetween(0, Math.PI * 2);
            this.herbs.push(herb);
            herb.setDepth(7);
        }
    }

    createEnemies() {
        if (this.enemies) this.enemies.forEach((enemy) => enemy.destroy());
        this.enemies = [];
        const boss = getBossForStage(this.level);
        const enemyCount = Math.min(8, 5 + Math.floor((this.level - 1) / 20));
        for (let index = 0; index < enemyCount; index++) {
            const enemy = this.add.container(
                index % 2 === 0 ? Phaser.Math.Between(38, 360) : Phaser.Math.Between(WORLD_WIDTH - 360, WORLD_WIDTH - 38),
                Phaser.Math.Between(220, WORLD_HEIGHT - 115)
            );
            const archetype = index === 0 && boss ? boss : ENEMY_TYPES[index % ENEMY_TYPES.length];
            const isBoss = index === 0 && Boolean(boss);
            const barWidth = isBoss ? 70 : 42;
            const radius = isBoss ? 27 : 17;
            const body = this.add.sprite(0, 0, isBoss ? 'boss-sheet' : 'enemy-sheet', 'frame0').setScale(isBoss ? .7 : .62);
            const bossAnimationIndex = boss ? boss.animationIndex : 0;
            body.play(isBoss ? this.assetAnimations.bosses[bossAnimationIndex] : this.assetAnimations.enemies[index % 6]);
            const healthBack = this.add.rectangle(0, -radius - 11, barWidth, 5, 0x311d29);
            const healthFill = this.add.rectangle(-barWidth / 2, -radius - 11, barWidth, 5, 0xf27772).setOrigin(0, .5);
            enemy.add([body, healthBack, healthFill]);
            const balance = window.StageBalance.get(this.level, isBoss, index);
            const baseHealth = 56 + index * 8 + (this.level - 1) * 4;
            enemy.health = Math.round(baseHealth * archetype.health * balance.health);
            enemy.maxHealth = enemy.health;
            enemy.speed = Math.min(112, balance.speed * archetype.speed);
            enemy.attackDamage = Math.min(34, Math.round((7 + index) * archetype.damage * balance.damage));
            enemy.attackCooldown = Phaser.Math.FloatBetween(.2, .8);
            enemy.healthFill = healthFill;
            enemy.healthBarWidth = barWidth;
            enemy.name = archetype.name;
            enemy.isBoss = isBoss;
            enemy.deathColor = archetype.color;
            enemy.setDepth(isBoss ? 13 : 12);
            this.enemies.push(enemy);
        }
        this.threatText.setText(boss ? 'BOSS: ' + boss.name : 'Linh thú: ' + enemyCount);
        this.threatText.setColor(boss ? '#f2c879' : '#ffaaa0');
    }

    createStatus() {
        this.message = this.add.text(WIDTH / 2, HEIGHT - 12, 'WASD / mũi tên · 6 skill auto · Né linh thú', {
            fontFamily: 'Trebuchet MS, sans-serif', fontSize: '10px', color: '#a6c4c3'
        }).setOrigin(.5);
        this.message.setScrollFactor(0);
        this.message.setDepth(1000);
    }

    update(time, delta) {
        const seconds = delta / 1000;
        let horizontal = 0;
        let vertical = 0;
        if (this.keys.A.isDown || this.keys.LEFT.isDown) horizontal -= 1;
        if (this.keys.D.isDown || this.keys.RIGHT.isDown) horizontal += 1;
        if (this.keys.W.isDown || this.keys.UP.isDown) vertical -= 1;
        if (this.keys.S.isDown || this.keys.DOWN.isDown) vertical += 1;
        const direction = new Phaser.Math.Vector2(horizontal, vertical).normalize();
        this.player.x = Phaser.Math.Clamp(this.player.x + direction.x * this.speed * seconds, 42, WORLD_WIDTH - 42);
        this.player.y = Phaser.Math.Clamp(this.player.y + direction.y * this.speed * seconds, 125, WORLD_HEIGHT - 48);
        this.player.rotation += seconds * .8;
        this.pet.x = 28 + Math.cos(time * .002) * 5;
        this.pet.y = 8 + Math.sin(time * .003) * 4;

        if (this.gameOver) return;
        this.updateCombat(seconds);
        this.herbs.forEach((herb) => {
            herb.phase += seconds * 2;
            herb.scale = 1 + Math.sin(herb.phase) * .1;
            if (herb.active && Phaser.Math.Distance.Between(this.player.x, this.player.y, herb.x, herb.y) < 30) {
                herb.destroy();
                this.herbsCollected += 1;
                this.qi = Math.min(100, this.qi + 10);
                this.updateHud();
                if (this.herbsCollected === TOTAL_SPIRIT_HERBS) this.breakthrough();
            }
        });
    }

    updateCombat(seconds) {
        const previousQi = Math.floor(this.qi);
        this.qi = Math.min(100, this.qi + (this.qiRegen + this.stats.intelligence * .08) * seconds);
        this.skillTimers = this.skillTimers.map((timer) => Math.max(0, timer - seconds));
        this.enemies.forEach((enemy) => {
            if (!enemy.active) return;
            const distance = Phaser.Math.Distance.Between(this.player.x, this.player.y, enemy.x, enemy.y);
            if (distance > 42) {
                const direction = new Phaser.Math.Vector2(this.player.x - enemy.x, this.player.y - enemy.y).normalize();
                enemy.x = Phaser.Math.Clamp(enemy.x + direction.x * enemy.speed * seconds, 38, WORLD_WIDTH - 38);
                enemy.y = Phaser.Math.Clamp(enemy.y + direction.y * enemy.speed * seconds, 125, WORLD_HEIGHT - 48);
            }
            enemy.attackCooldown -= seconds;
            if (distance <= 44 && enemy.attackCooldown <= 0) {
                enemy.attackCooldown = 1.25;
                this.takeDamage(enemy.attackDamage);
            }
        });
        this.castNextAvailableSkill();
        const readySkill = SKILLS[this.nextSkillIndex];
        this.skillText.setText('Tự động: ' + readySkill.name + '  ·  ' + readySkill.cost + ' linh lực');
        this.updateSkillIcons();
        if (Math.floor(this.qi) !== previousQi) this.updateHud();
    }

    updateSkillIcons() {
        if (!this.skillIcons) return;
        this.skillIcons.forEach((slot, index) => {
            const skill = SKILLS[index];
            const cooldown = this.skillTimers[index];
            const ready = cooldown <= 0 && this.qi >= skill.cost;
            slot.background.setFillStyle(ready ? 0x31584c : 0x183138);
            slot.icon.setAlpha(ready ? 1 : .42);
            slot.state.setText(cooldown > 0 ? Math.ceil(cooldown) + 's' : skill.name);
            slot.state.setColor(ready ? '#f2c879' : '#7f9b9a');
        });
    }

    castNextAvailableSkill() {
        for (let offset = 0; offset < SKILLS.length; offset++) {
            const skillIndex = (this.nextSkillIndex + offset) % SKILLS.length;
            const skill = SKILLS[skillIndex];
            if (this.skillTimers[skillIndex] > 0 || this.qi < skill.cost) continue;
            const target = this.findTarget(skill.range);
            if (!target) continue;
            this.skillTimers[skillIndex] = skill.cooldown;
            this.qi -= skill.cost;
            this.nextSkillIndex = (skillIndex + 1) % SKILLS.length;
            this.damageEnemy(target, skill);
            this.updateHud();
            break;
        }
    }

    findTarget(range) {
        return this.enemies
            .filter((enemy) => enemy.active && Phaser.Math.Distance.Between(this.player.x, this.player.y, enemy.x, enemy.y) <= range)
            .sort((first, second) => Phaser.Math.Distance.Between(this.player.x, this.player.y, first.x, first.y) - Phaser.Math.Distance.Between(this.player.x, this.player.y, second.x, second.y))[0];
    }

    damageEnemy(enemy, skill) {
        const projectile = this.add.sprite(this.player.x, this.player.y, 'skill-sheet', 'frame0').setScale(.8);
        projectile.setTint(skill.color);
        projectile.play(skill.animation);
        this.tweens.add({ targets: projectile, x: enemy.x, y: enemy.y, duration: 160, onComplete: () => projectile.destroy() });
        const effect = this.add.graphics();
        effect.lineStyle(4, skill.color, .9);
        effect.lineBetween(this.player.x, this.player.y, enemy.x, enemy.y);
        this.tweens.add({ targets: effect, alpha: 0, duration: 180, onComplete: () => effect.destroy() });
        const critical = Math.random() * 100 < this.stats.crit;
        const baseDamage = skill.damage + this.stats.attack * .45 + this.stats.intelligence * .25 + (this.level - 1) * 1.5;
        const scaledDamage = Math.round(baseDamage * (critical ? 1.8 : 1));
        enemy.health -= scaledDamage;
        enemy.healthFill.width = enemy.healthBarWidth * Math.max(0, enemy.health) / enemy.maxHealth;
        enemy.list[0].setTint(skill.color);
        this.time.delayedCall(100, () => {
            if (enemy.active) enemy.list[0].clearTint();
        });
        if (enemy.health <= 0) {
            this.createDeathEffect(enemy);
            enemy.destroy();
            this.qi = Math.min(100, this.qi + 15);
            if (this.enemies.every((item) => !item.active)) {
                this.advanceLevel();
            }
        }
    }

    createDeathEffect(enemy) {
        const effectSprite = this.add.sprite(enemy.x, enemy.y, 'effect-sheet', 'frame0').setScale(enemy.isBoss ? 1.6 : .9);
        effectSprite.setTint(enemy.deathColor);
        effectSprite.play(this.assetAnimations.effect);
        this.tweens.add({ targets: effectSprite, scale: enemy.isBoss ? 2.8 : 1.7, alpha: 0, duration: enemy.isBoss ? 520 : 320, onComplete: () => effectSprite.destroy() });
        const burst = this.add.graphics();
        burst.lineStyle(enemy.isBoss ? 5 : 3, enemy.deathColor, .9);
        burst.strokeCircle(0, 0, enemy.isBoss ? 28 : 18);
        burst.x = enemy.x;
        burst.y = enemy.y;
        this.tweens.add({ targets: burst, scale: enemy.isBoss ? 2.6 : 1.8, alpha: 0, duration: enemy.isBoss ? 520 : 320, onComplete: () => burst.destroy() });

        const shardCount = enemy.isBoss ? 18 : 8;
        for (let index = 0; index < shardCount; index++) {
            const shard = this.add.circle(enemy.x, enemy.y, enemy.isBoss ? 4 : 3, enemy.deathColor);
            const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
            const distance = Phaser.Math.Between(enemy.isBoss ? 55 : 28, enemy.isBoss ? 120 : 65);
            this.tweens.add({
                targets: shard,
                x: enemy.x + Math.cos(angle) * distance,
                y: enemy.y + Math.sin(angle) * distance,
                scale: 0,
                alpha: 0,
                duration: enemy.isBoss ? 650 : 380,
                ease: 'Cubic.easeOut',
                onComplete: () => shard.destroy()
            });
        }

        const label = this.add.text(enemy.x, enemy.y - (enemy.isBoss ? 42 : 30), enemy.isBoss ? 'BOSS ĐÃ BỊ ĐÁNH BẠI' : '+' + (enemy.isBoss ? 30 : 15) + ' LINH LỰC', {
            fontFamily: 'Trebuchet MS, sans-serif', fontSize: enemy.isBoss ? '15px' : '12px', color: '#' + enemy.deathColor.toString(16).padStart(6, '0')
        }).setOrigin(.5);
        this.tweens.add({ targets: label, y: label.y - 24, alpha: 0, duration: enemy.isBoss ? 900 : 560, onComplete: () => label.destroy() });
    }

    advanceLevel() {
        if (this.levelTransition || this.gameOver) return;
        this.levelTransition = true;
        if (this.level >= MAX_LEVEL) {
            this.message.setText('Đã vượt qua 100 tầng linh cốc! Nhấn F5 để tu luyện lại.').setColor('#f2c879');
            this.gameOver = true;
            return;
        }
        this.levelTransition = false;
        if (window.showStageSelect) window.showStageSelect(Math.min(MAX_LEVEL, this.level + 1));
        if (this.scene.isActive()) this.scene.pause();
    }

    takeDamage(amount) {
        const reducedDamage = Math.max(1, Math.round(amount - this.stats.defense * .35 - this.buffs.defense));
        this.health = Math.max(0, this.health - reducedDamage);
        this.updateHud();
        this.cameras.main.shake(120, .003);
        if (this.health === 0) {
            this.gameOver = true;
            this.message.setText('Linh lực cạn kiệt. Nhấn F5 để nhập lại sơn cốc.').setColor('#ffaaa0');
            if (window.showDefeat) window.showDefeat(this.level);
        }
    }

    updateHud() {
        this.realm = window.RealmSystem.get(this.level);
        this.realmText.setText(this.realm.name + ' · Cấp ' + this.level + ' / ' + MAX_LEVEL);
        this.scoreText.setText('Linh thảo  ' + this.herbsCollected + ' / ' + TOTAL_SPIRIT_HERBS);
        this.qiText.setText('Linh lực  ' + Math.floor(this.qi) + ' / 100');
        this.healthText.setText('Sinh lực  ' + this.health + ' / ' + this.maxHealth);
        this.progressFill.width = 180 * this.qi / 100;
        this.statsText.setText('Công ' + Math.round(this.stats.attack + this.buffs.attack) + '  Phòng ' + Math.round(this.stats.defense + this.buffs.defense) + '\nTrí ' + this.stats.intelligence + '  Bạo kích ' + this.stats.crit + '%  Tốc ' + this.stats.haste + '%');
        this.buffText.setText('Buff: Hồi linh lực +' + Math.round(this.qiRegen + this.stats.intelligence * .08) + '/s  ·  May mắn ' + this.stats.luck);
        this.vipText.setText('VIP ' + this.vip.level + ' · ' + this.vip.name + ' · ' + this.vipPoints + '/' + (this.vip.level < 10 ? this.VipNextPoints() : 'MAX'));
        this.updateSkillIcons();
    }

    saveGame() {
        return window.GameSave.save(this);
    }

    loadGame(snapshot) {
        if (!snapshot) return false;
        this.pendingSave = snapshot;
        this.scene.restart();
        this.scene.resume();
        return true;
    }

    VipNextPoints() {
        return window.VipSystem.get(this.vip.level + 1).points;
    }

    breakthrough() {
        this.message.setText('Linh lực đầy! Đột phá nhỏ thành công, tiếp tục chiến đấu.').setColor('#f2c879');
        this.player.list[2].setTint(0xf2c879);
        this.cameras.main.flash(450, 242, 200, 121);
    }
}

window.spiritGame = new Phaser.Game({
    type: Phaser.AUTO,
    parent: 'game',
    width: WIDTH,
    height: HEIGHT,
    backgroundColor: '#111a27',
    scene: SpiritValleyScene,
    scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH }
});
