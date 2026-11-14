// Điểm cần theo đích đến. Nạp bằng <script> thường, trước script của app.
// skills = điểm tối thiểu từng kỹ năng {L: nghe, R: đọc, W: viết, S: nói}; null = chỉ có điểm tổng.
// verified:false = nguồn bên thứ ba / đoạn trích tìm kiếm / dữ liệu mẫu, cần kiểm lại trang chính thức.
window.SAM_DATA = window.SAM_DATA || {};

window.SAM_DATA.targets = [
  // ---------- Định cư: Canada ----------
  {
    id: 'ca-express-entry-clb7',
    group: 'dinh-cu',
    label: 'Canada Express Entry (FSW) — CLB 7',
    note: 'CEC: CLB 7 cho việc TEER 0–1, CLB 5 cho TEER 2–3. Điểm phải dưới 2 năm tuổi; không nhận IELTS thi lại một kỹ năng.',
    tests: [
      { test: 'IELTS General', overall: null, skills: { L: 6.0, R: 6.0, W: 6.0, S: 6.0 }, scale: 'band 0–9' },
      { test: 'CELPIP', overall: null, skills: { L: 7, R: 7, W: 7, S: 7 }, scale: '1–12 (= mức CLB)' },
      { test: 'PTE Core', overall: null, skills: { L: 60, R: 60, W: 69, S: 68 }, scale: '10–90' }
    ],
    src: [
      'https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry/who-can-apply.html',
      'https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry/documents/language-requirements/language-testing.html'
    ],
    verified: true
  },
  {
    id: 'ca-express-entry-fst',
    group: 'dinh-cu',
    label: 'Canada Express Entry diện tay nghề (FST)',
    note: 'CLB 5 nghe/nói, CLB 4 đọc/viết. Chưa có bảng PTE Core cho mức CLB 5.',
    tests: [
      { test: 'IELTS General', overall: null, skills: { L: 5.0, R: 3.5, W: 4.0, S: 5.0 }, scale: 'band 0–9' },
      { test: 'CELPIP', overall: null, skills: { L: 5, R: 4, W: 4, S: 5 }, scale: '1–12 (= mức CLB)' }
    ],
    src: [
      'https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry/who-can-apply.html',
      'https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry/documents/language-requirements/language-testing.html'
    ],
    verified: true
  },
  {
    id: 'ca-aip-teer0-3',
    group: 'dinh-cu',
    label: 'Canada AIP (Đại Tây Dương) — việc TEER 0–3, CLB 5',
    note: 'Mức CLB lấy từ đoạn trích tìm kiếm trang IRCC, chưa mở được trang; đổi điểm theo bảng CLB của IRCC.',
    tests: [
      { test: 'IELTS General', overall: null, skills: { L: 5.0, R: 4.0, W: 5.0, S: 5.0 }, scale: 'band 0–9' },
      { test: 'CELPIP', overall: null, skills: { L: 5, R: 5, W: 5, S: 5 }, scale: '1–12 (= mức CLB)' }
    ],
    src: [
      'https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/atlantic-immigration/how-to-immigrate/eligibility.html',
      'https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry/documents/language-requirements/language-testing.html'
    ],
    verified: false
  },
  {
    id: 'ca-aip-teer4',
    group: 'dinh-cu',
    label: 'Canada AIP (Đại Tây Dương) — việc TEER 4, CLB 4',
    note: 'Mức CLB lấy từ đoạn trích tìm kiếm trang IRCC, chưa mở được trang; đổi điểm theo bảng CLB của IRCC.',
    tests: [
      { test: 'IELTS General', overall: null, skills: { L: 4.5, R: 3.5, W: 4.0, S: 4.0 }, scale: 'band 0–9' },
      { test: 'CELPIP', overall: null, skills: { L: 4, R: 4, W: 4, S: 4 }, scale: '1–12 (= mức CLB)' },
      { test: 'PTE Core', overall: null, skills: { L: 28, R: 33, W: 41, S: 42 }, scale: '10–90' }
    ],
    src: [
      'https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/atlantic-immigration/how-to-immigrate/eligibility.html',
      'https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry/documents/language-requirements/language-testing.html'
    ],
    verified: false
  },

  // ---------- Định cư: Úc (bài thi chấm điểm 189/190/491, thi từ 7/8/2025) ----------
  {
    id: 'au-skilled-competent',
    group: 'dinh-cu',
    label: 'Úc tay nghề (189/190/491) — Competent',
    note: 'Mức tối thiểu để nộp, 0 điểm cộng. Điểm thi có giá trị 3 năm; không nhận bài thi tại nhà.',
    tests: [
      { test: 'IELTS Academic', overall: null, skills: { L: 6, R: 6, W: 6, S: 6 }, scale: 'band 0–9 (Academic hoặc General)' },
      { test: 'PTE Academic', overall: null, skills: { L: 47, R: 48, W: 51, S: 54 }, scale: '10–90' },
      { test: 'TOEFL iBT', overall: null, skills: { L: 16, R: 16, W: 19, S: 19 }, scale: '0–30 mỗi phần (chọn "TOEFL for Australia")' },
      { test: 'CELPIP', overall: null, skills: { L: 7, R: 7, W: 7, S: 7 }, scale: '1–12' },
      { test: 'LanguageCert', overall: null, skills: { L: 57, R: 60, W: 64, S: 70 }, scale: 'LanguageCert Academic' },
      { test: 'Cambridge', overall: null, skills: { L: 163, R: 163, W: 170, S: 179 }, scale: 'C1 Advanced, thang Cambridge English' },
      { test: 'Michigan MET', overall: null, skills: { L: 56, R: 55, W: 57, S: 48 }, scale: 'MET' },
      { test: 'OET', overall: null, skills: { L: 290, R: 310, W: 290, S: 330 }, scale: 'OET' }
    ],
    src: ['https://www.legislation.gov.au/F2025L00905/asmade/2025-08-06/text/original/pdf'],
    verified: true
  },
  {
    id: 'au-skilled-proficient',
    group: 'dinh-cu',
    label: 'Úc tay nghề (189/190/491) — Proficient (+10 điểm)',
    note: 'Cộng 10 điểm vào bài chấm điểm định cư.',
    tests: [
      { test: 'IELTS Academic', overall: null, skills: { L: 7, R: 7, W: 7, S: 7 }, scale: 'band 0–9 (Academic hoặc General)' },
      { test: 'PTE Academic', overall: null, skills: { L: 58, R: 59, W: 69, S: 76 }, scale: '10–90' },
      { test: 'TOEFL iBT', overall: null, skills: { L: 22, R: 22, W: 26, S: 24 }, scale: '0–30 mỗi phần (chọn "TOEFL for Australia")' },
      { test: 'CELPIP', overall: null, skills: { L: 9, R: 8, W: 10, S: 8 }, scale: '1–12' },
      { test: 'LanguageCert', overall: null, skills: { L: 67, R: 71, W: 78, S: 82 }, scale: 'LanguageCert Academic' },
      { test: 'Cambridge', overall: null, skills: { L: 175, R: 179, W: 193, S: 194 }, scale: 'C1 Advanced, thang Cambridge English' },
      { test: 'Michigan MET', overall: null, skills: { L: 61, R: 63, W: 74, S: 59 }, scale: 'MET' },
      { test: 'OET', overall: null, skills: { L: 350, R: 360, W: 380, S: 360 }, scale: 'OET' }
    ],
    src: ['https://www.legislation.gov.au/F2025L00905/asmade/2025-08-06/text/original/pdf'],
    verified: true
  },
  {
    id: 'au-skilled-superior',
    group: 'dinh-cu',
    label: 'Úc tay nghề (189/190/491) — Superior (+20 điểm)',
    note: 'Cộng 20 điểm. MET không được dùng cho mức này.',
    tests: [
      { test: 'IELTS Academic', overall: null, skills: { L: 8, R: 8, W: 8, S: 8 }, scale: 'band 0–9 (Academic hoặc General)' },
      { test: 'PTE Academic', overall: null, skills: { L: 69, R: 70, W: 85, S: 88 }, scale: '10–90' },
      { test: 'TOEFL iBT', overall: null, skills: { L: 26, R: 27, W: 30, S: 28 }, scale: '0–30 mỗi phần (chọn "TOEFL for Australia")' },
      { test: 'CELPIP', overall: null, skills: { L: 10, R: 10, W: 12, S: 10 }, scale: '1–12' },
      { test: 'LanguageCert', overall: null, skills: { L: 80, R: 83, W: 89, S: 89 }, scale: 'LanguageCert Academic' },
      { test: 'Cambridge', overall: null, skills: { L: 186, R: 190, W: 210, S: 208 }, scale: 'C1 Advanced, thang Cambridge English' },
      { test: 'OET', overall: null, skills: { L: 390, R: 400, W: 420, S: 400 }, scale: 'OET' }
    ],
    src: ['https://www.legislation.gov.au/F2025L00905/asmade/2025-08-06/text/original/pdf'],
    verified: true
  },

  // ---------- Đi làm ----------
  {
    id: 'au-482-skills-in-demand',
    group: 'di-lam',
    label: 'Úc visa 482 Skills in Demand',
    note: 'Không có điểm tổng, chỉ xét từng kỹ năng; thi trong vòng 3 năm. Có diện miễn (vd. 5 năm học bằng tiếng Anh).',
    tests: [
      { test: 'IELTS Academic', overall: null, skills: { L: 5.0, R: 5.0, W: 5.0, S: 5.0 }, scale: 'band 0–9 (Academic hoặc General)' },
      { test: 'PTE Academic', overall: null, skills: { L: 33, R: 36, W: 29, S: 24 }, scale: '10–90' },
      { test: 'TOEFL iBT', overall: null, skills: { L: 8, R: 8, W: 9, S: 14 }, scale: '0–30 mỗi phần' },
      { test: 'CELPIP', overall: null, skills: { L: 5, R: 5, W: 5, S: 5 }, scale: '1–12' },
      { test: 'LanguageCert', overall: null, skills: { L: 41, R: 44, W: 45, S: 54 }, scale: 'LanguageCert Academic' },
      { test: 'Michigan MET', overall: null, skills: { L: 49, R: 47, W: 45, S: 38 }, scale: 'MET' },
      { test: 'OET', overall: null, skills: { L: 220, R: 240, W: 200, S: 270 }, scale: 'OET' }
    ],
    src: ['https://www.legislation.gov.au/F2025L01066/asmade/2025-09-10/text/original/pdf'],
    verified: true
  },
  {
    id: 'uk-skilled-worker',
    group: 'di-lam',
    label: 'Anh Skilled Worker',
    note: 'B2 cho hồ sơ mới từ 8/1/2026 (gia hạn visa cũ vẫn B1). Phải là bài thi SELT; điểm dưới 2 năm.',
    tests: [
      { test: 'IELTS for UKVI', overall: 'B2', skills: null, scale: 'CEFR' },
      { test: 'PTE Academic', overall: 'B2', skills: null, scale: 'CEFR (bản PTE Academic UKVI)' },
      { test: 'LanguageCert', overall: 'B2', skills: null, scale: 'CEFR (Academic/General SELT)' },
      { test: 'PSI Skills for English', overall: 'B2', skills: null, scale: 'CEFR (bản UKVI, thi ngoài nước Anh)' }
    ],
    src: [
      'https://www.gov.uk/skilled-worker-visa/knowledge-of-english',
      'https://www.gov.uk/guidance/prove-your-english-language-abilities-with-a-secure-english-language-test-selt'
    ],
    verified: true
  },
  {
    id: 'de-chancenkarte',
    group: 'di-lam',
    label: 'Đức Chancenkarte (thẻ cơ hội)',
    note: 'Cần tiếng Đức A1 hoặc tiếng Anh B2; tiếng Đức B2 được 3 điểm, B1 2 điểm, A2 1 điểm, tiếng Anh C1 1 điểm. Danh sách bài thi tiếng Anh được nhận chưa kiểm.',
    tests: [
      { test: 'Goethe (tiếng Đức)', overall: 'A1', skills: null, scale: 'CEFR' },
      { test: 'Tiếng Anh (chứng chỉ được công nhận)', overall: 'B2', skills: null, scale: 'CEFR' }
    ],
    src: [
      'https://www.gesetze-im-internet.de/aufenthg_2004/__20a.html',
      'https://www.gesetze-im-internet.de/aufenthg_2004/anlage.html'
    ],
    verified: true
  },
  {
    id: 'de-ausbildung',
    group: 'di-lam',
    label: 'Đức Ausbildung (học nghề kép)',
    note: 'Trừ khi trường đã tự kiểm tra trình độ hoặc chương trình có khoá học dự bị.',
    tests: [
      { test: 'Goethe (tiếng Đức)', overall: 'B1', skills: null, scale: 'CEFR' }
    ],
    src: ['https://www.gesetze-im-internet.de/aufenthg_2004/__16a.html'],
    verified: true
  },
  {
    id: 'de-blue-card',
    group: 'di-lam',
    label: 'Đức Thẻ xanh EU (Blue Card)',
    note: 'Không cần chứng chỉ ngoại ngữ để nhận thẻ; thường trú sau 27 tháng nếu có tiếng Đức A1, hoặc 21 tháng nếu có B1.',
    tests: [],
    src: ['https://www.gesetze-im-internet.de/aufenthg_2004/__18c.html'],
    verified: true
  },
  {
    id: 'us-eb3-niw-eb5',
    group: 'dinh-cu',
    label: 'Mỹ EB-3 / EB-2 NIW / EB-5',
    note: 'Visa không yêu cầu bài thi tiếng Anh (chưa có trang chính thức xác nhận); sau này thi quốc tịch có phỏng vấn tiếng Anh: đọc, viết 1 trong 3 câu và hỏi đáp công dân.',
    tests: [],
    src: ['https://www.uscis.gov/citizenship/learn-about-citizenship/the-naturalization-interview-and-test'],
    verified: false
  },

  // ---------- Du học ----------
  {
    id: 'study-english-typical',
    group: 'du-hoc',
    label: 'Du học trường nói tiếng Anh — mức thường gặp',
    note: 'Lấy từ mẫu 73 trường (IELTS thường 5.0–6.5, hay gặp nhất 6.0); mỗi trường, mỗi ngành tự đặt mức, phải xem trang trường.',
    tests: [
      { test: 'IELTS Academic', overall: 6.0, skills: null, scale: 'band 0–9 (thường 5.0–6.5)' },
      { test: 'TOEFL iBT', overall: 60, skills: null, scale: '0–120 thang cũ (thường 51–67); thang mới 1–6 theo ETS: IELTS 6.0 ≈ 4, 6.5 ≈ 4.5, 7.0 ≈ 5' },
      { test: 'PTE Academic', overall: 50, skills: null, scale: '10–90 (thường 46–52)' },
      { test: 'Duolingo English Test', overall: 105, skills: null, scale: '10–160 (thường 95–105)' }
    ],
    src: ['https://www.mx.ets.org/content/dam/ets-org/pdfs/toefl/score-scale-update-2026.pdf'],
    verified: false
  },
  {
    id: 'study-taiwan-1plus4',
    group: 'du-hoc',
    label: 'Du học Đài Loan chương trình 1+4',
    note: 'Đạt A2 hết năm dự bị, B1 để lên năm 2; trượt A2 có trường buộc thôi học. Theo tài liệu bàn giao trường, chưa kiểm trang chính thức.',
    tests: [
      { test: 'TOCFL', overall: 'A2 → B1', skills: null, scale: 'CEFR' }
    ],
    src: [],
    verified: false
  },
  {
    id: 'study-korea-vocational',
    group: 'du-hoc',
    label: 'Du học Hàn Quốc (cao đẳng nghề)',
    note: 'Cần tiếng Hàn, mức TOPIK tùy từng trường; chưa có số liệu cụ thể.',
    tests: [
      { test: 'TOPIK', overall: null, skills: null, scale: 'TOPIK I–II, mức tùy trường' }
    ],
    src: [],
    verified: false
  }
];

window.SAM_DATA.targetsAsOf = '2026-11-14';
