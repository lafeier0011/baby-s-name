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
    
    setDownloading(true);
    
    try {
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: "#ffffff",
        scale: 3, // Higher scale for better quality
        logging: false,
        useCORS: true,
        allowTaint: false,
        foreignObjectRendering: false,
        removeContainer: true,
      });

      const link = document.createElement("a");
      const timestamp = new Date().toLocaleDateString("zh-CN").replace(/\//g, "-");
      link.download = `吉名宝典-${gender === "boy" ? "男宝" : "女宝"}名字-${timestamp}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (error) {
      console.error("Download failed:", error);
      alert(`下载失败：${error instanceof Error ? error.message : '未知错误'}\n请截图此错误并联系开发者`);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative w-full max-w-2xl max-h-[90vh] flex flex-col">
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
              maxWidth: '600px', 
              margin: '0 auto',
              backgroundColor: '#ffffff',
              overflow: 'hidden',
              fontFamily: 'Georgia, serif, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
            }}
          >
            {/* Header - APP Name */}
            <div style={{
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
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '32px', fontSize: '15px', fontWeight: 600 }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{ color: colors.muted }}>生肖:</span> {metadata.zodiac}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{ color: colors.muted }}>五行:</span> {metadata.element}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{ color: colors.muted }}>星座:</span> {metadata.westernZodiac}
                  </span>
                </div>
              </div>
            </div>

            {/* Names */}
            <div style={{ padding: '8px 32px 32px 32px' }}>
              {names.map((name, index) => (
                <div
                  key={index}
                  style={{
                    background: colors.cardBg,
                    borderRadius: '20px',
                    padding: '28px',
                    border: `1px solid ${gender === "boy" ? '#dbeafe' : '#fce7f3'}`,
                    marginBottom: index < names.length - 1 ? '20px' : '0',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                >
                  {/* Decorative corner */}
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    width: '60px',
                    height: '60px',
                    background: `linear-gradient(225deg, ${gender === "boy" ? '#dbeafe' : '#fce7f3'} 0%, transparent 50%)`,
                    opacity: 0.5
                  }} />

                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '16px', marginBottom: '6px' }}>
                      <h3 style={{ 
                        fontSize: '32px', 
                        fontFamily: 'Georgia, serif', 
                        color: colors.accent, 
                        fontWeight: 700, 
                        margin: 0 
                      }}>
                        {name.chineseName}
                      </h3>
                      <span style={{ color: colors.muted, fontSize: '16px', fontWeight: 500 }}>{name.pinyin}</span>
                    </div>
                    <p style={{ 
                      color: '#4b5563', 
                      fontWeight: 600, 
                      fontSize: '18px', 
                      margin: 0,
                      fontFamily: 'Georgia, serif'
                    }}>{name.englishName}</p>
                  </div>

                  <div style={{
                    background: 'rgba(255, 255, 255, 0.7)',
                    borderRadius: '12px',
                    padding: '16px',
                    border: '1px solid rgba(255, 255, 255, 0.5)'
                  }}>
                    <p style={{ 
                      color: '#374151', 
                      fontSize: '15px', 
                      lineHeight: '1.7', 
                      margin: 0,
                      textAlign: 'justify'
                    }}>{name.explanation}</p>
                  </div>

                  {/* Decorative dots at bottom */}
                  <div style={{ marginTop: '16px', display: 'flex', gap: '6px' }}>
                    <div style={{ width: '40px', height: '4px', borderRadius: '2px', background: colors.muted, opacity: 0.6 }} />
                    <div style={{ width: '20px', height: '4px', borderRadius: '2px', background: colors.muted, opacity: 0.4 }} />
                    <div style={{ width: '10px', height: '4px', borderRadius: '2px', background: colors.muted, opacity: 0.2 }} />
                  </div>
                </div>
              ))}
            </div>

            {/* Footer - Author Signature */}
            <div style={{ 
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