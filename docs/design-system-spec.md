# Tài Liệu Đặc Tả Thiết Kế (Design System & Modular Architecture)
## Dự án: "Quảng Ninh 2076 — A Dream About the Future"

---

## 1. Cấu trúc Thư mục Độc lập (Option B)

```
Future_City/
├── index.html                     # Entrypoint chứa cấu trúc HTML của các slide
├── assets/
│   ├── css/
│   │   ├── design-tokens.css      # Hệ thống biến 3 lớp (Primitive → Semantic → Component)
│   │   ├── viewport.css           # Căn chỉnh Canvas cố định 16:9 (1920x1080) và Stage HUD
│   │   ├── animations.css         # Keyframes, glow neon, radar scan, warp tunnel
│   │   └── slides.css             # Định dạng layout chuyên biệt cho từng Slide
│   ├── js/
│   │   ├── deck-stage.js          # Engine tự động co giãn ma trận transform theo viewport
│   │   ├── sound-effects.js       # Bộ tổng hợp âm thanh Sci-Fi (Web Audio API) không cần file ngoài
│   │   ├── particles.js           # Hệ thống hạt canvas tương tác chuột & chế độ bẻ cong không-thời gian
│   │   └── presentation.js        # Bộ điều khiển chuyển cảnh, hotkeys bàn phím, countdown logic
│   └── media/                     # Thư mục sẵn sàng để đưa thêm video/ảnh thực tế
└── docs/
    └── design-system-spec.md      # Bản đặc tả kỹ thuật này
```

---

## 2. Hệ Thống Design Tokens (3 Layers)

### Lớp 1: Primitive Tokens (Giá trị cốt lõi)
- **Bảng màu Biển & Không Gian**: `--primitive-color-navy-950` (`#030712`), `--primitive-color-navy-900` (`#0b1329`), `--primitive-color-navy-800` (`#111d40`).
- **Bảng màu Sinh thái & Vịnh Hạ Long**: `--primitive-color-cyan-400` (`#22d3ee`), `--primitive-color-emerald-400` (`#34d399`), `--primitive-color-emerald-500` (`#10b981`).
- **Bảng màu Công nghệ Viễn tưởng**: `--primitive-color-violet-500` (`#8b5cf6`), `--primitive-color-magenta-400` (`#e879f9`), `--primitive-color-blue-500` (`#3b82f6`).
- **Bảng màu Di sản & Đất mỏ**: `--primitive-color-amber-400` (`#fbbf24`), `--primitive-color-coal-900` (`#0f172a`).

### Lớp 2: Semantic Tokens (Ý nghĩa bối cảnh)
- Nền Slide: `--bg-slide` (Radial Gradient chiều sâu từ `#0d1b3e` ra đen không gian).
- Thẻ Kính (Glassmorphism): `--bg-surface-glass` (`rgba(17, 29, 64, 0.65)` với `backdrop-filter: blur(16px)`).
- Hiệu ứng phát quang (Glow): `--glow-cyan`, `--glow-violet`, `--glow-emerald`.

### Lớp 3: Component Tokens (Phần tử giao diện)
- Khung hình chuẩn: `--stage-width: 1920px`, `--stage-height: 1080px`.
- Thẻ nhân vật, huy hiệu phân cảnh, nút điều hướng HUD, khối đối thoại kịch bản.

---

## 3. Nội Dung Phân Cảnh 1 (Scene 1: A Dream About the Future)

| Slide | Tên phân cảnh | Mô tả nội dung & Kịch học | Visual & Âm thanh |
| :---: | :--- | :--- | :--- |
| **1** | **Hero Deck: A Dream About the Future** | Mở màn vở kịch. Giới thiệu chuyến du hành Quảng Ninh 2026 $\rightarrow$ 2076. | Hiệu ứng nổi bồng bềnh, chữ gradient kim loại, nhạc dạo đầu dịu êm. |
| **2** | **Dramatis Personae (12 Nhân vật)** | Giới thiệu 3 nhóm tuyến nhân vật: Thế hệ 2026 (Minh, Lan, Narrator), Sứ giả 2076 (Alex, ROBO, Thị trưởng), và Chuyên gia kiến tạo (Kỹ sư, Nhà khoa học, v.v.). | Grid 3 cột chia màu hologram (Cyan, Violet, Emerald), hover card dịch chuyển. |
| **3** | **Scene 1: Quang Ninh 2026** | Minh và Lan ngắm bản đồ quê hương, đối thoại về vẻ đẹp Hạ Long và ước mơ xe bay/robot nhưng bảo vệ thiên nhiên. | Split-layout: Bên trái trích dẫn thoại nhân vật; bên phải 3 khối biểu tượng (Hạ Long, Mỏ than, Ước mơ). |
| **4** | **The Time Portal (3... 2... 1!)** | Alex và Robot ROBO (99.99% IQ) xuất hiện. Khởi động cổng không-thời gian nhảy vọt 50 năm. | Vòng xoáy lượng tử Sci-Fi quay ngược chiều, đếm ngược `3... 2... 1!`, bẻ cong hạt vi lượng (Warp speed) kèm âm thanh rít không gian. |

---

## 4. Hướng Dẫn Điều Khiển Sân Khấu

- **Chuyển slide tới**: Nhấn phím `Space`, `ArrowRight` ($\rightarrow$), `PageDown` hoặc bấm nút **Tiếp** trên thanh điều khiển.
- **Lùi lại slide trước**: Nhấn phím `ArrowLeft` ($\leftarrow$), `PageUp` hoặc bấm nút **Trước**.
- **Chế độ toàn màn hình**: Nhấn phím `F` hoặc nút **F11** trên HUD để bung trọn màn hình trình chiếu máy chiếu/tivi.
- **Bật / Tắt âm thanh**: Nhấn phím `M` hoặc bấm nút **Sound** trên HUD.
- **Nhảy nhanh slide**: Nhấn phím số `1`, `2`, `3`, `4` trên bàn phím.
