# Assets

Thư mục tài nguyên hình ảnh cho demo tu tiên.

## Quy ước

- `sprites/`: nhân vật, linh thú, NPC, vật phẩm.
- `tilesets/`: bản đồ và địa hình.
- `vfx/`: hiệu ứng linh lực, đột phá, kỹ năng.
- `ui/`: biểu tượng, khung hội thoại, thanh chỉ số.

Demo hiện có registry spritesheet động tại `demo/scripts/assets.js`. Registry tạo fallback spritesheet bằng Canvas và đăng ký animation cho:

- `character-sheet`: nhân vật chính.
- `pet-sheet`: linh thú đồng hành.
- `enemy-sheet` và `boss-sheet`: quái thường/boss.
- `skill-sheet`: đạn và projectile kỹ năng.
- `buff-sheet`: aura buff quanh nhân vật.
- `effect-sheet`: hiệu ứng chết, nổ và đột phá.

Khi có asset thật, thay `makeSheet` bằng `this.load.spritesheet` trong một loader scene nhưng giữ nguyên animation keys để gameplay không phải sửa lại.
