// 29 Ekim Cumhuriyet Bayramı açılış görseli: 29 Ekim 2026 gece yarısına kadar (TR saati) gösterilir.
export const HOLIDAY_KEY = 'holidaySplash'
export const HOLIDAY_END = Date.parse('2026-10-30T00:00:00+03:00')
export const holidayActive = () => Date.now() < HOLIDAY_END
