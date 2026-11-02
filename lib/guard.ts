// 健康關鍵字：出現時不給產品建議，直接提醒就醫
const HEALTH_RX = /(尿不出|尿不太出|一直跑砂盆|頻繁蹲|血尿|不吃不喝|呼吸急促|張口呼吸|抽搐|吐不停|嘔吐不止|昏迷|癱軟)/;

export const needsVet = (text: string) => HEALTH_RX.test(text);

export const VET_MESSAGE =
  '這聽起來可能需要立即就醫。公貓尿不出來可能在 24–48 小時內危及生命，請馬上聯絡獸醫或夜間急診。本平台不提供醫療建議。';
