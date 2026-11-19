## Mục tiêu & phạm vi

- **Thay đổi gì / vì sao:**
- **Ảnh hưởng:** Student UI / Teacher UI / Backend / Docs / Khác
- **Routes / components / API liên quan:**
- **Ngoài phạm vi:**

## Kiểm tra

- [ ] Đã đối chiếu yêu cầu/ADR và tái sử dụng code phù hợp
- [ ] Không thay đổi nghiệp vụ hoặc dữ liệu ngoài phạm vi PR
- [ ] Đã chạy test/lint/build phù hợp, **hoặc** ghi rõ lý do chưa chạy

**Lệnh và kết quả thực tế (ghi rõ những gì chưa kiểm tra):**

## Student UI design review — *chỉ hoàn thành nếu PR ảnh hưởng Student UI*

> Quy trình: [Student UI Governance](../.agent/ui/STUDENT_UI_GOVERNANCE.md). Mẫu: [Student Page Brief](../.agent/ui/templates/STUDENT_PAGE_BRIEF_TEMPLATE.md). Chọn **N/A và giải thích** nếu PR không tác động Student.

- [ ] Screen Brief có user goal, route, archetype, primary action và data source (mới/redesign: đính kèm brief đầy đủ)
- [ ] Page Visual Brief có visual purpose, reuse, mobile fallback và a11y **hoặc** nêu rõ lý do miễn trừ
- [ ] Dùng token/typography/shared patterns và art direction Indie Illustrated Scrapbook; không tạo palette hay mascot riêng
- [ ] Dùng đúng dữ liệu thật; không dựng progress, XP, streak hoặc học liệu giả
- [ ] Trạng thái loading / empty / filtered-empty / error / disabled / success được xử lý khi áp dụng
- [ ] Điều hướng/keyboard/focus/alt text/contrast/reduced motion được kiểm tra theo mức độ ảnh hưởng
- [ ] Đã review viewport thực (360/390/768/1024/1440px), **hoặc** ghi rõ chưa làm
- [ ] Asset mới có registry/provenance/license/attribution được phê duyệt **hoặc** N/A
- [ ] Teacher/shared components/portals không bị ảnh hưởng ngoài ý muốn **hoặc** N/A
- [ ] Đính kèm screenshot trước/sau đối với thay đổi hình ảnh đáng kể **hoặc** nêu lý do chưa có

**Brief link hoặc nội dung tóm tắt:**

**Screenshot / kiểm tra responsive / regression:**

**Ngoại lệ, chưa kiểm tra, P0/P1/P2 và người theo dõi:**

> Checklist này là **bước review thủ công**, không có CI/branch-protection tự động xác nhận. Đừng đánh dấu đạt cho các kiểm tra chưa chạy.
