import { useState, useEffect } from "react";
import { Heart, Copy, Check, X } from "lucide-react";
import { Button } from "./ui/button";
import { addFavorite, removeFavorite, isFavorite } from "../utils/favorites";

interface Name {
  chineseName: string;
  pinyin: string;
  englishName: string;
  explanation: string;
  career?: string;
  hobbies?: string;
}

interface NameCardProps {
  name: Name;
  gender: "boy" | "girl";
  index: number;
  showDeleteButton?: boolean;
  onDelete?: () => void;
}

export default function NameCard({ name, gender, index, showDeleteButton, onDelete }: NameCardProps) {
  const [liked, setLiked] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const currentFavorite = isFavorite(name.chineseName, gender);
    setLiked(currentFavorite);
  }, [name.chineseName, gender]);

  const handleCopy = async () => {
    const text = `${name.chineseName} (${name.pinyin})\n${name.englishName}\n${name.explanation}`;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLike = () => {
    if (liked) {
      removeFavorite(name.chineseName, gender);
    } else {
      addFavorite({
        chineseName: name.chineseName,
        pinyin: name.pinyin,
        englishName: name.englishName,
        explanation: name.explanation,
        gender,
      });
    }
    setLiked(!liked);
    
    // Trigger custom event for same-window updates
    window.dispatchEvent(new Event('favorites-updated'));
  };

  const gradientClass =
    gender === "boy"
      ? "from-blue-50 to-cyan-50"
      : "from-rose-50 to-pink-50";

  const accentColor =
    gender === "boy" ? "text-blue-600" : "text-rose-600";

  return (
    <div
      className={`bg-gradient-to-br ${gradientClass} rounded-xl md:rounded-2xl p-5 md:p-8 border border-stone-200/50 shadow-sm hover:shadow-md transition-all duration-300 animate-fadeIn`}
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="flex items-start justify-between gap-3 md:gap-4">
        <div className="flex-1 min-w-0">
          {/* Chinese Name */}
          <div className="mb-3 md:mb-4">
            <h3 className={`text-2xl md:text-4xl font-serif ${accentColor} mb-1 md:mb-2`}>
              {name.chineseName}
            </h3>
            <p className="text-stone-500 text-xs md:text-sm">{name.pinyin}</p>
          </div>

          {/* English Name */}
          <div className="mb-3 md:mb-4">
            <p className="text-stone-700 font-medium text-base md:text-lg">
              {name.englishName}
            </p>
          </div>

          {/* Explanation */}
          <div className="bg-white/60 backdrop-blur-sm rounded-lg md:rounded-xl p-3 md:p-4 border border-white/50">
            <p className="text-stone-600 text-xs md:text-sm leading-relaxed">
              {name.explanation}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2 flex-shrink-0">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleLike}
            className={`h-9 w-9 md:h-10 md:w-10 ${
              liked
                ? gender === "boy"
                  ? "text-blue-500 bg-blue-50"
                  : "text-rose-500 bg-rose-50"
                : "text-stone-400 hover:text-stone-600"
            } transition-colors`}
          >
            <Heart
              className={`h-4 w-4 md:h-5 md:w-5 ${liked ? "fill-current" : ""}`}
            />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleCopy}
            className="h-9 w-9 md:h-10 md:w-10 text-stone-400 hover:text-stone-600"
          >
            {copied ? (
              <Check className="h-4 w-4 md:h-5 md:w-5 text-green-500" />
            ) : (
              <Copy className="h-4 w-4 md:h-5 md:w-5" />
            )}
          </Button>
          {showDeleteButton && onDelete && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onDelete}
              className="h-9 w-9 md:h-10 md:w-10 text-stone-400 hover:text-stone-600"
            >
              <X className="h-4 w-4 md:h-5 md:w-5" />
            </Button>
          )}
        </div>
      </div>

      {/* Decorative Element */}
      <div className="mt-3 md:mt-4 flex items-center gap-2">
        <div className={`h-1 w-10 md:w-12 rounded-full ${gender === "boy" ? "bg-blue-300" : "bg-rose-300"}`} />
        <div className={`h-1 w-5 md:w-6 rounded-full ${gender === "boy" ? "bg-blue-200" : "bg-rose-200"}`} />
        <div className={`h-1 w-2 md:w-3 rounded-full ${gender === "boy" ? "bg-blue-100" : "bg-rose-100"}`} />
      </div>
    </div>
  );
}