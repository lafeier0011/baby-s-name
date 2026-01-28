import { useState, useEffect } from "react";
import { ArrowLeft, Heart, Trash2, Sparkles } from "lucide-react";
import { useNavigate } from "react-router";
import { Button } from "./ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { getFavoritesByGender, clearFavorites, FavoriteName, removeFavorite } from "../utils/favorites";
import NameCard from "./NameCard";
import Footer from "./Footer";

export default function FavoritesPage() {
  const navigate = useNavigate();
  const [boyFavorites, setBoyFavorites] = useState<FavoriteName[]>([]);
  const [girlFavorites, setGirlFavorites] = useState<FavoriteName[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    loadFavorites();
  }, [refreshKey]);

  const loadFavorites = () => {
    setBoyFavorites(getFavoritesByGender('boy'));
    setGirlFavorites(getFavoritesByGender('girl'));
  };

  const handleClearAll = () => {
    if (confirm('确定要清空所有收藏的名字吗？此操作不可恢复。')) {
      clearFavorites();
      setRefreshKey(prev => prev + 1);
    }
  };

  const handleDeleteFavorite = (chineseName: string, gender: 'boy' | 'girl') => {
    removeFavorite(chineseName, gender);
    setRefreshKey(prev => prev + 1);
  };

  // Listen for storage changes to refresh when a name is favorited/unfavorited
  useEffect(() => {
    const handleStorageChange = () => {
      setRefreshKey(prev => prev + 1);
    };
    
    window.addEventListener('storage', handleStorageChange);
    // Use a custom event for same-window updates
    window.addEventListener('favorites-updated', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('favorites-updated', handleStorageChange);
    };
  }, []);

  const totalFavorites = boyFavorites.length + girlFavorites.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-rose-50/30 to-blue-50/30">
      <div className="max-w-6xl mx-auto px-4 py-6 md:py-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 md:mb-8">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              onClick={() => navigate("/")}
              className="text-stone-600 hover:text-stone-900"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              返回
            </Button>
            <div className="flex items-center gap-2">
              <Heart className="h-5 w-5 md:h-6 md:w-6 text-rose-500 fill-rose-500" />
              <h1 className="text-xl md:text-2xl font-serif text-stone-800">
                收藏的名字
              </h1>
              {totalFavorites > 0 && (
                <span className="text-sm md:text-base text-stone-500">
                  ({totalFavorites})
                </span>
              )}
            </div>
          </div>
          {totalFavorites > 0 && (
            <Button
              variant="outline"
              onClick={handleClearAll}
              className="text-stone-600 hover:text-rose-600 hover:border-rose-300"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              清空收藏
            </Button>
          )}
        </div>

        {/* Empty State */}
        {totalFavorites === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 md:py-24 px-4">
            <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-br from-rose-100 to-pink-100 flex items-center justify-center mb-6">
              <Heart className="w-10 h-10 md:w-12 md:h-12 text-rose-300" />
            </div>
            <h2 className="text-xl md:text-2xl font-serif text-stone-700 mb-3">
              还没有收藏的名字
            </h2>
            <p className="text-sm md:text-base text-stone-500 mb-6 text-center max-w-md">
              在名字卡片上点击爱心图标，即可收藏喜欢的名字
            </p>
            <Button
              onClick={() => navigate("/")}
              className="!text-white !bg-gradient-to-r !from-slate-700 !to-indigo-800 hover:!brightness-110 shadow-lg shadow-indigo-100 transition-all hover:scale-[1.05] active:scale-[0.95] border-none"
            >
              <Sparkles className="mr-2 h-4 w-4" />
              开始取名
            </Button>
          </div>
        ) : (
          <>
            {/* Names Tabs */}
            <Tabs defaultValue="boy" className="w-full">
              <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-6 md:mb-8 h-11 md:h-12 bg-white/80 backdrop-blur-sm">
                <TabsTrigger
                  value="boy"
                  className="text-sm md:text-base data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-400 data-[state=active]:to-cyan-400 data-[state=active]:text-white"
                >
                  男宝名字 ({boyFavorites.length})
                </TabsTrigger>
                <TabsTrigger
                  value="girl"
                  className="text-sm md:text-base data-[state=active]:bg-gradient-to-r data-[state=active]:from-rose-400 data-[state=active]:to-pink-400 data-[state=active]:text-white"
                >
                  女宝名字 ({girlFavorites.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="boy" className="space-y-3 md:space-y-4">
                {boyFavorites.length === 0 ? (
                  <div className="text-center py-12 text-stone-500">
                    还没有收藏男宝名字
                  </div>
                ) : (
                  boyFavorites.map((name, index) => (
                    <NameCard 
                      key={`${name.chineseName}-${index}`} 
                      name={name} 
                      gender="boy" 
                      index={index} 
                      showDeleteButton={true}
                      onDelete={() => handleDeleteFavorite(name.chineseName, 'boy')} 
                    />
                  ))
                )}
              </TabsContent>

              <TabsContent value="girl" className="space-y-3 md:space-y-4">
                {girlFavorites.length === 0 ? (
                  <div className="text-center py-12 text-stone-500">
                    还没有收藏女宝名字
                  </div>
                ) : (
                  girlFavorites.map((name, index) => (
                    <NameCard 
                      key={`${name.chineseName}-${index}`} 
                      name={name} 
                      gender="girl" 
                      index={index} 
                      showDeleteButton={true}
                      onDelete={() => handleDeleteFavorite(name.chineseName, 'girl')} 
                    />
                  ))
                )}
              </TabsContent>
            </Tabs>
          </>
        )}

        <Footer />
      </div>
    </div>
  );
}