window.GameSave = {
    key: 'linh-coc-save-v1',
    save(scene) {
        const payload = {
            version: 1,
            savedAt: new Date().toISOString(),
            level: scene.level,
            vipLevel: scene.vipLevel,
            vipPoints: scene.vipPoints,
            petId: scene.petId,
            herbsCollected: scene.herbsCollected,
            qi: Math.floor(scene.qi),
            health: Math.floor(scene.health),
            player: { x: Math.round(scene.player.x), y: Math.round(scene.player.y) }
        };
        localStorage.setItem(this.key, JSON.stringify(payload));
        return payload;
    },
    load() {
        try {
            const raw = localStorage.getItem(this.key);
            return raw ? JSON.parse(raw) : null;
        } catch (error) {
            return null;
        }
    },
    clear() {
        localStorage.removeItem(this.key);
    }
};
