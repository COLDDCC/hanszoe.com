import type { Product, Release, Series } from "./schema";
import { jaPhrase, jaRules } from "./jaPhrases";
import { normalize } from "./catalog";

/** 日本語ロケール層。周辺商品（グッズ）ページのみで使用する。
 *  中国語本文の翻訳は src/data/jaText.json に別途持つ。 */

export const jaUi = {
  siteTitle: "ハンジ・ゾエ アーカイブ",
  navWiki: "原作アーカイブ",
  navMerch: "グッズ図録",
  navNews: "イベント・告知",
  seriesFile: "シリーズ",
  breadcrumbMerch: "グッズ図録",
  eyebrowType: "カテゴリ",
  officialPrice: "公式価格",
  releaseDate: "発売日",
  seriesLabel: "シリーズ",
  manufacturer: "メーカー",
  publisher: "販売元",
  toConfirm: "要確認",
  buyTitle: "購入可能な公式サイト",
  buyGo: "公式サイト ↗",
  imageSource: "画像の出典 ↗",
  imageOriginal: "元画像のURL ↗",
  noImage: "商品画像未収録",
  noImageSub: "利用可能な公式画像または自前撮影を収集中",
  releaseHistory: "発売・公式価格の記録",
  releaseCount: "発売回数",
  announcement: "告知日",
  preorderRange: "予約期間",
  preorderNote: "（日本時間）",
  limitedScope: "限定範囲",
  limitedNone: "公式情報に記載なし",
  condition: "入手条件",
  unconfirmed: "未確認事項",
  sameSeries: "同シリーズのグッズ",
  noSameSeries: "このシリーズの他の商品はまだ収録されていません。",
  sources: "出典",
  sourceNone: "未収録の出典があります。",
  checkedAt: "確認日",
  supports: "根拠",
  aboutTitle: "収録について",
  versionNote:
    "同一商品を1件のアーカイブにまとめ、発売回ごとの公式価格を分けて表示します。造形や仕様に実質的な変更がある場合は別のアーカイブとして登録し、相互リンクします。",
  recordedOn: "収録日",
  updatedAt: "更新日",
  demoNotice: "デモデータです。実在の商品ではありません。",
  filterTitle: "絞り込み",
  filterClear: "条件をクリア",
  searchLabel: "商品名・別名・メーカー・シリーズを検索",
  search: "検索",
  sortLabel: "並び順",
  sortAdded: "新着順",
  sortDate: "初発売が新しい順",
  sortName: "名称順",
  foundPrefix: "該当",
  foundUnit: "件",
  noResultTitle: "該当するグッズが見つかりません",
  noResultBody: "日本語名で試すか、絞り込みを減らしてください。収録は継続中です。",
  yearUnknown: "年未確認",
  firstSale: "初発売",
  partial: "一部未確認",
  confirmed: "確認済み",
  brandLabel: "メーカー",
  seriesLabelCard: "シリーズ",
  zhOriginal: "中国語原文（翻訳作業中）",
  zhValueNote: "未翻訳の項目",
  translationProgress: "日本語訳の進み",
  summaryTitle: "概要",
  officialName: "公式名称",
  pageZh: "中国語版",
  navHome: "トップ",
  merchIndexEyebrow: "THE COLLECTION",
  seriesIndexTitle: "シリーズ一覧",
};

export const jaType: Record<string, string> = {
  亚克力: "アクリル商品",
  纸品: "紙もの",
  徽章: "缶バッジ",
  生活用品: "生活雑貨",
  其他: "その他",
  玩偶: "ぬいぐるみ",
  服饰: "服飾",
  手办: "フィギュア",
};

export const jaRegion: Record<string, string> = { 日本: "日本", 中国: "中国" };

export const jaKind: Record<string, string> = { 初版: "初出", 再贩: "再販" };

export const jaSalesMethod: Record<string, string> = {
  单售: "個別販売",
  整盒: "BOX販売",
  盲抽: "ランダム販売",
  购买特典: "購入特典",
  抽奖奖品: "抽選景品",
};

export const jaTaxStatus: Record<string, string> = {
  含税: "税込",
  未注明: "税表記なし",
};

export const jaUnit: Record<string, string> = {
  单个: "1個",
  套装: "1セット",
  整盒: "1BOX",
  单包: "1パック",
  每抽: "1回",
};

/** specifications の键 153 种 → 日本語ラベル */
export const jaSpecKey: Record<string, string> = {
  全高: "全高",
  材质: "素材",
  规格: "仕様",
  官方编号: "公式品番",
  "各贩次 JAN（amiami 商品页）": "発売回ごとの JAN（amiami 商品ページ）",
  JAN: "JAN",
  "JAN 来源": "JAN の出典",
  发售窗口: "発売時期",
  尺寸: "サイズ",
  插画: "イラスト",
  一般发售窗口: "一般発売時期",
  款式: "ラインナップ",
  店铺领取: "店舗受取",
  店铺领取预约: "店舗受取予約",
  店铺领取支付期限: "店舗受取の支払期限",
  配送预计: "配送予定",
  预订范围说明: "予約範囲の説明",
  官方商品一览图: "公式商品一覧画像",
  本体: "本体",
  底座: "台座",
  展开尺寸: "展開時サイズ",
  折叠尺寸: "折りたたみ時サイズ",
  纸张尺寸: "用紙サイズ",
  店铺领取开始: "店舗受取開始",
  刻度长度: "目盛り長さ",
  板材尺寸: "板材サイズ",
  主体尺寸: "本体サイズ",
  配件尺寸: "付属品サイズ",
  直径: "直径",
  工艺: "加工",
  图案: "デザイン",
  主题说明: "テーマ説明",
  底座尺寸: "台座サイズ",
  历史配送说明: "過去の配送説明",
  商品代码: "商品コード",
  保证备货预约期限: "確保保証の予約期限",
  官方发售说明: "公式の発売説明",
  价格说明: "価格の説明",
  结构: "構造",
  数量: "数量",
  包装: "パッケージ",
  销售说明: "販売説明",
  主体: "本体",
  高度: "高さ",
  厚度: "厚み",
  活动期间: "イベント期間",
  "movic 获得条件": "movic での入手条件",
  绘柄: "絵柄",
  配送范围: "配送範囲",
  数量限制: "数量制限",
  尺寸与材质: "サイズと素材",
  单卡尺寸: "カード1枚のサイズ",
  外尺寸: "外形サイズ",
  内尺寸: "内寸",
  角色: "キャラクター",
  集齐说明: "コンプセットの説明",
  销售规格: "販売仕様",
  预约特典说明: "予約特典の説明",
  背面: "背面",
  活动先行销售: "イベント先行販売",
  活动公告刊载: "イベント告知の掲載",
  受注公告刊载: "受注告知の掲載",
  网上受注开始: "ネット受注開始",
  角色部件: "キャラクターパーツ",
  姓名部件: "名前パーツ",
  尺码: "サイズ展開",
  页面发货说明: "ページの発送説明",
  "各尺码 JAN（amiami 商品页）": "サイズごとの JAN（amiami 商品ページ）",
  本体尺寸: "本体サイズ",
  台座尺寸: "台座サイズ",
  种类: "種類",
  厂商: "メーカー",
  店铺发货说明: "店舗の発送説明",
  页面状态: "ページの状態",
  重量: "重量",
  原产国: "原産国",
  跨渠道同款: "チャネルを跨いだ同一商品",
  其他商品页: "他の商品ページ",
  跨渠道页面: "チャネルを跨いだページ",
  跨渠道价格核对: "チャネルを跨いだ価格確認",
  弹数: "段数",
  销售方: "販売元",
  ペンギンパレード商品代码: "ペンギンパレード商品コード",
  并单依据: "アーカイブ統合の根拠",
  印花工艺: "プリント加工",
  颜色: "カラー",
  图案文字: "デザイン文言",
  购买上限: "購入上限",
  角色名单: "キャラクター一覧",
  销售形态: "販売形態",
  贩卖开始时间: "販売開始日時",
  页面核查状态: "ページ確認状態",
  附件: "付属品",
  其他: "その他",
  展示方法: "展示方法",
  受注期间: "受注期間",
  发货说明: "発送説明",
  交易条件: "取引条件",
  制作人员: "スタッフ",
  "档位ID（Shopify variant）": "バリアントID（Shopify）",
  档位名: "バリアント名",
  限定数量说明: "限定数の説明",
  供应方: "供給元",
  页面说明: "ページの説明",
  预约配送: "予約配送",
  种类数: "種類数",
  封入方式: "封入方式",
  编号: "品番",
  滚动发货标注: "随時発送の表記",
  角色标注: "キャラクター表記",
  折扣标注: "割引表記",
  购买限制: "購入制限",
  版权标注: "著作権表記",
  "角色 lineup": "キャラクターラインナップ",
  跨渠道标价: "チャネルを跨いだ表示価格",
  "Anique 销售期间": "Anique の販売期間",
  "同款项码 JAN": "同一アイテムの JAN",
  发行史: "発売履歴",
  商品番号: "商品番号",
  版权: "著作権表記",
  类别: "カテゴリ",
  作品: "作品",
  先行贩卖: "先行販売",
  标价来源: "表示価格の出典",
  品牌: "ブランド",
  鞋型尺寸: "シューズサイズ",
  造型说明: "造形説明",
  税抜价: "税抜価格",
  图案说明: "デザイン説明",
  赏级: "賞",
  抽选主题: "抽選テーマ",
  赏级概率: "当選確率",
  单抽价格: "1回あたりの価格",
  配送手数料: "送料",
  售卖期间: "販売期間",
  发货窗口: "発送時期",
  lineup: "ラインナップ",
  标价: "表示価格",
  发售日: "発売日",
  销售渠道: "販売チャネル",
  同批其他品类: "同一バッチの他カテゴリ",
  来源说明: "出典の説明",
  商品内容: "商品内容",
  玩法说明: "遊び方の説明",
  套装: "セット",
  销售形式: "販売形式",
  页面档位: "ページのバリアント",
  制造商: "メーカー",
  销售期间: "販売期間",
  收录依据: "収録の根拠",
  页面商品类型: "ページの商品タイプ",
  特典対象期間: "特典対象期間",
  绘柄名单: "絵柄一覧",
};

/** 頻出する仕様値そのままの対照表（上位60件・約37%をカバー）。 */
export const jaSpecValue: Record<string, string> = {
  单件: "1個",
  "未注明（商品页无発売元字段）": "記載なし（商品ページに発売元の欄なし）",
  "预约受理中（2026-10-13 核查）": "予約受付中（2026-10-13 確認）",
  "预约受理中（2026-10-14 核查）": "予約受付中（2026-10-14 確認）",
  "在售（2026-10-13）": "販売中（2026-10-13）",
  "页面显示无库存（2026-10-13 核查）": "ページ上は在庫なし（2026-10-13 確認）",
  亚克力: "アクリル",
  アクリル: "アクリル",
  ハンジ・ゾエ: "ハンジ・ゾエ",
  "シンクイノベーション（Vvit）": "シンクイノベーション（Vvit）",
  "入荷・発売予定日前日から7日以内発送": "入荷・発売予定日前日から7日以内発送",
  纸: "紙",
  紙: "紙",
  "1 种": "1種",
  "入荷、发售预定日前日起 7 日内发货": "入荷・発売予定日前日から7日以内発送",
  "ご注文から7日以内発送": "ご注文から7日以内発送",
  "亚克力（原文【素材】アクリル）": "アクリル（原文【素材】アクリル）",
  "官方标示为含税价格（消费税 10%）": "税込価格と明記（消費税10%）",
  "8種": "8種",
  "整盒，每件含 4 款": "BOX（1BOXあたり4種）",
  "单件，图案固定": "1個・デザイン固定",
  "紙、ブリキ": "紙・ブリキ",
  ペンギンパレード: "ペンギンパレード",
  铝: "アルミ",
  "本体：PUレザー": "本体：PUレザー",
  "AniqueShop 页面「販売価格」（税込）": "AniqueShop ページの「販売価格」（税込）",
  "付款后通常约 4～5 周，以官方订单实际安排为准":
    "入金後おおむね4〜5週間。実際の発送は公式の注文状況に準じます。",
  "整盒，每件含 8 款": "BOX（1BOXあたり8種）",
  "库存剩余少量（2026-10-13 核查）": "在庫わずか（2026-10-13 確認）",
  "盲抽，单件": "ランダム・1個",
  "2 件套装": "2個セット",
  "1種": "1種",
  "2025年10月20日17：00": "2025年10月20日17:00",
  PP: "PP",
  "在庫なし（无库存）（2026-10-14 核查）": "在庫なし（2026-10-14 確認）",
  "4種": "4種",
  "单售，单件": "個別販売・1個",
  "商品名直接标注ハンジ": "商品名にハンジと明記",
  "仅指店铺领取，配送预订截止日待核实":
    "店舗受取のみ。配送の予約締切日は未確認",
  ブリキ: "ブリキ",
  "リヴァイ(リヴァイ・アッカーマン)": "リヴァイ（リヴァイ・アッカーマン）",
  "本体：アクリル樹脂": "本体：アクリル樹脂",
  日本: "日本",
  "单件销售": "個別販売",
  "〇 在庫あり（2026-10-13 核查）": "〇 在庫あり（2026-10-13 確認）",
  "3 mm": "3mm",
  "約Φ56mm": "約Φ56mm",
  套装: "セット",
  A3: "A3",
  "按角色选择单售": "キャラクター選択の個別販売",
  "WITストア（商品页供应方字段原文）": "WITストア（商品ページの供給元欄の表記）",
  "下单后 7 日内发货": "注文から7日以内発送",
  "（約）直径56mm": "（約）直径56mm",
  "アート：ブリキ、フレーム：アルミ（裏板：MDF）":
    "アート：ブリキ、フレーム：アルミ（裏板：MDF）",
  徽章: "缶バッジ",
  "铝制马口铁": "アルミ製ブリキ",
  "8種1セット": "8種1セット",
  场面写: "場面写真",
  "纸、马口铁": "紙・ブリキ",
};

/** 日本語の語彙として提示してよい語のみ。全文をこの語彙で分解出来なければ「翻訳待ち」扱いにする。
 *  文字単位の whitelist は使わない：「多人合绘」等の漢字共有中国語を通してしまうため。 */
export const jaWords = [
  "約","程度","最大","最小","以内","以上","前後","頃","年月日","年","月","日","時","分","秒",
  "上旬","中旬","下旬","週","時点","直径","半径","幅","高さ","奥行き","長さ","厚み","重さ",
  "個","枚","種","色","入","SET","セット","箱","袋","袋入","付属","付き","無し","あり",
  "日本","国内","海外","言語","日本語","英語","表記","記載","未","済","済み","確認","登録",
  "発売","発売日","発売中","販売","販売中","予約","受付","受注","生産","限定","数量","数",
  "税込","税抜","税","価格","円","送料","無料","サイズ","寸法","素材","仕様","内容","品番",
"番号","型","形","名","名称","系列","シリーズ","作品","初出","初","出","再販","売","価","格","目","録",
  "本体","部分","台座","変更","可能性","樹脂","黒","綿","角以内","厚さ","組立","裏面","表面","前面",
  "対応","用品","雑貨"
];
const wordSet = new Set(jaWords);
/** 漢字の連なりを語彙で100%分解できるか。分解出来ない文字が残れば false。 */
export const looksJapanese = (s: string) => {
  if (!/[一-鿿]/.test(s)) return true;
  const runs = s.match(/[一-鿿]+/g) || [];
  for (const run of runs) {
    let i = 0;
    outer: while (i < run.length) {
      for (let len = Math.min(4, run.length - i); len >= 1; len--) {
        if (wordSet.has(run.slice(i, i + len))) { i += len; continue outer; }
      }
      return false;
    }
  }
  return true;
};
export type JaText = { text: string; translated: boolean };
export const jaValue = (raw: unknown): JaText => {
  const s = String(raw ?? "");
  const exact = jaSpecValue[s] || jaPhrase[s];
  if (exact) return { text: exact, translated: true };
  if (!s.trim() || /^[A-Za-z0-9.@:+/_-]*$/.test(s))
    return { text: s, translated: true };
  for (const rule of jaRules) {
    const m = s.match(rule.re);
    if (!m) continue;
    const out = rule.ja(m.slice());
    if (out) return { text: out, translated: true };
  }
  // 「（原文【素材】…）」のような注記は、両側が翻訳済みなら維持する。
  const src = s.match(/^(.+?)（原文【([^】]+)】(.+?)）$/);
  if (src) {
    const a = jaValue(src[1]);
    const c = jaValue(src[3]);
    if (a.translated && c.translated)
      return {
        text: `${a.text}（原文【${src[2]}】${c.text}）`,
        translated: true,
      };
  }
  return { text: s, translated: looksJapanese(s) };
};

export const jaKey = (k: string) => jaSpecKey[k] ?? k;

export const jaName = (p: Product) => p.names.ja || p.names.en || p.names.zh;

export const jaPrice = (r: Release) => {
  if (r.priceStatus === "notSoldSeparately")
    return "購入特典のため個別販売なし";
  if (r.priceStatus === "unknown") return "公式価格未確認";
  return r.prices
    .map(
      (p) =>
        `${new Intl.NumberFormat("ja-JP", {
          style: "currency",
          currency: p.currency,
          maximumFractionDigits: p.currency === "JPY" || p.currency === "KRW" ? 0 : 2,
        }).format(p.amount / (p.currency === "JPY" || p.currency === "KRW" ? 1 : 100))}／${jaUnit[p.unit] ?? p.unit}（${jaTaxStatus[p.taxStatus] ?? p.taxStatus}${p.quantity ? `・${p.quantity}点` : ""}）`,
    )
    .join("；");
};

export const jaDate = (d?: { value: string; precision: string } | null) => {
  if (!d) return "日付未確認";
  const m = d.value.match(/^(\d{4})(?:-(\d{2}))?(?:-(\d{2}))?/);
  if (!m) return d.value;
  if (m[3]) return `${m[1]}年${Number(m[2])}月${Number(m[3])}日`;
  if (m[2]) return `${m[1]}年${Number(m[2])}月`;
  return `${m[1]}年`;
};

export const jaYear = (p: Product) => {
  const v = p.releases.find((r) => r.kind === "初版")?.releaseDate?.value || "";
  return v.slice(0, 4);
};

/** names.ja にある公式日本語名をそのまま使う。翻訳しない。 */
export const jaAlt = (p: Product) => `${jaName(p)}｜公式商品画像`;

export type JaEntry = {
  description?: string;
  specs?: Record<string, string>;
  missing?: string[];
};
export type JaSidecar = {
  products: Record<string, JaEntry>;
  series: Record<string, { description?: string }>;
};

/** 訳文は sidecar（src/data/jaText.json）から拾う。未登録なら空を返し、ページ側で翻訳待ちを出す。 */
import jaDocRaw from "../data/jaText.json";
export const jaDoc = jaDocRaw as unknown as JaSidecar;
export const productJa = (p: Product): JaEntry => jaDoc.products[p.id] || {};
export const seriesJa = (s: Series) => jaDoc.series[s.id] || {};

export const hasKana = (s: string) => /[぀-ヿ]/.test(s);

/** シリーズ名は中国語表記のものが多い。かなを含む表記があれば使い、なければ空。 */
export const jaSeriesName = (s?: Series) => {
  if (!s) return "";
  if (hasKana(s.name)) return s.name;
  return (s.aliases || []).find((a) => hasKana(a)) || "";
};

const unusableBrand = /^(未注明|待核实|未知)$/;
export const jaBrand = (v?: string | null) =>
  v && !unusableBrand.test(v.trim()) ? v : "";

/** 公式情報だけで概要を組み立てる。中国語が残る要素は文にしない。 */
export const jaSummary = (p: Product, s?: Series) => {
  const first = p.releases.find((r) => r.kind === "初版")!;
  const parts: string[] = [];
  parts.push(
    `『進撃の巨人』の${jaType[p.type] ?? "グッズ"}、公式名称は「${jaName(p)}」。`,
  );
  const sName = jaSeriesName(s);
  if (sName) parts.push(`シリーズは「${sName}」。`);
  const maker = jaBrand(p.manufacturer) || jaBrand(p.publisher);
  if (maker) parts.push(`取り扱いは ${maker}。`);
  parts.push(
    `初回の発売は${jaDate(first.releaseDate)}、公式価格は${jaPrice(first)}。`,
  );
  if (p.releases.length > 1)
    parts.push(
      `再販を含め${p.releases.length}回の発売を個別に記録しています。`,
    );
  const sizeKey = ["尺寸", "主体尺寸", "展开尺寸"].find((k) => p.specifications[k]);
  const size = sizeKey ? jaValue(p.specifications[sizeKey]) : null;
  if (size?.translated) parts.push(`サイズは${size.text}。`);
  parts.push(
    `出典は各公式商品ページ、確認日は${[...new Set(p.sources.map((x) => x.checkedAt))].sort().join("・")}。`,
  );
  return parts.join("");
};

/** 翻訳進捗。ページと検証の両方で使う。 */
export const jaProgress = () => {
  const products = Object.keys(jaDoc.products).filter(
    (id) => jaDoc.products[id].description,
  ).length;
  const series = Object.keys(jaDoc.series).filter(
    (id) => jaDoc.series[id].description,
  ).length;
  return { products, series };
};

/** 日本語版カタログの絞り込み。値はデータ本体の中国語表記のままで突き合わせ、表示だけ日本語にする。 */
const norm = normalize;
export function filterProductsJa(
  products: Product[],
  series: Series[],
  params: URLSearchParams,
) {
  const words = norm(params.get("q") || "").split(" ").filter(Boolean);
  const groups = ["year", "type", "method"];
  const out = products.filter((p) => {
    const s = series.find((x) => x.id === p.seriesId);
    const hay = norm(
      [
        ...Object.values(p.names),
        ...p.aliases,
        p.manufacturer || "",
        p.publisher || "",
        s?.name || "",
        ...(s?.aliases || []),
      ].join(" "),
    );
    if (!words.every((w) => hay.includes(w))) return false;
    return groups.every((g) => {
      const values = params.getAll(g);
      if (!values.length) return true;
      const own =
        g === "year"
          ? [jaYear(p)]
          : g === "type"
            ? [p.type]
            : p.releases.map((r) => r.salesMethod);
      return values.some((v) => own.includes(v));
    });
  });
  const sort = params.get("sort") || "added";
  out.sort((a, b) =>
    sort === "name"
      ? jaName(a).localeCompare(jaName(b), "ja")
      : sort === "date"
        ? (() => {
            const da = jaYear(a) ? a.releases.find((r) => r.kind === "初版")?.releaseDate?.value || "" : "";
            const db = jaYear(b) ? b.releases.find((r) => r.kind === "初版")?.releaseDate?.value || "" : "";
            return !da && !db ? 0 : !da ? 1 : !db ? -1 : db.localeCompare(da);
          })()
        : b.createdAt.localeCompare(a.createdAt),
  );
  return out;
}

/** 来源が持つ「支える項目」ラベル（中国語の語彙が混じる）を日本語ラベルへ。 */
const fieldMap: Record<string, string> = {
  名称: "名称",
  规格: "仕様",
  尺寸: "サイズ",
  材质: "素材",
  价格: "価格",
  官方原价: "公式価格",
  初版: "初出",
  再贩: "再販",
  预订时间: "予約期間",
  发售日: "発売日",
  发货: "発送",
  数量: "数量",
  限定: "限定",
  内容物: "内容",
  絵柄: "絵柄",
  渠道: "販売チャネル",
  版权: "著作権表記",
};
export const jaField = (f: string): JaText => {
  if (fieldMap[f]) return { text: fieldMap[f], translated: true };
  const keys = Object.keys(fieldMap).sort((a, b) => b.length - a.length);
  let out = f;
  for (const k of keys) out = out.split(k).join(fieldMap[k]);
  if (!looksJapanese(out)) return { text: f, translated: false };
  return { text: out, translated: true };
};

/** シリーズ区分（26 種）。 */
export const jaSeriesType: Record<string, string> = {
  手办系列: "フィギュア",
  绘柄系列: "絵柄・デザイン",
  主题周边系列: "テーマグッズ",
  角色场景周边系列: "キャラクターシーングッズ",
  主题新绘周边系列: "テーマ描き下ろしグッズ",
  厂商新绘周边系列: "メーカー描き下ろしグッズ",
  店铺主题新绘系列: "店舗描き下ろしテーマ",
  商品形态系列: "商品形態",
  联动图案系列: "コラボデザイン",
  动画截图周边系列: "アニメ場面写グッズ",
  漫画原画周边系列: "漫画原画グッズ",
  复售周边系列: "復刻グッズ",
  角色组合周边系列: "キャラクター組み合わせ",
  服饰商品系列: "服飾",
  角色组合系列: "キャラクター組み合わせ",
  官方企划系列: "公式企画",
  官方新绘主题系列: "公式描き下ろしテーマ",
  "官方 Q 版造型系列": "公式デフォルメ造形",
  官方刊物系列: "公式出版物",
  抽选赏品系列: "抽選景品",
  品牌联名系列: "ブランドコラボ",
  联名贴纸系列: "コラボステッカー",
  景品手办系列: "景品フィギュア",
  周边系列: "グッズ",
  漫画封面场景周边系列: "漫画表紙・場面グッズ",
  纪念场景周边: "記念シーングッズ",
};
