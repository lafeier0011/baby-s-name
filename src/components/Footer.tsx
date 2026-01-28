import { Heart, Sparkles, Mail, MessageCircle } from "lucide-react";

export default function Footer() {
  return (
    <div 
      className="px-4 flex flex-col items-center"
      style={{ marginTop: '24px', paddingBottom: '40px' }}
    >
      {/* Made with by Section */}
      <div className="text-center space-y-2" style={{ marginBottom: '24px' }}>
        <p className="text-sm md:text-base font-serif text-stone-600">
          Made with <span className="text-rose-500">♥</span> by <span className="font-medium bg-gradient-to-r from-rose-500 to-pink-500 bg-clip-text text-transparent">拉斐尔 & 小圆</span>
        </p>
        <div className="flex items-center justify-center gap-1.5">
          <Sparkles className="w-3 h-3 text-amber-400 animate-pulse" style={{ animationDelay: '0ms' }} />
          <Sparkles className="w-2.5 h-2.5 text-rose-400 animate-pulse" style={{ animationDelay: '300ms' }} />
          <Sparkles className="w-3 h-3 text-blue-400 animate-pulse" style={{ animationDelay: '600ms' }} />
        </div>
      </div>

      {/* Divider */}
      <div className="flex items-center justify-center gap-2 w-full" style={{ marginBottom: '24px' }}>
        <div className="flex-1 max-w-[100px] h-px bg-gradient-to-r from-transparent via-rose-200 to-rose-300" />
        <Heart className="w-4 h-4 text-rose-400 fill-rose-200 animate-pulse" />
        <div className="flex-1 max-w-[100px] h-px bg-gradient-to-l from-transparent via-rose-200 to-rose-300" />
      </div>

      {/* Contact Info Card (Now at the bottom) */}
      <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 md:p-6 shadow-sm border border-stone-200/50 flex flex-col md:flex-row items-center gap-4 md:gap-8 max-w-lg w-full">
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-rose-400 to-pink-400 rounded-full blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
          <img 
            src="https://sns-avatar-qc.xhscdn.com/avatar/5c8ce19283d4700001327a71.jpg?imageView2/2/w/540/format/jpg" 
            alt="作者头像" 
            className="relative w-16 h-16 md:w-20 md:h-20 rounded-full object-cover border-2 border-white shadow-md"
            onError={(e) => {
              // Fallback if image not found
              (e.target as HTMLImageElement).src = "https://api.dicebear.com/7.x/avataaars/svg?seed=Raphael";
            }}
          />
        </div>

        <div className="flex-1 text-center md:text-left space-y-3">
          <div>
            <h3 className="text-stone-800 font-serif font-semibold text-lg">关于作者</h3>
            <p className="text-stone-500 text-xs md:text-sm italic mt-1">"To 我们未出生的宝宝"</p>
          </div>
          
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-center md:justify-start gap-2 text-stone-600 text-sm">
              <div className="w-5 h-5 rounded-md bg-rose-50 flex items-center justify-center">
                <span className="text-[10px] font-bold text-rose-500">薯</span>
              </div>
              <span className="font-medium">小红书：</span>
              <span className="text-stone-500">拉斐尔 (ID: 979011619)</span>
            </div>
            <div className="flex items-center justify-center md:justify-start gap-2 text-stone-600 text-sm">
              <div className="w-5 h-5 rounded-md bg-blue-50 flex items-center justify-center">
                <Mail className="w-3 h-3 text-blue-500" />
              </div>
              <span className="font-medium">邮箱：</span>
              <span className="text-stone-500">451827990@qq.com</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
