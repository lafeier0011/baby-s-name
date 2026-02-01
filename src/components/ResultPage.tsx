import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router";
import { Button } from "./ui/button";
import { ArrowLeft, RefreshCw, Sparkles, AlertCircle, Calendar, Atom, BookOpen, Music, Wand2, Palette, Heart, Baby, Share2, X } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import NameCard from "./NameCard";
import ZodiacCard from "./ZodiacCard";
import ErrorState from "./ErrorState";
import SharePreview from "./SharePreview";
import Footer from "./Footer";
import { projectId, publicAnonKey } from "../utils/supabase/info";
import { rateLimiter } from "../utils/rateLimiter";
import html2canvas from "html2canvas";

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
  { text: "分析生辰八字", icon: Calendar, time: 4000, color: "text-purple-600" },
  { text: "计算五行平衡", icon: Atom, time: 3000, color: "text-cyan-600" },
  { text: "检索诗词经典", icon: BookOpen, time: 2000, color: "text-amber-600" },
  { text: "生成吉祥名字", icon: Wand2, time: 8000, color: "text-rose-600" },
  { text: "完善寓意解释", icon: Palette, time: 3000, color: "text-indigo-600" }
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
  const [sharePreview, setSharePreview] = useState<{ gender: "boy" | "girl"; names: Name[] } | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);

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
  const { fatherName, motherName, birthDate, birthTime, preferences, surnameChoice, nameCount = 5, nameLength, babyGender } = formData || {};

  // Convert babyGender array to gender parameter for API
  const getGenderParam = (): "boy" | "girl" | "both" => {
    if (!babyGender || babyGender.length === 0) return "both";
    const hasBoy = babyGender.includes("boy");
    const hasGirl = babyGender.includes("girl");
    if (hasBoy && hasGirl) return "both";
    if (hasBoy) return "boy";
    if (hasGirl) return "girl";
    return "both";
  };

  const genderParam = getGenderParam();

  useEffect(() => {
    if (!fatherName || !motherName) {
      navigate("/");
      return;
    }
    
    // Check if we have saved results in localStorage
    const savedResults = localStorage.getItem('nameGeneratorResults');
    if (savedResults) {
      try {
        const results = JSON.parse(savedResults);
        setNamesData(results);
        setLoading(false);
        return;
      } catch (e) {
        console.error('Failed to parse saved results:', e);
      }
    }
    
    // Only generate if we don't have saved results
    generateNames(false, genderParam);
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

  const generateNames = async (
    isRegenerateOrEvent: boolean | unknown = false,
    gender: "both" | "boy" | "girl" = "both",
  ) => {
    const isRegenerate = typeof isRegenerateOrEvent === "boolean" ? isRegenerateOrEvent : false;
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
            nameLength,
            babyGender,
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
        ...(data.names.boyNames || []).map((n: Name) => n.chineseName),
        ...(data.names.girlNames || []).map((n: Name) => n.chineseName),
      ];
      setPreviousNames(prev => [...prev, ...newNames]);

      setNamesData(prevData => {
        let newData;
        if (gender === "boy") {
          // Only update boy names
          newData = {
            boys: data.names.boyNames,
            girls: prevData?.girls || [],
            metadata: prevData?.metadata || data.metadata,
          };
        } else if (gender === "girl") {
          // Only update girl names
          newData = {
            boys: prevData?.boys || [],
            girls: data.names.girlNames,
            metadata: prevData?.metadata || data.metadata,
          };
        } else {
          // Update both
          newData = {
            boys: data.names.boyNames,
            girls: data.names.girlNames,
            metadata: isRegenerate && prevData ? prevData.metadata : data.metadata,
          };
        }
        
        // Save to localStorage for page refresh persistence
        localStorage.setItem('nameGeneratorResults', JSON.stringify(newData));
        
        return newData;
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
    generateNames(true, genderParam);
  };

  const handleRegenerateBoys = () => {
    generateNames(true, "boy");
  };

  const handleRegenerateGirls = () => {
    generateNames(true, "girl");
  };

  // Share names - show preview
  const handleShare = (gender: "boy" | "girl") => {
    const names = gender === "boy" ? namesData?.boys : namesData?.girls;
    if (!names) return;
    
    setSharePreview({ gender, names });
  };

  // Export names as image
  const handleExport = async (gender: "boy" | "girl") => {
    const names = gender === "boy" ? namesData?.boys : namesData?.girls;
    if (!names || !namesData) return;

    // Use NameCard style colors
    const accentColor = gender === "boy" ? "#2563eb" : "#e11d48"; // blue-600 : rose-600
    const cardBgGradient = gender === "boy" 
      ? "linear-gradient(to bottom right, #eff6ff, #ecfeff)" // blue-50 to cyan-50
      : "linear-gradient(to bottom right, #fff1f2, #fdf2f8)"; // rose-50 to pink-50
    const decorationColor = gender === "boy" ? "#93c5fd" : "#fda4af"; // blue-300 : rose-300

    // Create a wrapper to ensure the element is rendered in the viewport (but behind everything)
    // This fixes mobile browser issues where off-screen elements are not rendered
    const wrapper = document.createElement("div");
    wrapper.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: -9999;
      overflow: hidden;
      pointer-events: none;
      opacity: 0; /* Hide from user */
    `;
    document.body.appendChild(wrapper);

    // Create a pure DOM element without React
    const container = document.createElement("div");
    container.style.cssText = `
      width: 800px;
      background: #fafaf9;
      padding: 32px;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      position: absolute; /* Relative to wrapper */
      left: 0;
      top: 0;
    `;
    
    // Add container to wrapper
    wrapper.appendChild(container);

    // Build HTML content directly - remove all gradients that might cause issues
    const sparklesSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="${decorationColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.937A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .962 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.582a.5.5 0 0 1 0 .962L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.962 0z"/></svg>`;
    
    const heartSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="${gender === 'boy' ? '#dbeafe' : '#ffe4e6'}" stroke="${decorationColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>`;

    const namesHtml = names.map(name => `
      <div style="background: ${cardBgGradient}; border-radius: 12px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05); border: 1px solid ${gender === 'boy' ? '#dbeafe' : '#ffe4e6'}; padding: 20px; margin-bottom: 16px;">
        <div style="margin-bottom: 12px;">
          <div style="margin-bottom: 4px;">
            <span style="font-size: 28px; font-family: Georgia, serif; color: ${accentColor}; font-weight: 600;">
              ${name.chineseName}
            </span>
            <span style="color: #78716c; font-size: 14px; margin-left: 12px;">${name.pinyin}</span>
          </div>
          <p style="color: #57534e; font-weight: 500; font-size: 14px; margin: 4px 0 0 0; padding: 0;">
            ${name.englishName}
          </p>
        </div>
        <div style="background: rgba(255, 255, 255, 0.6); border-radius: 8px; padding: 12px; border: 1px solid rgba(255, 255, 255, 0.5);">
          <p style="color: #57534e; font-size: 14px; line-height: 1.6; margin: 0; padding: 0;">
            ${name.explanation}
          </p>
        </div>
        
        <!-- Decorative lines matching NameCard -->
        <div style="margin-top: 12px; display: flex; gap: 8px; align-items: center;">
          <div style="height: 4px; width: 40px; border-radius: 9999px; background-color: ${gender === 'boy' ? '#93c5fd' : '#fda4af'};"></div>
          <div style="height: 4px; width: 20px; border-radius: 9999px; background-color: ${gender === 'boy' ? '#bfdbfe' : '#fecdd3'};"></div>
          <div style="height: 4px; width: 8px; border-radius: 9999px; background-color: ${gender === 'boy' ? '#dbeafe' : '#ffe4e6'};"></div>
        </div>
      </div>
    `).join('');

    container.innerHTML = `
      <!-- Header -->
      <div style="text-align: center; margin-bottom: 32px;">
        <div style="margin-bottom: 12px;">
          <table style="margin: 0 auto; border-spacing: 8px;">
            <tr>
              <td>${sparklesSvg}</td>
              <td>
                <h1 style="font-size: 36px; font-family: Georgia, serif; color: ${accentColor}; margin: 0; padding: 0; font-weight: 600;">
                  吉名宝典
                </h1>
              </td>
              <td>${sparklesSvg}</td>
            </tr>
          </table>
        </div>
        <p style="color: #78716c; font-size: 14px; margin: 0; padding: 0;">传承千年文化 · 结合五行八字</p>
      </div>

      <!-- Metadata -->
      <div style="background: ${cardBgGradient}; border: 1px solid ${gender === 'boy' ? '#dbeafe' : '#ffe4e6'}; border-radius: 12px; padding: 16px; margin-bottom: 24px; text-align: center; min-height: 60px; overflow: hidden;">
        <div style="color: #57534e; font-size: 14px; font-weight: 500;">
          <span style="margin: 0 12px;">生肖：<span style="color: ${accentColor}; font-weight: 600;">${namesData.metadata.zodiac}</span></span>
          <span style="margin: 0 12px;">五行：<span style="color: ${accentColor}; font-weight: 600;">${namesData.metadata.element}</span></span>
          <span style="margin: 0 12px;">星座：<span style="color: ${accentColor}; font-weight: 600;">${namesData.metadata.westernZodiac}</span></span>
        </div>
      </div>

      <!-- Names -->
      <div>
        ${namesHtml}
      </div>

      <!-- Footer -->
      <div style="margin-top: 32px; text-align: center;">
        <div style="margin-bottom: 8px;">
          <table style="margin: 0 auto; border-spacing: 8px;">
            <tr>
              <td><div style="width: 80px; height: 1px; background: #e7e5e4;"></div></td>
              <td>${heartSvg}</td>
              <td><div style="width: 80px; height: 1px; background: #e7e5e4;"></div></td>
            </tr>
          </table>
        </div>
        <p style="font-size: 12px; color: #a8a29e; margin: 0; padding: 0;">
          Made with ♥ by 拉斐尔 & 小圆 · To 我们未出生的宝宝
        </p>
      </div>
    `;

    // document.body.appendChild(container); // Already appended to wrapper

    try {
      // Wait for layout
      await new Promise(resolve => setTimeout(resolve, 500));

      // Convert to canvas
      const canvas = await html2canvas(container, {
        backgroundColor: "#fafaf9",
        scale: 2,
        logging: false,
        useCORS: true,
        allowTaint: false,
        scrollX: 0,
        scrollY: 0,
      });

      // Detect mobile device
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      const dataUrl = canvas.toDataURL("image/png");

      if (isMobile) {
        // Show preview modal on mobile
        setGeneratedImage(dataUrl);
      } else {
        // Direct download on desktop
        const link = document.createElement("a");
        const timestamp = new Date().toLocaleDateString("zh-CN").replace(/\//g, "-");
        link.download = `吉名宝典-${gender === "boy" ? "男宝" : "女宝"}名字-${timestamp}.png`;
        link.href = dataUrl;
        link.click();
      }
    } catch (error) {
      console.error("Export failed:", error);
      alert(`导出失败：${error instanceof Error ? error.message : "未知错误"}`);
    } finally {
      // Clean up
      document.body.removeChild(wrapper);
    }
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
        onRetry={() => generateNames(false, genderParam)}
        onBack={() => navigate("/")}
      />
    );
  }

  if (!namesData) {
    return null;
  }

  return (
    <>
      {/* Share Preview Modal */}
      {sharePreview && namesData && (
        <SharePreview
          names={sharePreview.names}
          gender={sharePreview.gender}
          metadata={namesData.metadata}
          onClose={() => setSharePreview(null)}
        />
      )}
      
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
          <ZodiacCard metadata={namesData.metadata} showBirthDate={!!birthDate} />

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
              className="!text-white flex-shrink-0 !bg-gradient-to-r !from-slate-700 !to-indigo-800 hover:!brightness-110 shadow-md shadow-indigo-100 transition-all hover:scale-105 active:scale-95 border-none"
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
            
            <Tabs defaultValue={genderParam === "girl" ? "girl" : "boy"} className="w-full">
              {/* Only show tabs if user selected both genders */}
              {genderParam === "both" && (
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
              )}

              {/* Boy Names Section */}
              {(genderParam === "both" || genderParam === "boy") && namesData.boys.length > 0 && (
                <TabsContent value="boy" className="space-y-3 md:space-y-4">
                  {/* Boy names action buttons - only show if both genders selected */}
                  {genderParam === "both" && (
                    <div className="flex justify-end gap-2 mb-4">
                      <Button
                        onClick={() => handleShare("boy")}
                        size="sm"
                        variant="outline"
                        className="border-blue-300 text-blue-600 hover:bg-blue-50"
                      >
                        <Share2 className="mr-2 h-3.5 w-3.5" />
                        分享
                      </Button>
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
                  )}
                  
                  {/* Share button when only boy selected */}
                  {genderParam === "boy" && (
                    <div className="flex justify-end mb-4">
                      <Button
                        onClick={() => handleShare("boy")}
                        size="sm"
                        variant="outline"
                        className="border-blue-300 text-blue-600 hover:bg-blue-50"
                      >
                        <Share2 className="mr-2 h-3.5 w-3.5" />
                        分享
                      </Button>
                    </div>
                  )}
                  
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
              )}

              {/* Girl Names Section */}
              {(genderParam === "both" || genderParam === "girl") && namesData.girls.length > 0 && (
                <TabsContent value="girl" className="space-y-3 md:space-y-4">
                  {/* Girl names action buttons - only show if both genders selected */}
                  {genderParam === "both" && (
                    <div className="flex justify-end gap-2 mb-4">
                      <Button
                        onClick={() => handleShare("girl")}
                        size="sm"
                        variant="outline"
                        className="border-rose-300 text-rose-600 hover:bg-rose-50"
                      >
                        <Share2 className="mr-2 h-3.5 w-3.5" />
                        分享
                      </Button>
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
                  )}
                  
                  {/* Share button when only girl selected */}
                  {genderParam === "girl" && (
                    <div className="flex justify-end mb-4">
                      <Button
                        onClick={() => handleShare("girl")}
                        size="sm"
                        variant="outline"
                        className="border-rose-300 text-rose-600 hover:bg-rose-50"
                      >
                        <Share2 className="mr-2 h-3.5 w-3.5" />
                        分享
                      </Button>
                    </div>
                  )}
                  
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
              )}
            </Tabs>
          </div>

          {/* Footer */}
          <div 
            className="text-center text-xs md:text-sm text-stone-400 px-4"
            style={{ marginTop: '24px', marginBottom: '24px' }}
          >
            <p>名字仅供参考，建议结合家族传统与个人喜好综合考虑</p>
          </div>

          <Footer />
        </div>
      </div>

      {/* Generated Image Preview Modal */}
      {generatedImage && (
        <div 
          className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setGeneratedImage(null)}
        >
          <button 
            onClick={(e) => {
              e.stopPropagation();
              setGeneratedImage(null);
            }}
            className="absolute top-4 right-4 text-white/70 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors"
          >
            <X className="w-8 h-8" />
          </button>
          
          <div className="relative max-w-full max-h-[80vh] overflow-auto flex flex-col items-center">
            <img 
              src={generatedImage} 
              alt="Generated Name Card" 
              className="max-w-full rounded-lg shadow-2xl mb-6"
              onClick={(e) => e.stopPropagation()} 
            />
            <div className="bg-white/10 backdrop-blur-md text-white px-6 py-3 rounded-full font-medium text-sm shadow-lg animate-bounce">
              长按图片保存到相册
            </div>
          </div>
        </div>
      )}
    </>
  );
}
