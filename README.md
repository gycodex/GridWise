
# GridWise - 智图九宫格 🎨

[中文](#中文) | [English](#english)

---

## 中文

GridWise 是一款专为创意工作者和社交媒体运营设计的专业级图片处理工具。它采用 **"增强 -> 抠图 -> 切分"** 的三步工作流，集成了 TensorFlow.js AI 画质增强、智能背景移除和等距切图功能，帮助用户在几秒钟内完成高质量的图片素材加工。

### ✨ 核心功能

1.  **AI 画质增强 (TensorFlow.js)** 🚀
    *   利用浏览器端 GPU 加速，支持 2x/4x 图片超分辨率重建。
    *   智能细节锐化算法，修复模糊图片，提升清晰度。

2.  **智能背景移除** ✂️
    *   内置基于 Canvas 的智能色彩识别算法。
    *   支持容差调节、边缘平滑以及“仅删除外部区域”的填充逻辑。

3.  **智能等距切图与裁剪** 🖼️
    *   支持自定义横向与纵向格子数（1x1 到 10x10），完美适配微信朋友圈、小红书九宫格排版。
    *   高精度的自由裁剪工具，支持实时预览与 Rule of Thirds（三分法）参考线。

4.  **极致体验**
    *   多格式导出：支持 PNG、JPG 或 WebP，可一键打包 ZIP。
    *   双语支持：无缝切换中英文界面。
    *   流畅交互：支持图片缩放、拖拽预览。

### 🛠️ 技术栈

- **框架**: React 19 (Hooks)
- **AI 引擎**: TensorFlow.js (WebGL Backend)
- **样式**: Tailwind CSS
- **图片处理**: HTML5 Canvas API
- **压缩分发**: JSZip & FileSaver
- **字体**: Google Fonts (Inter)

### 🚀 快速开始

1.  **上传**: 将图片拖入上传区域或点击选择。
2.  **第一步：画质增强**:
    *   选择放大倍数（1x/2x/4x）和锐化程度，点击“执行增强”。
3.  **第二步：智能抠图**:
    *   选择背景色，调整容差和边缘平滑度，去除不需要的背景。
4.  **第三步：切图导出**:
    *   裁剪图片至理想范围。
    *   调整九宫格行列数，点击“下载全部”或“下载选中部分”。

### 💻 本地开发

如果您希望在本地运行或二次开发本项目，请确保您的环境已安装 Node.js。

1.  **克隆仓库**
    ```bash
    git clone https://github.com/gycodex/GridWise.git
    cd gridwise
    ```

2.  **安装依赖**
    ```bash
    npm install
    # 或者使用 yarn / pnpm
    yarn install
    ```

3.  **启动开发服务器**
    ```bash
    npm run dev
    ```
    打开浏览器访问 `http://localhost:5173` 即可预览。

4.  **构建生产版本**
    ```bash
    npm run build
    ```

---

## English

GridWise is a professional-grade image processing tool designed for creators and social media managers. It features a streamlined **"Enhance -> Remove BG -> Split"** workflow, powered by TensorFlow.js for AI upscaling, alongside intelligent background removal and precision grid splitting.

### ✨ Key Features

1.  **AI Image Enhancement (TensorFlow.js)** 🚀
    *   GPU-accelerated super-resolution (up to 4x) directly in the browser.
    *   Smart detail sharpening to fix blur and improve clarity.

2.  **Intelligent Background Removal** ✂️
    *   Canvas-based color recognition algorithm.
    *   Adjustable similarity threshold, edge smoothing, and "outer-only" flood-fill logic.

3.  **Smart Grid Splitter & Cropping** 🖼️
    *   Custom rows and columns (1x1 to 10x10). Perfect for Instagram grids, WeChat, and more.
    *   Precision cropping tool with real-time preview and Rule of Thirds grid lines.

4.  **Superior Experience**
    *   Multi-format Export: PNG, JPG, or WebP. Download individually or as a ZIP.
    *   Bilingual Interface: Seamlessly switch between Simplified Chinese and English.
    *   Interactive: Smooth zooming, dragging, and tile selection.

### 🛠️ Tech Stack

- **Framework**: React 19 (Hooks)
- **AI Engine**: TensorFlow.js (WebGL Backend)
- **Styling**: Tailwind CSS
- **Image Processing**: HTML5 Canvas API
- **Compression**: JSZip & FileSaver
- **Typography**: Google Fonts (Inter)

### 🚀 Quick Start

1.  **Upload**: Drag and drop an image or click the upload area.
2.  **Step 1: Enhance**:
    *   Select upscale factor (1x/2x/4x) and sharpening intensity. Click "Run Enhancer".
3.  **Step 2: Remove BG**:
    *   Pick the target background color, adjust threshold, and smooth edges to isolate your subject.
4.  **Step 3: Split & Export**:
    *   Crop the image to the desired composition.
    *   Adjust grid rows/columns and click "Download All" or "Download Selected".

### 💻 Local Development

To run or modify this project locally, ensure you have Node.js installed.

1.  **Clone the repository**
    ```bash
    git clone https://github.com/gycodex/GridWise.git
    cd gridwise
    ```

2.  **Install dependencies**
    ```bash
    npm install
    # or using yarn / pnpm
    yarn install
    ```

3.  **Start development server**
    ```bash
    npm run dev
    ```
    Open `http://localhost:5173` in your browser.

4.  **Build for production**
    ```bash
    npm run build
    ```

---
