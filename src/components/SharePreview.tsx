import { X, Download, Sparkles, Heart } from "lucide-react";
import { Button } from "./ui/button";
import html2canvas from "html2canvas";
import { useRef, useState } from "react";

interface Name {
  chineseName: string;
  pinyin: string;
  englishName: string;
  explanation: string;
}

interface SharePreviewProps {
  names: Name[];
  gender: "boy" | "girl";
  metadata: {
    zodiac: string;
    element: string;
    westernZodiac: string;
    birthDate: string;
  };
  onClose: () => void;
}

export default function SharePreview({ names, gender, metadata, onClose }: SharePreviewProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);
  const [selectedCards, setSelectedCards] = useState<Set<number>>(new Set());
  const [allSelected, setAllSelected] = useState(false);

  const handleSelectAll = () => {
    if (allSelected) {
      setSelectedCards(new Set());
    } else {
      const indices: number[] = [];
      names.forEach((_, index) => indices.push(index));
      setSelectedCards(new Set(indices));
    }
    setAllSelected(!allSelected);
  };

  const handleCardSelect = (index: number) => {
    const newSelected = new Set(selectedCards);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedCards(newSelected);
    setAllSelected(newSelected.size === names.length);
  };

  // Use hex colors to avoid oklch issues with html2canvas
  const colors = gender === "boy" 
    ? {
        gradient: "linear-gradient(135deg, #eff6ff 0%, #ecfeff 100%)",
        accent: "#2563eb",
        secondary: "#7dd3fc",
        text: "#1e40af",
        muted: "#60a5fa",
        cardBg: "linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)"
      }
    : {
        gradient: "linear-gradient(135deg, #fff1f2 0%, #fdf2f8 100%)",
        accent: "#e11d48",
        secondary: "#fda4af",
        text: "#9f1239",
        muted: "#fb7185",
        cardBg: "linear-gradient(135deg, #fff1f2 0%, #ffe4e6 100%)"
      };

  const accentColor = gender === "boy" ? "blue" : "rose";
  const gradientFrom = gender === "boy" ? "from-blue-500" : "from-rose-500";
  const gradientTo = gender === "boy" ? "to-cyan-500" : "to-pink-500";

  const handleDownload = async () => {
    if (!cardRef.current) return;

    // 🚀 优化：只导出选中的卡片（头部+选中卡片+尾部）
    if (selectedCards.size === 0) {
      alert('请至少选择一个卡片后再保存图片');
      return;
    }

    setDownloading(true);

    try {
      const cardContainer = cardRef.current as HTMLElement;
      const cardElements = cardContainer.querySelectorAll('[data-card-index]');

      // 找到头部和尾部元素
      const headerSection = cardContainer.querySelector('[data-section="header"]');
      const namesSection = cardContainer.querySelector('[data-section="names"]');
      const footerSection = cardContainer.querySelector('[data-section="footer"]');
      const controlSection = cardContainer.querySelector('[data-section="control"]');

      // 找到所有复选框
      const checkboxes = cardContainer.querySelectorAll('[data-checkbox]');

      // 保存原始显示状态
      const originalDisplays = new Map<number, string>();
      cardElements.forEach((el, index) => {
        originalDisplays.set(index, el.style.display || '');
      });

      const checkboxDisplays = new Map<number, string>();
      checkboxes.forEach((el, index) => {
        checkboxDisplays.set(index, el.style.display || '');
      });

      // 保存卡片的原始padding
      const originalPaddings = new Map<number, string>();
      cardElements.forEach((el, index) => {
        originalPaddings.set(index, (el as HTMLElement).style.padding || '');
      });

      // 只显示选中的卡片
      cardElements.forEach((el, index) => {
        el.style.display = selectedCards.has(index) ? 'block' : 'none';
      });

      // 🚀 导出时卡片添加8px的左右padding
      cardElements.forEach((el) => {
        (el as HTMLElement).style.padding = '28px 20px 24px 20px';
      });

      // 🚀 隐藏所有复选框（导出时不显示）
      checkboxes.forEach((el) => {
        el.style.display = 'none';
      });

      // 🚀 隐藏选择控制行（导出时不显示）
      if (controlSection) {
        controlSection.style.display = 'none';
      }

      // 等待 DOM 更新
      await new Promise(resolve => setTimeout(resolve, 50));

      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: "#ffffff",
        scale: 3,
        logging: false,
        useCORS: true,
        allowTaint: false,
        foreignObjectRendering: false,
        removeContainer: true,
      });

      // 恢复显示状态（包括控制行和复选框）
      cardElements.forEach((el, index) => {
        el.style.display = originalDisplays.get(index) || 'block';
      });

      cardElements.forEach((el, index) => {
        (el as HTMLElement).style.padding = originalPaddings.get(index) || '28px 32px 24px 28px';
      });

      checkboxes.forEach((el, index) => {
        el.style.display = checkboxDisplays.get(index) || 'flex';
      });

      if (controlSection) {
        controlSection.style.display = 'flex';
      }

      const link = document.createElement("a");
      const timestamp = new Date().toLocaleDateString("zh-CN").replace(/\//g, "-");
      link.download = `吉名宝典-${gender === "boy" ? "男宝" : "女宝"}名字-${selectedCards.size}个-${timestamp}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
      onClose();
    } catch (error) {
      console.error("Download failed:", error);
      alert(`下载失败：${error instanceof Error ? error.message : '未知错误'}\n请截图此错误并联系开发者`);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Close Button */}
        <Button
          onClick={onClose}
          variant="ghost"
          size="icon"
          className="absolute -top-12 right-0 text-white hover:bg-white/20 rounded-full z-10"
        >
          <X className="h-5 w-5" />
        </Button>

        {/* Scrollable Card Container */}
        <div className="overflow-y-auto rounded-2xl shadow-2xl bg-white" style={{ maxHeight: 'calc(90vh - 80px)' }}>
          {/* Card Preview */}
          <div 
            ref={cardRef}
            style={{ 
              all: 'initial',
              width: '100%', 
              maxWidth: '800px', 
              margin: '0 auto',
              backgroundColor: '#ffffff',
              overflow: 'hidden',
              fontFamily: 'Georgia, serif, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
            }}
          >
            {/* Header - APP Name */}
            <div data-section="header" style={{
              background: colors.gradient,
              padding: '40px 32px 30px 32px',
              textAlign: 'center',
              borderBottom: `1px solid ${gender === "boy" ? '#dbeafe' : '#fce7f3'}`
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '12px' }}>
                <span style={{ fontSize: '24px' }}>✨</span>
                <h1 style={{ 
                  fontSize: '32px', 
                  fontFamily: 'Georgia, serif', 
                  color: colors.accent, 
                  fontWeight: 700, 
                  margin: 0,
                  letterSpacing: '2px'
                }}>吉名宝典</h1>
                <span style={{ fontSize: '24px' }}>✨</span>
              </div>
              <p style={{ color: colors.muted, fontSize: '15px', fontWeight: 500, margin: 0, letterSpacing: '1px' }}>
                传承千年文化 · 结合五行八字
              </p>
            </div>

            {/* Metadata */}
            <div style={{ padding: '24px 32px 16px 32px' }}>
              <div style={{
                background: '#ffffff',
                borderRadius: '16px',
                padding: '16px 24px',
                color: colors.text,
                textAlign: 'center',
                border: `1px solid ${gender === "boy" ? '#bfdbfe' : '#fecdd3'}`,
                boxShadow: `0 4px 12px ${gender === "boy" ? 'rgba(59, 130, 246, 0.08)' : 'rgba(244, 63, 94, 0.08)'}`
              }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: '12px 20px', fontSize: '14px', fontWeight: 600 }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px', whiteSpace: 'nowrap' }}>
                    <span style={{ color: colors.muted }}>生肖:</span> {metadata.zodiac}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px', whiteSpace: 'nowrap' }}>
                    <span style={{ color: colors.muted }}>五行:</span> {metadata.element}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px', whiteSpace: 'nowrap' }}>
                    <span style={{ color: colors.muted }}>星座:</span> {metadata.westernZodiac}
                  </span>
                </div>
              </div>
            </div>

            {/* Control Section - Select All */}
            <div data-section="control" style={{ padding: '20px 32px 12px 32px', display: 'flex', alignItems: 'center' }}>
              <button
                onClick={handleSelectAll}
                style={{
                  background: allSelected ? colors.accent : '#ffffff',
                  border: `2px solid ${colors.muted}`,
                  color: allSelected ? '#ffffff' : colors.text,
                  padding: '10px 20px',
                  borderRadius: '12px',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.2s ease',
                  boxShadow: allSelected
                    ? `0 2px 8px ${gender === 'boy' ? 'rgba(37, 99, 235, 0.3)' : 'rgba(225, 29, 72, 0.3)'}`
                    : '0 1px 3px rgba(0, 0, 0, 0.1)',
                }}
                onMouseOver={(e) => {
                  if (!allSelected) {
                    e.currentTarget.style.background = colors.accent;
                    e.currentTarget.style.color = '#ffffff';
                    e.currentTarget.style.borderColor = colors.accent;
                  }
                }}
                onMouseOut={(e) => {
                  if (!allSelected) {
                    e.currentTarget.style.background = '#ffffff';
                    e.currentTarget.style.color = colors.text;
                    e.currentTarget.style.borderColor = colors.muted;
                  }
                }}
              >
                {allSelected ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 17"></polyline>
                  </svg>
                ) : (
                  <div style={{
                    width: '16px',
                    height: '16px',
                    borderRadius: '3px',
                    border: `2px solid ${colors.muted}`
                  }} />
                )}
                <span style={{ marginLeft: '4px' }}>{allSelected ? '全不选' : '全选'}</span>
              </button>
              <span style={{ marginLeft: '16px', fontSize: '14px', color: '#ffffff', fontWeight: 500 }}>
                已选择 <span style={{ color: colors.accent, fontWeight: 600, padding: '0 4px' }}>{selectedCards.size}</span>/{names.length} 个名字
              </span>
            </div>

            {/* Names */}
            <div data-section="names" style={{ padding: '8px 0 32px 0' }}>
              {names.map((name, index) => (
                <div
                  key={index}
                  data-card-index={index}
                  style={{
                    background: selectedCards.has(index)
                      ? (gender === 'boy' ? '#dbeafe' : '#fce7f3')
                      : colors.cardBg,
                    borderRadius: '24px',
                    padding: '28px 32px 24px 28px',
                    border: selectedCards.has(index)
                      ? `2px solid ${colors.accent}`
                      : `1px solid ${gender === "boy" ? '#dbeafe' : '#fce7f3'}`,
                    marginBottom: index < names.length - 1 ? '24px' : '0',
                    position: 'relative',
                    overflow: 'hidden',
                    boxShadow: selectedCards.has(index)
                      ? `0 4px 12px ${gender === "boy" ? 'rgba(37, 99, 235, 0.15)' : 'rgba(225, 29, 72, 0.15)'}`
                      : '0 4px 12px rgba(0, 0, 0, 0.03)',
                    cursor: 'pointer',
                  }}
                  onClick={() => handleCardSelect(index)}
                >
                  {/* Checkbox in top-right corner */}
                  <div
                    data-checkbox={index}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCardSelect(index);
                    }}
                    style={{
                      position: 'absolute',
                      top: '20px',
                      right: '20px',
                      width: '24px',
                      height: '24px',
                      borderRadius: '6px',
                      border: selectedCards.has(index) ? 'none' : `2px solid ${colors.muted}`,
                      background: selectedCards.has(index) ? colors.accent : '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      zIndex: 1,
                      boxShadow: selectedCards.has(index)
                        ? `0 2px 8px ${gender === 'boy' ? 'rgba(37, 99, 235, 0.3)' : 'rgba(225, 29, 72, 0.3)'}`
                        : '0 1px 3px rgba(0, 0, 0, 0.1)',
                    }}
                  >
                    {selectedCards.has(index) && (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 17"></polyline>
                      </svg>
                    )}
                  </div>

                  <div style={{ marginBottom: '16px' }}>
                    {/* Header: Name, Pinyin and English Name in a more horizontal layout */}
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      marginBottom: '16px',
                      gap: '20px'
                    }}>
                      <div style={{ flex: 1 }}>
                        <h3 style={{
                          fontSize: '28px',
                          fontFamily: 'Georgia, serif',
                          color: colors.accent,
                          fontWeight: 700,
                          margin: '0 0 4px 0',
                          lineHeight: '1.2'
                        }}>
                          {name.chineseName}
                        </h3>
                        <p style={{
                          color: '#6b7280',
                          fontSize: '16px',
                          margin: 0,
                          fontWeight: 500,
                          letterSpacing: '0.5px'
                        }}>{name.pinyin}</p>
                      </div>
                      <div style={{ textAlign: 'right', paddingTop: '4px', paddingRight: '50px' }}>
                        <p style={{
                          color: '#4b5563',
                          fontWeight: 600,
                          fontSize: '18px',
                          margin: 0,
                          fontFamily: 'Georgia, serif',
                          fontStyle: 'italic'
                        }}>{name.englishName}</p>
                      </div>
                    </div>

                    {/* Explanation */}
                    <div style={{
                      background: 'rgba(255, 255, 255, 0.6)',
                      backdropFilter: 'blur(4px)',
                      borderRadius: '16px',
                      padding: '20px',
                      border: '1px solid rgba(255, 255, 255, 0.5)',
                      boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)'
                    }}>
                      <p style={{ 
                        color: '#4b5563', 
                        fontSize: '15px', 
                        lineHeight: '1.7', 
                        margin: 0,
                        textAlign: 'justify'
                      }}>{name.explanation}</p>
                    </div>
                  </div>

                  {/* Decorative Elements matching NameCard.tsx */}
                  <div style={{ display: 'flex', itemsCenter: 'center', gap: '8px' }}>
                    <div style={{ 
                      height: '4px', 
                      width: '48px', 
                      borderRadius: '999px', 
                      background: gender === "boy" ? '#93c5fd' : '#fda4af' 
                    }} />
                    <div style={{ 
                      height: '4px', 
                      width: '24px', 
                      borderRadius: '999px', 
                      background: gender === "boy" ? '#bfdbfe' : '#fecdd3' 
                    }} />
                    <div style={{ 
                      height: '4px', 
                      width: '12px', 
                      borderRadius: '999px', 
                      background: gender === "boy" ? '#dbeafe' : '#ffe4e6' 
                    }} />
                  </div>
                </div>
              ))}
            </div>

            {/* Footer - Author Signature */}
            <div data-section="footer" style={{
              padding: '0 32px 40px 32px',
              textAlign: 'center'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '16px' }}>
                <div style={{ flex: '1', height: '1px', background: 'linear-gradient(90deg, transparent 0%, #fecdd3 50%, transparent 100%)' }} />
                <span style={{ fontSize: '18px', color: '#fb7185' }}>♥</span>
                <div style={{ flex: '1', height: '1px', background: 'linear-gradient(90deg, transparent 0%, #fecdd3 50%, transparent 100%)' }} />
              </div>
              <div>
                <p style={{ fontSize: '15px', fontFamily: 'Georgia, serif', color: '#4b5563', margin: '0 0 6px 0' }}>
                  Made with <span style={{ color: '#f43f5e' }}>♥</span> by{" "}
                  <span style={{ fontWeight: 600, color: '#e11d48' }}>拉斐尔 & 小圆</span>
                </p>
                <p style={{ fontSize: '13px', color: '#9ca3af', fontStyle: 'italic', margin: 0 }}>
                  To 我们未出生的宝宝
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center gap-3 mt-6">
          <Button
            onClick={onClose}
            variant="outline"
            className="bg-white/90 hover:bg-white border-stone-300"
          >
            取消
          </Button>
          <Button
            onClick={handleDownload}
            disabled={downloading}
            className={`bg-gradient-to-r ${gradientFrom} ${gradientTo} hover:opacity-90 text-white font-medium px-8 shadow-lg`}
          >
            {downloading ? (
              <>
                <Download className="mr-2 h-4 w-4 animate-pulse" />
                保存中...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                保存图片
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
