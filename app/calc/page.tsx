import { getProducts, getStats } from '@/lib/data';
import { median } from '@/lib/scoring';
import DemoNotice from '@/components/DemoNotice';
import Disclaimer from '@/components/Disclaimer';
import Calculator, { type CalcProduct } from './Calculator';

export const metadata = {
  title: '每貓每天成本計算機｜喵實測',
  description: '輸入一包多少錢、用幾天、幾隻貓，算出每貓每天真正花多少，跟全站中位數比一比。',
};

export default async function CalcPage() {
  const [products, stats] = await Promise.all([getProducts(), getStats()]);
  const byId = new Map(stats.map((s) => [s.product_id, s]));
  const list: CalcProduct[] = products
    .filter((p) => !p.prescription)
    .map((p) => {
      const s = byId.get(p.id);
      return {
        id: p.id, category: p.category, label: `${p.brand} ${p.name}`,
        cost: s?.cost_per_cat_day ?? null, catDays: s?.median_cat_days ?? null, source: s?.days_source ?? null,
      };
    });
  const medians = {
    litter: median(list.filter((p) => p.category === 'litter').map((p) => p.cost ?? 0)),
    food: median(list.filter((p) => p.category === 'food').map((p) => p.cost ?? 0)),
  };

  return (
    <main>
      <h1>每貓每天成本計算機</h1>
      <p className="muted">包裝上寫「一包用一個月」？算算你家實際上每隻貓每天花多少，不用登入。</p>
      <DemoNotice />
      <Calculator products={list} medians={medians} />
      <Disclaimer />
    </main>
  );
}
