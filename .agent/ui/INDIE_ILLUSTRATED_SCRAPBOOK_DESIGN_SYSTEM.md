# Indie Illustrated Scrapbook — Visual Design Rules

**Visual identity:** Hand Drawn × Hipness Purgatory  
**Status:** Canonical visual specification (ADR 0032).  
**Purpose:** Rules about what the design looks and feels like. This file does **not** define routes, frontend architecture, backend data or migration plans.

## 1. Triết lý & DNA cốt lõi

**Indie Illustrated Scrapbook** là điểm giao thoa giữa hai trường phái:

- **Hand Drawn:** nét vẽ mực, chì và màu nước tạo cảm giác thủ công, ấm áp, giàu dấu vết con người.
- **Hipness Purgatory / indie-twee (2004–2012):** tinh thần hoài niệm, giấy kraft, collage, ảnh polaroid, băng keo washi, vé giấy, dấu mực và nhãn máy đánh chữ.
- **Digital Wabi-Sabi:** sự bất toàn **có chủ đích** trong vật liệu, đường viền, độ lệch rất nhẹ. Bố cục, dữ liệu và khả năng đọc vẫn phải chính xác.

**North star:** Giao diện như một cuốn sổ tay cá nhân được cắt dán cẩn thận, không phải SaaS dashboard bóng bẩy hay trò chơi neon.

## 2. Nguyên tắc thị giác

1. **Paper first:** bề mặt giấy ngà và mực than ấm là nhận diện mặc định.
2. **Ink over glow:** nét mực, lớp giấy và bóng đổ ngắn thay vì gradient/glow bóng bẩy.
3. **Deliberate imperfection:** nét lệch nhẹ được kiểm soát; tuyệt đối không random layout trong runtime.
4. **Readable core:** nội dung học, bảng, biểu mẫu, điều hướng rõ ràng và thẳng hàng.
5. **Purposeful decoration:** tape, ghim, stamp, doodle gợi ý quan hệ/ý nghĩa, không xuất hiện vô cớ.
6. **One focal moment:** một điểm nhấn thị giác có chủ đích, phần còn lại tiết chế.
7. **Cohesion:** dùng cùng ngôn ngữ giấy, bút, icon và chất liệu trong một giao diện.

## 3. Surfaces & textures

| Vật liệu | Cảm giác | Thể hiện |
|---|---|---|
| Cream sketch paper | Giấy nền mịn, hơi ngà | Canvas, grain rất nhẹ |
| Warm parchment | Tờ giấy đọc | Nội dung và forms |
| Kraft paper | Bìa dày, màu đất | Thẻ phụ hoặc nhãn |
| Notebook/grid | Giấy kẻ dòng hoặc ô ly | Khối ghi chú, độ tương phản thấp |
| Torn paper | Mép giấy xé có chủ đích | Đoạn nhấn hoặc ghi chú |
| Washi/paperclip/stamp | Vật gắn thủ công | Tối đa một loại nhấn chính mỗi cụm |
| Polaroid | Ảnh in kỷ niệm | Khung hình với đáy giấy dày hơn |

Giữ grain thật mịn, không phủ texture lên chữ. Tránh chồng grid, mép xé, tape và stamp trên cùng một card. Chỉ dùng texture khi nó thêm ý nghĩa; không biến mọi thành phần thành vật trang trí.

## 4. Earthy & Indie palette

| Role | Tên | Reference |
|---|---|---|
| Canvas | Cream Paper | #F7F4EB |
| Reading paper | Warm Parchment | #FFFDF9 |
| Kraft | Kraft Tan | #E8DEC8 |
| Main ink | Charcoal Graphite | #2D2B2A |
| Supporting ink | Muted Pencil | #6E6863 |
| Warm emphasis | Indie Mustard | #D99B26 |
| Emphasis | Terracotta Clay | #C85A32 |
| Positive | Sage Olive | #6B8E67 |
| Informational | Faded Denim | #4A6B82 |
| Washi/highlight | Washi Yellow | rgba(243, 232, 142, 0.7) |

- Không dùng pure white/black làm **bản sắc mặc định**; không cấm chúng cho hình ảnh, xuất dữ liệu hoặc nhu cầu accessibility.
- Giấy và mực chiếm phần lớn màn hình; màu nhấn giới hạn, không biến mọi thẻ thành một màu.
- Không dùng màu cho trạng thái mà không có icon/label tương ứng.
- Kiểm tra contrast thực tế: chữ thường ≥4.5:1, chữ lớn ≥3:1; UI boundary có ý nghĩa ≥3:1.
- Palette trên là **reference**; token production và cặp màu nền/chữ cần kiểm chứng trước khi dùng.

## 5. Typography

| Vai trò | Font tham chiếu | Cách dùng |
|---|---|---|
| Display handwriting | Patrick Hand | Tiêu đề và lời chào ngắn, mặc định không quá 36px |
| Decorative handwriting | Caveat | Ghi chú hoặc caption ảnh, không dùng cho input |
| Body/UI | Nunito | Văn bản, form, điều hướng, thông tin quan trọng |
| Typewriter | Courier Prime | Nhãn/metadata ngắn, seed, ngày tháng; không dùng cho đoạn văn dài |

### Quy chuẩn font-size (Student, rút từ nhịp Profile)

| Vai trò | Mobile | Desktop | Quy tắc |
|---|---:|---:|---|
| Page title | 30px | 36px | Handwriting/serif phù hợp; độ cao dòng 1.15 |
| Section title | 22px | 26px | Một tiêu điểm rõ ràng, không vượt page title |
| Card title | 18px | 20px | Nunito đậm hoặc Patrick Hand ngắn |
| Body | 14px | 16px | Nunito; tránh Typewriter cho văn bản thông thường |
| Field label / navigation | 13–14px | 13–14px | Nunito semibold; không dùng Caveat |
| Metadata | 11–12px | 11–12px | Courier Prime; chữ ngắn, giữ độ tương phản |
| Stats / numeric emphasis | 24px | 28px | Tabular nums, không dùng chữ viết tay cho số |

- Trang Profile là **mốc tham chiếu mật độ nội dung**. Home không được phóng đại heading chỉ để giống giao diện game.
- Dùng `student-page-title`, `student-section-title`, `student-card-title` thay cho tổ hợp `text-5xl` / `text-6xl` tự phát.
- Điều chỉnh kiểu chữ theo vai trò qua `styles/student/typography.css`, không sửa `:root` hoặc font Teacher.
- Phần profile và form cần rõ, thẳng hàng và cỡ chữ ổn định. Trang Activity có thể có scale riêng nhưng phải có lý do chức năng.

- Không dùng chữ viết tay cho đoạn văn dài, dữ liệu và biểu mẫu.
- Chỉ một font handwriting chủ đạo trong một khu vực.
- Typewriter làm accent, không phải font mặc định cho bài đọc.
- Đảm bảo fallback cho tiếng Việt/Anh, không tự động thay font khi thiếu dấu.
- Các heading có thể dùng gạch mực, nét bút sáp hoặc marker nhẹ, không lạm dụng.

## 6. Linework & geometry

**Wobbly border:** dùng đường viền mực hơi không đều hoặc SVG path cho các hình minh họa/khung đặc trưng, không cho tất cả input, table và divider.

**Asymmetric border radius** (công thức tham khảo):

~~~css
/* Scrapbook note */
border-radius: 22px 8px 20px 6px / 8px 20px 6px 22px;

/* Handcrafted button */
border-radius: 20px 4px 18px 6px / 4px 18px 6px 20px;

/* Washi strip */
border-radius: 2px 8px 3px 6px;
~~~

**Micro-rotation:** ±0.8° đến ±2° cho paper note và polaroid; giới hạn 2.5°. Không nghiêng bảng, trường nhập, vùng văn bản dài hoặc dialog.

**Depth:** shadow ngắn như cạnh giấy nổi. Không dùng blur/glow lớn; không tạo shadow cho mọi lớp nested.

## 7. Visual component recipes

### Washi-taped card
Một tờ giấy mỏng với viền mực hơi bất đối xứng, một dải băng washi đặt cạnh; hover có thể làm thẳng nhẹ và nâng bóng. Không che text hay nút.

### Polaroid
Khung ảnh màu giấy, padding đáy lớn hơn cạnh trên, caption chữ tay ngắn. Ảnh vẫn giữ đúng tỷ lệ.

### Handcrafted button
Viền mực dày vừa đủ và bề mặt giấy/màu đất; trạng thái hover, pressed, focus và disabled khác biệt. Hình khối hơi mềm nhưng vùng bấm vẫn rõ ràng.

### Sketch progress
Đường viền như nét chì, fill gợi bút sáp. Độ dài phải tỷ lệ đúng với dữ liệu; luôn kèm số và đơn vị.

### Notebook section
Đường kẻ hoặc ô caro mờ, dùng cho ghi chú. Nội dung không bị chìm vào pattern.

### Paper tag / rubber stamp
Nhãn máy chữ hoặc dấu mực ở một số trạng thái/mốc có ý nghĩa; phần chữ phải luôn rõ ràng.

### Doodle annotation
Nét gạch chân, mũi tên, ngôi sao thủ công gợi ý điều cần chú ý. Không rải ở mọi góc.

## 8. Composition & visual rhythm

- Tập trung vào một khối trọng tâm rồi các tờ giấy phụ, như trang sổ tay.
- Dùng alignment, spacing và hierarchy chính xác; hiệu ứng không đều chỉ ở vật liệu.
- Không làm mọi phần tử thành card, không chồng quá nhiều viền lồng nhau.
- Trên màn hình nhỏ, giảm decoration trước khi giảm cỡ chữ hoặc đẩy layout ra ngoài viewport.

## 9. Motion & micro-interactions

- Cảm giác stop-motion có thể xuất hiện ở minh họa hoặc phần thưởng; tránh rung mọi nút thường xuyên.
- Wiggle ±1–2° trong 150–250ms, chỉ khi tương tác có ý nghĩa.
- Có thể dùng steps(3)/steps(4) ở animation ngắn, không áp đặt cho input, scroll, navigation.
- Không có confetti/bounce chạy liên tục hay âm thanh tự phát.
- Luôn hỗ trợ reduced motion; ý nghĩa trạng thái không phụ thuộc animation.

## 10. Do / Don't

| Do | Don't |
|---|---|
| Tờ giấy ngà, mực ấm, chất liệu gắn kết | Trắng lạnh / neon / 3D glossy làm chủ đạo |
| Imperfection nhỏ ở viền/note/polaroid | Nghiêng form, table hoặc chữ dài |
| Handwriting ở headline ngắn | Handwriting ở body và học liệu dài |
| Washi, stamp, doodle có lý do | Gắn sticker vào mọi card |
| Một khoảnh khắc nghệ thuật nổi bật | Cạnh tranh bằng hàng chục chi tiết |
| Focus, contrast, readable hierarchy | Đánh đổi khả năng dùng để có vintage effect |

## 11. Visual acceptance checklist

- [ ] Nhận diện rõ cả Hand Drawn và Hipness Purgatory mà không rối.
- [ ] Giấy ngà và mực ấm là visual foundation; màu nhấn có vai trò.
- [ ] Typography đúng vai trò, dễ đọc cả tiếng Việt và tiếng Anh.
- [ ] Các đường nét, rotation, washi, stamp được tiết chế và có ý nghĩa.
- [ ] Bố cục rõ ràng, một tiêu điểm; nội dung dữ liệu chính xác và dễ scan.
- [ ] Tương tác, focus, disabled, loading, error và success không bị hiệu ứng che khuất.
- [ ] Mobile, contrast, keyboard và reduced-motion được kiểm tra.

> Bất toàn ở chất liệu, chính xác ở trải nghiệm.
