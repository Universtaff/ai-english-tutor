# 04 · API và dữ liệu

## Dịch vụ ngoài
| Dịch vụ | Dùng để | Khoá | Lùi khi hỏng |
|---|---|---|---|
| Gemini REST `gemini-3.5-flash-lite` (ghim; 404 → bí danh `gemini-flash-lite-latest`) | Chat chữ, chấm Writing, giáo trình | Người dùng dán (`gs_key`) | Báo lỗi trong khung chat; 429 báo giờ hồi lượt |
| Gemini Live `gemini-3.8-live`, giọng Aoede (WebSocket) | Gọi thoại | cùng khoá | Thông báo "Mất kết nối… Bấm Gọi lại" |
| Open-Meteo `/v1/forecast?current=weather_code` | Thời tiết thật theo toạ độ khu vực | không cần | Mặc định "quang" |
| jsDelivr | three, TalkingHead, BVH mocap của Bandai Namco | không | Không cử chỉ mocap; cảnh vẫn chạy |

## Gemini Live
Không dùng token tạm (ephemeral token): token phải xin từ chính trình duyệt bằng cùng khoá nên không thêm an toàn, lại giới hạn cuộc gọi ~30 phút. `setup`: model, `responseModalities: [AUDIO]`, giọng, `systemInstruction = livePrompt()`, bật `inputAudioTranscription` + `outputAudioTranscription`, `sessionResumption` (kèm `handle` khi nối lại), `contextWindowCompression: { slidingWindow: {} }`, `realtimeInputConfig.automaticActivityDetection` = `{ endOfSpeechSensitivity: END_SENSITIVITY_LOW, silenceDurationMs: 1500 }` (hoặc `{ disabled: true }` khi bật Giữ nút để nói). Máy chủ gửi `sessionResumptionUpdate { newHandle, resumable }` → lưu `L.handle`; `goAway` hoặc đóng bất thường (≠ 1000) khi đã có `handle` → cùng đi qua bộ đếm nối lại, chờ 1,5 s, tối đa 3 lần, không gửi lời chào. Các hàm:
- `save_profile(band, weak[], note)` — cập nhật hồ sơ người học.
- `save_speaking_result(...)` — ghi kết quả thi thử Speaking.
Âm vào: PCM 16 kHz. Âm ra: PCM 24 kHz phát qua Web Audio và cấp cho HeadAudio (viseme).
**Luật ngôn ngữ** nằm ở đầu và cuối `livePrompt()`; thêm bộ chặn `FOREIGN` (regex chữ Hán/Nhật/Hàn/Thái/Nga/Ả Rập/Hindi): gặp trong lời Sam → cắt tiếng + gửi nhắc "nói lại bằng tiếng Anh".

## Dữ liệu trên máy (`localStorage`)
| Khoá | Nội dung |
|---|---|
| `gs_key` | Khoá Gemini của người dùng (không bao giờ vào repo) |
| `gs_model`, `gs_about` | Model; mô tả người dùng cho Sam (chỉ trên máy) |
| `ie_profile`, `ie_hist`, `ie_mode`, `ie_unit`, `ie_scores`, `ie_tests` | Hồ sơ band, lịch sử chat, chế độ, bài đang học, điểm, bài thi |
| `dn`, `wx`, `kv` | Buổi, thời tiết, khu vực (`auto` hoặc giá trị chọn tay) |
| `dh` | Đã hiện gợi ý "kéo để xoay" |
| `gs_ptt`, `gs_corr`, `gs_speed` | Cài đặt: Giữ nút để nói; mức sửa lỗi chế độ Học (`now`/`light`/`end`); tốc độ nói của Sam (`slow`/`normal`/`fast`) |
| `gs_mis` | Kết quả nhập vai `{id: {date, met, total, hints}}` |
| `gs_days` | Các ngày có học (`YYYY-MM-DD`, ≤ 400) để tính chuỗi ngày |
| `gs_lmem` | Trí nhớ chế độ Học (≤ 30 ghi chú) |
| `gs_mem`, `gs_phr`, `gs_hsk` | Trí nhớ Tâm sự; câu sai Cục súc; tiến độ HSK3 (mỗi loại ≤ 30 ghi chú) |
| `gs_vocab`, `gs_reflex`, `gs_road` | Sổ từ; nhật ký phản xạ; tab lộ trình đang mở |
| `gs_fix` | Sổ lỗi từ buổi gọi `{w, b, why, box, due}` (≤ 200), ôn cách quãng như sổ từ |
| `gs_real` | Điểm thi IELTS thật người học tự nhập `{date, kind, band}` |
| `gs_exam`, `gs_target` | Kỳ thi đang luyện; đích đến đang xem trong bảng điểm |
| `gs_mem_de`, `gs_mem_ko`, `gs_mem_ja`, `gs_mem_tw` | Trí nhớ từng ngôn ngữ thứ hai (≤ 30 ghi chú) |

## Dữ liệu tĩnh (`data/*.js`, nạp bằng `<script>` trước app, gán `window.SAM_DATA`)
| Tệp | Nội dung | Nguồn |
|---|---|---|
| `data/exams.js` | Dạng bài Nói/Viết, thời gian, tiêu chí (diễn đạt lại), thang điểm, khuôn thẻ `<score2>` của IELTS GT, TOEFL 2026, PTE, DET | Trang chính thức ETS/Pearson/Duolingo/IELTS (link trong tệp) |
| `data/targets.js` | Điểm cần theo đích đến (định cư, du học, đi làm), `verified:false` khi nguồn bên thứ ba | IRCC, Home Affairs (qua bản sao), GOV.UK, make-it-in-germany… |
| `data/missions.js` | 12 nhiệm vụ nhập vai: vai của Sam (EN), mục tiêu + 3 mốc (VI), cấp A2–B2 | Tự soạn (khuôn "nhiệm vụ" học từ Immergo, Apache-2.0 — chỉ ý tưởng, không chép mã) |
| `data/langs.js` | Lời dặn + mã giọng + chữ viết được phép cho Đức/Hàn/Nhật/Đài | goethe.de, topik.go.kr, jlpt.jp, jpf, tocfl |
| `data/us-civics.js` | 128 câu civics 2025, đáp án chấp nhận, danh sách từ đọc/viết | uscis.gov (tài liệu công) |

Gọi REST trả JSON (`geminiJSON`, `responseMimeType: application/json`): tóm tắt sau buổi gọi (`summarizeCall`), chấm phát âm từ ghi âm (`pronCheck`, chuẩn hoá thành WAV mono 16 kHz rồi gửi `inline_data`; không giải mã được mới gửi blob gốc). Model ghim → 404 lùi bí danh như chat.

Công cụ gọi thoại thêm: `complete_mission(met, total, feedback)`, `show_card(title, text)`, `start_timer(label, prep_seconds, speak_seconds, kind, target_text)`, `save_exam_result(skill, overall, low, high, feedback)`.
Mỗi lần đọc/ghi bọc `try/catch` (chế độ riêng tư có thể chặn).

## Khu vực (`REGIONS`)
Hà Nội, Sa Pa, Hải Phòng (Bắc) · Huế, Đà Nẵng, Nha Trang (Trung) · Đà Lạt, TP.HCM, Cần Thơ, Phú Quốc (Nam). Mã WMO → kiểu: ≥95 giông; 51–67 & 80–82 mưa; 71–77, 85, 86 tuyết; 45, 48 sương; còn lại quang.
