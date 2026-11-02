# 喵實測

貓砂與飼料的實測排行平台：標準實測＋購買紀錄＋情境分組。

## 本機試跑（示意資料，不用任何設定）

    npm install
    npm run dev    # 開 http://localhost:3000

沒有設定 Supabase 時，排行榜和商品頁會顯示虛構的示意資料；登入、實測、上傳訂單需要 Supabase。

## 接上真實資料

1. 到 supabase.com 建一個專案。
2. 在 SQL Editor 依序執行 `supabase/schema.sql`、`supabase/seed.sql`（seed 是示意商品，上線前換成真的）。
3. 複製 `.env.example` 為 `.env.local`，填入：
   - `NEXT_PUBLIC_SUPABASE_URL`、`NEXT_PUBLIC_SUPABASE_ANON_KEY`、`SUPABASE_SERVICE_ROLE_KEY`（Supabase → Project Settings → API）
   - `GEMINI_API_KEY`（aistudio.google.com 申請；Google AI Pro 訂閱不含 API 額度）
   - 選填：Matomo 網址與站台 ID
4. Supabase → Authentication → URL Configuration 加入你的網址（本機為 `http://localhost:3000`）。
5. 部署：推到 GitHub 後接 Vercel，環境變數照填。

## 功能

| 頁面 | 說明 |
|---|---|
| `/` 排行榜 | 貓砂／飼料，依貓數、住宅篩選（進榜門檻看全站驗證數，細分情境不空榜）；綜合、最省錢、回購率、低粉塵排序 |
| `/calc` | 免登入「每貓每天成本計算機」，輸入價格與使用天數／購買日期，即時與全站中位數比較並可一鍵複製分享 |
| `/products/[id]` | 回購率、一包用幾天、每貓每天成本、粉塵、除臭；評論；問用過的人 |
| `/submit` | 標準實測（第一次 +80 點、第 30 天追蹤 +50 點；可選填一包用幾天作為初期備援） |
| `/purchase` | 上傳訂單截圖 → Gemini 辨識並自動對齊商品目錄 → 確認後 +30 點（同款湊滿兩張不同日期證明再 +20 點） |
| `/me` | Email 登入、家庭情境、貓咪檔案、點數 |
| `/method` | 公開所有公式與規則 |

## 設計上的保護

- 點數由資料庫觸發器發放，只看完成度，不看評分。
- 有購買證明的紀錄只能由伺服器寫入（`/api/purchases`），用戶端只能寫未驗證的手動紀錄。
- 處方飼料不進排行、不放購買連結。
- 評論和提問出現「尿不出來」等字眼時，擋下送出並提醒就醫。
- 訂單照片放在私人 bucket，只有本人能上傳；辨識時只擷取寵物商品。

## 還沒做（下一步）

- LINE 登入與 LINE 推播（用完提醒、30 天追蹤、問題被回答通知）
- 依兩次購買間隔自動推估「快用完了」並提醒
- 試用包兌換與品牌後台
- 異常帳號偵測（可用 Colab 每週批次跑）
- 照片自動評分粉塵（先累積人工評分當校正資料）
