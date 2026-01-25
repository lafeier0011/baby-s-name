// 前端速率限制器
const RATE_LIMIT_KEY = 'name_generator_rate_limit';
const MAX_REQUESTS_PER_MINUTE = 5;
const TIME_WINDOW_MS = 60 * 1000; // 1分钟

interface RateLimitRecord {
  timestamps: number[];
}

export class RateLimiter {
  private getRecord(): RateLimitRecord {
    try {
      const stored = localStorage.getItem(RATE_LIMIT_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to parse rate limit record:', error);
    }
    return { timestamps: [] };
  }

  private saveRecord(record: RateLimitRecord): void {
    try {
      localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify(record));
    } catch (error) {
      console.error('Failed to save rate limit record:', error);
    }
  }

  private cleanOldTimestamps(timestamps: number[]): number[] {
    const now = Date.now();
    return timestamps.filter(ts => now - ts < TIME_WINDOW_MS);
  }

  // 检查是否可以发起请求
  canMakeRequest(): { allowed: boolean; remaining: number; resetIn: number } {
    const record = this.getRecord();
    const cleanTimestamps = this.cleanOldTimestamps(record.timestamps);
    
    const allowed = cleanTimestamps.length < MAX_REQUESTS_PER_MINUTE;
    const remaining = Math.max(0, MAX_REQUESTS_PER_MINUTE - cleanTimestamps.length);
    
    // 计算重置时间（最早的时间戳过期时间）
    let resetIn = 0;
    if (!allowed && cleanTimestamps.length > 0) {
      const oldestTimestamp = Math.min(...cleanTimestamps);
      resetIn = Math.ceil((TIME_WINDOW_MS - (Date.now() - oldestTimestamp)) / 1000);
    }

    return { allowed, remaining, resetIn };
  }

  // 记录一次请求
  recordRequest(): void {
    const record = this.getRecord();
    const cleanTimestamps = this.cleanOldTimestamps(record.timestamps);
    cleanTimestamps.push(Date.now());
    this.saveRecord({ timestamps: cleanTimestamps });
  }

  // 获取剩余请求次数
  getRemainingRequests(): number {
    const record = this.getRecord();
    const cleanTimestamps = this.cleanOldTimestamps(record.timestamps);
    return Math.max(0, MAX_REQUESTS_PER_MINUTE - cleanTimestamps.length);
  }
}

// 单例实例
export const rateLimiter = new RateLimiter();
