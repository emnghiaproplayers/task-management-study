# Task Management REST API with Global Validation

Hệ thống quản lý công việc (Task Management) được phát triển bằng NestJS nhằm xây dựng RESTful API đúng chuẩn REST contract, phân tách rõ ràng trách nhiệm giữa HTTP adapter (Controller), Business logic (Service) và cơ chế Validate DTO toàn cục.

---

## 1. Challenge Description

Bài toán yêu cầu thiết kế và triển khai một RESTful API hoàn chỉnh phục vụ cho việc quản lý các công việc (Task) với các yêu cầu cốt lõi về định nghĩa route, fail-fast validation và bảo mật API chống mass-assignment:
- **Tên Endpoint chuẩn REST**: Sử dụng danh từ số nhiều `/tasks`, tuyệt đối không chứa động từ trong URI (như `/getTasks`, `/deleteTask`).
- **HTTP Verbs & Status Codes chuẩn REST**: 
  - `POST /tasks` -> Tạo mới công việc, trả về mã trạng thái `201 Created` và thông tin công việc vừa được tạo.
  - `GET /tasks` -> Lấy danh sách toàn bộ công việc, trả về `200 OK` và mảng công việc.
  - `GET /tasks/:id` -> Lấy chi tiết công việc, trả về `200 OK` nếu tồn tại, trả về `404 Not Found` nếu không tìm thấy.
  - `PATCH /tasks/:id` -> Cập nhật một số thông tin công việc, trả về `200 OK` nếu thành công, trả về `404 Not Found` nếu không tìm thấy.
  - `DELETE /tasks/:id` -> Xóa công việc, trả về `204 No Content` khi xóa thành công, trả về `404 Not Found` nếu không tìm thấy.
- **Global Fail-fast Validation**:
  - Đăng ký `ValidationPipe` toàn cục.
  - Cấu hình `whitelist: true` và `forbidNonWhitelisted: true` để chặn mass-assignment bằng cách ném lỗi `400 Bad Request` ngay lập tức nếu client gửi kèm các field không hợp lệ (như `role` hay các thuộc tính bổ sung khác).
  - Sử dụng các decorator từ thư viện `class-validator` để ràng buộc các trường trong DTO (`title` phải có độ dài từ 3 ký tự trở lên, `priority` phải thuộc enum `TaskPriority`).

---

## 2. How to Run

### Yêu cầu môi trường
- **Node.js**: >= 18.x
- **npm**: >= 9.x

### Các bước cài đặt và vận hành

1. **Cài đặt các gói thư viện phụ thuộc:**
   ```bash
   npm install
   ```

2. **Chạy các kiểm thử để đảm bảo tính đúng đắn:**
   ```bash
   npm run test
   npm run test:e2e
   ```

3. **Biên dịch dự án:**
   ```bash
   npm run build
   ```

4. **Khởi chạy máy chủ (Listening on port 3000):**
   ```bash
   node dist/main.js
   ```

5. **Chạy script Smoke Test tự động kiểm tra validation:**
   ```bash
   node test-api.js
   ```

---

## 3. Architecture / Stack

Dự án sử dụng bộ công cụ tối giản nhưng mạnh mẽ:
- **NestJS v11.x**: Progressive Node.js framework dùng để xây dựng các ứng dụng phía máy chủ hiệu quả và dễ mở rộng.
- **TypeScript v5.7**: Ngôn ngữ lập trình kiểu tĩnh an toàn.
- **Class Validator & Class Transformer**: Sử dụng `class-validator` để khai báo các quy tắc kiểm thực dữ liệu qua decorator và `class-transformer` để chuyển đổi object.
- **In-Memory Store**: Sử dụng mảng đóng gói `private tasks: Task[]` nằm bên trong Service để lưu trữ trạng thái thay vì DB ngoài, đảm bảo tốc độ phản hồi tức thì và sự đơn giản.
- **Winston Logger**: Sử dụng Winston tích hợp qua `nest-winston` để ghi log có cấu trúc dạng JSON phục vụ cho mục đích giám sát hoạt động.

---

## 4. Smoke Test (Evidence Thực Tế)

Dưới đây là kết quả log thực tế thu được khi gửi các request bằng `curl -i` đến máy chủ NestJS đang chạy cục bộ ở cả 5 trường hợp validation:

### Case 1: hợp lệ → 201
- **Request Command**:
  ```bash
  curl -i -X POST http://localhost:3000/tasks -H "Content-Type: application/json" -d '{"title":"Fix bug","priority":"high"}'
  ```
- **Response**:
  ```http
  HTTP/1.1 201 Created
  Content-Type: application/json; charset=utf-8
  ```
  ```json
  {"id":"mpu88ybs53q","title":"Fix bug","status":"PENDING"}
  ```

### Case 2: thiếu title → 400
- **Request Command**:
  ```bash
  curl -i -X POST http://localhost:3000/tasks -H "Content-Type: application/json" -d '{"priority":"low"}'
  ```
- **Response**:
  ```http
  HTTP/1.1 400 Bad Request
  Content-Type: application/json; charset=utf-8
  ```
  ```json
  {
    "message": [
      "title must be longer than or equal to 3 characters",
      "title must be a string"
    ],
    "error": "Bad Request",
    "statusCode": 400
  }
  ```

### Case 3: title quá ngắn → 400
- **Request Command**:
  ```bash
  curl -i -X POST http://localhost:3000/tasks -H "Content-Type: application/json" -d '{"title":"AB","priority":"low"}'
  ```
- **Response**:
  ```http
  HTTP/1.1 400 Bad Request
  Content-Type: application/json; charset=utf-8
  ```
  ```json
  {
    "message": [
      "title must be longer than or equal to 3 characters"
    ],
    "error": "Bad Request",
    "statusCode": 400
  }
  ```

### Case 4: field lạ → 400
- **Request Command**:
  ```bash
  curl -i -X POST http://localhost:3000/tasks -H "Content-Type: application/json" -d '{"title":"Fix bug","priority":"high","role":"admin"}'
  ```
- **Response**:
  ```http
  HTTP/1.1 400 Bad Request
  Content-Type: application/json; charset=utf-8
  ```
  ```json
  {
    "message": [
      "property role should not exist"
    ],
    "error": "Bad Request",
    "statusCode": 400
  }
  ```

### Case 5: priority sai enum → 400
- **Request Command**:
  ```bash
  curl -i -X POST http://localhost:3000/tasks -H "Content-Type: application/json" -d '{"title":"Fix bug","priority":"urgent"}'
  ```
- **Response**:
  ```http
  HTTP/1.1 400 Bad Request
  Content-Type: application/json; charset=utf-8
  ```
  ```json
  {
    "message": [
      "priority must be one of the following values: low, medium, high"
    ],
    "error": "Bad Request",
    "statusCode": 400
  }
  ```

---

## 5. Code Execution Trace (Flow POST /tasks)

Dưới đây là sơ đồ trace chi tiết mô tả đường đi của request `POST /tasks` qua các điểm chạm trong source code ứng dụng:

1. **Điểm chạm 1 - Global Validation Interception**:
   - **File & Dòng**: [main.ts:22](file:///d:/Nghia-project/escape-beta/task-management/src/main.ts#L22)
   - **Cấu hình**: `app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))`
   - **Mô tả**: Khi request `POST /tasks` đi vào ứng dụng, `ValidationPipe` toàn cục sẽ tự động chạy trước route handler. Nó đối chiếu request payload với cấu trúc khai báo tại [create-task.dto.ts:9](file:///d:/Nghia-project/escape-beta/task-management/src/tasks/dto/create-task.dto.ts#L9). Nếu payload không vượt qua kiểm định (ví dụ: chứa thuộc tính lạ `role`, thiếu `title`, hoặc `priority` không hợp lệ), ValidationPipe sẽ chặn đứng luồng xử lý và gửi trả lỗi `400 Bad Request` về cho client mà không đi sâu thêm vào Controller.

2. **Điểm chạm 2 - Controller Entry**:
   - **File & Dòng**: [tasks.controller.ts:25](file:///d:/Nghia-project/escape-beta/task-management/src/tasks/tasks.controller.ts#L25)
   - **Method**: `TasksController.create()`
   - **Mô tả**: Khi dữ liệu đã được xác thực là hợp lệ, payload được deserialize an toàn thành object DTO và inject vào tham số `createTaskDto` của method. Controller ghi nhận log hoạt động và gọi phương thức xử lý nghiệp vụ của Service.

3. **Điểm chạm 3 - Service Business Logic**:
   - **File & Dòng**: [tasks.service.ts:10](file:///d:/Nghia-project/escape-beta/task-management/src/tasks/tasks.service.ts#L10)
   - **Method**: `TasksService.create()`
   - **Mô tả**: Phương thức tiếp nhận DTO hợp lệ, sinh mã `id` tự động dựa trên timestamp kết hợp chuỗi ngẫu nhiên, gán trạng thái `status: 'PENDING'` mặc định và ánh xạ các trường dữ liệu từ DTO để tạo object `Task`.

4. **Điểm chạm 4 - In-Memory Store Push**:
   - **File & Dòng**: [tasks.service.ts:17](file:///d:/Nghia-project/escape-beta/task-management/src/tasks/tasks.service.ts#L17)
   - **Thực thi**: `this.tasks.push(task)`
   - **Mô tả**: Lưu trữ công việc vừa tạo vào mảng `tasks` cục bộ của `TasksService`, hoàn tất chu trình và trả thực thể về để Controller phản hồi client.

---

## 6. Design Decisions

### A. Sử dụng ValidationPipe Toàn cục (Global ValidationPipe)
Thay vì khai báo `@UsePipes(ValidationPipe)` ở từng controller hay route, chúng tôi đăng ký `useGlobalPipes` ở file khởi chạy ứng dụng [main.ts:22](file:///d:/Nghia-project/escape-beta/task-management/src/main.ts#L22). Điều này mang lại sự đồng bộ kiểm thực trên toàn bộ endpoint của hệ thống, giảm thiểu trùng lặp code và đảm bảo không có route nào bị bỏ quên.

### B. Chặn Đứng Mass-Assignment bằng `whitelist` và `forbidNonWhitelisted`
- Cơ chế `whitelist: true` sẽ tự động lọc bỏ các thuộc tính không có decorator trong DTO class.
- Khi kết hợp với `forbidNonWhitelisted: true`, thay vì chỉ âm thầm strip bỏ các field thừa, NestJS sẽ lập tức trả về lỗi `400 Bad Request` và chỉ rõ property lạ nào không được phép gửi lên (ví dụ: `property role should not exist`). Điều này tăng cường đáng kể tính bảo mật và giúp lập trình viên phía client phát hiện ngay các lỗi truyền payload thừa hoặc sai thiết kế.

### C. Định nghĩa Enum Kiểu dữ liệu và Ràng buộc DTO cụ thể
- Sử dụng TypeScript `enum TaskPriority` tại DTO giúp quy chuẩn hoá danh sách giá trị ưu tiên. Khi client gửi một mức priority lạ, hệ thống sẽ trả về danh sách giá trị được phép một cách tường minh (`low`, `medium`, `high`).
- Trường `title` bắt buộc phải có độ dài từ 3 ký tự trở lên để tránh tạo các task vô nghĩa (VD: tiêu đề chỉ chứa khoảng trắng hay 1-2 ký tự không rõ nghĩa).
- Mọi validation đều được xử lý tự động qua khai báo hướng khai báo (declarative validation) bằng decorator tại class DTO, tuyệt đối không dùng code thủ công kiểm tra `if/else` trong service hay controller, đảm bảo sự tách biệt rõ ràng mã nguồn.

### D. Chiến lược Phòng thủ Chiều sâu (Defense-in-depth)
Tại sao backend validation lại cực kỳ quan trọng dù frontend đã tiến hành validate dữ liệu?
1. **Frontend bypass**: Bất kỳ người dùng nâng cao hoặc kẻ tấn công nào cũng có thể dễ dàng vượt qua (bypass) lớp validation trên frontend bằng cách sử dụng các công cụ như `curl`, Postman, hoặc chỉnh sửa trực tiếp request payload thông qua Developer Tools của trình duyệt. Lớp validation ở frontend chỉ đóng vai trò cải thiện trải nghiệm người dùng (UX) chứ không có giá trị bảo mật.
2. **Đảm bảo tính toàn vẹn của dữ liệu (Data Integrity)**: Backend là chốt chặn cuối cùng bảo vệ cơ sở dữ liệu. Nếu dữ liệu không hợp lệ lọt qua, nó có thể gây ra crash hệ thống, lỗi logic nghiệp vụ hoặc gây ô nhiễm (corrupt) cơ sở dữ liệu.
3. **Bảo mật mass-assignment**: Tránh việc kẻ xấu lợi dụng để cập nhật các trường nhạy cảm trong database (như `role: "admin"` hay `isVerified: true`) khi backend không kiểm duyệt kỹ danh sách thuộc tính được phép nhận vào.

---

## 7. Postman Collection Export
Dự án có đi kèm tệp cấu hình Postman collection xuất bản sẵn cho cả 5 scenario validation tại [task-validation.postman_collection.json](file:///d:/Nghia-project/escape-beta/task-management/task-validation.postman_collection.json). Bạn có thể import tệp này trực tiếp vào Postman để thử nghiệm nhanh chóng.
