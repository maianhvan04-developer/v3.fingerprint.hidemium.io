import type { Language, Translation } from "@/types/fingerprint";

export const translations: Record<Language, Translation> = {
  EN: {
    badge: "Know your IP",
    browserScore: "Browser score:",
    copied: "Copied!",
    copyIp: "Copy IP",
    details: "View details",
    diagnostics: "Detailed proxy & system diagnostics",
    diagnosticsSub: "Analyze your current connection and browser environment: detected WebRTC IP address, JavaScript status. Verify anonymity and detect potential leaks.",
    ipRisk: "IP risk score:",
    myIp: "My IP:",
  },
  VI: {
    badge: "Kiểm tra địa chỉ IP",
    browserScore: "Điểm trình duyệt:",
    copied: "Đã sao chép!",
    copyIp: "Sao chép IP",
    details: "Xem chi tiết",
    diagnostics: "Chẩn đoán proxy & hệ thống chi tiết",
    diagnosticsSub: "Phân tích kết nối và môi trường trình duyệt hiện tại, kiểm tra WebRTC, JavaScript và các nguy cơ rò rỉ dữ liệu.",
    ipRisk: "Điểm rủi ro IP:",
    myIp: "IP của tôi:",
  },
  RU: {
    badge: "Узнайте свой IP",
    browserScore: "Оценка браузера:",
    copied: "Скопировано!",
    copyIp: "Копировать IP",
    details: "Подробнее",
    diagnostics: "Подробная диагностика прокси и системы",
    diagnosticsSub: "Анализ текущего соединения, WebRTC, JavaScript и возможных утечек данных.",
    ipRisk: "Риск IP:",
    myIp: "Мой IP:",
  },
};

export function getFlag(countryCode?: string) {
  if (!countryCode || countryCode.length !== 2) return "🌐";
  return countryCode
    .toUpperCase()
    .split("")
    .map((letter) => String.fromCodePoint(127397 + letter.charCodeAt(0)))
    .join("");
}
