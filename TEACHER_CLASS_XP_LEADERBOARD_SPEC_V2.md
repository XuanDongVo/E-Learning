# Teacher Classes — Bảng xếp hạng XP & Streak

> **Loại tài liệu:** Đặc tả sản phẩm, UI/UX và nghiệp vụ
> **Phạm vi:** Teacher → Lớp học → Chi tiết lớp → **Bảng xếp hạng XP**  
> **Route:** `/vi/teacher/classes/{classId}/ranking`  
> **Trạng thái:** Đặc tả để triển khai; không mô tả API mới là đã tồn tại  
> **Tham chiếu:** Teacher Class Detail hiện có, `ClassWorkspaceShell`, `ClassRankingView`, Student Gamification XP/Streak leaderboard.

## 1. Mục tiêu của trang

Trang giúp giáo viên **tra cứu thứ hạng và mức độ luyện tập của học sinh thuộc lớp đang xem** qua ba chỉ số:

1. **XP:** Điểm kinh nghiệm học sinh nhận được trong khoảng thời gian được chọn.
2. **Lượt Activity hoàn thành:** Số *session* có trạng thái `COMPLETED`, không phải số Activity khác nhau và không phải số lần bắt đầu.
3. **Streak:** Số ngày học liên tiếp **hiện tại và còn hiệu lực** của học sinh.

Giáo viên có thể chuyển giữa hai **chế độ xếp hạng**: **XP** và **Streak**. Đây là một trang **xem/tra cứu**; không chấm điểm học lực, cộng/trừ XP, reset Streak, chỉnh sửa Activity hay can thiệp thành tích.

### Quyết định đã chốt

| Hạng mục | Quy tắc chính thức của v2 |
|---|---|
| Lớp được xem | Chỉ thành viên học sinh hiện thuộc lớp đó và thỏa điều kiện tài khoản hợp lệ |
| Chế độ mở trang | **XP**, mặc định **Tuần này** |
| Chế độ Streak | **Có**, dùng để xếp hạng theo Streak hiện tại; **không cho lọc thời gian** |
| Lượt Activity | **Chỉ tính `COMPLETED`**; không có thống kê/bộ lọc “chưa hoàn thành” |
| Summary strip, KPI cards | **Bỏ** |
| Dropdown “Tất cả hoạt động” | **Bỏ** |
| Dropdown sắp xếp riêng | **Bỏ**; chế độ XP/Streak quyết định thứ tự |
| Cột Streak | **Luôn có**, kể cả khi đang xếp hạng theo XP |
| Hành động `Xem` | Điều hướng `/vi/teacher/students/{studentId}` (hoặc locale hiện hành) |
| Bảng và tìm kiếm | Dữ liệu thật từ backend, phân trang, giữ nguyên hạng toàn lớp khi tìm kiếm |

## 2. Phạm vi UI và visual

**Giữ nguyên** từ Teacher Classes hiện tại:

- Teacher sidebar, topbar, breadcrumb `Lớp học > {className}`.
- Class header: mã/tên lớp, trạng thái, Grade, niên khóa, sĩ số và các action hiện hữu.
- Tabs cấp lớp: **Tổng quan | Danh sách học sinh | Bảng xếp hạng XP**. Tab đang chọn có underline màu cam.
- Teacher design system: nền kem nhạt, card trắng, border mảnh, bo góc vừa phải, chữ dễ đọc, accent cam. **Không áp dụng** theme Student Indie Illustrated Scrapbook.

**Chỉ thay phần nội dung bên trong tab Ranking**, theo thứ tự:

1. Tiêu đề `Bảng xếp hạng XP` và mô tả ngắn.
2. Thanh điều khiển: **XP / Streak**, bộ lọc thời gian **chỉ ở XP**, ô tìm học sinh.
3. **Một bảng xếp hạng duy nhất**, có phân trang.

Không tạo thêm tabs con cho “Hoạt động”, “Chưa hoạt động”, không có podium lớn, không có summary strip hay các KPI cards để lấp khoảng trống.

## 3. Cấu trúc giao diện chi tiết

### 3.2. Chuyển chế độ xếp hạng XP / Streak

Sử dụng một **segmented control** hai lựa chọn, không cần trang hay route riêng:

| Chế độ | Thứ hạng được tính theo | Bộ lọc thời gian |
|---|---|---|
| **XP** (mặc định) | XP trong kỳ giảm dần | Hiện và có thể thao tác |
| **Streak** | **Current/effective Streak** giảm dần | **Ẩn hoàn toàn**; không gửi `period` |

- Tại chế độ XP, `Hôm nay | Tuần này | Tháng này | Tất cả` dùng cho **XP** và **lượt Activity hoàn thành**.
- Tại chế độ Streak, Streak là **chuỗi ngày hiện tại**, không có khái niệm “Streak của tuần/tháng” trong bảng này.
- **Chốt UX: Ẩn bộ lọc thời gian khi chọn Streak** (thay vì chỉ disable). Tránh để các chip thời gian xuất hiện nhưng không có tác dụng.
- Giữ lại lựa chọn thời gian XP trước đó trong state. Khi quay từ Streak sang XP, khôi phục đúng kỳ đã chọn (mặc định `Tuần này` khi lần đầu mở trang).
- Đổi chế độ hoặc kỳ → reset trang về 1; không giữ dữ liệu cũ với nhãn mới.
- Không có nút “Sắp xếp theo lượt” trong MVP; tránh làm cột `Hạng` mơ hồ.

### 3.3. Ô tìm học sinh

- Placeholder: `Tìm học sinh...`.
- Tìm tên học sinh **trên toàn bộ thành viên lớp**, không chỉ trong page kết quả đang hiển thị. Nên dùng debounce khoảng 300ms.
- Không thay đổi rank gốc của học sinh khi tìm kiếm.
- Khi đổi từ khóa → page = 1. Nút xóa tìm kiếm trả về toàn danh sách theo chế độ đang chọn.

### 3.4. Bảng xếp hạng

**Các cột cố định:**

| Cột | Khi ở chế độ XP | Khi ở chế độ Streak |
|---|---|---|
| `Hạng` | Hạng theo XP trong kỳ | Hạng theo Streak hiện tại |
| `Học sinh` | Avatar/initials + họ tên | Không đổi |
| `XP` | **XP trong kỳ** | **XP tích lũy (All-time)** — ghi rõ nhãn |
| `Lượt hoàn thành` | Số `COMPLETED` **trong kỳ** | Số `COMPLETED` **tích lũy (All-time)** — ghi rõ nhãn |
| `Streak` | **Streak hiện tại** (không phụ thuộc kỳ XP) | **Streak hiện tại**, cột nổi bật |
| `Thao tác` | `Xem` hồ sơ | `Xem` hồ sơ |

**Tại sao cột XP và Lượt chuyển sang All-time ở chế độ Streak?** Vì bộ lọc thời gian bị ẩn; số liệu không được ngầm tiếp tục lấy theo `Tuần này` rồi khiến người dùng hiểu sai. Dùng nhãn cột/tooltip rõ ràng. Đây là lựa chọn nghiệp vụ của đặc tả v2; backend và FE phải dùng cùng một quy ước.

**Không có:** cột số lần chưa hoàn thành, tổng lượt bắt đầu, số `GAME_OVER`, tỷ lệ hoàn thành, hoặc nhãn “học sinh chưa hoạt động”.

**Nguyên tắc xếp hạng:**

- XP mode: `xpInPeriod DESC, studentId ASC`.
- Streak mode: `effectiveCurrentStreak DESC, studentId ASC`.
- `Hạng` được tính trên **toàn bộ lớp đủ điều kiện trước tìm kiếm/phân trang**. Tìm học sinh ở hạng 12 vẫn hiển thị hạng 12.
- Học sinh `0 XP`, `0 completedSessions`, `0 streak` **vẫn có mặt**. Không coi đây là empty state.
- Có thể dùng biểu tượng huy chương nhỏ cho 3 hạng đầu; không tạo podium.
- Phân trang server-side; không lấy Top 50 toàn trường rồi lọc client-side.
- Khi Streak là 0, hiển thị `0 ngày`, không dùng flame rực sáng khiến hiểu nhầm.

## 4. Định nghĩa dữ liệu và quy tắc nghiệp vụ

### 4.1. XP

- Nguồn: tổng giao dịch XP đã ghi nhận thực tế trong `xp_transactions` theo `earned_at`, không lấy Level hay tổng XP snapshot để giả làm XP trong kỳ.
- Bộ lọc XP: `TODAY`, `WEEK`, `MONTH`, `ALL`, sử dụng ngày địa phương `Asia/Ho_Chi_Minh` (tuần bắt đầu từ thứ Hai).
- XP trong kỳ có thể đến từ nhiều nguồn hợp lệ, không nhất thiết chỉ từ Activity; do đó **XP > 0 không chứng minh đã hoàn thành Activity**.
- XP là số điểm của **tài khoản học sinh đang thuộc lớp**, không khẳng định điểm chỉ được kiếm trong chính lớp hiện tại. Nếu chuyển lớp, MVP không tái phân bổ XP theo lớp lịch sử.
- Khi ở Streak mode, cột XP dùng tổng hợp all-time theo cùng nguồn ledger (nếu đã có bộ tổng lifetime được đồng bộ đúng thì backend có thể tái sử dụng, nhưng phải thống nhất ý nghĩa).

### 4.2. Lượt Activity hoàn thành — chỉ `COMPLETED`

- Duy nhất **`activity_sessions.status = 'COMPLETED'`** được tính là một lượt hoàn thành.
- Dùng thời điểm hoàn thành chính thức của server (`completed_at`) để lọc thời gian.
- Một học sinh hoàn thành lại cùng một Activity 3 lần → **3 lượt**, nếu có 3 session `COMPLETED` khác nhau.
- **Không tính** `GAME_OVER`, `ABANDONED`, IN_PROGRESS, timeout chưa kết thúc, hay số lượt bấm vào Activity.
- Không tạo chỉ số “chưa hoàn thành” và **không có bộ lọc có/chưa hoạt động**. Học sinh có 0 lượt được hiển thị bình thường.
- Khi ở Streak mode: cột này là số lượt `COMPLETED` **all-time**; không tự suy diễn “Streak dài thì hoàn thành nhiều lượt”.
- `0 lượt` không có nghĩa là học sinh chưa học Vocabulary, chưa đọc Knowledge Note, hoặc không đăng nhập.

### 4.3. Streak

- Dùng **effective current streak**, không dùng `longest_streak`.
- Ngày đủ điều kiện Streak là ngày có ít nhất một Activity `COMPLETED`, theo chính sách Streak đã có. Nhiều Activity hoàn thành cùng ngày vẫn chỉ tính 1 ngày streak.
- Nếu ngày hoàn thành đủ điều kiện gần nhất **trước hôm qua** (theo `Asia/Ho_Chi_Minh`) thì Streak hiệu lực là **0**; các quy tắc bảo lưu khác chỉ được áp dụng nếu backend đã triển khai.
- Khi Teacher chọn chế độ Streak, không tính theo TODAY/WEEK/MONTH; **thời gian bị ẩn và không truyền vào API**.
- XP mode vẫn hiện Streak hiện tại ở cột Streak, có tooltip `Chuỗi ngày học liên tiếp còn hiệu lực, không phụ thuộc khoảng thời gian XP`.
- Không có thao tác cộng/trừ, sửa hoặc reset Streak trong bảng này.

### 4.4. Membership và quyền truy cập

- Chỉ học sinh thuộc **Class đang xem** với membership có hiệu lực, tài khoản đáp ứng quy tắc hợp lệ của hệ thống.
- Teacher phải được phân quyền xem `classId`; không cho client truyền tùy ý ID học sinh để lấy dữ liệu vượt quyền.
- Không dùng Student leaderboard toàn hệ thống làm dữ liệu nền vì Top 50 toàn hệ thống có thể thiếu thành viên lớp.
- Xếp hạng có tie-break `studentId ASC` để thứ tự ổn định, không tự tính lại theo trang đang tải.

## 5. Các screen / trạng thái phải có

> Các screen dưới đây là **trạng thái của cùng một page**, không phải nhiều route hoặc tabs cấp lớp mới. Ví dụ minh họa là dữ liệu mẫu trong tài liệu; production dùng API thật.

### Screen 01 — Default: XP / Tuần này

**Khi nào:** Teacher mở `Bảng xếp hạng XP` lần đầu, API trả dữ liệu.

**Mục tiêu:** Thấy ngay XP theo tuần và số lượt Activity đã hoàn thành; đồng thời xem được Streak hiện tại.

```text
[Class Header: G7-SEED-7A1]
[Tổng quan] [Danh sách học sinh] [Bảng xếp hạng XP ✓]

🏆 Bảng xếp hạng XP
   Theo dõi XP, lượt hoàn thành Activity và Streak của học sinh trong lớp.

Xếp hạng: [XP ✓] [Streak]    [Hôm nay] [Tuần này ✓] [Tháng này] [Tất cả]
[Tìm học sinh.......................................................]

Hạng  Học sinh              XP trong kỳ    Lượt hoàn thành trong kỳ    Streak hiện tại   Thao tác
1     Nguyễn Minh Anh       1.250          18                           7 ngày          [Xem]
2     Trần Gia Huy          1.180          15                           5 ngày          [Xem]
3     Lê Khánh Vy             980          13                           3 ngày          [Xem]
4     Hoàng Minh Thư            0           0                           0 ngày          [Xem]
                                                     [Trước] 1 2 [Sau]
```

**Tiêu chí:** XP/COMPLETED tính trong tuần hiện tại; Streak là giá trị hiện tại; hạng tính theo XP toàn lớp.

### Screen 02 — Chuyển sang xếp hạng Streak

**Khi nào:** Teacher bấm `Streak` ở segmented control.

**Mục tiêu:** Xếp hạng học sinh theo chuỗi ngày hiện tại mà không gây nhầm lẫn với bộ lọc kỳ XP.

```text
🏆 Bảng xếp hạng XP

Xếp hạng: [XP] [Streak ✓]          [Tìm học sinh...................]
         (Không hiện Hôm nay / Tuần này / Tháng này / Tất cả)

Hạng  Học sinh              XP tích lũy    Lượt hoàn thành tích lũy    Streak hiện tại   Thao tác
1     Nguyễn Minh Anh       4.820          70                           7 ngày          [Xem]
2     Trần Gia Huy          3.750          55                           5 ngày          [Xem]
3     Lê Khánh Vy           2.940          46                           3 ngày          [Xem]
4     Hoàng Minh Thư          860          15                           0 ngày          [Xem]
```

**Tiêu chí:** Thời gian được **ẩn**, API không gửi `period`; sắp xếp theo effective current Streak; XP và số lượt trong bảng có nhãn **tích lũy**; chuyển lại XP khôi phục kỳ trước đó.

### Screen 03 — Chuyển bộ lọc thời gian (chỉ XP)

**Khi nào:** Teacher đang ở XP mode, đổi `Tuần này` → `Hôm nay`, `Tháng này` hoặc `Tất cả`.

**Mục tiêu:** So sánh XP và số lượt `COMPLETED` theo kỳ đã chọn.

- Đổi kỳ → gọi API lại và trả trang về 1.
- Chỉ cột XP và lượt hoàn thành thay đổi theo kỳ; **Streak hiện tại không thay đổi chỉ vì đổi bộ lọc**.
- `ALL` tương đương all-time cho XP và số lượt hoàn thành.
- Không hiển thị danh sách “chưa hoàn thành” riêng.

### Screen 04 — Tìm kiếm học sinh

**Khi nào:** Giáo viên nhập tên, ở XP hoặc Streak mode.

```text
Xếp hạng: [XP ✓] [Streak]        [Tuần này ✓]         [Tìm: "Minh Anh" ×]

Hạng  Học sinh              XP trong kỳ   Lượt hoàn thành trong kỳ   Streak hiện tại
1     Nguyễn Minh Anh       1.250         18                          7 ngày
```

**Tiêu chí:** Tìm trên toàn lớp, không đổi rank gốc, có clear search; page = 1 khi tìm kiếm.

### Screen 05 — Loading

**Khi nào:** Tải lần đầu hoặc chuyển XP ↔ Streak / đổi kỳ / tìm kiếm / phân trang.

- Header và filter giữ ổn định; bảng có skeleton row tương ứng số cột.
- Khi đang fetch không hiển thị số liệu của chế độ cũ dưới nhãn chế độ mới.
- Có `aria-busy` hoặc thông báo cho screen reader.
- Không để một card trắng cao bất thường.

### Screen 06 — Empty Class

**Khi nào:** Lớp chưa có thành viên học sinh hợp lệ.

- Thông điệp: `Lớp chưa có học sinh để xếp hạng.`
- Action: `Đến danh sách học sinh`, trỏ về tab `students` của class.
- **Không** dùng empty state này chỉ vì tất cả XP hoặc Streak bằng 0.

### Screen 07 — Không có kết quả tìm kiếm

**Khi nào:** Lớp có học sinh nhưng không khớp từ khóa.

- Thông điệp: `Không tìm thấy học sinh phù hợp.`
- Action: `Xóa tìm kiếm`.
- Giữ nguyên chế độ XP/Streak và kỳ XP đang chọn.
- Không có empty state dành riêng cho “chưa hoàn thành Activity”.

### Screen 08 — Error / API chưa có / không có quyền

**Khi nào:** API lỗi, timeout, `403`, hoặc chưa triển khai.

- `Không tải được bảng xếp hạng. [Thử lại]`.
- Với `403`: `Bạn không có quyền xem bảng xếp hạng của lớp này.`
- Không thay dữ liệu lỗi bằng mock data trong production.
- Trong giai đoạn backend chưa có endpoint, hiển thị placeholder trung thực hoặc ẩn tính năng theo feature flag.

### Screen 09 — Mobile / Tablet

- Class header và sidebar theo responsive layout Teacher hiện tại.
- XP/Streak segmented control dễ bấm; thanh thời gian **chỉ xuất hiện ở XP** và có thể wrap/cuộn ngang.
- Search full width trên màn hẹp.
- Bảng `overflow-x-auto`, giữ tên học sinh và chỉ số không bị nén quá nhỏ.
- Có trạng thái focus bàn phím rõ; thao tác chạm tối thiểu khoảng 44px.

## 6. Tương tác của trang

| Hành động | Kết quả |
|---|---|
| Mở trang | `metric=XP`, `period=WEEK`, `page=1` |
| Bấm `Streak` | `metric=STREAK`; **ẩn thời gian**; xếp hạng theo Streak; `page=1` |
| Bấm `XP` | `metric=XP`; **hiện thời gian** và giữ kỳ đã chọn trước đó; `page=1` |
| Đổi kỳ XP | Chỉ áp dụng XP và lượt Activity `COMPLETED`; `page=1` |
| Tìm/xóa tên | Lọc toàn lớp, giữ hạng thật; `page=1` |
| Bấm `Xem` | Điều hướng `/teacher/students/{studentId}` theo locale hiện tại |
| Đổi trang | Giữ metric, period (nếu XP), từ khóa |
| API lỗi | Error + Retry, không dùng dữ liệu mock |

## 7. API đề xuất (cần triển khai backend)

**Một endpoint read-only cho cả hai metric**:

```http
GET /v1/teacher/classes/{classId}/leaderboard?metric=XP&period=WEEK&search=&page=1&size=20
GET /v1/teacher/classes/{classId}/leaderboard?metric=STREAK&search=&page=1&size=20
```

**Request parameters:**

| Parameter | Giá trị | Quy tắc |
|---|---|---|
| `metric` | `XP` / `STREAK` | Default `XP` |
| `period` | `TODAY` / `WEEK` / `MONTH` / `ALL` | **Chỉ dùng với XP**, default `WEEK` |
| `search` | string | Tìm tên trên toàn lớp |
| `page`, `size` | integer | Page bắt đầu 1; size có giới hạn server |

**Validation:** Với `metric=STREAK`, frontend không gửi `period`. Backend nên **từ chối `period` khác null** (400) để bắt lỗi sử dụng API không đúng contract, thay vì ngầm áp dụng nó. Không còn request param `participation`, `sort`, `activityType` trong MVP.

**Response gợi ý — XP mode:**

```json
{
  "classId": 1,
  "metric": "XP",
  "period": "WEEK",
  "totalStudents": 20,
  "totalElements": 20,
  "page": 1,
  "size": 20,
  "items": [
    {
      "studentId": 101,
      "fullName": "Nguyễn Minh Anh",
      "avatarKey": null,
      "rank": 1,
      "xp": 1250,
      "completedSessions": 18,
      "currentStreak": 7
    }
  ]
}
```

**Response gợi ý — Streak mode:** cùng cấu trúc, `metric="STREAK"`, `period=null`, `xp` là **lifetime XP**, `completedSessions` là **lifetime COMPLETED sessions**, `currentStreak` là **effective current streak**. Nên có thêm `xpScope` và `completedScope` (`PERIOD`/`ALL`) hoặc thể hiện rõ qua `metric` để frontend không tự suy luận. Ví dụ:

```json
{
  "classId": 1,
  "metric": "STREAK",
  "period": null,
  "xpScope": "ALL",
  "completedScope": "ALL",
  "totalStudents": 20,
  "totalElements": 20,
  "page": 1,
  "size": 20,
  "items": [
    {
      "studentId": 101,
      "fullName": "Nguyễn Minh Anh",
      "avatarKey": null,
      "rank": 1,
      "xp": 4820,
      "completedSessions": 70,
      "currentStreak": 7
    }
  ]
}
```

> Đây là hợp đồng API **đề xuất**, chưa phải endpoint sẵn có. Cần đồng bộ wrapper `ApiResponse`/`PageResponse`, kiểu dữ liệu và phân quyền với convention backend hiện tại.

### 7.1. Thứ tự xử lý query backend

1. Xác thực Teacher, kiểm tra quyền xem `classId`.
2. Lấy tập học sinh có membership hợp lệ thuộc **lớp hiện tại**.
3. Tổng hợp XP và `COMPLETED` sessions theo khoảng kỳ XP, hoặc all-time nếu ở Streak mode.
4. Tính effective Streak theo chính sách Streak đang dùng.
5. Xếp hạng **toàn lớp** theo metric đã chọn; hòa điểm → `studentId ASC`.
6. Sau đó mới áp dụng tìm kiếm và phân trang, trả về rank gốc cùng tổng số kết quả khớp.

**Không dùng** `/v1/student/gamification/leaderboard` rồi filter ở frontend: API Student xếp hạng toàn hệ thống, giới hạn Top 50 nên có thể bỏ sót học sinh lớp.

## 8. Acceptance Criteria / test cases

- [ ] Giữ Teacher sidebar, class header và tabs hiện tại; không áp dụng Student theme.
- [ ] Mặc định **XP / Tuần này** khi mới mở tab Ranking.
- [ ] Có hai lựa chọn XP/Streak nhưng **chỉ một bảng**; không tạo route riêng.
- [ ] Trong XP mode, các bộ lọc thời gian hoạt động với `Asia/Ho_Chi_Minh`.
- [ ] Khi chọn Streak, **ẩn bộ lọc thời gian**, request không truyền `period`.
- [ ] Khi quay lại XP, bộ lọc thời gian được hiện lại với kỳ trước đó.
- [ ] Cột Streak xuất hiện ở cả hai chế độ, dùng **effective current streak**, không phải longest streak.
- [ ] Khi ở Streak mode, bảng xếp theo Streak; nhãn XP/Lượt là **tích lũy**, không ngầm dùng Tuần này.
- [ ] XP trong kỳ lấy từ ledger hợp lệ, không tính lại từ Level.
- [ ] **Chỉ** `ActivitySession.COMPLETED` được tính là lượt hoàn thành; replay COMPLETED tính thêm lượt.
- [ ] `GAME_OVER`, `ABANDONED`, IN_PROGRESS **không** tính vào cột Lượt hoàn thành.
- [ ] Không có filter/metric “Chưa hoàn thành”, “Chưa hoạt động”, “Có hoạt động”.
- [ ] Không có KPI cards, summary strip, dropdown `Tất cả hoạt động` hay `Sắp xếp`.
- [ ] Học sinh có 0 XP / 0 Completed / 0 Streak vẫn được hiển thị.
- [ ] Hạng tính trên toàn bộ lớp trước search/page; tie-break `studentId ASC`.
- [ ] Membership chỉ thuộc lớp đang xem, kiểm tra quyền Teacher trên server.
- [ ] Search trên toàn lớp, debounce nếu cần, không reset rank.
- [ ] Click `Xem` chuyển đến Teacher Student Profile hiện hữu.
- [ ] Loading, empty class, empty search, error/retry, mobile đều hoạt động.
- [ ] Không dùng mock data như dữ liệu thật; không có nút sửa/cho/tước XP/Streak.

## 9. Phạm vi triển khai

### Phase 1 — MVP

- Giữ `ClassWorkspaceShell` và route hiện có.
- Thay placeholder `ClassRankingView` bằng **header ngắn + XP/Streak segmented control + period (XP-only) + search + bảng + pagination**.
- Thêm API read-only theo lớp, rank XP/Streak và completed sessions.
- Bảo đảm permission, timezone, các trường hợp 0 và API error.
- Đầy đủ Screen 01–09 phía trên; test regression không ảnh hưởng Student leaderboard.

### Phase 2 — Chỉ khi có nhu cầu

- Export CSV, analytics, trend biến động thứ hạng (cần định nghĩa snapshot).
- Không tự thêm tính năng thưởng thủ công, bộ lọc “chưa hoàn thành” hoặc tổng hợp nhiều nguồn hoạt động.

## 10. Các quyết định đã chốt trước khi code

1. **Mặc định kỳ:** `Tuần này` (`WEEK`) trong **XP mode**.
2. **Phạm vi membership:** **chỉ học sinh hiện thuộc lớp đang xem**.
3. **Streak:** **có cột Streak và có chế độ xếp hạng Streak**; khi chọn Streak, **ẩn bộ lọc thời gian** (XP mode mới sử dụng kỳ thời gian).
4. **Activity:** **chỉ tính lượt `COMPLETED`**, không có tính năng thống kê/lọc “chưa hoàn thành”.
5. **Summary strip & dropdown `Tất cả hoạt động`:** **bỏ** để trang gọn.
6. **Click `Xem`:** dùng trang hồ sơ Teacher `/teacher/students/{studentId}`.
7. **Sắp xếp:** không có dropdown riêng; XP mode xếp theo XP, Streak mode xếp theo effective Streak.
8. **Streak mode và các cột khác:** khi ẩn kỳ, cột XP và lượt hoàn thành hiển thị **all-time** với nhãn rõ ràng.

---

**Kết luận:** Giữ tab `Bảng xếp hạng XP` trong Teacher Class Detail. Một trang gọn, **hai chế độ XP/Streak**, một bảng có cột **Hạng / Học sinh / XP / Lượt Activity hoàn thành / Streak / Xem**. Chỉ đếm Activity `COMPLETED`, không thêm tính năng “chưa hoàn thành”, không lặp thống kê đã có ở nơi khác. Streak luôn là chỉ số hiện tại; chọn Streak sẽ ẩn bộ lọc thời gian.
