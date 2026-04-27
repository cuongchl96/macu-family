# TÀI LIỆU CHỨC NĂNG CHI TIẾT: MACUFAM WEALTH HUB

Nền tảng **MacuFam Wealth Hub** được thiết kế để cung cấp một giải pháp quản lý gia sản gia đình hoàn chỉnh (Family Office). Tài liệu này liệt kê chi tiết cơ chế hoạt động, công thức tính toán và các thao tác (User Actions) trên từng module riêng biệt của hệ thống.

---

## 1. TÍNH NĂNG TOÀN CỤC (GLOBAL FEATURES)

- **Ẩn/Hiện số tiền (Privacy Mode)**: Cung cấp nút chuyển đổi (Toggle) biểu tượng con mắt ở góc trên cùng của giao diện. Khi kích hoạt, toàn bộ số tiền thực tế trong mọi màn hình, biểu đồ, danh sách đều biến thành dấu `******` giúp bảo vệ sự riêng tư khi sử dụng ứng dụng nơi đông người. Trạng thái này được lưu lại cục bộ (Local Storage).
- **Hệ thống Đa tiền tệ (Multi-currency - Đang hoàn thiện)**: Hỗ trợ linh hoạt chuyển đổi/hiển thị giá trị gốc (VND hoặc USD).

---

## 2. TỔNG QUAN TÀI SẢN (DASHBOARD)

Đây là Trung tâm điều khiển hiển thị báo cáo tổng quát.

- **Thẻ Tổng Tài Sản Hiện Có (Total Net Worth)**:
  - **Công thức tính toán**: `Tổng Net Worth = Tổng Gốc Sổ Tiết Kiệm + Tổng Tiền Đã Trả Bất Động Sản + Tổng Giá Trị Vàng Hiện Tại + Tổng Giá Trị Crypto Hiện Tại`.
  - Nếu vốn đầu tư (Capital Contributions) ít hơn Tổng tài sản, hệ thống sẽ đánh giá gia đình đang sinh lời.
- **Biểu đồ Phân Bổ (Asset Allocation)**:
  - Sử dụng biểu đồ tròn (Doughnut Chart) biểu diễn % tỷ trọng của từng lớp tài sản.
  - Phân loại rõ ràng 4 danh mục: Tiết kiệm an toàn, Bất động sản, Vàng, và Crypto.

---

## 3. QUẢN LÝ VỐN GÓP (CAPITAL CONTRIBUTIONS)

Module ghi chép lại nguồn gốc dòng tiền ban đầu đưa vào hệ thống đầu tư/tích lũy.

- **Các trường dữ liệu (Fields)**:
  - **Số tiền (Amount)**: Định dạng tiền tệ có phân cách hàng nghìn.
  - **Nguồn gốc (Owner)**: Vợ góp (Wife), Chồng góp (Husband) hoặc Quỹ chung (Joint).
  - **Ngày góp (Date)** & **Ghi chú (Note)**.
- **Tính toán hiển thị**:
  - Thẻ tổng (Total Capital): Cộng dồn toàn bộ nguồn tiền.
  - Thẻ chi tiết theo từng nguồn gốc: `Vợ (Wife)`, `Chồng (Husband)`, `Chung (Joint)` giúp gia đình dễ dàng minh bạch tài chính.
- **Thao tác (Actions)**: `Thêm`, `Sửa`, `Xóa` các khoản vốn góp.

---

## 4. KẾ HOẠCH LƯƠNG & MỤC TIÊU (SALARY PLANNING)

Đây là trái tim của hệ thống quản lý dòng tiền dự trù. Module này được chia thành 4 Tab riêng biệt:

### Tab 4.1: Tổng Quan (Overview)
- **Danh sách Mục tiêu ưu tiên**: Sắp xếp các mục tiêu tài chính tự động theo độ khẩn cấp (thời hạn gần nhất lên đầu).
- **Cảnh báo Thông minh**:
  - `Màu đỏ`: Mục tiêu đã quá hạn.
  - `Màu cam`: Mục tiêu cấp bách (Còn dưới 60 ngày).
- **Tiến trình kép (Dual Progress)**:
  - **Thanh 1 - Kế hoạch (Planned)**: Tính bằng `(Tổng số tiền Phân bổ từ Lương / Target) * 100%`. Thể hiện lượng tiền trên giấy tờ đã "hứa" sẽ dành cho mục tiêu.
  - **Thanh 2 - Thực tế (Saved)**: Tính bằng `(Tổng tiền gốc của các Sổ Tiết kiệm gắn với mục tiêu / Target) * 100%`. Thể hiện dòng tiền vật lý thực sự đã nằm trong sổ an toàn.

### Tab 4.2: Mục Tiêu (Financial Goals)
- **Các trường dữ liệu**: 
  - **Tên mục tiêu** (Ví dụ: Chuyến đi Châu Âu).
  - **Số tiền mục tiêu (Target Amount)**.
  - **Danh mục (Category)**: Trả góp BĐS (🏠), Du lịch (✈️), Học phí (🎓), Khẩn cấp (🆘), Khác (📦). Mỗi danh mục có biểu tượng và màu sắc riêng.
  - **Hạn chót (Due Date)**.
- **Thao tác**: `Thêm mới`, `Sửa` (cho phép cập nhật lại target/hạn chót), `Xóa`.

### Tab 4.3: Lương Tháng (Monthly Salaries)
- **Các trường dữ liệu**: Tháng (Format YYYY-MM), Số tiền thực nhận, Ghi chú nguồn (Ví dụ: Lương tháng 3 + Thưởng quý).
- **Hiển thị trực quan**: 
  - Mỗi thẻ lương có thanh Progress báo hiệu % số tiền đã được "Phân bổ" đi.
  - Hiển thị rành mạch: Tổng tiền đã phân bổ, Khoản tiền còn dư chưa phân bổ (màu cam), hoặc báo xanh "Đã phân bổ hết".
  - Liệt kê ngay bên trong thẻ lương đó là dòng tiền đã được trích ra đi vào các mục tiêu nào.

### Tab 4.4: Phân Bổ (Allocations)
- **Nghiệp vụ**: Lấy tiền từ một Tháng Lương cụ thể và điều hướng nó vào một Mục tiêu cụ thể.
- **Validation Form**:
  - Không cho phép người dùng phân bổ số tiền vượt quá phần "Còn dư chưa phân bổ" của tháng lương đó.
  - Cung cấp nút bấm nhanh "Tối đa" (Max) để điền nhanh toàn bộ tiền còn lại của lương.
- **Hiển thị**: Danh sách các giao dịch điều hướng tiền, hiển thị nguồn gốc (Lương tháng mấy) chảy vào đích (Mục tiêu nào).

---

## 5. SỔ TIẾT KIỆM (SAVINGS DEPOSITS)

Nơi lưu trữ và quản lý dòng tiền mặt có tính sinh lời an toàn.

- **Nhóm thông minh**: Danh sách sổ được tự động nhóm (Group By) theo Tên Ngân Hàng/Tổ chức (VD: Techcombank, Tikop).
- **Các trường dữ liệu chi tiết**:
  - **Tên/Mục đích Sổ**.
  - **Ngân hàng/Nguồn** (Ví dụ: Vietcombank, Momo).
  - **Số tiền gốc (Principal)**.
  - **Lãi suất (% APY)**.
  - **Ngày mở sổ** & **Ngày đáo hạn**.
  - **Mục Tiêu Liên Kết (Goal ID)**: Dropdown cho phép chọn 1 Mục tiêu (từ Module 4). Khi chọn, hệ thống tự động cộng số dư của sổ này vào tiến trình thực tế của mục tiêu đó.
- **Logic Tính toán & Giao diện**:
  - Tính toán tự động số ngày đã trôi qua so với tổng thời hạn sổ.
  - Hiển thị thanh tiến trình báo hiệu độ "chín" của sổ.
  - Cảnh báo màu vàng nhạt (bg-warning) nếu sổ sắp đáo hạn (dưới 30 ngày).
  - Cảnh báo màu đỏ nhạt (bg-destructive) nếu sổ đã quá hạn chưa tất toán.
  - Huy hiệu (Badge) `🎯 [Tên Mục tiêu]` xuất hiện ngay bên cạnh tên sổ nếu nó được liên kết thành công.

---

## 6. QUẢN LÝ BẤT ĐỘNG SẢN (REAL ESTATE)

Theo dõi các tài sản nhà đất và lịch sử trả nợ/đóng tiến độ.

- **Tạo Tài Sản**: Nhập Tên dự án/Căn nhà và Tổng Giá trị (Total Value).
- **Thanh toán (Payments)**:
  - Cho phép tạo danh sách các đợt phải thanh toán.
  - Mỗi đợt có: Ngày hạn thanh toán, Số tiền, Ghi chú đợt thanh toán, và Trạng thái (Đã đóng hay Chưa đóng).
  - Nút Switch (Gạt) tiện dụng để chuyển trạng thái từ "Chưa thanh toán" sang "Đã thanh toán".
- **Logic Tính toán**: Tổng giá trị `Đã thanh toán (Paid Amount)` của tài sản được tự động tính bằng cách cộng dồn tất cả các khoản Payments có cờ `isPaid = true`. Số tiền này được xem là Net Worth cấu thành trên Dashboard.

---

## 7. ĐẦU TƯ (INVESTMENTS)

Chia làm 2 hạng mục là Vàng và Tiền điện tử.

### 7.1 Vàng (Gold Holdings)
- **Các trường dữ liệu**: Số lượng (chỉ/lượng), Giá mua, Giá hiện tại thị trường (có thể nhập thủ công hoặc liên kết API), Ngày mua.
- **Tính toán Lợi Nhuận**:
  - Tổng Vốn Bỏ Ra = Tổng (Số lượng * Giá mua).
  - Tổng Giá Trị Hiện Tại = Tổng (Số lượng * Giá hiện tại).
  - Tự động tính Lợi nhuận/Lỗ cả về số tiền tuyệt đối (VNĐ) và tỷ lệ phần trăm (%).
  - Đổi màu xanh (Profit) nếu lãi, đỏ (Destructive) nếu lỗ.

### 7.2 Crypto (Tiền điện tử)
- **Kiến trúc quản lý hai lớp**:
  - **Lớp 1 - Nạp tiền (Fiat Deposits)**: Quản lý dòng tiền thực tế được bơm vào sàn (Ví dụ: Nạp 100 triệu lên Binance). Mục đích để biết chính xác "Mình đã tốn bao nhiêu tiền thật".
  - **Lớp 2 - Danh mục Coin (Holdings)**: Quản lý các đồng xu đang giữ (Tên coin, Ký hiệu, Số lượng giữ, Giá vốn (Entry), Giá thị trường hiện tại).
- **Tính toán PnL Tổng thể**:
  - Hệ thống lấy `Tổng Giá trị Coin Hiện Tại` trừ đi `Tổng Vốn Đã Nạp` để tính ra PnL thực sự cho toàn bộ danh mục Crypto. (Hỗ trợ phát hiện trường hợp nạp tiền nhưng để USD, hoặc mua đi bán lại sinh lời).
