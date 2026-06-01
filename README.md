# NestJS Request Validation & Mass-Assignment Protection

Dự án giới thiệu giải pháp xác thực request nâng cao sử dụng NestJS, bao gồm kiểm thực lồng nhau đệ quy (Recursive Nested DTO validation) và triển khai custom validator decorator chống rò rỉ dữ liệu hoặc mass-assignment.

---

## 1. Challenge Description

Bài toán tập trung giải quyết các bài toán xác thực dữ liệu phức tạp ở biên hệ thống (API Gateway/Controller) trước khi đi vào tầng logic nghiệp vụ:
- **Nested DTO Validation**: Thiết lập mối quan hệ lồng nhau giữa `CreateUserDto` và `AddressDto` để kiểm thực toàn bộ dữ liệu địa chỉ gửi lên.
  - Ràng buộc: `street` (chuỗi >= 3 ký tự), `city` (chuỗi >= 2 ký tự), `zipCode` (phải là số dài từ 4-10 ký tự).
  - Yêu cầu đệ quy: Payload lỗi ở nested property phải hiển thị chính xác đường dẫn lỗi dưới dạng `address.zipCode` và trả về mã lỗi HTTP `400 Bad Request`.
- **Custom Decorator `@IsCorporateEmail()`**: Chặn các email đăng ký tài khoản từ nhà cung cấp dịch vụ công cộng như Gmail, Yahoo, Hotmail, Outlook.
  - Yêu cầu an toàn: Chuyển đổi chữ thường (lowercase) domain trước khi so khớp để tránh bypass bằng cách viết hoa chữ cái (ví dụ: `john.doe@GMAIL.COM`).
  - Yêu cầu mở rộng: Hỗ trợ tùy biến thông báo lỗi thông qua `validationOptions`.
- **Unit & Integration Testing**: Viết unit test cho constraint của custom decorator và integration e2e test để tự động hóa kiểm định cả 3 nhánh flow chính của API `/users`.

---

## 2. How to Run

### Yêu cầu môi trường
- **Node.js**: >= 18.x
- **npm**: >= 9.x

### Lệnh chạy kiểm thử và vận hành

1. **Khởi chạy kiểm thử đơn vị (Unit Tests)**:
   ```bash
   npm test
   ```
   *Chạy toàn bộ các test suite kiểm thử logic của custom email validator.*

2. **Khởi chạy kiểm thử tích hợp (E2E Integration Tests)**:
   ```bash
   npm run test:e2e
   ```
   *Chạy toàn bộ kiểm thử tích hợp HTTP sử dụng supertest và NestJS testing module.*

3. **Biên dịch dự án**:
   ```bash
   npm run build
   ```

4. **Khởi chạy máy chủ sản phẩm**:
   ```bash
   node dist/main.js
   ```

---

## 3. Architecture / Stack

Hệ thống được phát triển trên nền tảng:
- **NestJS v11.x** & **TypeScript v5.7**
- **class-validator** & **class-transformer** làm động cơ validate.
- **Supertest** & **Jest** phục vụ viết và chạy kiểm thử tự động.

### Sơ đồ Quy trình Xác thực & Phản hồi (Mermaid Diagram)

```mermaid
sequenceDiagram
    autonumber
    actor Client
    participant App as NestJS Application
    participant Pipe as ValidationPipe
    participant DTO as CreateUserDto
    participant NestedDTO as AddressDto
    participant Decorator as IsCorporateEmailConstraint
    participant Interceptor as TransformInterceptor
    participant Controller as UsersController
    participant Filter as AllExceptionsFilter

    Client->>App: POST /users (JSON Payload)
    App->>Pipe: Chuyển tiếp request body
    Pipe->>DTO: Ánh xạ và kiểm thực CreateUserDto
    DTO->>Decorator: Kích hoạt kiểm tra @IsCorporateEmail()
    alt Email thuộc gmail.com/yahoo.com...
        Decorator-->>Pipe: Thất bại (Trả về thông tin lỗi email)
    else Email hợp lệ
        Decorator-->>DTO: Thành công
    end

    DTO->>NestedDTO: Ánh xạ đệ quy @ValidateNested() & @Type()
    alt zipCode không khớp regex ^\d{4,10}$
        NestedDTO-->>Pipe: Thất bại (Lỗi tại path: address.zipCode)
    else zipCode hợp lệ
        NestedDTO-->>DTO: Thành công
    end

    alt Có bất kỳ lỗi xác thực nào
        Pipe-->>Filter: Bắt lỗi bằng AllExceptionsFilter
        Filter-->>Client: Trả về HTTP 400 Bad Request (Error Details)
    else Toàn bộ dữ liệu hợp lệ
        Pipe->>Interceptor: Đi qua TransformInterceptor (Pre-handler)
        Interceptor->>Controller: Chuyển tiếp DTO an toàn
        Controller-->>Interceptor: Trả về raw data
        Interceptor->>Interceptor: Đọc statusCode & Wrap thành Success Envelope
        Interceptor-->>Client: Trả về HTTP 201 Created (Created User JSON)
    end
```

---

## 4. Smoke Test (Evidence Thực Tế)

Dưới đây là kết quả log thực tế thu được từ máy chủ NestJS khi gửi các request kiểm thực:

### Case 1: Hợp lệ (Valid corporate user) -> `201 Created`
- **Request**:
  ```bash
  curl -i -X POST http://localhost:3000/users -H "Content-Type: application/json" -d '{"email":"john.doe@company.com","address":{"street":"123 Main Street","city":"New York","zipCode":"10001"}}'
  ```
- **Response**:
  ```http
  HTTP/1.1 201 Created
  Content-Type: application/json; charset=utf-8
  ```
  ```json
  {
    "statusCode": 201,
    "message": "SUCCESS",
    "data": {
      "id": "mpu8pxjuo87",
      "email": "john.doe@company.com",
      "address": {
        "street": "123 Main Street",
        "city": "New York",
        "zipCode": "10001"
      }
    },
    "timestamp": "2026-06-01T03:00:59.854Z"
  }
  ```

### Case 2: Gmail bị chặn (Gmail reject) -> `400 Bad Request`
- **Request**:
  ```bash
  curl -i -X POST http://localhost:3000/users -H "Content-Type: application/json" -d '{"email":"john.doe@gmail.com","address":{"street":"123 Main Street","city":"New York","zipCode":"10001"}}'
  ```
- **Response**:
  ```http
  HTTP/1.1 400 Bad Request
  Content-Type: application/json; charset=utf-8
  ```
  ```json
  {
    "statusCode": 400,
    "error": "BadRequestException",
    "message": [
      "email must be a corporate email address (public domains like gmail.com, yahoo.com, hotmail.com, or outlook.com are not allowed)"
    ],
    "timestamp": "2026-06-01T03:00:59.862Z",
    "path": "/users"
  }
  ```

### Case 3: ZipCode không hợp lệ (Bad zipCode) -> `400 Bad Request`
- **Request**:
  ```bash
  curl -i -X POST http://localhost:3000/users -H "Content-Type: application/json" -d '{"email":"john.doe@company.com","address":{"street":"123 Main Street","city":"New York","zipCode":"12"}}'
  ```
- **Response**:
  ```http
  HTTP/1.1 400 Bad Request
  Content-Type: application/json; charset=utf-8
  ```
  ```json
  {
    "statusCode": 400,
    "error": "BadRequestException",
    "message": [
      "address.zipCode must be a numeric string between 4 and 10 digits"
    ],
    "timestamp": "2026-06-01T03:00:59.864Z",
    "path": "/users"
  }
  ```

### Case 4: Minh họa bỏ quên `@Type` (Bypass validation) -> `201 Created`
Dưới đây là phần code diff minh họa tác hại khi xóa decorator `@Type(() => AddressDto)` khỏi thuộc tính `address` trong DTO:

```diff
  export class CreateUserDto {
    @IsEmail()
    @IsCorporateEmail()
    email: string;
 
    @IsDefined({ message: 'address is required' })
    @ValidateNested()
-   @Type(() => AddressDto)
    address: AddressDto;
  }
```

- **Tác hại**: Khi xóa dòng `@Type(() => AddressDto)`, nếu client gửi lên payload có `zipCode` không hợp lệ (ví dụ: `"zipCode": "12"`), NestJS sẽ **không** báo lỗi và vẫn trả về `201 Created`. Lý do là không có constructor để ánh xạ JSON thô thành thực thể `AddressDto`, khiến `class-validator` bỏ qua bước kiểm tra `@ValidateNested()`.

---

## 5. Code Execution Trace (Flow POST /users)

Request `POST /users` đi qua 5 điểm chạm chính xác trong source code để thực hiện xác thực và định dạng:

1. **Điểm chạm 1 - Đăng ký ValidationPipe & Interceptor toàn cục**:
   - **File & Dòng**: [src/main.ts:24](file:///d:/Nghia-project/escape-beta/task-management/src/main.ts#L24)
   - **Mã nguồn**: `app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))`
   - **Mô tả**: Kích hoạt ValidationPipe toàn cục để lọc sạch request và tiến hành xác thực trước khi route handler được kích hoạt. Ở các dòng 30-31, `TransformInterceptor` và `AllExceptionsFilter` cũng được đăng ký toàn cục.

2. **Điểm chạm 2 - Khai báo DTO & Ràng buộc đệ quy**:
   - **File & Dòng**: [src/users/dto/create-user.dto.ts:6](file:///d:/Nghia-project/escape-beta/task-management/src/users/dto/create-user.dto.ts#L6)
   - **Mã nguồn**: `CreateUserDto` sử dụng cặp decorator `@ValidateNested()` và `@Type(() => AddressDto)`.
   - **Mô tả**: ValidationPipe đọc metadata từ class này để xác định rằng trường `address` phải được validate lồng đệ quy.

3. **Điểm chạm 3 - Ràng buộc thuộc tính con**:
   - **File & Dòng**: [src/users/dto/address.dto.ts:3](file:///d:/Nghia-project/escape-beta/task-management/src/users/dto/address.dto.ts#L3)
   - **Mã nguồn**: `AddressDto` sử dụng `@Matches(/^\d{4,10}$/)` trên thuộc tính `zipCode`.
   - **Mô tả**: Thực thi kiểm tra định dạng của các trường con bên trong `address`.

4. **Điểm chạm 4 - Custom Decorator kiểm tra email**:
   - **File & Dòng**: [src/users/validators/is-corporate-email.validator.ts:3](file:///d:/Nghia-project/escape-beta/task-management/src/users/validators/is-corporate-email.validator.ts#L3)
   - **Mã nguồn**: Hàm `validate(value, args)` so khớp domain email đã được đưa về dạng chữ thường với blocklist.
   - **Mô tả**: Thực hiện loại bỏ các địa chỉ email công cộng, chỉ chấp nhận email doanh nghiệp.

5. **Điểm chạm 5 - Outbound Interceptor Wrapping**:
   - **File & Dòng**: [src/common/interceptors/transform.interceptor.ts:6](file:///d:/Nghia-project/escape-beta/task-management/src/common/interceptors/transform.interceptor.ts#L6)
   - **Method**: `TransformInterceptor.intercept()`
   - **Mô tả**: Bắt lấy dữ liệu thành công trả về từ Controller, đọc statusCode từ context ở dòng 9 và đóng gói thành công thành success envelope trước khi gửi về client. Nếu xảy ra lỗi, [src/common/filters/all-exceptions.filter.ts:4](file:///d:/Nghia-project/escape-beta/task-management/src/common/filters/all-exceptions.filter.ts#L4) sẽ bắt và định dạng lại lỗi thay thế.

---

## 6. Design Decisions

### A. Chọn Global Interceptor + Filter thay vì Decorator per-controller
- **Quyết định**: Sử dụng `app.useGlobalInterceptors()` và `app.useGlobalFilters()` trong file khởi chạy ứng dụng.
- **Trade-off (DRY & Nhất quán vs Tính linh hoạt cục bộ)**:
  - *Sử dụng toàn cục (Global)*: Giúp toàn bộ API của hệ thống thống nhất một format phản hồi, tránh tình trạng viết code format thủ công trong từng API, bảo vệ hệ thống khỏi việc leak stack trace khi lập trình viên quên gắn decorator.
  - *Sử dụng cục bộ (Per-controller)*: Tốt cho các hệ thống lai (ví dụ vừa trả về JSON API vừa render HTML views). Tuy nhiên, đối với hệ thống thuần REST API, dùng cục bộ dễ dẫn đến thiếu sót và không đồng bộ cấu trúc lỗi.

### B. Chọn `registerDecorator` thay vì Class implement `ValidatorConstraintInterface`
- **Quyết định**: Dùng `registerDecorator` cho `@IsCorporateEmail()`.
- **Trade-off (Sự tinh gọn vs Khả năng nhúng dependency)**:
  - *Dùng `registerDecorator`*: Code tinh gọn, đóng gói logic validate nhỏ trong cùng một file, dễ viết unit test độc lập.
  - *Dùng Class Interface*: Cho phép tiêm (inject) các service khác (như TypeORM Repository) để kiểm tra dữ liệu từ database. Tuy nhiên, nó tăng độ phức tạp trong việc đăng ký DI container.

### C. Chọn Block List dạng Hardcode thay vì Config-Driven
- **Quyết định**: Lưu danh sách domain cấm trực tiếp dưới dạng mảng tĩnh.
- **Trade-off (Sự độc lập khi deploy vs Sự linh hoạt cấu hình)**:
  - *Hardcode*: Giúp ứng dụng độc lập tuyệt đối khi chạy kiểm thử (Unit test/E2E), đảm bảo test suite luôn chạy ổn định mà không cần mock file cấu hình.
  - *Config-driven*: Cho phép thay đổi blocklist qua biến môi trường (.env) không cần build lại code, nhưng tăng nguy cơ crash runtime nếu biến môi trường cấu hình sai hoặc thiếu.
