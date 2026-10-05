# 韩吉档案馆 · Hange Archive

以韩吉·佐耶为主题的非官方粉丝站，采用 Astro + TypeScript 静态生成。米白、深绿与棕色界面，周边图录为核心。只保存每次发行的官方原价，不记录二手行情。

## 本地打开

需要 Node.js 22.12+（推荐 24 LTS）。先进入含有 `package.json` 的项目目录，再运行：

```sh
npm ci
npm run dev
```

打开终端显示的地址，默认 http://localhost:4321/ 。Windows 可双击 `start-preview.cmd`，首次会安装依赖，然后启动并打开网页；终端需保持开启。

```sh
npm run validate   # 数据、日期、来源与 ID 关联校验
npm run test       # 搜索、筛选与价格规则测试
npm run check      # Astro / TypeScript 检查
npm run build      # 校验后生成 dist/
npm run preview    # 查看生产构建
```

`dist/` 中的页面依赖根路径资源，应通过 HTTP 预览，不能只双击 HTML。

## 当前内容与范围

实现首页、图录、商品详情、系列列表与详情、资讯列表与详情、Wiki 目录与文章、关于和 404。图录支持中日英名称与别名、品牌及系列搜索，全半角归一化，六组多选筛选，三个排序方式，URL 恢复和清空状态。

已有 3 件真实商品、3 个系列、2 篇发行资讯、2 篇 Wiki 结构文章。其中黏土人保留 2019 初版、2023 与 2026 再贩的独立原价。来源及缺项见每个详情页和 [STATUS.md](STATUS.md)。商品图片尚无确认可使用的素材，均明确占位，不伪造官方照片。

未做账号、交易、后台、自动爬虫、实时库存、本机收藏和多语言。未公开部署。

## 增加商品

1. 在 `src/data/products.json` 数组中增加一条记录。可复制 `templates/product.json`，模板不进入内容构建。
2. 设置唯一 `id` 与稳定 `slug`，中日英名称至少一个不为空。
3. `seriesId` 必须对应 `src/data/series.json` 中的 ID。
4. 官方来源填写完整 `sources`，注明核对日期和支持的字段；发行价格的 `sourceId` 必须指向同一商品的来源 ID。
5. 每次发行分别添加 `releases`，禁止覆盖过去的价格。初版发售未知时保留 `releaseDate: null`，不能把再贩日期当首次发售。
6. 保存后运行 `npm run validate` 和 `npm run build`，无需改页面组件。

## 价格与日期

金额保存整数最小货币单位，JPY/KRW 为整数元，USD/CNY/HKD 为分。币种、税务状态、单位和官方数量各自保存。单位含 `单个 / 单包 / 整盒 / 套装 / 每抽`。

`priceStatus: known` 必须包含正数价格；`unknown` 与 `notSoldSeparately` 的 `prices` 必须为空。特典使用 `购买特典` 与 `notSoldSeparately`，门槛写在 `condition` 并附 `conditionSourceId`。抽奖奖品只能使用 `每抽` 单位。整盒价格不会自动除算。

日期为 `{ "value": "2024-07", "precision": "month" }`，支持年、月、日精度；不得填充未知月份或日。下旬等文字可在规格或说明中保留。限定范围必须附来源，空值只表示未注明。

## 增加系列

复制 `templates/series.json` 到 `src/data/series.json` 数组，填写唯一 ID、slug、简介、类型与官方来源。关联商品从 `seriesId` 自动派生，不需手动维护商品集合。

## 增加资讯和 Wiki

资讯复制 `templates/news.md` 到 `src/content/news/`，Wiki 复制 `templates/wiki.md` 到 `src/content/wiki/`。修改稳定 ID、slug、标题、摘要、日期、来源及 Markdown 正文。资讯的 `seriesId`、`productIds` 须引用真实内容。Wiki 剧透标记为 `无 / 轻微 / 重大`；非无剧透内容默认折叠。登场索引尚未核对，现有文章只提供结构，不编造集数。

## 图片配置

图片放在 `public/images/`，条目 `images` 填写根路径、替代文字、原始来源链接、署名与使用说明，例如：

```json
{"path":"/images/hange-1123.jpg","alt":"韩吉黏土人完整正面与底座","sourceUrl":"https://example.org/source","credit":"摄影者姓名","usage":"摄影者授权用于本站"}
```

请替换示意来源，确认可以使用再添加。图片用 contain 展示，不裁掉包装或底座；不配置时显示待补充占位。

## 示例模式

`src/data/demo.json` 有 7 个独立案例，覆盖单售、盲抽与整盒、特典、再贩、未知年份、缺图、未知价格、奖品。默认构建完全不导入示例内容；包括前端搜索脚本也不打包 demo 文件。

本地可使用 `INCLUDE_DEMO=true npm run dev`；Windows PowerShell 使用 `$env:INCLUDE_DEMO='true'; npm run dev`。示例模式显示顶部提醒和逐条示例标识，禁止搜索引擎索引，sitemap 为空。正式构建前移除该变量。

## 域名、索引与纠错

复制 `.env.example` 为 `.env`。默认不配置生产域名、全站 noindex、robots 禁止抓取、sitemap 不写假 URL。确定正式域名并准备公开上线后，设置 `SITE_URL=https://你的域名` 与 `PUBLIC_INDEXABLE=true` 再构建；本阶段不执行部署。

`PUBLIC_CORRECTION_URL` 可配置真实 HTTPS 纠错入口；未配置则只显示说明，不出现假提交表单。

## 自动检查

`.github/workflows/check.yml` 运行校验、测试、类型检查、构建及桌面／手机浏览器测试，没有发布步骤。主要页面截图、测试报告与失败追踪会保存为 GitHub Actions 的 `browser-review` 附件（保留 14 天），也可在 Actions 页面手动运行。新增一批内容时，也应检查上一批图片、重复条目、价格单位、来源与再贩关系。

## 浏览器与截图验收

本次环境无法启动预览服务和下载浏览器，因此没有宣称完成视觉验收。在本地运行 `npm run build`、`npx playwright install chromium`、`npm run test:browser`，检查所有页面 1440px 与 360px 的横向溢出和搜索状态，并输出首页截图到 `test-results/`。
