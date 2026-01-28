import { Sparkles, Award, Droplet, Flame, Mountain, Gem, Sprout, Calendar, Briefcase, Target } from "lucide-react";

interface Metadata {
  zodiac: string;
  element: string;
  westernZodiac: string;
  birthDate: string;
  zodiacAnalysis?: string;
  career?: string;
  hobbies?: string;
}

interface ZodiacCardProps {
  metadata: Metadata;
  showBirthDate?: boolean;
}

// 生肖SVG图标组件（简约线条风格）
const ZodiacIcon = ({ zodiac }: { zodiac: string }) => {
  const zodiacMap: Record<string, JSX.Element> = {
    '鼠': (
      <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8">
        <circle cx="12" cy="10" r="6" className="stroke-rose-600" strokeWidth="1.5" fill="none"/>
        <circle cx="9" cy="9" r="1" className="fill-rose-600"/>
        <circle cx="15" cy="9" r="1" className="fill-rose-600"/>
        <path d="M8 7C7 6 6 5 5 5M16 7C17 6 18 5 19 5" className="stroke-rose-600" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M10 13C10 13 11 14 12 14C13 14 14 13 14 13" className="stroke-rose-600" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M12 16C12 16 10 18 8 19M12 16C12 16 14 18 16 19" className="stroke-rose-600" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
    '牛': (
      <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8">
        <rect x="7" y="8" width="10" height="8" rx="2" className="stroke-rose-600" strokeWidth="1.5" fill="none"/>
        <circle cx="10" cy="11" r="1" className="fill-rose-600"/>
        <circle cx="14" cy="11" r="1" className="fill-rose-600"/>
        <path d="M7 8C7 8 6 5 4 4M17 8C17 8 18 5 20 4" className="stroke-rose-600" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M10 14H14" className="stroke-rose-600" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
    '虎': (
      <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8">
        <circle cx="12" cy="11" r="7" className="stroke-rose-600" strokeWidth="1.5" fill="none"/>
        <path d="M8 6L6 4M16 6L18 4" className="stroke-rose-600" strokeWidth="1.5" strokeLinecap="round"/>
        <circle cx="9.5" cy="10" r="1" className="fill-rose-600"/>
        <circle cx="14.5" cy="10" r="1" className="fill-rose-600"/>
        <path d="M9 14C9.5 15 10.5 15.5 12 15.5C13.5 15.5 14.5 15 15 14" className="stroke-rose-600" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M7 8L8 9M17 8L16 9" className="stroke-rose-600" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
    '兔': (
      <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8">
        <ellipse cx="12" cy="13" rx="5" ry="6" className="stroke-rose-600" strokeWidth="1.5" fill="none"/>
        <path d="M9 3C9 3 9 8 9 10M15 3C15 3 15 8 15 10" className="stroke-rose-600" strokeWidth="1.5" strokeLinecap="round"/>
        <circle cx="10" cy="12" r="0.8" className="fill-rose-600"/>
        <circle cx="14" cy="12" r="0.8" className="fill-rose-600"/>
        <path d="M10 15C10.5 16 11 16.5 12 16.5C13 16.5 13.5 16 14 15" className="stroke-rose-600" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
    '龙': (
      <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8">
        <path d="M4 12C4 12 6 8 9 8C12 8 13 10 14 10C15 10 16 8 19 8C20 8 20 12 20 12" className="stroke-rose-600" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
        <circle cx="12" cy="12" r="5" className="stroke-rose-600" strokeWidth="1.5" fill="none"/>
        <path d="M10 11L8 9M14 11L16 9" className="stroke-rose-600" strokeWidth="1.5" strokeLinecap="round"/>
        <circle cx="10.5" cy="12" r="0.8" className="fill-rose-600"/>
        <circle cx="13.5" cy="12" r="0.8" className="fill-rose-600"/>
      </svg>
    ),
    '蛇': (
      <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8">
        <path d="M5 15C7 15 8 13 10 13C12 13 13 15 15 15C17 15 18 13 19 13" className="stroke-rose-600" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
        <circle cx="12" cy="9" r="4" className="stroke-rose-600" strokeWidth="1.5" fill="none"/>
        <circle cx="10.5" cy="8.5" r="0.8" className="fill-rose-600"/>
        <circle cx="13.5" cy="8.5" r="0.8" className="fill-rose-600"/>
        <path d="M10 11L9 12M14 11L15 12" className="stroke-rose-600" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
    '马': (
      <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8">
        <path d="M8 6C8 4 9 3 10 3C11 3 12 4 12 6" className="stroke-rose-600" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
        <rect x="7" y="6" width="10" height="10" rx="2" className="stroke-rose-600" strokeWidth="1.5" fill="none"/>
        <circle cx="10" cy="10" r="1" className="fill-rose-600"/>
        <circle cx="14" cy="10" r="1" className="fill-rose-600"/>
        <path d="M10 13H14" className="stroke-rose-600" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M9 16L7 19M15 16L17 19" className="stroke-rose-600" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
    '羊': (
      <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8">
        <circle cx="12" cy="11" r="6" className="stroke-rose-600" strokeWidth="1.5" fill="none"/>
        <path d="M8 7C7 6 6 6 5 7M16 7C17 6 18 6 19 7" className="stroke-rose-600" strokeWidth="1.5" strokeLinecap="round"/>
        <circle cx="10" cy="10" r="1" className="fill-rose-600"/>
        <circle cx="14" cy="10" r="1" className="fill-rose-600"/>
        <path d="M10 13C10.5 14 11 14 12 14C13 14 13.5 14 14 13" className="stroke-rose-600" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M12 5V7" className="stroke-rose-600" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
    '猴': (
      <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8">
        <circle cx="12" cy="11" r="6" className="stroke-rose-600" strokeWidth="1.5" fill="none"/>
        <path d="M6 10C5 9 4 9 3 10M18 10C19 9 20 9 21 10" className="stroke-rose-600" strokeWidth="1.5" strokeLinecap="round"/>
        <circle cx="10" cy="10" r="1" className="fill-rose-600"/>
        <circle cx="14" cy="10" r="1" className="fill-rose-600"/>
        <ellipse cx="12" cy="13" rx="2" ry="1.5" className="stroke-rose-600" strokeWidth="1.5" fill="none"/>
      </svg>
    ),
    '鸡': (
      <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8">
        <circle cx="12" cy="10" r="5" className="stroke-rose-600" strokeWidth="1.5" fill="none"/>
        <path d="M12 5C12 5 11 3 10 3C9 3 9 4 9 4" className="stroke-rose-600" strokeWidth="1.5" strokeLinecap="round"/>
        <circle cx="10.5" cy="9" r="0.8" className="fill-rose-600"/>
        <circle cx="13.5" cy="9" r="0.8" className="fill-rose-600"/>
        <path d="M10 12L8 13" className="stroke-rose-600" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M10 15L8 18M14 15L16 18" className="stroke-rose-600" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
    '狗': (
      <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8">
        <path d="M8 6L7 4M16 6L17 4" className="stroke-rose-600" strokeWidth="1.5" strokeLinecap="round"/>
        <circle cx="12" cy="11" r="6" className="stroke-rose-600" strokeWidth="1.5" fill="none"/>
        <circle cx="10" cy="10" r="1" className="fill-rose-600"/>
        <circle cx="14" cy="10" r="1" className="fill-rose-600"/>
        <path d="M12 12V14M10 14C10.5 15 11 15 12 15C13 15 13.5 15 14 14" className="stroke-rose-600" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
    '猪': (
      <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8">
        <ellipse cx="12" cy="11" rx="6" ry="5.5" className="stroke-rose-600" strokeWidth="1.5" fill="none"/>
        <circle cx="10" cy="10" r="1" className="fill-rose-600"/>
        <circle cx="14" cy="10" r="1" className="fill-rose-600"/>
        <ellipse cx="12" cy="13" rx="2.5" ry="1.5" className="stroke-rose-600" strokeWidth="1.5" fill="none"/>
        <circle cx="10.5" cy="13" r="0.5" className="fill-rose-600"/>
        <circle cx="13.5" cy="13" r="0.5" className="fill-rose-600"/>
      </svg>
    ),
  };

  // 找到对应的生肖
  for (const [key, icon] of Object.entries(zodiacMap)) {
    if (zodiac.includes(key)) return icon;
  }
  
  return <Award className="w-8 h-8 text-rose-600" />;
};

// 星座SVG图标组件（优雅符号）
const ConstellationIcon = ({ zodiac }: { zodiac: string }) => {
  const zodiacMap: Record<string, JSX.Element> = {
    '白羊座': (
      <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8">
        <path d="M7 14C7 10 9 6 12 4C15 6 17 10 17 14" className="stroke-indigo-600" strokeWidth="1.8" strokeLinecap="round" fill="none"/>
        <circle cx="7" cy="14" r="2" className="stroke-indigo-600" strokeWidth="1.8" fill="none"/>
        <circle cx="17" cy="14" r="2" className="stroke-indigo-600" strokeWidth="1.8" fill="none"/>
      </svg>
    ),
    '金牛座': (
      <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8">
        <circle cx="12" cy="13" r="6" className="stroke-indigo-600" strokeWidth="1.8" fill="none"/>
        <path d="M6 10C6 8 5 6 4 5M18 10C18 8 19 6 20 5" className="stroke-indigo-600" strokeWidth="1.8" strokeLinecap="round"/>
      </svg>
    ),
    '双子座': (
      <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8">
        <path d="M6 6V18M18 6V18M6 6H10M6 18H10M18 6H14M18 18H14M10 12H14" className="stroke-indigo-600" strokeWidth="1.8" strokeLinecap="round"/>
      </svg>
    ),
    '巨蟹座': (
      <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8">
        <path d="M4 12C6 12 8 10 8 8C8 10 10 12 12 12C10 12 8 14 8 16C8 14 6 12 4 12Z" className="stroke-indigo-600" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        <path d="M20 12C18 12 16 10 16 8C16 10 14 12 12 12C14 12 16 14 16 16C16 14 18 12 20 12Z" className="stroke-indigo-600" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      </svg>
    ),
    '狮子座': (
      <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8">
        <circle cx="12" cy="12" r="5" className="stroke-indigo-600" strokeWidth="1.8" fill="none"/>
        <path d="M12 7C12 5 14 4 15 5M12 7V4" className="stroke-indigo-600" strokeWidth="1.8" strokeLinecap="round"/>
        <path d="M8 10L6 8M16 10L18 8M8 14L6 16M16 14L18 16" className="stroke-indigo-600" strokeWidth="1.8" strokeLinecap="round"/>
      </svg>
    ),
    '处女座': (
      <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8">
        <path d="M6 4V16C6 18 7 19 9 19M11 4V14M16 4V14C16 16 17 17 18 19" className="stroke-indigo-600" strokeWidth="1.8" strokeLinecap="round"/>
        <path d="M11 14C11 16 12 17 14 17" className="stroke-indigo-600" strokeWidth="1.8" strokeLinecap="round"/>
      </svg>
    ),
    '天秤座': (
      <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8">
        <path d="M4 15H20M7 15L5 19H9L7 15ZM17 15L15 19H19L17 15Z" className="stroke-indigo-600" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M12 8V15M9 8H15" className="stroke-indigo-600" strokeWidth="1.8" strokeLinecap="round"/>
      </svg>
    ),
    '天蝎座': (
      <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8">
        <path d="M6 4V16M11 4V16M16 4V16L18 18L20 16" className="stroke-indigo-600" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M6 16C6 18 7 19 9 19M11 16C11 18 12 19 14 19" className="stroke-indigo-600" strokeWidth="1.8" strokeLinecap="round"/>
      </svg>
    ),
    '射手座': (
      <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8">
        <path d="M5 19L19 5M19 5H13M19 5V11" className="stroke-indigo-600" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M9 15L15 9" className="stroke-indigo-600" strokeWidth="1.8" strokeLinecap="round"/>
      </svg>
    ),
    '摩羯座': (
      <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8">
        <path d="M6 6V16C6 18 8 20 10 20C12 20 14 19 15 17" className="stroke-indigo-600" strokeWidth="1.8" strokeLinecap="round" fill="none"/>
        <path d="M15 17C16 15 18 14 20 14C18 14 17 12 17 10V6" className="stroke-indigo-600" strokeWidth="1.8" strokeLinecap="round" fill="none"/>
      </svg>
    ),
    '水瓶座': (
      <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8">
        <path d="M4 10C6 12 8 10 10 12C12 10 14 12 16 10C18 12 20 10 22 12" className="stroke-indigo-600" strokeWidth="1.8" strokeLinecap="round" fill="none"/>
        <path d="M4 15C6 17 8 15 10 17C12 15 14 17 16 15C18 17 20 15 22 17" className="stroke-indigo-600" strokeWidth="1.8" strokeLinecap="round" fill="none"/>
      </svg>
    ),
    '双鱼座': (
      <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8">
        <path d="M3 12H21M8 8C6 10 5 12 6 14C7 16 9 17 11 16M16 8C18 10 19 12 18 14C17 16 15 17 13 16" className="stroke-indigo-600" strokeWidth="1.8" strokeLinecap="round" fill="none"/>
      </svg>
    ),
  };

  return zodiacMap[zodiac] || <Sparkles className="w-8 h-8 text-indigo-600" />;
};

// 五行图标映射
const elementIcons: Record<string, { icon: JSX.Element; gradient: string; text: string }> = {
  '金': { 
    icon: <Gem className="w-7 h-7 text-amber-600" />,
    gradient: 'from-amber-50 via-yellow-50 to-amber-50', 
    text: 'text-amber-700' 
  },
  '木': { 
    icon: <Sprout className="w-7 h-7 text-green-600" />,
    gradient: 'from-green-50 via-emerald-50 to-green-50', 
    text: 'text-green-700' 
  },
  '水': { 
    icon: <Droplet className="w-7 h-7 text-blue-600" />,
    gradient: 'from-blue-50 via-cyan-50 to-blue-50', 
    text: 'text-blue-700' 
  },
  '火': { 
    icon: <Flame className="w-7 h-7 text-red-600" />,
    gradient: 'from-red-50 via-orange-50 to-red-50', 
    text: 'text-red-700' 
  },
  '土': { 
    icon: <Mountain className="w-7 h-7 text-stone-600" />,
    gradient: 'from-stone-100 via-amber-50 to-stone-100', 
    text: 'text-stone-700' 
  }
};

// 格式化日期
function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return dateString;
    }
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}年${month}月${day}日`;
  } catch {
    return dateString;
  }
}

// 获取五行配置
function getElementConfig(element: string) {
  for (const [key, config] of Object.entries(elementIcons)) {
    if (element.includes(key)) return config;
  }
  return { 
    icon: <Award className="w-7 h-7 text-amber-600" />,
    gradient: 'from-amber-50 via-yellow-50 to-amber-50', 
    text: 'text-amber-700' 
  };
}

export default function ZodiacCard({ metadata, showBirthDate = true }: ZodiacCardProps) {
  const elementCfg = getElementConfig(metadata.element);

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 md:p-8 shadow-lg border border-stone-200/50 mb-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-200 to-blue-200 flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-purple-600" />
        </div>
        <h3 className="text-xl md:text-2xl font-serif text-stone-800">
          命理分析
        </h3>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-6">
        {/* 生肖卡片 */}
        <div className="text-center p-5 rounded-xl bg-gradient-to-br from-rose-50/80 via-pink-50/50 to-rose-50/80 border border-rose-100/50 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex justify-center mb-3">
            <div className="w-14 h-14 rounded-full bg-white/80 flex items-center justify-center shadow-sm">
              <ZodiacIcon zodiac={metadata.zodiac} />
            </div>
          </div>
          <p className="text-stone-500 text-xs md:text-sm mb-1.5 font-medium">生肖</p>
          <p className="text-lg md:text-xl font-semibold text-rose-700">
            {metadata.zodiac}
          </p>
        </div>

        {/* 五行卡片 */}
        <div className={`text-center p-5 rounded-xl bg-gradient-to-br ${elementCfg.gradient} border border-amber-100/50 shadow-sm hover:shadow-md transition-shadow`}>
          <div className="flex justify-center mb-3">
            <div className="w-14 h-14 rounded-full bg-white/80 flex items-center justify-center shadow-sm">
              {elementCfg.icon}
            </div>
          </div>
          <p className="text-stone-500 text-xs md:text-sm mb-1.5 font-medium">五行</p>
          <p className={`text-lg md:text-xl font-semibold ${elementCfg.text}`}>
            {metadata.element}
          </p>
        </div>

        {/* 星座卡片 */}
        <div className="text-center p-5 rounded-xl bg-gradient-to-br from-blue-50/80 via-indigo-50/50 to-blue-50/80 border border-blue-100/50 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex justify-center mb-3">
            <div className="w-14 h-14 rounded-full bg-white/80 flex items-center justify-center shadow-sm">
              <ConstellationIcon zodiac={metadata.westernZodiac} />
            </div>
          </div>
          <p className="text-stone-500 text-xs md:text-sm mb-1.5 font-medium">星座</p>
          <p className="text-lg md:text-xl font-semibold text-indigo-700">
            {metadata.westernZodiac}
          </p>
        </div>

        {/* 出生日期卡片 */}
        {showBirthDate && (
        <div className="text-center p-5 rounded-xl bg-gradient-to-br from-purple-50/80 via-pink-50/50 to-purple-50/80 border border-purple-100/50 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex justify-center mb-3">
            <div className="w-14 h-14 rounded-full bg-white/80 flex items-center justify-center shadow-sm">
              <Calendar className="w-7 h-7 text-purple-600" />
            </div>
          </div>
          <p className="text-stone-500 text-xs md:text-sm mb-1.5 font-medium">出生日期</p>
          <p className="text-sm md:text-base font-semibold text-purple-700 leading-tight">
            {formatDate(metadata.birthDate)}
          </p>
        </div>
        )}
      </div>

      {/* Career and Hobbies Section */}
      {(metadata.career || metadata.hobbies) && (
        <div className="mb-6 space-y-3">
          {metadata.career && (
            <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-100 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-100 to-blue-200 flex items-center justify-center flex-shrink-0 shadow-sm">
                  <Briefcase className="w-5 h-5 text-indigo-700" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-indigo-900 mb-1.5">职业倾向</p>
                  <p className="text-stone-700 text-sm leading-relaxed">
                    {metadata.career}
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {metadata.hobbies && (
            <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-100 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-emerald-100 to-green-200 flex items-center justify-center flex-shrink-0 shadow-sm">
                  <Target className="w-5 h-5 text-emerald-700" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-emerald-900 mb-1.5">兴趣爱好</p>
                  <p className="text-stone-700 text-sm leading-relaxed">
                    {metadata.hobbies}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {metadata.zodiacAnalysis && (
        <div className="p-5 rounded-xl bg-gradient-to-br from-stone-50 to-stone-100 border border-stone-200">
          <p className="text-stone-700 leading-relaxed text-sm md:text-base">
            {metadata.zodiacAnalysis}
          </p>
        </div>
      )}
    </div>
  );
}