# Lịch sử phát hành

Tóm tắt từ `git log` (mới → cũ). Phiên bản service worker `gia-su-vNN` tăng mỗi lần đẩy.

## 2026-11-14 · v59 — nâng cấp đợt 1 theo nghiên cứu đối thủ

- Gọi không đứt ở phút ~10: bật nối lại phiên + nén ngữ cảnh của Gemini Live; nhận goAway hoặc rớt mạng thì tự nối lại (chờ 1,5 s, tối đa 3 lần liền), giữ micro, avatar, lời thoại, không chào lại. Hết lượt free thì không cố nối lại mà báo giờ hồi lượt.
- Sam chờ người học nói xong: nhận biết hết lượt kém nhạy, im 1,5 s mới coi là xong; luật "đừng chen khi người học đang nghĩ câu" trong mọi lời dặn.
- Tuỳ chọn "Giữ nút để nói" trong Cài đặt: Sam không bao giờ cắt lời, nhấn giữ để nói, thả ra để Sam trả lời.
- Bớt hỏi dồn: lượt nào cũng hỏi là lời chê số 2 của mọi app → luật VARIETY (xen kể chuyện, nêu ý kiến, nhắc chuyện cũ).
- Chế độ Học cũng nhớ buổi trước (chuyện đã kể, chủ đề đã nói, việc còn dở), không lẫn sang Cục súc.
- Chat chữ ghim model gemini-3.5-flash-lite (bản Stable); Google gỡ thì tự lùi về bí danh cũ. Cài đặt có cảnh báo điều khoản gói free (18+, Google có thể đọc dữ liệu).
- QA: sửa lỗi QA tự báo xanh khi đoạn kiểm văng lỗi (15 mục chạy thật trước đây có thể xanh giả); thêm 2 mục (gọi nối lại/chờ/giữ nút, model + lời dặn) → 57 mục.

## 2026-11-13 · v58 — kiểm toàn app + vá lỗi

- Bấm Kết thúc lúc đang kết nối: micro, kết nối Gemini và khoá màn hình được nhả ngay (trước đây micro vẫn mở sau khi tắt).
- Bài phản xạ bị chặn (chưa có khoá / đang trong cuộc gọi khác) không còn dính sang cuộc gọi sau.
- "Xoá hết dữ liệu" xoá sạch cả sổ từ, nhật ký phản xạ, trí nhớ Tâm sự/Cục súc/HSK3 (trước đây lần ghi sau lưu lại dữ liệu cũ).
- Tiết kiệm pin: màn gọi ẩn (đang nhắn tin / xem lộ trình) thì dừng vẽ 3D và video nền.
- HeadAudio khoá ở bản 1.0.0 (trước trỏ `@main`, mã đã tự đổi ngày 10/11 mà chưa qua kiểm).
- Service worker xoá cache các phiên bản cũ.
- Giao diện: nút Gọi trên đầu đủ tương phản (chữ trắng trên xanh đậm), tin nhắn trên màn rộng không kéo dài quá 640 px, nút "IELTS" ở màn gọi đổi thành "Lộ trình" cho khớp tab, mở lần đầu thì Cài đặt điền sẵn model, chữ nhỏ nhất 12 px.
- Mic chat: trình duyệt từ chối nghe thì nút mic không kẹt đỏ; thông báo thử lại không còn hiện "5/4".
- QA thêm 5 mục (55 mục): khoá phiên bản CDN, dọn cache SW, tắt máy lúc kết nối, ẩn màn gọi, xoá dữ liệu.

## 2026-10-16 → 2026-11-05 · v45–v57

- HSK3 (chuẩn HSK 3.0), phrase drill, chế độ Cục súc (giọng Mỹ đường phố, chửi song ngữ), lộ trình Ngữ pháp + Từ vựng với sổ từ Leitner, Phản xạ 30 bài + thẻ Hôm nay, tiết kiệm pin khi chạy nền, avatar chụp từ chính nhân vật 3D.

## 2026-10-12

- QA
- Thêm bộ QA/QC tự động (tools/qa.mjs

## 2026-10-09

- Nền hết nhòe
- Đèn lồng trên bục tự sáng theo buổi (ngày tắt · chiều hửng · đêm sáng ấm lung linh, hắt ánh lên Sam); mạn-đà-la trên sàn phát sáng về đêm; đom đóm đêm, bụi nắng
- Bục đứng mới
- Giao diện mới
- Sam nghe được tiếng Việt nhưng luôn trả lời bằng tiếng Anh dễ hiểu (gọi thoại + nhắn tin), kèm cách nói câu đó bằng tiếng Anh; chỉ đổi sang tiếng Việt khi được 

## 2026-10-08

- Mùa đông dùng video mới (mua dong 2): đoạn đông dài gấp đôi, sương sáng
- Gọi thoại
- Sam chỉ nói tiếng Anh/tiếng Việt
- Cảnh động theo mùa
- Sam để mái ngang: cắt phẳng tóc mái ở chân mày (MAI=1.53 trong script chuyển VRoid)
- Cây hoa trên tranh đổi màu theo mùa (mặt nạ bg/hoa.png + shader); chuyển buổi/thời tiết/mùa mờ dần mượt thay vì bật tắt
- Chọn khu vực Việt Nam
- Ngày/chiều/đêm tự theo giờ máy (+ đổi tay) và thời tiết
- Nền phát được video lặp vòng (bg/tien-canh.mp4) trên vòm 360°, không có thì dùng tranh tĩnh
- Nền = tranh tiên cảnh anime David vẽ bằng Gemini Pro, dán lên vòm 360° (nửa sau lật gương); ẩn núi/đảo/cây dựng bằng khối
- Tiên cảnh kiểu anime thay ảnh chụp thật
- Nền ảnh chụp 360° thật (Poly Haven CC0): vách đá, rừng sương, hoàng hôn + nút đổi cảnh
- Sam: motion capture thật của Bandai Namco Research (cúi chào, vẫy tay, chỉ dẫn, đáp lời, nhảy)
- Sam: cảnh tiên hiệp 3D xoay 360 độ, cử chỉ dễ thương theo lời nói và lúc nghe
- Sam: da trắng hồng, thêm má hồng
- Màn gọi: nền tối cho dòng trạng thái để đọc được trên váy trắng
- Sam: sống mũi cao hơn; khung chân dung nửa người thấy tay, vẫy tay chào khi bắt máy

## 2026-10-07

- Sam: tô son hồng đỏ có bóng, môi đầy hơn, thêm lỗ mũi
- Sam = nhân vật David tự nặn trong VRoid (tóc đỏ rượu, váy fantasy); hạ đèn để da/tóc đúng màu
- Sam kiểu nhân viên văn phòng: tóc đỏ rượu vang, mắt hổ phách lim dim, son, gile đen sơ mi trắng
- Sam thành cô gái anime châu Á tóc đen (VRoid mẫu CC0), nhìn thẳng, đồ thường thay đồng phục
- Sửa lỗi cú pháp module mặt 3D (chú thích nuốt mất cuối dòng)
- Mặt 3D: vẽ ở độ nét 1.5 để điện thoại chạy 60 fps (trước 14 fps)
- Gọi kiểu FaceTime: mặt Sam 3D cử động, mấp máy miệng theo giọng, chớp mắt, đổi biểu cảm
- Ô 'Sam nên biết gì về bạn' (chỉ lưu trên máy) để Sam chọn chủ đề và cách nói hợp người dùng
- Gọi thoại trực tiếp với Sam (Gemini Live): giọng có cảm xúc, chen ngang, song ngữ Anh–Việt giọng miền Nam
- Icon mới làm bằng Magnific (cô gái nháy mắt, son đỏ), bỏ bản SVG tự vẽ
- Icon mới: cô gái tóc dài nháy mắt, son đỏ (tự vẽ SVG), ảnh đại diện trên đầu app
- Sam chuyên IELTS, nói như người bản xứ
- Không đoán level từ trò chuyện trước 8 câu (Lite từng phán B2 sau 1 câu)
- Chọn đúng giọng en-US trên Chrome Android (mã giọng dạng en_US)
- Gộp tất cả vào Sam: nói chuyện là chính, thêm tab Lộ trình & Điểm
- Đổi thành Sam: bạn nói chuyện tiếng Anh, tự đoán level, mặc định Flash-Lite
- Tự gọi lại khi Gemini báo 503 quá tải
- Gia sư tiếng Anh: app PWA đo trình độ, học bài, nói chuyện (Gemini free)

