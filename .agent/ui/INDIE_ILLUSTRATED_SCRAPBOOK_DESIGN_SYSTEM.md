# Indie Illustrated Scrapbook — Visual Design Rules

**Visual identity:** Hand Drawn × Hipness Purgatory  
**Status:** Canonical visual specification (ADR 0032).  
**Purpose:** The single Student visual identity under ADR 0032. Proposed v2 governance (sections 12 onward) records design constraints for future pages; it is not an implementation claim. Route/domain decisions stay in architecture and specs. See STUDENT_VISUAL_STORYTELLING.md, STUDENT_PAGE_ARCHETYPES.md and STUDENT_DESIGN_SYSTEM_V2_PHASE_0_AUDIT.md.

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
| Body/UI | Plus Jakarta Sans | Văn bản, form, điều hướng, thông tin quan trọng |
| Typewriter | Courier Prime | Nhãn/metadata ngắn, seed, ngày tháng; không dùng cho đoạn văn dài |

### Quy chuẩn font-size (Student, rút từ nhịp Profile)

| Vai trò | Mobile | Desktop | Quy tắc |
|---|---:|---:|---|
| Page title | 30px | 36px | Handwriting/serif phù hợp; độ cao dòng 1.15 |
| Section title | 22px | 22px (current CSS) | Một tiêu điểm rõ ràng, không vượt page title |
| Card title | 18px | 18px (current CSS) | Plus Jakarta Sans đậm hoặc Patrick Hand ngắn |
| Body | 15px (Phase 2 Student CSS) | 15px (Phase 2 Student CSS) | Plus Jakarta Sans; tránh Typewriter cho văn bản thông thường |
| Field label / navigation | 13–14px | 13–14px | Plus Jakarta Sans semibold; không dùng Caveat |
| Metadata | 13px; caption 12px | 13px; caption 12px | Courier Prime; chữ ngắn, giữ độ tương phản |
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

### Implementation contract

- `styles/student/theme.css` is the only Student palette/token declaration layer.
  Literal color values belong in token declarations, not feature components or
  surface recipes.
- `styles/student/typography.css` owns the role scale. Feature code uses
  `student-page-title`, `student-section-title`, `student-card-title`,
  `student-body`, `student-label`, `student-meta`, `student-caption` and
  `student-stat`; it does not compose `text-xs`/`text-3xl` or arbitrary sizes.
- `components/student-ui`, `styles/student/surfaces.css` (legacy recipes) and the
  later-loaded `styles/student/foundations-v2.css` (Phase 2 semantic overrides) own repeatable paper,
  tape, control, field, progress, polaroid and dialog treatments. Fixed geometry
  is allowed inside these shared recipes; feature TSX must not copy it.
- Student Home, Profile, the complete Units branch and Rewards are standardized reference routes. Use
  their shared primitives for later route migration, not their page-specific
  composition or data layout.

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

## 12. Product-wide direction (v2 design proposal)

**One Student Experience. One Design Language. Many Learning Journeys.** The identity remains Indie Illustrated Scrapbook, interpreted as **A Personal Learning Journal**. "Editorial clarity" means predictable hierarchy, readability, spacing and interaction; it is **not** another aesthetic palette or a second style.

- Every Student page, including future ones, uses the same scoped semantic tokens, typography roles, surface grammar, illustration identity and accessibility standard.
- Archetype determines content composition, density and focus only; it does not create a new theme. Refer to STUDENT_PAGE_ARCHETYPES.md.
- The website should feel alive without feeling crowded: mascot, contextual imagery, meaningful SVG and real-data visualizations share the page with quiet, readable content.
- Consistency is in the rules and component semantics, **not** in identical page shapes. Avoid "hero + mascot on right + 3 KPI cards" everywhere.
- Teacher remains separately styled. Existing immersive Activity/Assessment/Game interactions are functional exceptions, not new visual brands.

## 13. Surface hierarchy & decoration policy (v2)

Use one of these **semantic roles** regardless of PaperSurface material variant:

| Role | Purpose | Visual intensity |
|---|---|---|
| Canvas | Overall page background | Quiet cream, optional very subtle texture |
| Reading / Content | Learning text, input, large data lists | High legibility, flat/light border, no default pop shadow |
| Feature | Intentional primary focus (one at a time) | Paper/ink outline and shadow-pop when earned |
| Accent / State | Important reward, notice or contextual annotation | Controlled contrast, semantic label, no competing CTA |
| Immersive stage | Single task/game canvas | Can use illustration/background; prompt/input stay readable |

**Rule:** Material (plain/lined/kraft) is NOT importance. Do not equate every paper card with Feature elevation. Never stack strong ink borders, pop shadows and washi across nested surfaces. Limit each visually grouped composition to one dominant decorative treatment; simplify others with spacing/dividers.

Existing PaperSurface/surfaces.css applies a strong border/shadow broadly. This is documented migration debt for Phase 2, not a change made by this phase.

## 14. Page visuals (v2)

Follow STUDENT_VISUAL_STORYTELLING.md. Each ordinary Student page must specify a meaningful **visual anchor** (approved Pipo, thematic scene, lesson/Unit art, identity avatar, useful diagram or truthful data visualization). Its place can be within content, a header or an empty/result state; it need not be a hero.

For high-focus Assessment/Workspace, a brief may explicitly choose "no decorative anchor" to protect the task. No mandatory mascot quota. A large Lucide icon alone does not automatically satisfy an illustration need.

Pipo and SVG language are shared across pages. Do not create page-local mascot identities, reuse unrelated stock photography or invent educational data to decorate a layout. All visuals have a mobile composition, alt/decorative semantics, asset provenance and reduced-motion handling.

## 15. Typography, density and target validation (v2)

Current **implemented** roles are in styles/student/typography.css and theme.css (with Phase 2 Student-only 15px body / 16px reading roles). Plus Jakarta Sans is the actual body font; Patrick Hand is heading handwriting; Caveat is decorative; Courier Prime is short typewriter metadata. The preceding size table has been aligned with current CSS to avoid treating targets as implementation.

**Phase 2 candidate targets (NOT implemented):** body copy generally 15–16px after testing, supporting metadata >=12px, headings shorter and visually restrained. Long educational instructions and reading passages must not be set in handwriting or typewriter fonts. Do not globally change --app-font-body-size (Teacher also consumes it); target Student-scoped roles after contrast/spacing/browser validation.

Density comes from archetype: collection may be compact while reading and assessment require comfortable scanning, but targets remain >=44px and text must not shrink merely to fit more widgets. Mobile reduction order: remove decoration -> simplify secondary metadata -> reflow layout; never hide essential controls/content.

## 16. Component & asset governance (v2)

- Foundations and visual recipes belong in styles/student/*.css and components/student-ui, scoped to Student. Avoid importing a new feature-specific design language or hardcoding colors into feature pages.
- Shared components expose semantic variants (purpose, density, state) instead of raw paper styling or arbitrary colors.
- Reuse source-owned imagery when meaningful; create art only for a documented semantic gap. Keep an asset manifest, rights/source and mobile variants when Phase 3 produces new files.
- Visuals are not allowed to compete with important learning input, scoring feedback, keyboard focus or recovery actions.
- One feature's new component or asset must be checked against at least one other archetype for reuse potential, without forcing all pages into a single giant component.

## 17. New Student page quality gate (v2)

Before code: write a Screen Brief (UI_ARCHITECTURE_GUIDELINES.md), choose the archetype (STUDENT_PAGE_ARCHETYPES.md), and write a Page Visual Brief (STUDENT_VISUAL_STORYTELLING.md). Inspect reusable assets and existing Student primitives. For each page confirm:

- [ ] Clear goal, primary action and content priority within the first viewport.
- [ ] Single visual identity; purposeful anchor or a justified high-focus exception.
- [ ] Quiet reading surfaces, purposeful feature emphasis; no nested decorative overload.
- [ ] Typography roles, safe text length and translation support.
- [ ] Mobile 360/390px, 768px, 1024px and desktop composition; touch targets >=44px.
- [ ] Loading, empty/filtered-empty, error, disabled, success and result feedback are truthful.
- [ ] Accessible image meaning, keyboard/focus, contrast and reduced-motion behavior.
- [ ] Teacher visual isolation and portal overlay regression.
- [ ] No invented API, entity, score, content or route.
- [ ] Design intent vs implemented CSS/runtime and tests are reported separately.

**Version boundary:** Sections 12–17 govern the v2 direction. Phase 2 implements Student-scoped type roles, surface emphasis, controls/fields and a development-only preview, with source-level checks; authenticated device, accessibility and Teacher regression QA remain to be executed. Phase 3 artwork and Phase 4 page archetypes are separate.
