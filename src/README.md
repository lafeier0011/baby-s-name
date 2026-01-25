# 吉名宝典 - AI智能宝宝取名应用

一个结合中国传统文化与阴阳五行原理的AI智能取名应用，为您的宝宝生成美好的中英文姓名。

## ✨ 功能特点

- 🎋 **传统文化融合**: 结合五行、生辰八字、生肖、诗词典故
- 🤖 **AI智能生成**: 使用 Deepseek API 生成高质量姓名
- 📱 **完全响应式**: 完美适配手机、平板和桌面设备
- 🎨 **优雅设计**: 极简现代风格融入柔和中式美学元素
- ⚡ **性能优化**: 单次API调用同时生成所有名字
- 🔄 **灵活重生成**: 支持分性别重新生成，节省时间和成本

## 🚀 本地开发

### 前置要求

- Node.js 18+
- npm 或 yarn

### 安装依赖

```bash
npm install
```

### 环境变量配置

复制 `.env.example` 为 `.env` 并填入配置：

```bash
cp .env.example .env
```

在 `.env` 中配置：

```env
VITE_SUPABASE_PROJECT_ID=your_project_id
VITE_SUPABASE_ANON_KEY=your_anon_key
```

### 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:5173

### 构建生产版本

```bash
npm run build
```

### 预览生产构建

```bash
npm run preview
```

## 📦 部署到 Vercel

### 方法一：通过 Vercel CLI

```bash
# 安装 Vercel CLI
npm install -g vercel

# 登录
vercel login

# 部署
vercel --prod
```

### 方法二：通过 GitHub

1. 将代码推送到 GitHub
2. 访问 [vercel.com](https://vercel.com)
3. 导入 GitHub 仓库
4. Vercel 会自动检测 Vite 配置并部署

### 配置环境变量

在 Vercel Dashboard 中添加以下环境变量：

```
VITE_SUPABASE_PROJECT_ID=pudsxztzgmugxmrqthrx
VITE_SUPABASE_ANON_KEY=your_anon_key
```

确保在所有环境（Production, Preview, Development）中都添加。

## 🌐 绑定自定义域名

### 在 Vercel 中添加域名

1. 进入项目设置 → Domains
2. 添加域名：`awesomename.top` 和 `www.awesomename.top`
3. 复制 Vercel 提供的 DNS 配置信息

### 在阿里云配置 DNS

访问 [阿里云 DNS 控制台](https://dns.console.aliyun.com/)，添加以下记录：

**A 记录（主域名）：**
```
记录类型: A
主机记录: @
记录值: [Vercel提供的IP地址]
TTL: 10分钟
```

**CNAME 记录（www子域名）：**
```
记录类型: CNAME
主机记录: www
记录值: cname.vercel-dns.com
TTL: 10分钟
```

等待 5-30 分钟 DNS 生效。

## 🔧 常见问题

### 刷新页面出现 404

已通过 `vercel.json` 配置解决。确保该文件存在且包含正确的 rewrites 配置。

### API 调用失败

检查：
1. Vercel 环境变量是否正确配置
2. 环境变量名称是否包含 `VITE_` 前缀
3. Supabase Functions 是否正常运行

### CORS 错误

确保后端 `/supabase/functions/server/index.tsx` 中的 CORS 配置包含您的域名。

## 📄 技术栈

- **前端框架**: React 18 + TypeScript
- **构建工具**: Vite 5
- **路由**: React Router 6
- **样式**: Tailwind CSS 4
- **图标**: Lucide React
- **后端**: Supabase Edge Functions (Hono)
- **AI**: Deepseek API
- **部署**: Vercel

## 👨‍👩‍👧 作者

Made with ♥ by 拉斐尔 & 小圆

To 我们未出生的宝宝

## 📝 License

MIT
