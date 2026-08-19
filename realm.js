window.RealmSystem = {
    realms: [
        { min: 0, name: 'Phàm Nhân', title: 'Chưa nhập môn', health: 0, attack: 0, defense: 0, qi: 0 },
        { min: 10, name: 'Luyện Khí', title: 'Dẫn khí nhập thể', health: 20, attack: 5, defense: 2, qi: 10 },
        { min: 20, name: 'Trúc Cơ', title: 'Đạo cơ sơ thành', health: 45, attack: 12, defense: 6, qi: 20 },
        { min: 30, name: 'Kim Đan', title: 'Kết đan tụ pháp', health: 80, attack: 22, defense: 12, qi: 35 },
        { min: 40, name: 'Nguyên Anh', title: 'Anh linh xuất khiếu', health: 125, attack: 36, defense: 20, qi: 50 },
        { min: 50, name: 'Hóa Thần', title: 'Thần niệm thông thiên', health: 180, attack: 55, defense: 30, qi: 70 },
        { min: 60, name: 'Luyện Hư', title: 'Hư không luyện thể', health: 250, attack: 80, defense: 44, qi: 90 },
        { min: 70, name: 'Hợp Thể', title: 'Thiên địa hợp nhất', health: 335, attack: 112, defense: 62, qi: 115 },
        { min: 80, name: 'Đại Thừa', title: 'Một bước thành tiên', health: 440, attack: 150, defense: 84, qi: 145 },
        { min: 90, name: 'Độ Kiếp', title: 'Vượt qua thiên kiếp', health: 570, attack: 200, defense: 112, qi: 180 },
        { min: 100, name: 'Chân Tiên', title: 'Đăng lâm tiên giới', health: 730, attack: 260, defense: 150, qi: 220 }
    ],
    get(stage) {
        return this.realms.reduce((current, realm) => stage >= realm.min ? realm : current, this.realms[0]);
    }
};

window.StageBalance = {
    get(stage, isBoss, index) {
        const progress = Math.max(0, Math.min(1, stage / 100));
        const wave = 1 + progress * .85;
        const role = 1 + (index || 0) * .055;
        const bossMultiplier = isBoss ? 2.15 + progress * .75 : 1;
        return {
            health: Math.round(wave * role * bossMultiplier),
            damage: Math.min(isBoss ? 34 : 19, Math.round((1 + progress * .72) * role * (isBoss ? 1.8 : 1))),
            speed: Math.min(isBoss ? 92 : 78, 42 + progress * 24 + (index || 0) * 3) * (isBoss ? .78 : 1)
        };
    }
};
