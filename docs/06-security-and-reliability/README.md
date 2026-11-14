# 06 · Bảo mật và độ tin cậy

## Bảo mật
- Khoá Gemini chỉ ở `localStorage` của máy người dùng; **không** có trong mã, commit, hay URL chia sẻ.
- Repo công khai: `tools/qa.mjs` quét khoá (`AIza…`, `sk-…`, khoá riêng) và email nội bộ.
- Mô tả cá nhân người dùng (`gs_about`) chỉ nằm trên máy.
- Không bật micro khi chưa bấm Gọi; kết thúc gọi thì giải phóng micro + khoá màn hình — kể cả khi bấm Kết thúc lúc đang kết nối (micro/WebSocket mở xong sau đó phải được nhả ngay).
- "Xoá hết dữ liệu" xoá cả trong bộ nhớ lẫn `localStorage`: trò chuyện, band, điểm, thi thử, sổ từ, nhật ký phản xạ, trí nhớ Tâm sự/Cục súc/HSK3. Chỉ giữ khoá API, model, phần "Sam nên biết gì về bạn" và chế độ đang chọn.
- Mã chạy từ CDN phải khoá đúng phiên bản (three@0.180.0, TalkingHead@1.7, HeadAudio@1.0.0); không trỏ vào nhánh (`@main`).
- Service worker xoá cache của phiên bản cũ khi phiên bản mới kích hoạt.
- Đề thi: Sam chỉ tả khuôn đề và tự soạn câu hỏi cùng dạng; KHÔNG chép câu hỏi, bài mẫu, bảng tiêu chí nguyên văn của ETS/Pearson/Duolingo/Cambridge vào repo công khai. Bộ civics USCIS là tài liệu công của chính phủ Mỹ nên được chép, có ghi nguồn.
- Mọi điểm của kỳ thi khác IELTS hiện dạng khoảng và ghi rõ là ước lượng của Sam, không phải điểm chính thức.

## Giấy phép
| Tài nguyên | Giấy phép | Cách dùng |
|---|---|---|
| TalkingHead, HeadAudio | MIT | Nạp từ CDN |
| three.js | MIT | CDN |
| Chuyển động Bandai Namco Research | CC BY-NC-ND | Tải lúc chạy từ CDN; không lưu/không phát tán bản chỉnh; ghi công trong Cài đặt |
| Nhân vật | Do chủ dự án tự nặn trong VRoid | `tools/sam-david.vrm` |
| Bục 3D | Tạo bằng Magnific (gói trả phí của chủ dự án) | `bg/buc.glb` |
| Video/tranh nền | Chủ dự án tự tạo bằng Gemini | `bg/` |

## Độ tin cậy — lùi từng bước
| Hỏng | Hành vi |
|---|---|
| Video nền không tải | Dùng tranh tĩnh theo buổi |
| `buc.glb` không tải | Đĩa ngọc trơn |
| Open-Meteo lỗi/offline | Thời tiết "quang" |
| Mocap không tải | Không cử chỉ mocap, các cử chỉ khác vẫn chạy |
| Mất Gemini Live | Có mã nối lại: tự nối lại (≤ 3 lần liên tiếp, giữ micro + avatar). Không có / quá 3 lần: thông báo, bấm Gọi lại |
| Hết lượt Gemini free (429) | Báo hết lượt + giờ hồi lượt (≈ 14–15 giờ chiều VN) |
| Sam lỡ nói ngôn ngữ lạ | Cắt tiếng, nhắc nói lại tiếng Anh |
| `localStorage` bị chặn | Vẫn chạy, không nhớ |
