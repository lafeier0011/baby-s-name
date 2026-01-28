/**
 * 农历生肖计算工具
 * 根据立春节气来确定生肖，而非简单的公历年份
 */

// 1900-2100年的立春日期数据（格式：[月, 日]）
const springBeginDates: Record<number, [number, number]> = {
  2020: [2, 4],
  2021: [2, 3],
  2022: [2, 4],
  2023: [2, 4],
  2024: [2, 4],
  2025: [2, 3],
  2026: [2, 4],
  2027: [2, 4],
  2028: [2, 4],
  2029: [2, 3],
  2030: [2, 4],
  2031: [2, 4],
  2032: [2, 4],
  2033: [2, 3],
  2034: [2, 4],
  2035: [2, 4],
  2036: [2, 4],
  2037: [2, 3],
  2038: [2, 4],
  2039: [2, 4],
  2040: [2, 4],
};

/**
 * 根据公历日期计算生肖
 * @param date 公历日期
 * @returns 生肖字符串
 */
export function getChineseZodiac(date: Date): string {
  const zodiacs = ["鼠", "牛", "虎", "兔", "龙", "蛇", "马", "羊", "猴", "鸡", "狗", "猪"];
  
  const year = date.getFullYear();
  const month = date.getMonth() + 1; // 0-indexed, so add 1
  const day = date.getDate();
  
  // 获取该年的立春日期
  const springBegin = springBeginDates[year];
  
  if (!springBegin) {
    // 如果没有数据，使用简化算法（以2月4日为近似立春）
    console.warn(`No spring begin date data for year ${year}, using approximation`);
    const isBeforeSpring = month < 2 || (month === 2 && day < 4);
    const zodiacYear = isBeforeSpring ? year - 1 : year;
    return zodiacs[(zodiacYear - 1900) % 12];
  }
  
  const [springMonth, springDay] = springBegin;
  
  // 判断日期是否在立春之前
  const isBeforeSpring = 
    month < springMonth || 
    (month === springMonth && day < springDay);
  
  // 如果在立春之前，使用上一年的生肖
  const zodiacYear = isBeforeSpring ? year - 1 : year;
  
  return zodiacs[(zodiacYear - 1900) % 12];
}

/**
 * 获取生肖对应的年份（用于显示）
 * @param date 公历日期
 * @returns 生肖年份
 */
export function getZodiacYear(date: Date): number {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  
  const springBegin = springBeginDates[year];
  
  if (!springBegin) {
    const isBeforeSpring = month < 2 || (month === 2 && day < 4);
    return isBeforeSpring ? year - 1 : year;
  }
  
  const [springMonth, springDay] = springBegin;
  const isBeforeSpring = 
    month < springMonth || 
    (month === springMonth && day < springDay);
  
  return isBeforeSpring ? year - 1 : year;
}
