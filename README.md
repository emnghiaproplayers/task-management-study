# Task Management REST API

Hệ thống quản lý công việc (Task Management) được phát triển bằng NestJS để chứng minh việc xây dựng RESTful API đúng chuẩn REST contract, phân tách rõ ràng trách nhiệm giữa HTTP adapter (Controller) và Business logic (Service).

---

## 1. Challenge Description

Bài toán yêu cầu thiết kế và triển khai một RESTful API hoàn chỉnh phục vụ cho việc quản lý các công việc (Task) với các yêu cầu cốt lõi:
- **Tên Endpoint chuẩn REST**: Sử dụng danh từ số nhiều `/tasks`, tuyệt đối không chứa động từ trong URI (như `/getTasks`, `/deleteTask`).
- **HTTP Verbs & Status Codes chuẩn REST**: 
  - `POST /tasks` -> Tạo mới công việc, trả về mã trạng thái `201 Created` và thông tin công việc vừa được tạo.
  - `GET /tasks` -> Lấy danh sách toàn bộ công việc, trả về `200 OK` và mảng công việc.
  - `GET /tasks/:id` -> Lấy chi tiết công việc, trả về `200 OK` nếu tồn tại, trả về `404 Not Found` nếu không tìm thấy.
  - `PATCH /tasks/:id` -> Cập nhật một số thông tin công việc, trả về `200 OK` nếu thành công, trả về `404 Not Found` nếu không tìm thấy.
  - `DELETE /tasks/:id` -> Xóa công việc, trả về `204 No Content` khi xóa thành công, trả về `404 Not Found` nếu không tìm thấy.
- **Fail-fast Validation / Error handling**: Mọi trường hợp tìm kiếm hoặc tương tác với id không tồn tại đều phải ném `NotFoundException` để trả về status `404` thay vì trả về null hoặc status `200` với body trống.

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

5. **Chạy script Smoke Test tự động:**
   ```bash
   node test-api.js
   ```

---

## 3. Architecture / Stack

Dự án sử dụng bộ công cụ tối giản nhưng mạnh mẽ:
- **NestJS v11.x**: Progressive Node.js framework.
- **TypeScript v5.7**: Ngôn ngữ lập trình kiểu tĩnh an toàn.
- **In-Memory Store**: Sử dụng mảng đóng gói `private tasks: Task[]` nằm bên trong Service để lưu trữ trạng thái thay vì DB ngoài, đảm bảo tốc độ phản hồi tức thì và sự đơn giản.
- **Winston Logger**: Sử dụng Winston tích hợp qua `nest-winston` để ghi log có cấu trúc dạng JSON ở cả cấp ứng dụng và trong Controller để theo dõi các nghiệp vụ REST.

---

## 4. Smoke Test (Evidence Thực Tế)

Dưới đây là kết quả log thực tế được trích xuất trực tiếp từ terminal khi chạy script `node test-api.js` gọi tuần tự đến máy chủ NestJS đang chạy cục bộ:

```text
--- 1. POST /tasks (Create Task) ---
Status: 201
Body: {"id":"mppaaniys4w","title":"Learn NestJS","description":"Complete REST CRUD module","status":"PENDING"}

--- 2. GET /tasks (Get List) ---
Status: 200
Body: [{"id":"mppaaniys4w","title":"Learn NestJS","description":"Complete REST CRUD module","status":"PENDING"}]

--- 3. GET /tasks/mppaaniys4w (Get One) ---
Status: 200
Body: {"id":"mppaaniys4w","title":"Learn NestJS","description":"Complete REST CRUD module","status":"PENDING"}

--- 4. PATCH /tasks/mppaaniys4w (Update Task) ---
Status: 200
Body: {"id":"mppaaniys4w","title":"Learn NestJS Master","description":"Complete REST CRUD module","status":"IN_PROGRESS"}

--- 5. DELETE /tasks/mppaaniys4w (Delete Task) ---
Status: 204
Body: 

--- 6. GET /tasks/mppaaniys4w (Get Miss - 404) ---
Status: 404
Body: {"message":"Task with ID \"mppaaniys4w\" not found","error":"Not Found","statusCode":404}
```

---

## 5. Code Execution Trace (Flow POST /tasks)

Dưới đây là sơ đồ trace đường đi của request `POST /tasks` qua 3 điểm chạm chính xác trong source code:

1. **Điểm chạm 1 - Controller Entry**:
   - **File & Dòng**: [src/tasks/tasks.controller.ts:22](file:///d:/Nghia-project/escape-beta/task-management/src/tasks/tasks.controller.ts#L22)
   - **Method**: `create(@Body() createTaskDto: CreateTaskDto)`
   - **Mô tả**: Tiếp nhận dữ liệu JSON payload từ request body của client và bàn giao cho service.

2. **Điểm chạm 2 - Service Logic**:
   - **File & Dòng**: [src/tasks/tasks.service.ts:10](file:///d:/Nghia-project/escape-beta/task-management/src/tasks/tasks.service.ts#L10)
   - **Method**: `create(createTaskDto: CreateTaskDto)`
   - **Mô tả**: Tiếp nhận data, thực hiện sinh id ngẫu nhiên, khởi tạo trạng thái `status: 'PENDING'` mặc định.

3. **Điểm chạm 3 - Store Push**:
   - **File & Dòng**: [src/tasks/tasks.service.ts:17](file:///d:/Nghia-project/escape-beta/task-management/src/tasks/tasks.service.ts#L17)
   - **Mô tả**: Đẩy thực thể task vừa tạo vào mảng lưu trữ cục bộ `this.tasks.push(task)` và trả kết quả về cho Controller phản hồi client.

---

## 6. Design Decisions

### A. Phân tách rõ ràng Trách nhiệm (Separation of Concerns)
- **Controller**: Đóng vai trò là HTTP Adapter. Chỉ tiếp nhận tham số, định nghĩa URL routing và mã trạng thái HTTP trả về (`@HttpCode(HttpStatus.NO_CONTENT)` cho DELETE, mặc định `201` cho POST, `200` cho GET/PATCH). Controller không có quyền truy cập trực tiếp vào mảng in-memory.
- **Service**: Nơi tập trung toàn bộ logic nghiệp vụ (business logic) và lưu trữ in-memory. Đảm bảo tính độc lập và dễ dàng tích hợp Database thực tế sau này mà không cần chỉnh sửa Controller.

### B. Định nghĩa Task dưới dạng Class thay vì Interface
- **Vấn đề**: Khi bật `isolatedModules` và `emitDecoratorMetadata` trong dự án NestJS/TypeScript, trình biên dịch yêu cầu tất cả các kiểu dữ liệu dùng làm kiểu phản hồi hoặc kiểu đối số của decorated handler (như `create(...): Task`) phải là class. Lý do là interface sẽ biến mất hoàn toàn ở runtime, khiến trình tạo type metadata của NestJS bị lỗi `TS1272`.
- **Giải quyết**: Khai báo `Task` là một `class` cụ thể tại [src/tasks/task.interface.ts:1](file:///d:/Nghia-project/escape-beta/task-management/src/tasks/task.interface.ts#L1) để vừa định nghĩa kiểu dữ liệu tĩnh trong TypeScript, vừa giữ lại kiểu thực tế cho NestJS decorator metadata lúc ứng dụng chạy.

### C. Ném Lỗi Fail-Fast qua NestJS Exceptions
- Thay vì trả về `null`, chuỗi trống hay mã HTTP `200` kèm body lỗi thủ công, hệ thống trực tiếp ném `NotFoundException` (HTTP 404) chuẩn của NestJS khi không tìm thấy Task ID thích hợp. Điều này đảm bảo HTTP status phản hồi luôn thống nhất và thân thiện với người dùng REST API.
