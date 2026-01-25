import { AlertCircle, ArrowLeft, RefreshCw } from "lucide-react";
import { Button } from "./ui/button";

interface ErrorStateProps {
  error: string;
  onRetry: () => void;
  onBack: () => void;
}

export default function ErrorState({ error, onRetry, onBack }: ErrorStateProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-rose-50/30 to-blue-50/30 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl md:rounded-3xl shadow-xl p-6 md:p-12 border border-stone-200/50 text-center">
          {/* Error Icon */}
          <div className="w-14 h-14 md:w-16 md:h-16 mx-auto mb-5 md:mb-6 rounded-full bg-red-50 flex items-center justify-center">
            <AlertCircle className="w-7 h-7 md:w-8 md:h-8 text-red-500" />
          </div>

          {/* Error Message */}
          <h2 className="text-xl md:text-2xl font-serif text-stone-800 mb-2 md:mb-3">
            生成失败
          </h2>
          <p className="text-sm md:text-base text-stone-600 mb-6 md:mb-8 leading-relaxed">
            {error}
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={onBack}
              variant="outline"
              className="flex-1 h-11 md:h-12 border-stone-200 hover:bg-stone-50 text-sm md:text-base"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              返回首页
            </Button>
            <Button
              onClick={onRetry}
              className="flex-1 h-11 md:h-12 bg-gradient-to-r from-rose-400 to-pink-400 hover:from-rose-500 hover:to-pink-500 text-white text-sm md:text-base"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              重试
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}