export default function Disclaimer({ food = false }: { food?: boolean }) {
  return (
    <p className="disc">
      本平台內容為飼主實測與使用經驗分享，不構成醫療建議，也不能取代獸醫診斷。
      {food && '若貓咪有健康狀況或正在使用處方飼料，請先與您的獸醫討論。'}
      購買連結可能含導購分潤，不影響排名；拿過試用品的評論會標示「試用」。
    </p>
  );
}
