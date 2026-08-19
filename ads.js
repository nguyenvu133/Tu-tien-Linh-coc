window.GameAds = (() => {
    const banner = document.getElementById('ad-banner');
    const title = document.getElementById('ad-title');
    const copy = document.getElementById('ad-message');
    const cta = document.getElementById('ad-cta');
    const messages = {
        home: ['TÂN THỦ LINH CỐC', 'Nhận 250 kim tệ và mở khóa hành trình tu tiên.', 'Xem quà'],
        battle: ['PHÚC LỢI TU LUYỆN', 'Đột phá cảnh giới để tăng Công và Hồi linh lực.', 'Tu luyện'],
        boss: ['BOSS ĐANG THỨC TỈNH', 'Chuẩn bị buff phòng thủ trước khi vào tầng boss.', 'Chuẩn bị']
    };

    function show(type) {
        const message = messages[type] || messages.home;
        title.textContent = message[0];
        copy.textContent = message[1];
        cta.textContent = message[2];
        banner.hidden = false;
    }

    document.getElementById('ad-close').addEventListener('click', () => { banner.hidden = true; });
    cta.addEventListener('click', () => {
        cta.textContent = 'Đã nhận';
        cta.disabled = true;
        window.setTimeout(() => { cta.disabled = false; }, 1200);
    });

    return { show };
})();
