-- 喵實測 資料庫結構（在 Supabase SQL Editor 執行一次）

create extension if not exists pgcrypto;

create table households (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique default auth.uid() references auth.users on delete cascade,
  display_name text not null default '匿名貓奴' check (length(btrim(display_name)) > 0),
  cats int not null default 1 check (cats between 1 and 20),
  housing text check (housing in ('studio', 'apartment', 'house')),
  box_type text,
  allergy boolean not null default false,
  created_at timestamptz not null default now()
);

create table cats (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references households on delete cascade,
  species text not null default 'cat' check (species in ('cat', 'dog')),
  name text not null,
  birth_date date,
  long_hair boolean not null default false,
  neutered boolean not null default true,
  vet_tags text[] not null default '{}',
  created_at timestamptz not null default now()
);

create table products (
  id uuid primary key default gen_random_uuid(),
  species text not null default 'cat' check (species in ('cat', 'dog')),
  category text not null check (category in ('litter', 'food', 'pad')),
  brand text not null,
  name text not null,
  litter_type text,
  pack_weight_kg numeric,
  life_stage text,
  prescription boolean not null default false,
  buy_url text,
  is_sample boolean not null default false,
  created_at timestamptz not null default now()
);

create table purchases (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references households on delete cascade,
  product_id uuid not null references products,
  purchased_at date not null,
  quantity int not null default 1 check (quantity > 0),
  -- 0 元會讓「每貓每天成本」變成 0 並打壞價格分數，所以只接受正數或不填
  price_twd numeric check (price_twd > 0),
  channel text,
  proof_path text,
  verified boolean not null default false,
  full_replace boolean not null default false,
  created_at timestamptz not null default now()
);
-- 一張訂單可以有多個品項，但同一張證明 × 同一款商品只能記一次
create unique index purchases_proof_product on purchases (proof_path, product_id) where proof_path is not null;

-- 訂單辨識結果：只由伺服器（service role）寫入，/api/purchases 用它確認證明真的辨識出寵物商品
create table ocr_results (
  proof_path text primary key,
  user_id uuid not null references auth.users on delete cascade,
  image_sha256 text not null,
  items jsonb not null default '[]',
  purchased_on date,
  created_at timestamptz not null default now()
);
create index ocr_results_sha on ocr_results (image_sha256);

-- 標準實測：day = 0 首次實測，day = 30 追蹤
create table tests (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references households on delete cascade,
  product_id uuid not null references products,
  day int not null default 0 check (day in (0, 30)),
  -- 貓砂
  dust numeric check (dust between 1 and 5),
  clump numeric check (clump between 1 and 5),
  tracking numeric check (tracking between 1 and 5),
  odor_d3 numeric check (odor_d3 between 1 and 5),
  odor_d7 numeric check (odor_d7 between 1 and 5),
  accepted boolean,
  -- 飼料（飼主觀察，非醫療判斷）
  palatability boolean,
  stool_score int check (stool_score between 1 and 7),
  soft_stool_on_switch boolean,
  vomit_weekly boolean,
  coat numeric check (coat between 1 and 5),
  vet_suggested boolean,
  -- 共通
  bag_days int check (bag_days between 1 and 365), -- 飼主自填「全家一包大約用幾天」，還沒有連續購買紀錄時的備援
  sponsored boolean not null default false,
  photo_paths text[] not null default '{}',
  comment text,
  created_at timestamptz not null default now(),
  unique (household_id, product_id, day)
);

create table questions (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references households on delete cascade,
  product_id uuid not null references products,
  author_name text not null,
  body text not null check (length(body) between 2 and 500),
  created_at timestamptz not null default now()
);

create table answers (
  id uuid primary key default gen_random_uuid(),
  question_id uuid not null references questions on delete cascade,
  household_id uuid not null references households on delete cascade,
  author_name text not null,
  body text not null check (length(body) between 2 and 1000),
  created_at timestamptz not null default now()
);

create table points_ledger (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references households on delete cascade,
  delta int not null,
  reason text not null,
  ref_id uuid,
  created_at timestamptz not null default now()
);

-- 點數只由觸發器發放，只看完成度，與評分高低無關
create or replace function award_points() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if tg_table_name = 'purchases' and new.verified then
    insert into points_ledger (household_id, delta, reason, ref_id) values (new.household_id, 30, 'purchase', new.id);
    -- 同一款第一次湊滿「兩次不同日期的已驗證購買」→ 解鎖使用週期，每個家庭每款只給一次
    if exists (
      select 1 from purchases x
      where x.household_id = new.household_id and x.product_id = new.product_id
        and x.id <> new.id and x.verified and x.purchased_at <> new.purchased_at
    ) and not exists (
      select 1 from points_ledger l join purchases x on x.id = l.ref_id
      where l.reason = 'cycle' and x.household_id = new.household_id and x.product_id = new.product_id
    ) then
      insert into points_ledger (household_id, delta, reason, ref_id) values (new.household_id, 20, 'cycle', new.id);
    end if;
  elsif tg_table_name = 'tests' then
    insert into points_ledger (household_id, delta, reason, ref_id)
    values (new.household_id, case when new.day = 30 then 50 else 80 end, 'test', new.id);
  end if;
  return new;
end $$;

create trigger purchases_points after insert on purchases for each row execute function award_points();
create trigger tests_points after insert on tests for each row execute function award_points();

-- RLS
alter table households enable row level security;
alter table cats enable row level security;
alter table products enable row level security;
alter table purchases enable row level security;
alter table ocr_results enable row level security; -- 不開任何 policy：只有 service role 能讀寫
alter table tests enable row level security;
alter table questions enable row level security;
alter table answers enable row level security;
alter table points_ledger enable row level security;

create or replace function my_household() returns uuid
language sql stable security definer set search_path = public as $$
  select id from households where user_id = auth.uid()
$$;

create policy "own household" on households for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "own cats" on cats for all using (household_id = my_household()) with check (household_id = my_household());
create policy "products readable" on products for select using (true);
create policy "own purchases read" on purchases for select using (household_id = my_household());
-- 用戶自己新增的購買一律未驗證；驗證過的由伺服器（service role）寫入
create policy "own purchases insert" on purchases for insert with check (household_id = my_household() and verified = false and proof_path is null);
create policy "own tests read" on tests for select using (household_id = my_household());
create policy "own tests insert" on tests for insert with check (household_id = my_household() and sponsored = false);
create policy "questions readable" on questions for select using (true);
create policy "questions insert" on questions for insert with check (household_id = my_household());
create policy "answers readable" on answers for select using (true);
create policy "answers insert" on answers for insert with check (household_id = my_household());
create policy "own points" on points_ledger for select using (household_id = my_household());

-- 公開評論（只露出暱稱與情境，不露出 household id）
create or replace view public_reviews as
select t.id, t.product_id, h.display_name, h.cats, h.housing, t.comment, t.sponsored, t.day,
       exists (select 1 from purchases x where x.household_id = t.household_id and x.product_id = t.product_id and x.verified) as verified,
       t.created_at
from tests t join households h on h.id = t.household_id
where t.comment is not null and length(t.comment) > 0;
grant select on public_reviews to anon, authenticated;

-- 商品統計：可依貓數與住宅類型篩選情境
-- 權重：試用包 0.5、有購買驗證 1.0、其他 0.4
-- 每個家庭對每款商品只算一票（首次實測 + 30 天追蹤合併，各欄位取最新有填的值）
create or replace function product_stats(p_cats int default null, p_housing text default null)
returns table (
  product_id uuid, n_verified int, n_households int, repurchase_rate numeric,
  median_cat_days numeric, cost_per_cat_day numeric, days_source text,
  dust numeric, dust_w numeric, odor numeric, odor_w numeric, accept_rate numeric,
  palatability numeric, stool numeric, soft_switch numeric, vomit numeric, vet_rate numeric, n_tests int
)
language sql stable security definer set search_path = public as $$
with hh as (
  select id, cats from households
  where (p_cats is null or cats = p_cats) and (p_housing is null or housing = p_housing)
),
pu as (
  select x.*, hh.cats,
         lag(x.purchased_at) over w as prev_at,
         lag(x.quantity) over w as prev_qty,
         lag(x.price_twd) over w as prev_price
  from purchases x join hh on hh.id = x.household_id
  window w as (partition by x.household_id, x.product_id order by x.purchased_at)
),
-- 使用週期：同一家庭連續兩次購買同一款的間隔，排除 >90 天
cyc as (
  select product_id,
         ((purchased_at - prev_at)::numeric / prev_qty) * cats as cat_days,
         prev_price / prev_qty as bag_price
  from pu
  where prev_at is not null and purchased_at - prev_at between 1 and 90
),
cyc_agg as (
  select product_id,
         percentile_cont(0.5) within group (order by cat_days)::numeric as median_cat_days,
         percentile_cont(0.5) within group (order by bag_price / nullif(cat_days, 0))::numeric as cost_per_cat_day
  from cyc group by product_id
),
-- 一包的價格：單次購買就有，不需要湊兩次
price_agg as (
  select product_id, percentile_cont(0.5) within group (order by price_twd / quantity)::numeric as bag_price
  from pu where price_twd > 0 group by product_id
),
buy_agg as (
  select product_id,
         count(*) filter (where verified)::int as n_verified,
         count(distinct household_id)::int as n_households,
         (count(distinct household_id) filter (where n >= 2))::numeric / nullif(count(distinct household_id), 0) as repurchase_rate
  from (select pu.*, count(*) over (partition by household_id, product_id) as n from pu) z
  group by product_id
),
th as (
  select tt.household_id, tt.product_id, hh.cats,
         bool_or(tt.sponsored) as sponsored,
         (array_agg(tt.dust order by tt.day desc, tt.created_at desc) filter (where tt.dust is not null))[1] as dust,
         (array_agg(coalesce(tt.odor_d7, tt.odor_d3) order by tt.day desc, tt.created_at desc)
            filter (where coalesce(tt.odor_d7, tt.odor_d3) is not null))[1] as odor,
         (array_agg(tt.accepted order by tt.day desc, tt.created_at desc) filter (where tt.accepted is not null))[1] as accepted,
         (array_agg(tt.palatability order by tt.day desc, tt.created_at desc) filter (where tt.palatability is not null))[1] as palatability,
         (array_agg(tt.stool_score order by tt.day desc, tt.created_at desc) filter (where tt.stool_score is not null))[1] as stool_score,
         (array_agg(tt.soft_stool_on_switch order by tt.day desc, tt.created_at desc) filter (where tt.soft_stool_on_switch is not null))[1] as soft_stool_on_switch,
         (array_agg(tt.vomit_weekly order by tt.day desc, tt.created_at desc) filter (where tt.vomit_weekly is not null))[1] as vomit_weekly,
         (array_agg(tt.vet_suggested order by tt.day desc, tt.created_at desc) filter (where tt.vet_suggested is not null))[1] as vet_suggested,
         (array_agg(tt.bag_days order by tt.day desc, tt.created_at desc) filter (where tt.bag_days is not null))[1] as bag_days
  from tests tt join hh on hh.id = tt.household_id
  group by tt.household_id, tt.product_id, hh.cats
),
t as (
  select th.*,
         case when th.sponsored then 0.5
              when exists (select 1 from purchases x where x.household_id = th.household_id and x.product_id = th.product_id and x.verified) then 1.0
              else 0.4 end as w
  from th
),
test_agg as (
  select product_id,
         sum(w * dust) / nullif(sum(w) filter (where dust is not null), 0) as dust,
         coalesce(sum(w) filter (where dust is not null), 0) as dust_w,
         sum(w * odor) / nullif(sum(w) filter (where odor is not null), 0) as odor,
         coalesce(sum(w) filter (where odor is not null), 0) as odor_w,
         avg(accepted::int) as accept_rate,
         avg(palatability::int) as palatability,
         percentile_cont(0.5) within group (order by stool_score)::numeric as stool,
         avg(soft_stool_on_switch::int) as soft_switch,
         avg(vomit_weekly::int) as vomit,
         avg(vet_suggested::int) as vet_rate,
         percentile_cont(0.5) within group (order by bag_days * cats)::numeric as self_cat_days,
         count(*)::int as n_tests
  from t group by product_id
)
select p.id,
       coalesce(b.n_verified, 0), coalesce(b.n_households, 0), b.repurchase_rate,
       coalesce(c.median_cat_days, ta.self_cat_days),
       coalesce(c.cost_per_cat_day, pr.bag_price / nullif(coalesce(c.median_cat_days, ta.self_cat_days), 0)),
       case when c.median_cat_days is not null then 'purchase'
            when ta.self_cat_days is not null then 'self' end,
       ta.dust, coalesce(ta.dust_w, 0), ta.odor, coalesce(ta.odor_w, 0), ta.accept_rate,
       ta.palatability, ta.stool, ta.soft_switch, ta.vomit, ta.vet_rate, coalesce(ta.n_tests, 0)
from products p
left join buy_agg b on b.product_id = p.id
left join cyc_agg c on c.product_id = p.id
left join price_agg pr on pr.product_id = p.id
left join test_agg ta on ta.product_id = p.id
$$;
grant execute on function product_stats(int, text) to anon, authenticated;

-- Storage：訂單證明（私人）與實測照片（公開）
insert into storage.buckets (id, name, public) values ('proofs', 'proofs', false), ('tests', 'tests', true)
on conflict (id) do nothing;
create policy "own proofs upload" on storage.objects for insert to authenticated
  with check (bucket_id = 'proofs' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "own test photos upload" on storage.objects for insert to authenticated
  with check (bucket_id = 'tests' and (storage.foldername(name))[1] = auth.uid()::text);
