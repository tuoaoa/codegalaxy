# 🌌 CodeGalaxy: AI Context Copilot for Large Codebases

> **Prunes up to 99% of unrelated files from task-specific AI context selection. Local-first, lightweight, and deterministic.**
>
> **Tự động lọc bỏ đến 99% file nhiễu khỏi ngữ cảnh của AI Agent cho từng task cụ thể. Hoạt động local-first, siêu nhẹ và chuẩn xác.**

---

### 🌐 Language Select / Lựa chọn ngôn ngữ
* [English Version](#-english-version)
* [Phiên bản Tiếng Việt](#-phien-ban-tieng-viet)

---

## 🇺🇸 English Version

CodeGalaxy helps developers and AI coding agents (Cline, Antigravity, Roo Code, Cursor) isolate the absolute minimal set of files required for a specific coding task, eliminating context bloat and preventing LLM hallucination.

### 🎯 The "Holy Shit" Metric: Context Reduction
Instead of claiming hypothetical token savings, CodeGalaxy focuses on a measurable, honest metric: **Files not selected for this task**.

```
📊 [Large Codebase Scan] 2,438 total files ──► Pruned 99.71% unrelated noise ──► 7 task-relevant files
```
By keeping the context extremely narrow, AI agents read faster, work cheaper, and rarely hallucinate.

### 🏍️ Supported & Maintained By
This open-source tool is proudly built and maintained alongside 🏍️ **[chothuexemay.vn](https://chothuexemay.vn)** - The premium motorbike rental platform in Ho Chi Minh City, supporting lightweight, resource-saving open source developer tooling.

### 🚀 How It Works (Step-by-Step)
```
[User Query] ──► Local Synonym Expansion ──► SQLite Token Match & BFS Hops ──► Task-Scoped Subgraph
```
1. **Local Indexing (Zero External DB)**: CodeGalaxy recursively parses your codebase imports, exports, and symbols in ~1.8 seconds using a lightweight parser, storing the results in local SQLite (`codegalaxy.db`).
2. **Deterministic Context Narrowing**: Splits your task query into technical and Vietnamese synonyms (e.g., matching `"chốt số điện nước"` automatically to `invoice`, `sqlite`, `helper`, `vietqr` paths and symbols).
3. **BFS Dependency Traversal**: Resolves 1-hop and 2-hop import relationships of match candidates to pull structural context files automatically.
4. **Lightweight AI Rerank (Optional & OFF by Default)**: Toggles Gemini 2.5 Flash on metadata only (paths/symbols) to refine the final recommended subset—**never sending raw source code to external servers**.
5. **Interactive Subgraph Visualization**: Draws glowing node representations of selected files and fades out unrelated codebase noise.

### ⚡ Quick Start

#### 1. Install Dependencies
```bash
git clone https://github.com/tuoaoa/codegalaxy.git
cd codegalaxy
npm install
```

#### 2. Scan Your Target Codebase
```bash
npm run scan /absolute/path/to/your/project
```

#### 3. Query Context via CLI
```bash
npm run query "chốt số điện nước"
```

#### 4. Open the Interactive Dashboard UI
```bash
npm run dev
```
Navigate to `http://localhost:3000` to view the modern force-directed visualizer, dynamic context reduction stats, and direct copy-paste prompt generator.

### 📝 Generated Prompt Copilot Output
CodeGalaxy outputs an optimized, copy-pasteable Markdown block that you can feed directly into Cline or Antigravity:
```markdown
Recommended files for AI to read:
  1. [page.js](file:///app/r/[token]/page.js) - Handles invoice calculations and rent totals.
  2. [route.js](file:///app/api/invoice/route.js) - Calculates electric/water bills.
  3. [prisma.ts](file:///lib/prisma.ts) - Direct DB connection persistence layer.

Do not read other unselected files unless absolutely necessary.
```

### 🤝 Contributing & Support
We welcome issues and PRs! If you are traveling or working in Ho Chi Minh City and need reliable, well-maintained scooter rentals, support our sponsor at **[chothuexemay.vn](https://chothuexemay.vn)**.

---

## 🇻🇳 Phiên bản Tiếng Việt

CodeGalaxy giúp lập trình viên và các AI coding agents (Cline, Antigravity, Roo Code, Cursor) tự động định vị và cô lập đúng nhóm file tối giản cần thiết cho một task lập trình cụ thể, loại bỏ hoàn toàn tình trạng phình ngữ cảnh (context bloat) và hạn chế tối đa việc AI bị ảo giác.

### 🎯 Chỉ số ấn tượng thực tế: Tối ưu hóa ngữ cảnh
Thay vì đưa ra các con số hứa hẹn mơ hồ về chi phí token tiết kiệm được, CodeGalaxy tập trung vào một số liệu thực tế đo lường được: **Số lượng file nhiễu được loại bỏ khỏi tác vụ**.

```
📊 [Quét codebase lớn] 2,438 tổng số file ──► Lọc sạch 99.71% file không liên quan ──► Giữ lại 7 file cốt lõi cho task
```
Khi ngữ cảnh được thu hẹp tối đa, các AI agent sẽ đọc hiểu nhanh hơn, hoạt động rẻ hơn và đưa ra phương án chỉnh sửa chính xác nhất.

### 🏍️ Đồng hành và Bảo trợ bởi
Dự án mã nguồn mở này được xây dựng và duy trì song hành cùng 🏍️ **[chothuexemay.vn](https://chothuexemay.vn)** - Nền tảng cho thuê xe máy uy tín, chuyên nghiệp hàng đầu tại TP. Hồ Chí Minh, chung tay hỗ trợ các công cụ mã nguồn mở gọn nhẹ và tiết kiệm tài nguyên cho lập trình viên.

### 🚀 Nguyên lý hoạt động từng bước
```
[Yêu cầu người dùng] ──► Mở rộng từ đồng nghĩa tiếng Việt ──► Khớp SQLite Token & BFS ──► Vẽ đồ thị Task-Scoped
```
1. **Lập chỉ mục nội bộ (Không cần Vector DB)**: CodeGalaxy quét đệ quy các liên kết import, export và các symbols chỉ trong ~1.8 giây bằng parser tối giản, lưu trữ vào SQLite cục bộ (`codegalaxy.db`).
2. **Thu hẹp ngữ cảnh Deterministic**: Tách từ khóa trong yêu cầu của bạn và ánh xạ thông minh qua bản đồ từ đồng nghĩa tiếng Việt (Ví dụ: tìm kiếm `"chốt số điện nước"` sẽ tự động hiểu và map ra các file `invoice`, `sqlite`, `helper`, `vietqr` chứa cấu trúc tương ứng).
3. **Duyệt đồ thị BFS**: Phân tích quan hệ import 1-hop và 2-hop của các file khớp từ khóa để kéo theo các tệp tin cấu trúc phụ thuộc có liên quan trực tiếp.
4. **AI Rerank siêu nhẹ (Tùy chọn & Tắt mặc định)**: Chỉ gọi Gemini 2.5 Flash để tinh lọc danh sách cuối dựa trên metadata (đường dẫn & danh sách symbols) — **tuyệt đối không gửi mã nguồn gốc lên server bên ngoài**.
5. **Giao diện Đồ thị Tương tác**: Render duy nhất nhóm file liên quan lên canvas với hiệu ứng phát sáng (glowing nodes) và làm mờ toàn bộ cấu trúc file không liên quan còn lại.

### ⚡ Cài đặt nhanh

#### 1. Cài đặt các gói phụ thuộc
```bash
git clone https://github.com/tuoaoa/codegalaxy.git
cd codegalaxy
npm install
```

#### 2. Quét codebase dự án của bạn
```bash
npm run scan /duong/dan/tuyet/doi/toi/du-an
```

#### 3. Truy vấn ngữ cảnh qua CLI
```bash
npm run query "chốt số điện nước"
```

#### 4. Khởi chạy Giao diện Dashboard UI tương tác
```bash
npm run dev
```
Truy cập địa chỉ `http://localhost:3000` trên trình duyệt để trải nghiệm bộ đồ thị force-directed, theo dõi thống kê cắt giảm context và nút copy prompt ăn liền cho Agent.

### 📝 Định dạng Prompt xuất ra
Hệ thống sẽ sinh ra một Prompt dạng Markdown tối ưu để bạn copy trực tiếp vào Cline hoặc Antigravity:
```markdown
Recommended files for AI to read:
  1. [page.js](file:///app/r/[token]/page.js) - Handles invoice calculations and rent totals.
  2. [route.js](file:///app/api/invoice/route.js) - Calculates electric/water bills.
  3. [prisma.ts](file:///lib/prisma.ts) - Direct DB connection persistence layer.

Do not read other unselected files unless absolutely necessary.
```

### 🤝 Đóng góp & Hỗ trợ
Chúng tôi luôn chào đón các phản hồi (Issues) và Pull Requests đóng góp từ cộng đồng! Nếu bạn có chuyến công tác, du lịch tại TP. Hồ Chí Minh và cần thuê xe máy chất lượng cao, giao xe tận nơi nhanh chóng, hãy ủng hộ nhà bảo trợ của chúng tôi tại **[chothuexemay.vn](https://chothuexemay.vn)**.
