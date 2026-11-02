-- 台灣常見貓砂與貓飼料起始清單（可直接在 Supabase SQL Editor 執行）

insert into products (species, category, brand, name, litter_type, pack_weight_kg, is_sample) values
  -- 豆腐砂 / 植物砂 / 混合砂
  ('cat', 'litter', '汪喵星球', '益生菌消臭豆腐砂（細條型）6L', 'tofu', 2.4, false),
  ('cat', 'litter', '汪喵星球', '米粒型益生菌消臭豆腐砂 6L', 'tofu', 2.4, false),
  ('cat', 'litter', '怪獸部落', '費洛蒙快樂貓砂（豆腐砂）6L', 'tofu', 2.4, false),
  ('cat', 'litter', '臭味滾', '極細抗臭豆腐貓砂 6L', 'tofu', 2.4, false),
  ('cat', 'litter', '超凝小姐', '益生菌除臭豆腐砂 6L', 'tofu', 2.7, false),
  ('cat', 'litter', 'pidan', '經典混合貓砂 6L', 'mixed', 2.4, false),
  ('cat', 'litter', 'pidan', '原味純豆腐砂 6L', 'tofu', 2.4, false),
  ('cat', 'litter', '路易貓砂', '88% 高纖豆腐砂 6L', 'tofu', 2.5, false),
  ('cat', 'litter', '防禦工事', 'T-FENCE 黃金比例混合砂 6L', 'mixed', 2.5, false),
  ('cat', 'litter', '水魔素', '極細消臭豆腐砂 6L', 'tofu', 2.5, false),
  -- 木薯砂 / 礦型植物砂
  ('cat', 'litter', '汪喵星球', '純木薯極細貓砂 6L', 'cassava', 2.7, false),
  ('cat', 'litter', '怪獸部落', '極細木薯貓砂 6L', 'cassava', 2.7, false),
  ('cat', 'litter', 'Sustainably Yours', '玉米木薯天然貓砂（大顆粒）5.9kg', 'cassava', 5.9, false),
  -- 礦砂
  ('cat', 'litter', 'Arm & Hammer 鐵鎚', '雙效除臭強效結塊礦砂 18.1kg', 'bentonite', 18.1, false),
  ('cat', 'litter', 'Ever Clean 藍鑽', '雙重活性碳低過敏結塊礦砂 11.3kg', 'bentonite', 11.3, false),
  ('cat', 'litter', 'Boxiecat', 'Pro 益生菌無塵礦砂 7.2kg', 'bentonite', 7.2, false),
  ('cat', 'litter', 'Dr.Elsey''s 艾爾博士', '經典無香低粉塵礦砂 18.1kg', 'bentonite', 18.1, false),
  -- 松木砂
  ('cat', 'litter', '凱優 Cat''s Best', '紅標凝結木屑砂 10L', 'pine', 4.3, false);

insert into products (species, category, brand, name, life_stage, pack_weight_kg, prescription, is_sample) values
  -- 一般成貓／幼貓／熟齡乾糧
  ('cat', 'food', 'Orijen 渴望', '全貓鮮雞無穀乾糧', 'adult', 1.8, false, false),
  ('cat', 'food', 'Acana 愛肯拿', '室內開胃無穀貓糧（雞肉＋火雞）', 'adult', 1.8, false, false),
  ('cat', 'food', 'Nutram 紐頓', 'T22 無穀全齡貓火雞＋雞肉', 'adult', 2.0, false, false),
  ('cat', 'food', 'Halo 嘿囉', '成貓無穀鮮嫩雞肉', 'adult', 1.8, false, false),
  ('cat', 'food', 'Wellness 寵物健康', 'CORE 無穀室內成貓去骨雞肉', 'adult', 2.27, false, false),
  ('cat', 'food', 'Hill''s 希爾思', '室內成貓雞肉特調', 'adult', 1.58, false, false),
  ('cat', 'food', 'Royal Canin 法國皇家', 'IN27 室內成貓乾糧', 'adult', 2.0, false, false),
  ('cat', 'food', 'Royal Canin 法國皇家', 'K36 幼貓專用乾糧', 'kitten', 2.0, false, false),
  ('cat', 'food', '汪喵星球', '冷凍乾燥生食餐（安心雞）', 'adult', 0.5, false, false),
  ('cat', 'food', '怪獸部落', '98% 鮮肉主食糧（雞肉）', 'adult', 0.8, false, false),
  -- 處方飼料（僅供紀錄，不進排行、不放導購連結）
  ('cat', 'food', 'Royal Canin 法國皇家', 'LP34 貓泌尿道處方乾糧', 'adult', 2.0, true, false),
  ('cat', 'food', 'Hill''s 希爾思', 'c/d Multicare 貓泌尿道護理處方乾糧', 'adult', 1.81, true, false),
  ('cat', 'food', 'Hill''s 希爾思', 'k/d 貓腎臟護理處方乾糧', 'mature', 1.81, true, false);
