# 主图卖点卡（Hero Selling Card）

上传一张场景图，填写产品名与短卖点，生成 3 版淘宝 800×800「场景图 + 卖点叠层」主图预览，并导出 PNG。

## 做什么

- 上传 1 张场景/商品图（支持拖拽；按整幅场景满幅合成）
- 填写产品名、3–5 条短卖点、可选促销角标
- 平台尺寸固定为淘宝 **800×800**
- 一键生成 **3 版**布局预览（浏览器 Canvas 合成）
  - **底边玻璃条**：场景满幅 + 底边轻玻璃条
  - **左边玻璃条**：场景满幅 + 左侧窄玻璃条
  - **角叠胶囊**：场景满幅 + 标题/卖点玻璃胶囊角叠
- 导出选中版为 PNG（文件名：`产品名-卖点卡-布局名.png`）
- 可选服务端文案改写；未配置 API Key 时用本地模板润色，仍可出图

## 快速试用

本地跑起来后，点表单顶部的 **「填入示例」**：会自动填入短卖点示例，并加载内置客厅场景图（`public/sample-product.svg`）。然后直接点「生成 3 版预览」即可看效果；也可再换成自己的场景图。

## 不做

- 多 SKU 批量、账号登录、支付
- 飞书 / 表格对接
- 像素级结构保真、img2img
- 第二平台尺寸（如抖音）
- 复杂多页后台
- 白底抠图目录式排版

## 环境变量（可选）

复制 `.env.example` 为 `.env.local`。不配置也能完整走通上传 → 生成 → 导出。

| 变量 | 说明 |
|------|------|
| `DASHSCOPE_API_KEY` | 通义兼容模式 Key（优先） |
| `DASHSCOPE_BASE_URL` | 默认 `https://dashscope.aliyuncs.com/compatible-mode/v1` |
| `DASHSCOPE_MODEL` | 默认 `qwen-plus` |
| `OPENAI_API_KEY` | 无 DashScope 时可用 |
| `OPENAI_BASE_URL` | 默认 `https://api.openai.com/v1` |
| `OPENAI_MODEL` | 默认 `gpt-4o-mini` |

密钥仅服务端使用，勿提交到 Git。

## 本地运行

```bash
npm install
npm run dev
```

打开 [http://localhost:3000](http://localhost:3000)。

生产构建：

```bash
npm run build
npm start
```

## 部署（Vercel）

1. 将本仓库推送到 GitHub
2. 在 [Vercel](https://vercel.com) Import 该仓库
3. Framework 选 Next.js，按需添加上述环境变量
4. Deploy 后用公开 URL 走通：上传 → 填卖点 → 生成 → 导出 PNG
