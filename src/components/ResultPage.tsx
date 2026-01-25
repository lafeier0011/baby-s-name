import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router";
import { Button } from "./ui/button";
import { ArrowLeft, RefreshCw, Sparkles, AlertCircle, Calendar, Atom, BookOpen, Music, Wand2, Palette, Heart, Baby } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import NameCard from "./NameCard";
import ZodiacCard from "./ZodiacCard";
import ErrorState from "./ErrorState";
import { projectId, publicAnonKey } from "../utils/supabase/info";
import { rateLimiter } from "../utils/rateLimiter";

interface Name {
  chineseName: string;
  pinyin: string;
  englishName: string;
  explanation: string;
  career?: string;
  hobbies?: string;
}

interface NamesData {
  boys: Name[];
  girls: Name[];
  metadata: {
    zodiac: string;
    element: string;
    westernZodiac: string;
    birthDate: string;
    zodiacAnalysis?: string;
    career?: string;
    hobbies?: string;
  };
}

// AI思考步骤（带图标）
const thinkingSteps = [
  { text: "分析生辰八字", icon: Calendar, time: 6000, color: "text-purple-600" },
  { text: "计算五行平衡", icon: Atom, time: 6000, color: "text-cyan-600" },
  { text: "检索诗词经典", icon: BookOpen, time: 6000, color: "text-amber-600" },
  { text: "匹配音韵节奏", icon: Music, time: 6000, color: "text-pink-600" },
  { text: "生成吉祥名字", icon: Wand2, time: 6000, color: "text-rose-600" },
  { text: "完善寓意解释", icon: Palette, time: 6000, color: "text-indigo-600" }
];

// 高雅文化加载文案
const loadingTexts = [
  // 四书五经风（儒雅庄重）
  "正在推敲名理，以合天地之数",
  "循天理人伦，斟酌嘉名雅字",
  "依经据典，择选清贵佳名",
  "正考文脉源流，拣选祥瑞字韵",
  // 诗词歌赋风（诗意唯美）
  "撷取诗韵词魂，凝铸姓名风华",
  "采撷千年文墨，酝酿一世佳名",
  "字斟句酌，炼就琼瑶之名",
  "取天地清音，铸人间雅称",
  // 易经玄学风（深邃神秘）
  "推演阴阳五行，契合乾坤命理",
  "演算八字命盘，调和姓名气韵",
  "观星象，察地脉，择良名以应天命",
  "通晓玄机妙理，择选福运嘉名",
  // 古典文雅风（简洁高级）
  "字里寻珠，名中探玉",
  "斟酌雅字，推敲佳音",
  "溯文脉源流，铸姓名风骨",
  "凝天地灵气，聚姓名字魂",
  // 现代隽永风（简约有意境）
  "字有灵，名有韵，正在为您凝练",
  "从千年文化中，为您拣选独特回音",
  "正在编织属于TA的名字诗篇",
  "萃取文化精髓，凝铸姓名华章"
];

export default function ResultPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [namesData, setNamesData] = useState<NamesData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [regenerating, setRegenerating] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [loadingText, setLoadingText] = useState("");
  const [previousNames, setPreviousNames] = useState<string[]>([]);
  const [regeneratingBoys, setRegeneratingBoys] = useState(false);
  const [regeneratingGirls, setRegeneratingGirls] = useState(false);

  // Get data from location.state or localStorage
  const getFormData = () => {
    if (location.state && location.state.fatherName) {
      // Save to localStorage for persistence
      localStorage.setItem('nameGeneratorFormData', JSON.stringify(location.state));
      return location.state;
    }
    // Try to get from localStorage if state is lost (e.g., page refresh)
    const saved = localStorage.getItem('nameGeneratorFormData');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved form data:', e);
        return null;
      }
    }
    return null;
  };

  const formData = getFormData();
  const { fatherName, motherName, birthDate, birthTime, preferences, surnameChoice, nameCount = 5 } = formData || {};

  useEffect(() => {
    if (!fatherName || !motherName || !birthDate) {
      navigate("/");
      return;
    }
    generateNames();
  }, []);

  // 思考步骤动画
  useEffect(() => {
    if (!loading) {
      setCurrentStep(0);
      setCompletedSteps([]);
      return;
    }

    // Reset states when loading starts
    setCurrentStep(0);
    setCompletedSteps([]);

    const timeouts: number[] = [];
    let currentStepIndex = 0;

    const runNextStep = () => {
      if (currentStepIndex < thinkingSteps.length) {
        const stepToRun = currentStepIndex;
        setCurrentStep(stepToRun);
        
        const timeoutId = window.setTimeout(() => {
          setCompletedSteps(prev => [...prev, stepToRun]);
          currentStepIndex++;
          runNextStep();
        }, thinkingSteps[stepToRun].time);
        
        timeouts.push(timeoutId);
      }
    };

    runNextStep();

    return () => {
      timeouts.forEach(id => clearTimeout(id));
    };
  }, [loading]);

  const generateNames = async (isRegenerate = false, gender: "both" | "boy" | "girl" = "both") => {
    // 随机选择一条高雅文案
    const randomLoadingText = loadingTexts[Math.floor(Math.random() * loadingTexts.length)];
    setLoadingText(randomLoadingText);

    // 检查速率限制
    const { allowed, remaining, resetIn } = rateLimiter.canMakeRequest();
    
    if (!allowed) {
      setError(`请求过于频繁，请在 ${resetIn} 秒后重试。每分钟最多可生成5次名字。`);
      setLoading(false);
      setRegenerating(false);
      setRegeneratingBoys(false);
      setRegeneratingGirls(false);
      return;
    }

    // 记录本次请求
    rateLimiter.recordRequest();

    if (isRegenerate) {
      if (gender === "boy") {
        setRegeneratingBoys(true);
      } else if (gender === "girl") {
        setRegeneratingGirls(true);
      } else {
        setRegenerating(true);
      }
    } else {
      setLoading(true);
    }
    setError(null);

    // Filter previous names based on gender
    let filteredPreviousNames = previousNames;
    if (isRegenerate && gender !== "both") {
      // Only include names of the gender being regenerated
      const currentNames = gender === "boy" ? namesData?.boys : namesData?.girls;
      filteredPreviousNames = currentNames ? currentNames.map(n => n.chineseName) : [];
    }

    // Debug log to check the data
    console.log("Generating names with data:", {
      fatherName,
      motherName,
      birthDate,
      birthTime,
      preferences,
      surnameChoice,
      previousNames: isRegenerate ? filteredPreviousNames : undefined,
      nameCount,
      gender,
    });

    try {
      // Generate names based on gender parameter
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-093e7da9/generate-names`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({
            fatherName,
            motherName,
            birthDate,
            birthTime,
            preferences,
            surnameChoice,
            previousNames: isRegenerate ? filteredPreviousNames : undefined,
            nameCount,
            gender,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "生成名字失败");
      }

      const data = await response.json();

      // Collect all new names for future reference
      const newNames = [
        ...data.names.boyNames.map((n: Name) => n.chineseName),
        ...data.names.girlNames.map((n: Name) => n.chineseName),
      ];
      setPreviousNames(prev => [...prev, ...newNames]);

      setNamesData(prevData => {
        if (gender === "boy") {
          // Only update boy names
          return {
            boys: data.names.boyNames,
            girls: prevData?.girls || [],
            metadata: prevData?.metadata || data.metadata,
          };
        } else if (gender === "girl") {
          // Only update girl names
          return {
            boys: prevData?.boys || [],
            girls: data.names.girlNames,
            metadata: prevData?.metadata || data.metadata,
          };
        } else {
          // Update both
          return {
            boys: data.names.boyNames,
            girls: data.names.girlNames,
            metadata: isRegenerate && prevData ? prevData.metadata : data.metadata,
          };
        }
      });
    } catch (err) {
      console.error("Error generating names:", err);
      setError(err instanceof Error ? err.message : "生成名字时发生未知错误");
    } finally {
      setLoading(false);
      setRegenerating(false);
      setRegeneratingBoys(false);
      setRegeneratingGirls(false);
    }
  };

  const handleRegenerate = () => {
    generateNames(true, "both");
  };

  const handleRegenerateBoys = () => {
    generateNames(true, "boy");
  };

  const handleRegenerateGirls = () => {
    generateNames(true, "girl");
  };

  if (loading && !regenerating) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-stone-50 via-rose-50/30 to-blue-50/30 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 md:p-10">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-rose-200 via-pink-200 to-blue-200 flex items-center justify-center animate-pulse shadow-lg">
                <Baby className="w-9 h-9 text-rose-600" />
              </div>
            </div>
            <h2 className="text-2xl font-serif text-stone-800 mb-2">{loadingText}</h2>
            <p className="text-stone-500 text-sm">结合传统文化与五行八字</p>
          </div>

          <div className="space-y-3">
            {thinkingSteps.map((step, index) => {
              const StepIcon = step.icon;
              return (
                <div
                  key={index}
                  className={`flex items-center gap-3 p-3.5 rounded-xl transition-all duration-300 ${
                    completedSteps.includes(index)
                      ? 'bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 shadow-sm'
                      : currentStep === index
                      ? 'bg-gradient-to-r from-rose-50 to-pink-50 border border-rose-200 scale-105 shadow-md'
                      : 'bg-stone-50 border border-stone-200 opacity-50'
                  }`}
                >
                  <div className="flex-shrink-0">
                    {completedSteps.includes(index) ? (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-sm">
                        <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    ) : currentStep === index ? (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center shadow-sm animate-pulse">
                        <StepIcon className="w-4 h-4 text-white" />
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-stone-200 flex items-center justify-center">
                        <StepIcon className="w-4 h-4 text-stone-400" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <span className={`text-sm font-medium ${
                      completedSteps.includes(index) ? 'text-green-700' :
                      currentStep === index ? 'text-rose-700' : 'text-stone-500'
                    }`}>
                      {step.text}
                    </span>
                  </div>
                  {currentStep === index && (
                    <div className="flex-shrink-0">
                      <div className="flex gap-1">
                        <div className="w-1.5 h-1.5 bg-rose-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-1.5 h-1.5 bg-rose-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-1.5 h-1.5 bg-rose-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-6 text-center text-xs text-stone-400">
            请稍候，通常需要15-30秒
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <ErrorState
        error={error}
        onRetry={generateNames}
        onBack={() => navigate("/")}
      />
    );
  }

  if (!namesData) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-rose-50/30 to-blue-50/30">
      <div className="max-w-6xl mx-auto px-4 py-6 md:py-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 md:mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="text-stone-600 hover:text-stone-900"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            返回
          </Button>
        </div>

        {/* Zodiac Analysis Card */}
        <ZodiacCard metadata={namesData.metadata} />

        {/* Names Section Header with Regenerate Button */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6 mt-8">
          <div className="text-center sm:text-left">
            <h2 className="text-2xl md:text-3xl font-serif text-stone-800 mb-1 md:mb-2">
              精选名字推荐
            </h2>
            <p className="text-stone-500 text-sm">基于五行八字与诗词典故</p>
          </div>
          <Button
            onClick={handleRegenerate}
            disabled={regenerating}
            className="bg-gradient-to-r from-rose-400 to-pink-400 hover:from-rose-500 hover:to-pink-500 text-white flex-shrink-0"
          >
            {regenerating ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                生成中...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                换一批
              </>
            )}
          </Button>
        </div>

        {/* Names Tabs with Loading Overlay */}
        <div className="relative">
          {/* Regenerating Loading Overlay */}
          {regenerating && (
            <div className="absolute inset-0 z-50 bg-white/60 backdrop-blur-md rounded-2xl flex items-center justify-center">
              <div className="text-center">
                <div className="inline-flex items-center justify-center mb-4">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-rose-200 to-pink-200 flex items-center justify-center animate-pulse">
                    <Sparkles className="w-7 h-7 text-rose-600" />
                  </div>
                </div>
                <h3 className="text-lg md:text-xl font-serif text-stone-800 mb-1">{loadingText}</h3>
                <p className="text-stone-500 text-sm">正在生成新的名字...</p>
                <div className="flex items-center justify-center gap-1 mt-3">
                  <div className="w-2 h-2 bg-rose-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-rose-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-rose-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            </div>
          )}
          
          <Tabs defaultValue="boy" className="w-full">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-6 md:mb-8 h-11 md:h-12 bg-white/80 backdrop-blur-sm">
              <TabsTrigger
                value="boy"
                className="text-sm md:text-base data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-400 data-[state=active]:to-cyan-400 data-[state=active]:text-white"
              >
                男宝名字
              </TabsTrigger>
              <TabsTrigger
                value="girl"
                className="text-sm md:text-base data-[state=active]:bg-gradient-to-r data-[state=active]:from-rose-400 data-[state=active]:to-pink-400 data-[state=active]:text-white"
              >
                女宝名字
              </TabsTrigger>
            </TabsList>

            <TabsContent value="boy" className="space-y-3 md:space-y-4">
              {/* Boy names regenerate button */}
              <div className="flex justify-end mb-4">
                <Button
                  onClick={handleRegenerateBoys}
                  disabled={regeneratingBoys || regenerating}
                  size="sm"
                  className="bg-gradient-to-r from-blue-400 to-cyan-400 hover:from-blue-500 hover:to-cyan-500 text-white"
                >
                  {regeneratingBoys ? (
                    <>
                      <RefreshCw className="mr-2 h-3.5 w-3.5 animate-spin" />
                      生成中...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-3.5 w-3.5" />
                      只换男宝名字
                    </>
                  )}
                </Button>
              </div>
              
              {/* Loading overlay for boys only */}
              {regeneratingBoys && (
                <div className="fixed inset-0 z-50 bg-white/60 backdrop-blur-md flex items-center justify-center">
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center mb-4">
                      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-200 to-cyan-200 flex items-center justify-center animate-pulse">
                        <Sparkles className="w-7 h-7 text-blue-600" />
                      </div>
                    </div>
                    <h3 className="text-lg md:text-xl font-serif text-stone-800 mb-1">{loadingText}</h3>
                    <p className="text-stone-500 text-sm">正在生成新的男宝名字...</p>
                    <div className="flex items-center justify-center gap-1 mt-3">
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                  </div>
                </div>
              )}
              
              {namesData.boys.map((name, index) => (
                <NameCard key={`${name.chineseName}-${index}`} name={name} gender="boy" index={index} />
              ))}
            </TabsContent>

            <TabsContent value="girl" className="space-y-3 md:space-y-4">
              {/* Girl names regenerate button */}
              <div className="flex justify-end mb-4">
                <Button
                  onClick={handleRegenerateGirls}
                  disabled={regeneratingGirls || regenerating}
                  size="sm"
                  className="bg-gradient-to-r from-rose-400 to-pink-400 hover:from-rose-500 hover:to-pink-500 text-white"
                >
                  {regeneratingGirls ? (
                    <>
                      <RefreshCw className="mr-2 h-3.5 w-3.5 animate-spin" />
                      生成中...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-3.5 w-3.5" />
                      只换女宝名字
                    </>
                  )}
                </Button>
              </div>
              
              {/* Loading overlay for girls only */}
              {regeneratingGirls && (
                <div className="fixed inset-0 z-50 bg-white/60 backdrop-blur-md flex items-center justify-center">
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center mb-4">
                      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-rose-200 to-pink-200 flex items-center justify-center animate-pulse">
                        <Sparkles className="w-7 h-7 text-rose-600" />
                      </div>
                    </div>
                    <h3 className="text-lg md:text-xl font-serif text-stone-800 mb-1">{loadingText}</h3>
                    <p className="text-stone-500 text-sm">正在生成新的女宝名字...</p>
                    <div className="flex items-center justify-center gap-1 mt-3">
                      <div className="w-2 h-2 bg-rose-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 bg-rose-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 bg-rose-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                  </div>
                </div>
              )}
              
              {namesData.girls.map((name, index) => (
                <NameCard key={`${name.chineseName}-${index}`} name={name} gender="girl" index={index} />
              ))}
            </TabsContent>
          </Tabs>
        </div>

        {/* Footer */}
        <div className="text-center mt-10 md:mt-12 text-xs md:text-sm text-stone-400 px-4">
          <p>名字仅供参考，建议结合家族传统与个人喜好综合考虑</p>
        </div>

        {/* Author Section */}
        <div className="mt-8 md:mt-12 pb-6">
          <div className="flex items-center justify-center gap-2 mb-3">
            <div className="flex-1 max-w-[100px] h-px bg-gradient-to-r from-transparent via-rose-200 to-rose-300" />
            <Heart className="w-4 h-4 text-rose-400 fill-rose-200 animate-pulse" />
            <div className="flex-1 max-w-[100px] h-px bg-gradient-to-l from-transparent via-rose-200 to-rose-300" />
          </div>
          <div className="text-center space-y-1">
            <p className="text-sm md:text-base font-serif text-stone-600">
              Made with <span className="text-rose-500">♥</span> by <span className="font-medium bg-gradient-to-r from-rose-500 to-pink-500 bg-clip-text text-transparent">拉斐尔 & 小圆</span>
            </p>
            <p className="text-xs md:text-sm text-stone-400 italic">
              To 我们未出生的宝宝
            </p>
          </div>
          <div className="flex items-center justify-center gap-1.5 mt-3">
            <Sparkles className="w-3 h-3 text-amber-400 animate-pulse" style={{ animationDelay: '0ms' }} />
            <Sparkles className="w-2.5 h-2.5 text-rose-400 animate-pulse" style={{ animationDelay: '300ms' }} />
            <Sparkles className="w-3 h-3 text-blue-400 animate-pulse" style={{ animationDelay: '600ms' }} />
          </div>
        </div>
      </div>
    </div>
  );
}