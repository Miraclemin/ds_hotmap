# DeepSeek中国部署热力图

一个可视化DeepSeek在中国各地部署情况的交互式地图应用。

## 项目介绍

本项目是一个基于Next.js的Web应用，展示DeepSeek在中国各地的部署和影响情况。通过爬取与DeepSeek相关的新闻，使用大模型提取地理位置信息，并将数据可视化成热力图，以便直观地了解DeepSeek在全国各地的部署密度。

### 主要特点

- 交互式中国地图，展示DeepSeek部署热力分布
- 鼠标悬停时显示省份详细信息
- 基于真实新闻数据的热力图分析
- 自动化的数据收集和处理流程
- 可部署到Vercel平台

## 项目结构

```
deepseek_map/
├── src/                   # Next.js应用源代码
│   ├── app/               # 应用主要代码
│   │   ├── api/           # API路由
│   │   ├── page.tsx       # 主页面
│   │   └── layout.tsx     # 应用布局
│   ├── components/        # React组件
│   │   └── ChinaMap.tsx   # 中国地图组件
│   ├── types/             # TypeScript类型定义
│   └── utils/             # 工具函数
├── public/                # 静态资源
│   └── data/              # 地图数据
├── scripts/               # 数据收集脚本
│   └── news_crawler.py    # 新闻爬虫脚本
└── README.md              # 项目说明
```

## 技术栈

- **前端**: Next.js, TypeScript, Tailwind CSS, Ant Design, ECharts
- **后端**: Next.js API Routes
- **数据处理**: Python, 大语言模型
- **数据存储**: MongoDB (可选)
- **部署**: Vercel

## 快速开始

### 环境要求

- Node.js 18+
- Python 3.8+ (用于数据收集)
- MongoDB (可选)

### 安装与运行

1. 克隆项目

```bash
git clone https://github.com/yourusername/deepseek_map.git
cd deepseek_map
```

2. 安装前端依赖

```bash
npm install
```

3. 安装Python依赖(用于数据收集)

```bash
pip install -r scripts/requirements.txt
```

4. 运行开发服务器

```bash
npm run dev
```

5. 访问 http://localhost:3000 查看应用

### 数据收集

运行新闻爬虫脚本收集DeepSeek相关数据:

```bash
cd scripts
python news_crawler.py --keyword DeepSeek --days 7 --output ../public/data/map_data.json
```

参数说明:
- `--keyword`: 搜索关键词，默认为"DeepSeek"
- `--days`: 搜索过去几天的新闻，默认为1天
- `--workers`: 最大线程数，默认为5
- `--output`: 输出文件路径，默认为"../public/data/map_data.json"
- `--use-mongo`: 是否使用MongoDB存储数据，默认不使用

## 部署

本项目可直接部署到Vercel平台。

1. 将代码推送到GitHub仓库
2. 在Vercel中导入该仓库
3. 配置环境变量(如需要)
4. 部署!

对于数据收集部分，建议设置独立的服务器或使用定时任务服务(如GitHub Actions)定期运行爬虫脚本并更新数据。

## 许可证

MIT
