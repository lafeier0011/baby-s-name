import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Checkbox } from "./ui/checkbox";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Calendar } from "./ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Textarea } from "./ui/textarea";
import { Calendar as CalendarIcon, Sparkles, Star, Moon, Sun, BookOpen, Flower2, Palette, Atom, Users, MessageSquare, Heart, Baby, Hash } from "lucide-react";
import { zhCN } from "date-fns/locale/zh-CN";
import { rateLimiter } from "../utils/rateLimiter";
import Footer from "./Footer";

// Helper function to format Chinese date
function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return `${year}年${month}月${day}日`;
}

// Helper function to format date for backend (YYYY-MM-DD)
function formatDateForBackend(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export default function InputPage() {
  const navigate = useNavigate();
  const [fatherName, setFatherName] = useState("");
  const [motherName, setMotherName] = useState("");
  const [surnameChoice, setSurnameChoice] = useState<"father" | "mother">("father");
  const [birthDate, setBirthDate] = useState<Date>();
  const [birthHour, setBirthHour] = useState("");
  const [birthMinute, setBirthMinute] = useState("");
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [remainingRequests, setRemainingRequests] = useState(5);
  
  // Preferences state
  const [culturalPref, setCulturalPref] = useState<string>("");
  const [meaningPref, setMeaningPref] = useState<string>("");
  const [stylePref, setStylePref] = useState<string>("");
  const [elementPref, setElementPref] = useState<string>("");
  const [customExpectation, setCustomExpectation] = useState("");
  const [nameCount, setNameCount] = useState<5 | 10>(5);
  const [nameLength, setNameLength] = useState<"single" | "double" | "both">("double"); // 单字/双字，默认双字
  const [babyGender, setBabyGender] = useState<string[]>(["girl"]); // 性别选择（多选），默认女宝

  // Cultural preference options
  const culturalOptions = [
    '四书五经',
    '唐诗宋词',
    '诗经风雅',
    '楚辞离骚',
    '易经玄学',
    '诸子百家',
    '汉赋乐府',
    '古文观止'
  ];

  // Meaning preference options
  const meaningOptions = [
    '品德修养',
    '自然意境',
    '才学智慧',
    '美好祝愿',
    '志向抱负',
    '气质风范',
    '家庭和谐',
    '艺术审美'
  ];

  // Style preference options
  const styleOptions = [
    '古典传统',
    '现代简约',
    '音韵优美',
    '独特别致',
    '中西结合',
    '儒雅端庄',
    '清新自然',
    '活泼可爱'
  ];

  // Element preference options
  const elementOptions = [
    '金',
    '木',
    '水',
    '火',
    '土'
  ];

  // Update remaining requests on mount and periodically
  useEffect(() => {
    const updateRemaining = () => {
      setRemainingRequests(rateLimiter.getRemainingRequests());
    };
    updateRemaining();
    const interval = setInterval(updateRemaining, 5000); // Update every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (fatherName && motherName) {
      // Format birth time if both hour and minute are selected
      const birthTime = birthHour && birthMinute ? `${birthHour}:${birthMinute}` : undefined;
      
      // Clear previous results to force regeneration
      localStorage.removeItem('nameGeneratorResults');
      
      navigate("/result", {
        state: {
          fatherName,
          motherName,
          birthDate: birthDate ? formatDateForBackend(birthDate) : undefined,
          birthTime,
          preferences: {
            cultural: culturalPref ? [culturalPref] : [],
            meaning: meaningPref ? [meaningPref] : [],
            style: stylePref ? [stylePref] : [],
            element: elementPref ? [elementPref] : [],
            customExpectation: customExpectation,
          },
          surnameChoice,
          nameCount,
          nameLength,
          babyGender,
        },
      });
    }
  };

  const isFormValid = fatherName && motherName;

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-rose-50/30 to-blue-50/30 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Favorites Button */}
        <div className="flex justify-end mb-4">
          <Button
            variant="outline"
            onClick={() => navigate("/favorites")}
            className="text-stone-600 hover:text-rose-600 hover:border-rose-300 shadow-sm"
          >
            <Heart className="mr-2 h-4 w-4" />
            查看收藏
          </Button>
        </div>

        {/* Header */}
        <div className="text-center mb-8 md:mb-12">
          <div className="inline-flex items-center justify-center mb-4">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-br from-rose-200 via-pink-200 to-blue-200 flex items-center justify-center shadow-lg">
              <Baby className="w-5 h-5 md:w-6 md:h-6 text-rose-600" />
            </div>
          </div>
          <h1 className="text-3xl md:text-4xl font-serif text-stone-800 mb-2 md:mb-3">吉名宝典</h1>
          <p className="text-stone-500 text-base md:text-lg px-4">结合传统文化与五行原理，为您的宝宝取一个好名字</p>
        </div>

        {/* Form Card */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl md:rounded-3xl shadow-xl p-6 md:p-12 border border-stone-200/50">
          <form onSubmit={handleSubmit} className="space-y-6 md:space-y-8">
            {/* Parents Names */}
            <div className="grid md:grid-cols-2 gap-4 md:gap-6">
              <div className="space-y-2 md:space-y-3">
                <Label htmlFor="fatherName" className="text-stone-700 text-sm md:text-base">
                  父亲姓名
                </Label>
                <Input
                  id="fatherName"
                  value={fatherName}
                  onChange={(e) => setFatherName(e.target.value)}
                  placeholder="请输入父亲姓名"
                  className="h-11 md:h-12 bg-stone-50 border-stone-200 focus:border-rose-300 focus:ring-rose-200"
                  required
                />
              </div>

              <div className="space-y-2 md:space-y-3">
                <Label htmlFor="motherName" className="text-stone-700 text-sm md:text-base">
                  母亲姓名
                </Label>
                <Input
                  id="motherName"
                  value={motherName}
                  onChange={(e) => setMotherName(e.target.value)}
                  placeholder="请输入母亲姓名"
                  className="h-11 md:h-12 bg-stone-50 border-stone-200 focus:border-blue-300 focus:ring-blue-200"
                  required
                />
              </div>
            </div>

            {/* Surname Choice */}
            <div className="space-y-3 md:space-y-4">
              <Label className="text-stone-700 text-sm md:text-base flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-slate-100 to-stone-200 flex items-center justify-center">
                  <Users className="w-4 h-4 text-stone-700" />
                </div>
                宝宝姓氏
              </Label>
              <RadioGroup
                value={surnameChoice}
                onValueChange={(value) => setSurnameChoice(value as "father" | "mother")}
                className="grid grid-cols-2 gap-3"
              >
                <label
                  htmlFor="r1"
                  className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    surnameChoice === "father"
                      ? "border-rose-300 bg-rose-50/50 shadow-sm"
                      : "border-stone-200 bg-stone-50 hover:border-stone-300"
                  }`}
                >
                  <RadioGroupItem value="father" id="r1" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-stone-700">跟随父亲</p>
                    <p className="text-xs text-stone-500 mt-0.5">使用父亲姓氏</p>
                  </div>
                </label>
                <label
                  htmlFor="r2"
                  className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    surnameChoice === "mother"
                      ? "border-blue-300 bg-blue-50/50 shadow-sm"
                      : "border-stone-200 bg-stone-50 hover:border-stone-300"
                  }`}
                >
                  <RadioGroupItem value="mother" id="r2" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-stone-700">跟随母亲</p>
                    <p className="text-xs text-stone-500 mt-0.5">使用母亲姓氏</p>
                  </div>
                </label>
              </RadioGroup>
            </div>

            {/* Birth Date */}
            <div className="space-y-2 md:space-y-3">
              <Label className="text-stone-700 text-sm md:text-base flex items-center gap-2">
                宝宝出生日期
                <span className="text-xs text-stone-400 font-normal">（可选，提供更精准的五行分析）</span>
              </Label>
              <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full h-11 md:h-12 justify-start text-left font-normal bg-stone-50 border-stone-200 hover:bg-stone-100"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4 text-stone-500" />
                    {birthDate ? (
                      <span className="text-stone-900 text-sm md:text-base">
                        {formatDate(birthDate)}
                      </span>
                    ) : (
                      <span className="text-stone-400 text-sm md:text-base">选择出生日期</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={birthDate}
                    onSelect={(date) => {
                      if (date) {
                        setBirthDate(date);
                        setCalendarOpen(false);
                      }
                    }}
                    captionLayout="dropdown-buttons"
                    fromYear={1900}
                    toYear={new Date().getFullYear() + 10}
                    initialFocus
                    locale={zhCN}
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Birth Time (Optional) */}
            <div className="space-y-2 md:space-y-3">
              <Label className="text-stone-700 text-sm md:text-base flex items-center gap-2">
                出生时辰
                <span className="text-xs text-stone-400 font-normal">（可选，更精准的八字分析）</span>
              </Label>
              <div className="grid grid-cols-2 gap-3">
                <Select value={birthHour} onValueChange={setBirthHour}>
                  <SelectTrigger className="h-11 md:h-12 bg-stone-50 border-stone-200 focus:border-purple-300 focus:ring-purple-200">
                    <SelectValue placeholder="选择小时" />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    {Array.from({ length: 24 }, (_, i) => {
                      const hour = String(i).padStart(2, '0');
                      return (
                        <SelectItem key={hour} value={hour}>
                          {hour}时
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
                
                <Select value={birthMinute} onValueChange={setBirthMinute}>
                  <SelectTrigger className="h-11 md:h-12 bg-stone-50 border-stone-200 focus:border-purple-300 focus:ring-purple-200">
                    <SelectValue placeholder="选择分钟" />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    {Array.from({ length: 60 }, (_, i) => {
                      const minute = String(i).padStart(2, '0');
                      return (
                        <SelectItem key={minute} value={minute}>
                          {minute}分
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Preferences Section */}
            <div className="space-y-5 md:space-y-6">
              <div className="flex items-center gap-2">
                <div className="flex-1 h-px bg-stone-200" />
                <span className="text-sm text-stone-500">取名偏好设置（可选）</span>
                <div className="flex-1 h-px bg-stone-200" />
              </div>

              {/* Cultural Preferences */}
              <div className="space-y-3">
                <Label className="text-stone-700 text-sm md:text-base flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-100 to-amber-200 flex items-center justify-center">
                    <BookOpen className="w-4 h-4 text-amber-700" />
                  </div>
                  经典文化偏好
                </Label>
                <RadioGroup 
                  value={culturalPref} 
                  onValueChange={setCulturalPref}
                  className="grid grid-cols-2 gap-3"
                >
                  {culturalOptions.map((item) => (
                    <label
                      key={item}
                      className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-all ${
                        culturalPref === item
                          ? "border-amber-300 bg-amber-50/50 shadow-sm"
                          : "border-transparent bg-stone-50 hover:bg-stone-100"
                      }`}
                    >
                      <RadioGroupItem value={item} id={`cultural-${item}`} />
                      <span className="text-sm text-stone-700">{item}</span>
                    </label>
                  ))}
                </RadioGroup>
              </div>

              {/* Meaning Preferences */}
              <div className="space-y-3">
                <Label className="text-stone-700 text-sm md:text-base flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-pink-100 to-rose-200 flex items-center justify-center">
                    <Flower2 className="w-4 h-4 text-rose-700" />
                  </div>
                  寓意方向选择
                </Label>
                <RadioGroup 
                  value={meaningPref} 
                  onValueChange={setMeaningPref}
                  className="grid grid-cols-2 gap-3"
                >
                  {meaningOptions.map((item) => (
                    <label
                      key={item}
                      className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-all ${
                        meaningPref === item
                          ? "border-rose-300 bg-rose-50/50 shadow-sm"
                          : "border-transparent bg-stone-50 hover:bg-stone-100"
                      }`}
                    >
                      <RadioGroupItem value={item} id={`meaning-${item}`} />
                      <span className="text-sm text-stone-700">{item}</span>
                    </label>
                  ))}
                </RadioGroup>
              </div>

              {/* Style Preferences */}
              <div className="space-y-3">
                <Label className="text-stone-700 text-sm md:text-base flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-100 to-violet-200 flex items-center justify-center">
                    <Palette className="w-4 h-4 text-purple-700" />
                  </div>
                  风格偏好
                </Label>
                <RadioGroup 
                  value={stylePref} 
                  onValueChange={setStylePref}
                  className="grid grid-cols-2 gap-3"
                >
                  {styleOptions.map((item) => (
                    <label
                      key={item}
                      className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-all ${
                        stylePref === item
                          ? "border-purple-300 bg-purple-50/50 shadow-sm"
                          : "border-transparent bg-stone-50 hover:bg-stone-100"
                      }`}
                    >
                      <RadioGroupItem value={item} id={`style-${item}`} />
                      <span className="text-sm text-stone-700">{item}</span>
                    </label>
                  ))}
                </RadioGroup>
              </div>

              {/* Element Preferences */}
              <div className="space-y-3">
                <Label className="text-stone-700 text-sm md:text-base flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-100 to-blue-200 flex items-center justify-center">
                    <Atom className="w-4 h-4 text-blue-700" />
                  </div>
                  五行补益
                </Label>
                <RadioGroup 
                  value={elementPref} 
                  onValueChange={setElementPref}
                  className="flex flex-wrap gap-3"
                >
                  {elementOptions.map((item) => (
                    <label
                      key={item}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg border cursor-pointer transition-all ${
                        elementPref === item
                          ? "border-blue-300 bg-blue-50/50 shadow-sm"
                          : "border-transparent bg-stone-50 hover:bg-stone-100"
                      }`}
                    >
                      <RadioGroupItem value={item} id={`element-${item}`} />
                      <span className="text-sm text-stone-700">{item}</span>
                    </label>
                  ))}
                </RadioGroup>
              </div>

              {/* Custom Description */}
              <div className="space-y-3">
                <Label htmlFor="customExpectation" className="text-stone-700 text-sm md:text-base flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-100 to-teal-200 flex items-center justify-center">
                      <MessageSquare className="w-4 h-4 text-emerald-700" />
                    </div>
                    <span>自定义描述</span>
                  </div>
                  <span className={`text-xs font-normal ${
                    customExpectation.length > 100 ? 'text-red-500' : 'text-stone-400'
                  }`}>
                    {customExpectation.length}/100
                  </span>
                </Label>
                <div className="relative">
                  <Textarea
                    id="customExpectation"
                    value={customExpectation}
                    onChange={(e) => {
                      const text = e.target.value;
                      if (text.length <= 100) {
                        setCustomExpectation(text);
                      }
                    }}
                    placeholder="例如：希望名字有诗意，寓意聪明勇敢，避免生僻字..."
                    className="min-h-[100px] resize-none bg-stone-50 border-stone-200 focus:border-emerald-300 focus:ring-emerald-200 text-sm md:text-base"
                    maxLength={100}
                  />
                </div>
                <p className="text-xs text-stone-500">
                  您可以在这里进一步描述您对宝宝名字的要求
                </p>
              </div>

              {/* Name Length Selection (单字/双字) */}
              <div className="space-y-3">
                <Label className="text-stone-700 text-sm md:text-base flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-green-100 to-emerald-200 flex items-center justify-center">
                    <Hash className="w-4 h-4 text-green-700" />
                  </div>
                  名字字数
                </Label>
                <RadioGroup
                  value={nameLength}
                  onValueChange={(value) => setNameLength(value as "single" | "double" | "both")}
                  className="grid grid-cols-3 gap-3"
                >
                  <label
                    htmlFor="single"
                    className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                      nameLength === "single"
                        ? "border-green-300 bg-green-50/50 shadow-sm"
                        : "border-stone-200 bg-stone-50 hover:border-stone-300"
                    }`}
                  >
                    <RadioGroupItem value="single" id="single" />
                    <div className="text-center">
                      <p className="text-sm font-medium text-stone-700">单字名</p>
                      <p className="text-xs text-stone-500 mt-0.5">如：韩立</p>
                    </div>
                  </label>
                  <label
                    htmlFor="double"
                    className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                      nameLength === "double"
                        ? "border-green-300 bg-green-50/50 shadow-sm"
                        : "border-stone-200 bg-stone-50 hover:border-stone-300"
                    }`}
                  >
                    <RadioGroupItem value="double" id="double" />
                    <div className="text-center">
                      <p className="text-sm font-medium text-stone-700">双字名</p>
                      <p className="text-xs text-stone-500 mt-0.5">如：向之礼</p>
                    </div>
                  </label>
                  <label
                    htmlFor="both"
                    className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                      nameLength === "both"
                        ? "border-green-300 bg-green-50/50 shadow-sm"
                        : "border-stone-200 bg-stone-50 hover:border-stone-300"
                    }`}
                  >
                    <RadioGroupItem value="both" id="both" />
                    <div className="text-center">
                      <p className="text-sm font-medium text-stone-700">不限</p>
                      <p className="text-xs text-stone-500 mt-0.5">两种都要</p>
                    </div>
                  </label>
                </RadioGroup>
              </div>

              {/* Baby Gender Selection (性别选择) */}
              <div className="space-y-3">
                <Label className="text-stone-700 text-sm md:text-base flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-100 to-purple-200 flex items-center justify-center">
                    <Baby className="w-4 h-4 text-violet-700" />
                  </div>
                  宝宝性别
                </Label>
                <div className="grid grid-cols-2 gap-3">
                  <label
                    className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      babyGender.includes("boy")
                        ? "border-blue-300 bg-blue-50/50 shadow-sm"
                        : "border-stone-200 bg-stone-50 hover:border-stone-300"
                    }`}
                  >
                    <Checkbox
                      id="gender-boy"
                      checked={babyGender.includes("boy")}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setBabyGender(prev => [...prev, "boy"]);
                        } else {
                          // At least one gender must be selected
                          if (babyGender.length > 1) {
                            setBabyGender(prev => prev.filter(g => g !== "boy"));
                          }
                        }
                      }}
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-stone-700">男宝</p>
                      <p className="text-xs text-stone-500 mt-0.5">生成男宝名字</p>
                    </div>
                  </label>
                  <label
                    className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      babyGender.includes("girl")
                        ? "border-rose-300 bg-rose-50/50 shadow-sm"
                        : "border-stone-200 bg-stone-50 hover:border-stone-300"
                    }`}
                  >
                    <Checkbox
                      id="gender-girl"
                      checked={babyGender.includes("girl")}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setBabyGender(prev => [...prev, "girl"]);
                        } else {
                          // At least one gender must be selected
                          if (babyGender.length > 1) {
                            setBabyGender(prev => prev.filter(g => g !== "girl"));
                          }
                        }
                      }}
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-stone-700">女宝</p>
                      <p className="text-xs text-stone-500 mt-0.5">生成女宝名字</p>
                    </div>
                  </label>
                </div>
                <p className="text-xs text-stone-500">
                  💡 可以同时选择，也可以只选其中一个
                </p>
              </div>

              {/* Name Count Selection */}
              <div className="space-y-3">
                <Label className="text-stone-700 text-sm md:text-base flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-100 to-blue-200 flex items-center justify-center">
                    <Hash className="w-4 h-4 text-indigo-700" />
                  </div>
                  生成数量
                </Label>
                <RadioGroup
                  value={String(nameCount)}
                  onValueChange={(value) => setNameCount(Number(value) as 5 | 10)}
                  className="grid grid-cols-2 gap-3"
                >
                  <label
                    htmlFor="count5"
                    className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      nameCount === 5
                        ? "border-indigo-300 bg-indigo-50/50 shadow-sm"
                        : "border-stone-200 bg-stone-50 hover:border-stone-300"
                    }`}
                  >
                    <RadioGroupItem value="5" id="count5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-stone-700">每性别 5 个</p>
                      <p className="text-xs text-stone-500 mt-0.5">共 10 个名字</p>
                    </div>
                  </label>
                  <label
                    htmlFor="count10"
                    className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      nameCount === 10
                        ? "border-indigo-300 bg-indigo-50/50 shadow-sm"
                        : "border-stone-200 bg-stone-50 hover:border-stone-300"
                    }`}
                  >
                    <RadioGroupItem value="10" id="count10" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-stone-700">每性别 10 个</p>
                      <p className="text-xs text-stone-500 mt-0.5">共 20 个名字</p>
                    </div>
                  </label>
                </RadioGroup>
              </div>
            </div>

            {/* Decorative Elements */}
            <div className="flex items-center justify-center gap-2 md:gap-3 py-3 md:py-4">
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-stone-300 to-transparent" />
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-gradient-to-br from-amber-100 to-amber-200 flex items-center justify-center">
                  <Sun className="w-3.5 h-3.5 md:w-4 md:h-4 text-amber-600" />
                </div>
                <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-gradient-to-br from-rose-100 to-pink-200 flex items-center justify-center">
                  <Sparkles className="w-3.5 h-3.5 md:w-4 md:h-4 text-rose-600" />
                </div>
                <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-gradient-to-br from-blue-100 to-indigo-200 flex items-center justify-center">
                  <Moon className="w-3.5 h-3.5 md:w-4 md:h-4 text-blue-600" />
                </div>
                <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-gradient-to-br from-purple-100 to-violet-200 flex items-center justify-center">
                  <Star className="w-3.5 h-3.5 md:w-4 md:h-4 text-purple-600" />
                </div>
              </div>
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-stone-300 to-transparent" />
            </div>

            {/* Rate Limit Info */}
            {remainingRequests <= 3 && (
              <div className={`text-center p-3 rounded-lg ${
                remainingRequests === 0 
                  ? 'bg-red-50 border border-red-200' 
                  : 'bg-amber-50 border border-amber-200'
              }`}>
                <p className={`text-sm ${
                  remainingRequests === 0 
                    ? 'text-red-700' 
                    : 'text-amber-700'
                }`}>
                  {remainingRequests === 0 
                    ? '⚠️ 已达到每分钟最大请求次��，请稍后再试' 
                    : `💡 剩余 ${remainingRequests} 次生成机会（每分钟最多5次）`}
                </p>
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={!isFormValid}
              className="w-full h-12 md:h-14 text-base md:text-lg rounded-xl !text-white !bg-gradient-to-r !from-slate-700 !to-indigo-800 hover:!brightness-110 shadow-lg shadow-indigo-100 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed border-none"
            >
              开始生成名字
            </Button>
          </form>
        </div>

        {/* Footer Note */}
        <p 
          className="text-center text-xs md:text-sm text-stone-400 px-4"
          style={{ marginTop: '24px', marginBottom: '24px' }}
        >
          基于传统文化、五行八字、诗词典故智能生成
        </p>

        <Footer />
      </div>
    </div>
  );
}