window.VipSystem = {
    levels: [
        { level: 0, name: 'Phàm nhân', points: 0, attack: 0, defense: 0, regen: 0, speed: 0, luck: 0 },
        { level: 1, name: 'Tân tu', points: 100, attack: 2, defense: 1, regen: 1, speed: 1, luck: 1 },
        { level: 2, name: 'Linh đồ', points: 250, attack: 4, defense: 2, regen: 1, speed: 2, luck: 2 },
        { level: 3, name: 'Đạo đồng', points: 500, attack: 7, defense: 4, regen: 2, speed: 3, luck: 3 },
        { level: 4, name: 'Chân truyền', points: 900, attack: 10, defense: 6, regen: 2, speed: 4, luck: 4 },
        { level: 5, name: 'Hộ pháp', points: 1500, attack: 14, defense: 9, regen: 3, speed: 5, luck: 5 },
        { level: 6, name: 'Trưởng lão', points: 2400, attack: 18, defense: 12, regen: 4, speed: 6, luck: 7 },
        { level: 7, name: 'Đại năng', points: 3600, attack: 23, defense: 16, regen: 5, speed: 7, luck: 9 },
        { level: 8, name: 'Thánh tử', points: 5200, attack: 29, defense: 21, regen: 6, speed: 8, luck: 11 },
        { level: 9, name: 'Tiên tôn', points: 7200, attack: 36, defense: 27, regen: 8, speed: 10, luck: 14 },
        { level: 10, name: 'Thiên mệnh', points: 10000, attack: 45, defense: 34, regen: 10, speed: 12, luck: 18 }
    ],
    get(level) {
        return this.levels[Math.max(0, Math.min(10, level))];
    },
    apply(scene) {
        scene.vip = this.get(scene.vipLevel || 0);
        scene.stats.attack += scene.vip.attack;
        scene.stats.defense += scene.vip.defense;
        scene.stats.luck += scene.vip.luck;
        scene.qiRegen += scene.vip.regen;
        scene.speed += scene.vip.speed;
    }
};
