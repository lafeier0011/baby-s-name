import { Loader2 } from "lucide-react";

export default function LoadingState() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-rose-50/30 to-blue-50/30 flex items-center justify-center p-4">
      <div className="text-center px-4">
        {/* Animated Icon */}
        <div className="relative mb-6 md:mb-8">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-br from-rose-200 to-blue-200 opacity-30 animate-ping" />
          </div>
          <div className="relative w-20 h-20 md:w-24 md:h-24 mx-auto rounded-full bg-gradient-to-br from-rose-200 to-blue-200 flex items-center justify-center">
            <Loader2 className="w-10 h-10 md:w-12 md:h-12 text-white animate-spin" />
          </div>
        </div>

        {/* Loading Text */}
        <h2 className="text-xl md:text-2xl font-serif text-stone-800 mb-2 md:mb-3">
          正在为您的宝宝取名...
        </h2>
        <p className="text-sm md:text-base text-stone-500 mb-5 md:mb-6">
          结合五行八字与传统文化，精心挑选
        </p>

        {/* Animated Dots */}
        <div className="flex items-center justify-center gap-2">
          <div className="w-2 h-2 rounded-full bg-rose-400 animate-bounce" style={{ animationDelay: "0ms" }} />
          <div className="w-2 h-2 rounded-full bg-pink-400 animate-bounce" style={{ animationDelay: "150ms" }} />
          <div className="w-2 h-2 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: "300ms" }} />
        </div>

        {/* Loading Steps */}
        <div className="mt-10 md:mt-12 space-y-2 md:space-y-3 text-xs md:text-sm text-stone-400">
          <p className="opacity-100">✓ 分析生辰八字</p>
          <p className="opacity-80">✓ 计算五行属性</p>
          <p className="opacity-60">⋯ 寻找诗词典故</p>
          <p className="opacity-40">⋯ 生成美好名字</p>
        </div>
      </div>
    </div>
  );
}