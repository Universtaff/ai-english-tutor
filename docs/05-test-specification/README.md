# 05 · Đặc tả kiểm thử

## Tự động: `node tools/qa.mjs` (≈ 2 phút, mã thoát 1 nếu có ❌)
**QA (mã & kho):** cú pháp mọi `.mjs` + script trong `index.html` · file tham chiếu có thật · dung lượng `bg/` ≤ 22 MB, `sam.glb` ≤ 14 MB · không lộ khoá/email nội bộ · mọi URL CDN đều pin phiên bản/SHA · `sw.js` đã tăng phiên bản khi đổi nội dung (so với commit cha, không dựa riêng worktree) · lưu sẵn vỏ app (không lưu sẵn tệp lớn) · commit đã đẩy.
**QC (chạy thật Chrome headless):**
| Mã | Kiểm |
|---|---|
| A-layout | 360, 393, 412, 1280: không tràn ngang; nút ≥ 40 px |
| A-scene | Nhân vật, bục, đèn nạp được; video ≥ 720p chạy thật, tiến khung hình; bảng cảnh mở, gọn trong màn, tự đóng |
| A-fx | 90 tổ hợp buổi×thời tiết×mùa không lỗi; đèn đêm sáng, ngày tắt |
| A-season | Mùa theo vùng/tháng; mỗi mùa có video; toạ độ 10 khu vực nằm trong Việt Nam |
| A-weather | Mã WMO → kiểu đúng; Open-Meteo trả số |
| A-frame | Chân Sam nằm trên hàng nút (khổ 393×873) |
| A-umbrella | Mưa/giông/tuyết: dù (mô hình) đã nạp, mở hết cỡ, tán + chân nằm trong màn; quang/sương: dù đóng |
| A-physics | Mưa: ≥ 20 va chạm tán trong 5 s và lọt dưới < 30%; tuyết: độ đọng tăng dần |
| A-chat | Chế độ Tâm sự: prompt có luật chỉ nói tiếng Anh + không dạy, không còn nội dung IELTS, nạp ghi chú trí nhớ; có 2 nút chọn chế độ |
| A-hsk | Chế độ HSK3: prompt gọi + chat có HSK 3, nạp ghi chú tiến độ, chat chữ có dòng 🗣, bộ lọc cho chữ Hán nhưng vẫn chặn Nhật/Hàn |
| A-drill | Prompt chế độ Học (gọi + chat chữ) chứa PHRASE DRILL: phản ứng hài, câu đúng theo ngữ cảnh, bắt nói lại |
| A-roast | Chế độ Cục súc: prompt gọi + chat có vai cục súc, bắt nói lại, giới hạn an toàn, nạp câu từng sai |
| A-road2 | Lộ trình G/V: 40+40 bài id không trùng, prompt đúng loại bài (G/V/IELTS), sổ từ Leitner (chống trùng, hẹn ngày, lên/xuống hộp), 3 tab dựng được, nút ≥ 40px |
| A-reflex | 30 bài phản xạ; prompt gọi (Học + Cục súc) có REFLEX DRILL; tool save_drill chấm điểm 0–10; nhật ký phản xạ lưu trung bình ms; hàm đo độ to micro; thẻ Hôm nay có 5 việc; tab dưới tên Lộ trình |
| A-lang | Luật "chỉ nói tiếng Anh" có trong lời dặn; `FOREIGN` bắt đúng; |
| A-chat | Dòng 💡 ✏️ 🗣 có kiểu riêng; tab IELTS và Cài đặt mở được |
| A-console | Không lỗi console/exception cả phiên |
| A-resume | Giả lập máy chủ Live: setup có sessionResumption + contextWindowCompression; goAway / đóng 1006 → kết nối mới dùng mã nối lại, không chào lại, micro còn mở; đóng do hết lượt → kết thúc + báo giờ hồi; quá 3 lần nối lại liền → kết thúc |
| A-turn | setup có automaticActivityDetection (END_SENSITIVITY_LOW, silenceDurationMs ≥ 1200); bật Giữ nút → disabled + giữ/thả gửi activityStart/activityEnd; nút không kẹt sáng khi nối lại / sang cuộc gọi sau |
| A-memory | Mọi lời dặn có TURN-TAKING (+ VARIETY trừ HSK3); chế độ Học lưu + đưa trí nhớ vào lời dặn, không lẫn sang Cục súc |
| A-model | DEFAULT_MODEL = gemini-3.5-flash-lite; 404 → thử bí danh gemini-flash-lite-latest; Cài đặt có cảnh báo 18+ |
| A-exam | Nạp đủ 4 tệp data; đổi kỳ thi TOEFL/civics → lời dặn chat + gọi có EXAM FOCUS (civics: 20 câu); thẻ `<score2>` lưu lịch sử dạng khoảng; tab Kỳ thi có chọn kỳ thi + bảng đích đến |
| A-timer | `wordMatch` đúng (5/6 từ = 83%, báo từ thiếu); `start_timer` + lời chép → xong sớm hiện % khớp và gửi số đo cho Sam (không bắt Sam nói); thẻ `<timer>` đếm giờ trên thanh chế độ |
| A-l2 | Nút ngôn ngữ xoay Trung → Đức → Hàn → Nhật → Đài; lời dặn đúng ngôn ngữ; bộ lọc chữ: Hàn cho Hangul, chặn chữ Thái; Đức chặn chữ Hán |
| A-recap | Giả lập Gemini: hết buổi gọi ≥ 3 lượt → thẻ 📝 tóm tắt, lỗi vào sổ lỗi, từ vào sổ từ, tóm tắt vào trí nhớ; `[FIXES]` + thẻ `<review>` dời lịch ôn lỗi |
| A-honest | Lời dặn IELTS có BAND GUIDE + khoảng band + luật bài yếu; thẻ band lưu `range`; điểm thi thật vào lời dặn hiệu chỉnh |
| A-pron | Giả lập Gemini: `pronCheck` gửi `inline_data` âm thanh + câu gốc, hiện độ rõ ★ + từ đọc sai + nhãn ước lượng |
| (luật QA) | Mục kiểm chạy thật phải trả về danh sách rỗng mới xanh; văng lỗi / quá giờ = ĐỎ (`okList`) |
Giới hạn: headless vẽ chậm → KHÔNG đo được fps máy thật. Điều kiện chờ dùng vòng lặp thăm dò, không `sleep` cố định.

## Tay trên điện thoại thật (trước mỗi bản lớn) — chi tiết ở `tests/may-that.md`
M-01 Gọi · M-02 Hỏi tiếng Việt · M-03 Môi/cử chỉ · M-04 Thi thử + nhớ hồ sơ · M-05 Xoay 360° · M-06 Cài đặt như ứng dụng, mở khi mạng yếu · **M-07 fps 60** (cắm máy, đo bằng CDP: `adb forward tcp:9555 localabstract:chrome_devtools_remote`).

## Quy tắc
Sửa giao diện → xem ảnh chụp ở đúng khổ máy (393×873) trước khi đẩy. Đừng tin "không tràn ngang" thay cho nhìn ảnh.
