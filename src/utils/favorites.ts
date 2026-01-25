// Favorites management using localStorage

export interface FavoriteName {
  chineseName: string;
  pinyin: string;
  englishName: string;
  explanation: string;
  gender: 'boy' | 'girl';
  addedAt: number; // timestamp
}

const FAVORITES_KEY = 'baby-names-favorites';

// Get all favorites
export function getFavorites(): FavoriteName[] {
  try {
    const data = localStorage.getItem(FAVORITES_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error reading favorites:', error);
    return [];
  }
}

// Add to favorites
export function addFavorite(name: Omit<FavoriteName, 'addedAt'>): void {
  try {
    const favorites = getFavorites();
    
    // Check if already exists
    const exists = favorites.some(
      fav => fav.chineseName === name.chineseName && fav.gender === name.gender
    );
    
    if (!exists) {
      favorites.push({
        ...name,
        addedAt: Date.now(),
      });
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
    }
  } catch (error) {
    console.error('Error adding favorite:', error);
  }
}

// Remove from favorites
export function removeFavorite(chineseName: string, gender: 'boy' | 'girl'): void {
  try {
    const favorites = getFavorites();
    const filtered = favorites.filter(
      fav => !(fav.chineseName === chineseName && fav.gender === gender)
    );
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('Error removing favorite:', error);
  }
}

// Check if a name is favorited
export function isFavorite(chineseName: string, gender: 'boy' | 'girl'): boolean {
  try {
    const favorites = getFavorites();
    return favorites.some(
      fav => fav.chineseName === chineseName && fav.gender === gender
    );
  } catch (error) {
    console.error('Error checking favorite:', error);
    return false;
  }
}

// Get favorites by gender
export function getFavoritesByGender(gender: 'boy' | 'girl'): FavoriteName[] {
  const favorites = getFavorites();
  return favorites.filter(fav => fav.gender === gender);
}

// Clear all favorites
export function clearFavorites(): void {
  try {
    localStorage.removeItem(FAVORITES_KEY);
  } catch (error) {
    console.error('Error clearing favorites:', error);
  }
}
