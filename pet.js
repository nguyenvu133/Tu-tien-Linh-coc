window.PetSystem = {
    catalog: [
        { id: 'moon-fox', name: 'Nguyệt Hồ', color: 0x81d8ff, attack: 4, defense: 2, regen: 1, speed: 8, luck: 4 },
        { id: 'ember-hound', name: 'Hỏa Khuyển', color: 0xff8a5b, attack: 9, defense: 1, regen: 0, speed: 4, luck: 2 },
        { id: 'jade-turtle', name: 'Ngọc Quy', color: 0x7bc7a4, attack: 1, defense: 10, regen: 2, speed: -2, luck: 1 }
    ],
    get(id) {
        return this.catalog.find((pet) => pet.id === id) || this.catalog[0];
    },
    apply(scene) {
        scene.petData = this.get(scene.petId || 'moon-fox');
        scene.stats.attack += scene.petData.attack;
        scene.stats.defense += scene.petData.defense;
        scene.stats.luck += scene.petData.luck;
        scene.qiRegen += scene.petData.regen;
        scene.speed += scene.petData.speed;
    }
};
