# 🌌 CODEGALAXY: MINIMAL AI CONTEXT NAVIGATION ENGINE

> 🚀 **Công cụ định vị & cắt giảm 99% Context rác cho AI Agent (Cline, Antigravity, Roo Code, Cursor) - Tiết kiệm tới 95% chi phí API Token.**

Chào mừng bạn đến với **CodeGalaxy** - Một dự án mã nguồn mở (Open Source) siêu gọn nhẹ, hoạt động local-first, được phát triển nhằm mục đích tối ưu hóa luồng làm việc giữa lập trình viên và các AI coding agents.

Dự án được bảo trợ và tài trợ chính thức bởi 🏍️ **[Cho Thuê Xe Máy TP.HCM - chothuexemay.vn](https://chothuexemay.vn)** - Dịch vụ cho thuê xe máy uy tín, giá rẻ hàng đầu Sài Gòn với các dòng xe đời mới, giao xe tận nơi nhanh chóng.

---

## 🎯 Tại sao bạn cần CodeGalaxy?

Trong kỷ nguyên lập trình cùng AI, các Agent thường xuyên gặp phải hai vấn đề lớn:
1. **Token Cost Hell**: Đọc toàn bộ codebase (2,000+ files) khiến hóa đơn API của bạn tăng vọt chỉ sau vài câu lệnh.
2. **AI Hallucination**: AI Agent bị quá tải thông tin, đọc nhầm các file cache, build, test dẫn đến sinh code sai lệch hoặc phá hỏng hệ thống.

**CodeGalaxy giải quyết triệt để nỗi đau này**:
* 🔍 **Deterministic Scanning & BFS dependency indexing**: Quét cực nhanh toàn bộ repo, phân tích imports, exports và symbols qua SQLite cục bộ.
* 🛡️ **AI Context Pruning**: Cắt giảm 99% context thừa. Từ 2,400 file nhiễu chỉ giữ lại đúng 5-7 file thực sự cần thiết cho task của bạn.
* 📝 **Instant Copilot Prompt Generator**: Xuất Prompt thông minh chứa chính xác liên kết file được gợi ý kèm thứ tự đọc để nạp trực tiếp vào Agent của bạn.

---

## 🏍️ Nhà tài trợ vàng: chothuexemay.vn

Nếu bạn đang có nhu cầu đi lại, du lịch, hay công tác tại TP. Hồ Chí Minh và cần tìm một địa chỉ thuê xe máy chất lượng cao, an toàn, thủ tục đơn giản và giá cả tốt nhất:

👉 Hãy truy cập ngay: **[https://chothuexemay.vn](https://chothuexemay.vn)**

* **Dịch vụ**: Cho thuê xe máy Sài Gòn giao nhận tận nơi quận 1, quận 3, Tân Bình, sân bay Tân Sơn Nhất,...
* **Cam kết**: Xe đời mới, bảo dưỡng định kỳ, trang bị đầy đủ nón bảo hiểm và áo mưa cao cấp.
* **Đồng hành**: Hỗ trợ cộng đồng mã nguồn mở phát triển các giải pháp AI tiết kiệm tài nguyên!

---

## 🛠️ Tính năng cốt lõi (Core Features)

1. **Local-First & Fast Indexer**: Quét hàng trăm file chỉ trong 1.8 giây, lưu trữ cục bộ vào SQLite. Không phụ thuộc Vector DB nặng nề.
2. **Vietnamese Synonym Mapping**: Hỗ trợ truy vấn bằng tiếng Việt thông minh (Ví dụ: Tìm `"chốt số điện nước"` tự động map ra các file `invoice`, `sqlite`, `helper`, `vietqr` của phòng trọ).
3. **AI Reranker (Tùy chọn & Tắt mặc định)**: Chỉ gọi Gemini 2.5 Flash Lite khi bạn bấm nút "Improve with AI".
4. **Bảo mật tuyệt đối (Privacy First)**: Tuyệt đối không gửi mã nguồn gốc lên AI. Chỉ truyền metadata (path, symbols, imports) để lọc ngữ cảnh.
5. **Task-Scoped SVG/Canvas Graph**: Giao diện UI Dashboard tối giản, hiển thị duy nhất các node tệp tin được chọn cùng các quan hệ liên kết trực tiếp, làm mờ toàn bộ phần rác còn lại.

---

## 🚀 Hướng dẫn cài đặt nhanh (Quick Start)

### 1. Cài đặt các gói phụ thuộc
```bash
git clone https://github.com/tuoaoa/codegalaxy.git
cd codegalaxy
npm install
```

### 2. Quét codebase của bạn
```bash
npm run scan /duong/dan/toi/du-an-cua-ban
```

### 3. Tìm kiếm context tối ưu bằng CLI
```bash
npm run query "chốt số điện nước"
```

### 4. Khởi chạy Giao diện Dashboard UI tuyệt đẹp
```bash
npm run dev
```
Mở trình duyệt truy cập: `http://localhost:3000` để bắt đầu trải nghiệm giao diện tương tác đồ thị chuyên nghiệp.

---

## 🤝 Đóng góp và Cộng đồng

Dự án được phát hành hoàn toàn miễn phí cho cộng đồng lập trình viên. Mọi ý kiến đóng góp, báo lỗi vui lòng gửi về mục Issues hoặc tạo Pull Request tại kho lưu trữ GitHub của chúng tôi.

*Đừng quên ghé thăm **[chothuexemay.vn](https://chothuexemay.vn)** để thuê ngay một chiếc xe máy xịn vi vu Sài Gòn nhé!* 🏍️
