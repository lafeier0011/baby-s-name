import { Context } from "npm:hono";
import * as kv from "./kv_store.tsx";

const MAX_REQUESTS_PER_DAY = 20;
const ONE_DAY_MS = 24 * 60 * 60 * 1000; // 24小时

interface RateLimitRecord {
  count: number;
  resetAt: number; // Unix timestamp when the limit resets
}

// 获取客户端标识符（IP地址或其他）
function getClientIdentifier(c: Context): string {
  // 尝试从多个来源获取真实IP
  const forwardedFor = c.req.header("x-forwarded-for");
  const realIp = c.req.header("x-real-ip");
  const cfConnectingIp = c.req.header("cf-connecting-ip");
  
  // 优先使用这些header中的IP
  const ip = cfConnectingIp || realIp || forwardedFor?.split(",")[0] || "unknown";
  
  return `rate_limit_daily:${ip}`;
}

// 获取今天结束的时间戳（当地时间午夜）
function getTodayEndTimestamp(): number {
  const now = new Date();
  const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  return tomorrow.getTime();
}

// 速率限制中间件
export async function rateLimitMiddleware(c: Context, next: () => Promise<void>) {
  const clientKey = getClientIdentifier(c);
  
  try {
    const now = Date.now();
    
    // 获取当前记录
    const record = await kv.get<RateLimitRecord>(clientKey);
    
    // 如果没有记录或已过期，创建新记录
    if (!record || now >= record.resetAt) {
      const newRecord: RateLimitRecord = {
        count: 1,
        resetAt: getTodayEndTimestamp(),
      };
      await kv.set(clientKey, newRecord);
      
      // 添加响应头，告知前端剩余次数
      c.header("X-RateLimit-Remaining", String(MAX_REQUESTS_PER_DAY - 1));
      c.header("X-RateLimit-Reset", String(newRecord.resetAt));
      
      await next();
      return;
    }
    
    // 检查是否超过限制
    if (record.count >= MAX_REQUESTS_PER_DAY) {
      const resetIn = Math.ceil((record.resetAt - now) / 1000 / 60); // 转换为分钟
      const resetHours = Math.floor(resetIn / 60);
      const resetMinutes = resetIn % 60;
      
      console.log(`Daily rate limit exceeded for ${clientKey}`);
      
      return c.json({
        error: `今日取名次数已用完（${MAX_REQUESTS_PER_DAY}次/天），请在${resetHours > 0 ? `${resetHours}小时` : ''}${resetMinutes}分钟后重试。`,
        resetIn: resetIn * 60, // 返回秒数
        remaining: 0,
        limit: MAX_REQUESTS_PER_DAY,
      }, 429);
    }
    
    // 增加计数
    record.count += 1;
    await kv.set(clientKey, record);
    
    // 添加响应头，告知前端剩余次数
    c.header("X-RateLimit-Remaining", String(MAX_REQUESTS_PER_DAY - record.count));
    c.header("X-RateLimit-Reset", String(record.resetAt));
    
    // 继续处理请求
    await next();
  } catch (error) {
    console.error("Rate limiter error:", error);
    // 如果速率限制器出错，允许请求通过
    await next();
  }
}