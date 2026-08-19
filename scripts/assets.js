window.DynamicAssets = {
    setup(scene) {
        const textures = scene.textures;
        const makeSheet = (key, colors, frameSize) => {
            if (textures.exists(key)) return;
            const canvas = textures.createCanvas(key, frameSize * colors.length, frameSize);
            const context = canvas.context;
            colors.forEach((color, index) => {
                const x = index * frameSize;
                context.fillStyle = color;
                context.beginPath();
                context.arc(x + frameSize / 2, frameSize / 2, frameSize * .3 + index * 2, 0, Math.PI * 2);
                context.fill();
                context.strokeStyle = '#f4f0d0';
                context.lineWidth = 2;
                context.stroke();
                context.fillStyle = '#ffffff88';
                context.fillRect(x + frameSize * .28, frameSize * .2, frameSize * .16, frameSize * .16);
            });
            canvas.refresh();
            colors.forEach((color, index) => canvas.add('frame' + index, 0, index * frameSize, 0, frameSize, frameSize));
        };
        const animate = (key, prefix, frameRate = 8) => {
            const animationKey = prefix + '-idle';
            if (!scene.anims.exists(animationKey)) {
                scene.anims.create({ key: animationKey, frames: [{ key, frame: 'frame0' }, { key, frame: 'frame1' }, { key, frame: 'frame2' }], frameRate, repeat: -1 });
            }
            return animationKey;
        };

        makeSheet('character-sheet', ['#62c6a0', '#7de0b4', '#48a88a'], 48);
        makeSheet('pet-sheet', ['#d9a85b', '#f2c879', '#b47a38'], 36);
        makeSheet('enemy-sheet', ['#a84f61', '#cf6b6d', '#813e58'], 42);
        makeSheet('boss-sheet', ['#ed654d', '#f2c879', '#a84454'], 64);
        makeSheet('skill-sheet', ['#ff8a5b', '#8de8ff', '#d4a5ff'], 24);
        makeSheet('buff-sheet', ['#f2c879', '#7bc7a4', '#8de8ff'], 28);
        makeSheet('effect-sheet', ['#ffffff', '#f2c879', '#ff8a5b'], 32);
        scene.assetAnimations = {
            character: animate('character-sheet', 'character', 5),
            pet: animate('pet-sheet', 'pet', 6),
            enemies: Array.from({ length: 6 }, (_, index) => animate('enemy-sheet', 'enemy-' + index, 6 + index)),
            bosses: [25, 60, 100].map((level) => animate('boss-sheet', 'boss-' + level, 4 + level / 50)),
            skills: Array.from({ length: 6 }, (_, index) => animate('skill-sheet', 'skill-' + index, 10 + index)),
            buff: animate('buff-sheet', 'buff', 8),
            effect: animate('effect-sheet', 'effect', 14)
        };
    }
};
