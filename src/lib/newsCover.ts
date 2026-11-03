// 杂志封面式资讯区（首页与活动资讯页共用）的选稿规则与日期格式。
// 头条：最新一条带封面的资讯；右栏：再 3 条带封面的资讯；中栏：其余最新 listSize 条，只列日期与标题。
type NewsLike = { data: { slug: string; cover?: unknown } };

export function pickCover<T extends NewsLike>(news: T[], listSize = 5) {
  const withCover = news.filter((n) => n.data.cover);
  const lead = withCover[0];
  const rail = withCover.slice(1, 4);
  const shown = new Set([lead, ...rail].filter((n): n is T => !!n).map((n) => n.data.slug));
  const textList = news.filter((n) => !shown.has(n.data.slug)).slice(0, listSize);
  const used = new Set([...shown, ...textList.map((n) => n.data.slug)]);
  return { lead, rail, textList, used };
}

const months = ["JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE", "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER"];
/** 2026-10-15 → OCTOBER 15, 2026；精度不到日时原样返回。 */
export const longDate = (v: string) => {
  const [y, m, d] = v.split("-");
  return m && d ? `${months[+m - 1]} ${+d}, ${y}` : v;
};
/** 2026-10-15 → 2026.10.15 */
export const dotDate = (v: string) => v.replaceAll("-", ".");
