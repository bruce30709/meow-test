-- 起始商品（示意品牌，正式上線前換成真實商品）
insert into products (category, brand, name, litter_type, pack_weight_kg, is_sample) values
  ('litter', 'A 牌', '原味豆腐砂 6L', 'tofu', 2.4, true),
  ('litter', 'B 牌', '礦砂 10kg', 'bentonite', 10, true),
  ('litter', 'C 牌', '木薯砂 7L', 'cassava', 3.0, true),
  ('litter', 'D 牌', '混合砂 6L', 'mixed', 2.6, true),
  ('litter', 'E 牌', '松木砂 10kg', 'pine', 10, true);

insert into products (category, brand, name, life_stage, pack_weight_kg, prescription, is_sample) values
  ('food', 'F 牌', '成貓雞肉乾糧', 'adult', 2, false, true),
  ('food', 'G 牌', '幼貓鮭魚乾糧', 'kitten', 1.5, false, true),
  ('food', 'H 牌', '熟齡貓火雞乾糧', 'mature', 2, false, true),
  ('food', 'P 牌', '泌尿道處方乾糧', 'adult', 2, true, true);
