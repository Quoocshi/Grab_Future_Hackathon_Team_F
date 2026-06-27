# Github Workflow

# 1. **Nguyên Tắc Cốt Lõi**

> ❗ Không bao giờ đẩy code trực tiếp lên nhánh `main`

- `main` là nhánh **quan trọng, ổn định nhất** của dự án
- Mọi thay đổi phải được thực hiện thông qua **Pull Request (PR)**.
- PR là nơi để **review code**, giúp đảm bảo chất lượng và phát hiện lỗi sớm.

# 2.  **Tổng Quan Quy Trình Làm Việc**

1. **Tạo Branch**: Tạo một nhánh mới từ main để làm công việc của bạn.
2. **Code & Commit**: Viết code trên nhánh mới và commit thường xuyên.
3. **Tạo Pull Request**: Khi hoàn thành, tạo một yêu cầu để sáp nhập code vào nhánh main.
4. **Review & Thảo luận**: Các thành viên khác xem code, góp ý.
5. **Merge**: Sau khi được duyệt, sáp nhập code vào nhánh main.

# 3.  **Chu Kỳ Làm Việc Cá Nhân**

---

**Ví dụ: ****công việc của bạn là thực hiện tính năng "**Trang đăng nhập**".

## 1. **Đồng bộ code mới nhất về máy**

Luôn **bắt đầu** bằng việc cập nhật nhánh `main` ở local:

```bash
# Chuyển về nhánh main
git checkout main

# Kéo code mới nhất từ GitHub
git pull origin main
```

---

## 2. **Tạo nhánh mới cho tính năng**

> 💡 Quy tắc đặt tên nhánh:
> 
> `loai-cong-viec/ten-tinh-nang`
> 
> Ví dụ:
> 
> `feature/login-page`, `fix/header-css-bug`, `docs/update-readme`
> 
> 💡 Các loại nhánh phổ biến:
> 
> |🧩 **Prefix**|📝 **Dùng khi...**|**Ví dụ**|
> |---|---|---|
> |`feature/`|Thêm tính năng mới|`feature/search-bar`|
> 
> `feature/chat-ui` |  
> | `fix/` | Sửa lỗi | `fix/navbar-bugfix/image-loading` |  
> | `chore/` | Công việc phụ trợ: cập nhật cấu hình, dọn code, update lib... | `chore/upgrade-dependencies` |  
> | `refactor/` | Tái cấu trúc code, không thay đổi logic | `refactor/api-handlers` |  
> | `test/` | Thêm hoặc sửa test | `test/add-user-tests` |  
> | `docs/` | Cập nhật tài liệu (README, hướng dẫn...) | `docs/update-readme` |

```bash
# Tạo và chuyển sang nhánh mới
git checkout -b feature/login-page
```

---

## 3. **Viết code & commit thường xuyên**

> Quy tắc viết Commit Message:
> 
> - ✅ Tốt: `feat: Create basic UI for login page`
> - ❌ Tệ: `update`, `fix bug`

```bash
# Thêm thay đổi vào staging
git add .

# Commit với message có ý nghĩa
git commit -m "feat: Create basic UI for login page"
```

---

## 4. **Đẩy nhánh lên GitHub**

```bash
# Đẩy nhánh của bạn lên repo trên GitHub
git push origin feature/login-page
```

---

## 5. **Tạo Pull Request (PR) 📬**

1. Vào GitHub → nhấn **Compare & pull request**
    
2. **Tiêu đề PR**:
    
    `Feat: Implement Login Page`
    
3. **Mô tả PR**:
    
    - ✅ Mô tả công việc đã làm
    - 📸 Chụp ảnh giao diện (nếu có UI)
4. **Reviewers**: Gắn 1–2 thành viên để review
    

---

## 6. **Review, thảo luận & merge ✅**

### 🔍 Code Review

- Reviewer để lại comment trực tiếp trên dòng code
- Người tạo PR cập nhật bằng cách **commit thêm vào cùng nhánh**

###  Merge Code

- Khi code đã ổn và được người review chấp nhận, người tạo **PR** nhấn vào **Merge pull request** để merge code.

### Dọn dẹp

- Sau khi merge, hãy **Delete branch** trên GitHub để repo gọn gàng.

---

#  Xử Lý Merge Conflict (Xung đột)

> ⚠️ Khi PR báo "This branch has conflicts", làm theo hướng dẫn sau:

### Bước 1: Cập nhật nhánh `main` ở máy

```bash
git checkout main
git pull origin main
```

### Bước 2: Quay lại nhánh của bạn và merge `main` vào

```bash
git checkout feature/login-page
git merge main
```

### Bước 3: Giải quyết xung đột

- Mở file bị xung đột trong VS Code
    
- Xử lý các khối
    
    ```
    <<<<<<< HEAD
    đoạn A
    =======
    đoạn B
    >>>>>>> main
    ```
    
- Giữ lại đoạn code đúng và xóa các ký hiệu đặc biệt.
    
- **Hoặc**: chọn giữ lại code của bạn (**Accept Current Change**), code của main (**Accept Incoming Change**), hoặc cả hai (**Accept Both Changes**).
    

### Bước 4: Hoàn tất

• Sau khi sửa xong tất cả các file, commit lại như bình thường.

```bash
git add .
git commit -m "chore: Resolve merge conflict from main"
git push origin feature/login-page
```