# Music

Nơi chứa nhạc nền và hiệu ứng âm thanh của demo.


Chỉ thêm audio có giấy phép phù hợp. Phaser có thể tải audio bằng `this.load.audio` và phát qua `this.sound.play`.

## BGM demo

`demo/scripts/audio.js` hiện tạo BGM procedural bằng Web Audio để demo chạy không cần file nhạc nhị phân:

- `home`: giai điệu nhẹ cho menu chính.
- `newgame`: đoạn mở đầu khi bắt đầu hành trình.
- `battle`: nhịp chiến đấu cho map battle.

Trình duyệt có thể chặn âm thanh trước tương tác đầu tiên; nút `New Game` sẽ kích hoạt audio context. Nút `♫` trong gameplay dùng để bật/tắt âm thanh.
