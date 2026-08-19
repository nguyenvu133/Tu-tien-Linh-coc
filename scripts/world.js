window.DynamicWorld = {
    width: 1280,
    height: 1920,
    tileSize: 32,
    setup(scene) {
        const columns = this.width / this.tileSize;
        const rows = this.height / this.tileSize;
        this.createTiles(scene);
        const ground = Array.from({ length: rows }, () => Array(columns).fill(0));
        const paths = Array.from({ length: rows }, () => Array(columns).fill(-1));
        const decorations = Array.from({ length: rows }, () => Array(columns).fill(-1));
        for (let row = 0; row < rows; row++) {
            for (let column = 0; column < columns; column++) {
                if (column % 11 === 0 || row % 13 === 0 || (column > 16 && column < 22 && row > 12)) paths[row][column] = 1;
                if ((column * 7 + row * 3) % 29 === 0) decorations[row][column] = 2;
            }
        }
        const map = scene.make.tilemap({ data: ground, tileWidth: this.tileSize, tileHeight: this.tileSize });
        const tileset = map.addTilesetImage('world-tiles', 'world-tiles', this.tileSize, this.tileSize, 0, 0);
        if (!tileset) throw new Error('Không thể tạo tileset bản đồ');
        scene.tilemap = map;
        scene.tilemapLayers = {
            ground: map.createLayer(0, tileset, 0, 0),
            paths: this.createLayer(scene, paths, tileset, 'paths'),
            decorations: this.createLayer(scene, decorations, tileset, 'decorations')
        };
        scene.tilemapLayers.ground.name = 'ground';
        scene.tilemapLayers.paths.name = 'paths';
        scene.tilemapLayers.decorations.name = 'decorations';
        scene.tilemapLayers.ground.setDepth(0);
        scene.tilemapLayers.paths.setDepth(1);
        scene.tilemapLayers.decorations.setDepth(2);
        scene.cameras.main.setBounds(0, 0, this.width, this.height);
        scene.cameras.main.startFollow(scene.player, true, .08, .08);
    },
    createLayer(scene, data, tileset, name) {
        const map = scene.make.tilemap({ data, tileWidth: this.tileSize, tileHeight: this.tileSize });
        const layer = map.createLayer(0, tileset, 0, 0);
        layer.name = name;
        return layer;
    },
    createTiles(scene) {
        if (scene.textures.exists('world-tiles')) return;
        const canvas = scene.textures.createCanvas('world-tiles', 96, 32);
        const context = canvas.context;
        context.fillStyle = '#142b2d';
        context.fillRect(0, 0, 32, 32);
        context.fillStyle = '#5a4632';
        context.fillRect(32, 0, 32, 32);
        context.fillStyle = '#315744';
        context.fillRect(64, 0, 32, 32);
        context.strokeStyle = '#ffffff18';
        for (let tile = 0; tile < 3; tile++) {
            context.strokeRect(tile * 32, 0, 32, 32);
        }
        canvas.refresh();
        canvas.add('ground', 0, 0, 0, 32, 32);
        canvas.add('path', 0, 32, 0, 32, 32);
        canvas.add('decor', 0, 64, 0, 32, 32);
    }
};
