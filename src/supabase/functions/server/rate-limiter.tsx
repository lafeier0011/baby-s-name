import { Context } from "npm:hono";
import * as kv from "./kv_store.tsx";

const MAX_REQUESTS_PER_MINUTE = 5;
const TIME_WINDOW_MS = 60 * 1000; // 1分钟

interface RateLimitRecord {
  timestamps: number[];
}

// 获取客户端标识符（IP地址或其他）
function getClientIdentifier(c: Context): string {
  // 尝试从多个来源获取真实IP
  const forwardedFor = c.req.header("x-forwarded-for");
  const realIp = c.req.header("x-real-ip");
  const cfConnectingIp = c.req.header("cf-connecting-ip");
  
  // 优先使用这些header中的IP
  const ip = cfConnectingIp || realIp || forwardedFor?.split(",")[0] || "unknown";
  
  return `rate_limit:${ip}`;
}

// 清理过期的时间戳
function cleanOldTimestamps(timestamps: number[]): number[] {
  const now = Date.now();
  return timestamps.filter(ts => now - ts < TIME_WINDOW_MS);
}

// 速率限制中间件
export async function rateLimitMiddleware(c: Context, next: () => Promise<void>) {
  const clientKey = getClientIdentifier(c);
  
  try {
    // 获取当前记录
    const record = await kv.get<RateLimitRecord>(clientKey);
    const timestamps = record?.timestamps || [];
    
    // 清理过期的时间戳
    const cleanTimestamps = cleanOldTimestamps(timestamps);
    
    // 检查是否超过限制
    if (cleanTimestamps.length >= MAX_REQUESTS_PER_MINUTE) {
      const oldestTimestamp = Math.min(...cleanTimestamps);
      const resetIn = Math.ceil((TIME_WINDOW_MS - (Date.now() - oldestTimestamp)) / 1000);
      
      console.log(`Rate limit exceeded for ${clientKey}`);
      
      return c.json({
        error: `请求过于频繁，请在 ${resetIn} 秒后重试。每分钟最多可请求${MAX_REQUESTS_PER_MINUTE}次。`,
        resetIn,
        remaining: 0,
      }, 429);
    }
    
    // 记录本次请求
    cleanTimestamps.push(Date.now());
    await kv.set(clientKey, { timestamps: cleanTimestamps });
    
    // 继续处理请求
    await next();
  } catch (error) {
    console.error("Rate limiter error:", error);
    // 如果速率限制器出错，允许请求通过
    await next();
  }
}
