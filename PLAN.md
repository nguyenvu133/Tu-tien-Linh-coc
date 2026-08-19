# Tu Tien Demo Plan

## Muc tieu vertical slice

Tao mot game phiêu lưu tu tiên nguyên bản: khám phá sơn cốc, thu thập linh thảo, luyện khí, mở khóa kỹ năng và đối đầu linh thú.

## Cấu trúc

```text
demo/
  assets/
    sprites/
    tilesets/
    vfx/
    ui/
  music/
    music/
    sfx/
  scripts/
    game.js
  styles/
    main.css
  index.html
  PLAN.md
```

## World tilemap

`demo/scripts/world.js` tạo bản đồ `1280x1920` với tile 32px và ba layer độc lập:

- `ground`: nền sơn cốc.
- `paths`: đường đi và khu vực chiến đấu.
- `decorations`: điểm nhấn địa hình.

Camera follow player và bounds theo world, còn HUD dùng scroll factor bằng 0.

## VIP progression

VIP có cấp `0` đến `10`. Mỗi cấp có ngưỡng điểm và quyền lợi riêng cho Công, Phòng, Hồi linh lực, Tốc độ và May mắn. Bảng dữ liệu nằm ở `demo/scripts/vip.js`; khi kết nối backend hoặc thanh toán thật, chỉ cần cập nhật `vipLevel` và `vipPoints` từ hồ sơ người chơi.

## Milestone

1. **Vertical slice hiện tại**: bản đồ sơn cốc, nhân vật, nhặt linh thảo, thanh linh lực, đột phá cảnh giới.
2. **Khám phá**: scene bản đồ, camera follow, cổng khu vực, NPC và hội thoại.
3. **Tu luyện**: công pháp, thuộc tính ngũ hành, cảnh giới, cooldown kỹ năng.
4. **Chiến đấu**: linh thú, hitbox, né tránh, phần thưởng và rơi vật phẩm.
5. **Tiến trình**: save/load, nhiệm vụ, túi đồ, nhật ký phiêu du.
6. **Đóng gói**: asset pipeline, nhạc theo scene, mobile controls, build production.

## Quy tắc kỹ thuật

- Mỗi scene giữ một trách nhiệm rõ ràng.
- Dữ liệu nhân vật và vật phẩm đặt ở module riêng, không hard-code trong UI.
- Asset bên ngoài phải có nguồn và giấy phép được ghi lại.
- Mỗi milestone cần một luồng chơi hoàn chỉnh trước khi thêm hệ thống mới.
