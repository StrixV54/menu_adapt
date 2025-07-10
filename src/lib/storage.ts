import type { IUserState, IFilterConfig } from './type';

const STORAGE_KEYS = {
    USER_STATE: 'menuadapt_user_state',
    SELECTED_INGREDIENTS: 'menuadapt_selected_ingredients',
    RECENT_SEARCHES: 'menuadapt_recent_searches',
    FAVORITE_FILTERS: 'menuadapt_favorite_filters',
    THEME: 'menuadapt_theme',
} as const;

/**
 * Browser storage utility for persisting user state
 */
export class StorageService {
    /**
     * Save complete user state to localStorage
     */
    static saveUserState(userState: IUserState): void {
        try {
            localStorage.setItem(STORAGE_KEYS.USER_STATE, JSON.stringify(userState));
        } catch (error) {
            console.warn('Failed to save user state to localStorage:', error);
        }
    }

    /**
     * Load complete user state from localStorage
     */
    static loadUserState(): IUserState | null {
        try {
            const stored = localStorage.getItem(STORAGE_KEYS.USER_STATE);
            if (stored) {
                return JSON.parse(stored);
            }
        } catch (error) {
            console.warn('Failed to load user state from localStorage:', error);
        }
        return null;
    }

    /**
     * Save selected ingredients for dish suggester
     */
    static saveSelectedIngredients(ingredients: string[]): void {
        try {
            localStorage.setItem(STORAGE_KEYS.SELECTED_INGREDIENTS, JSON.stringify(ingredients));
        } catch (error) {
            console.warn('Failed to save selected ingredients:', error);
        }
    }

    /**
     * Load selected ingredients for dish suggester
     */
    static loadSelectedIngredients(): string[] {
        try {
            const stored = localStorage.getItem(STORAGE_KEYS.SELECTED_INGREDIENTS);
            if (stored) {
                const parsed = JSON.parse(stored);
                return Array.isArray(parsed) ? parsed : [];
            }
        } catch (error) {
            console.warn('Failed to load selected ingredients:', error);
        }
        return [];
    }

    /**
     * Add a search term to recent searches
     */
    static addRecentSearch(searchTerm: string): void {
        try {
            const recentSearches = this.loadRecentSearches();
            // Remove if already exists to avoid duplicates
            const filteredSearches = recentSearches.filter(term => term !== searchTerm);
            // Add to beginning and limit to 10 items
            const updatedSearches = [searchTerm, ...filteredSearches].slice(0, 10);
            localStorage.setItem(STORAGE_KEYS.RECENT_SEARCHES, JSON.stringify(updatedSearches));
        } catch (error) {
            console.warn('Failed to save recent search:', error);
        }
    }

    /**
     * Load recent searches
     */
    static loadRecentSearches(): string[] {
        try {
            const stored = localStorage.getItem(STORAGE_KEYS.RECENT_SEARCHES);
            if (stored) {
                const parsed = JSON.parse(stored);
                return Array.isArray(parsed) ? parsed : [];
            }
        } catch (error) {
            console.warn('Failed to load recent searches:', error);
        }
        return [];
    }

    /**
     * Save a favorite filter configuration
     */
    static saveFavoriteFilter(name: string, filterConfig: IFilterConfig): void {
        try {
            const favorites = this.loadFavoriteFilters();
            const updated = [...favorites.filter(f => f.name !== name), { name, config: filterConfig }];
            localStorage.setItem(STORAGE_KEYS.FAVORITE_FILTERS, JSON.stringify(updated));
        } catch (error) {
            console.warn('Failed to save favorite filter:', error);
        }
    }

    /**
     * Load favorite filter configurations
     */
    static loadFavoriteFilters(): Array<{ name: string; config: IFilterConfig }> {
        try {
            const stored = localStorage.getItem(STORAGE_KEYS.FAVORITE_FILTERS);
            if (stored) {
                const parsed = JSON.parse(stored);
                return Array.isArray(parsed) ? parsed : [];
            }
        } catch (error) {
            console.warn('Failed to load favorite filters:', error);
        }
        return [];
    }

    /**
     * Save theme preference
     */
    static saveTheme(theme: 'light' | 'dark'): void {
        try {
            localStorage.setItem(STORAGE_KEYS.THEME, theme);
        } catch (error) {
            console.warn('Failed to save theme preference:', error);
        }
    }

    /**
     * Load theme preference
     */
    static loadTheme(): 'light' | 'dark' | null {
        try {
            const stored = localStorage.getItem(STORAGE_KEYS.THEME);
            return stored === 'light' || stored === 'dark' ? stored : null;
        } catch (error) {
            console.warn('Failed to load theme preference:', error);
        }
        return null;
    }

    /**
     * Clear all stored data (useful for logout or reset)
     */
    static clearAllData(): void {
        try {
            Object.values(STORAGE_KEYS).forEach(key => {
                localStorage.removeItem(key);
            });
        } catch (error) {
            console.warn('Failed to clear stored data:', error);
        }
    }

    /**
     * Get storage usage statistics
     */
    static getStorageStats(): { used: number; available: number; percentage: number } {
        try {
            let used = 0;
            for (const key of Object.values(STORAGE_KEYS)) {
                const item = localStorage.getItem(key);
                if (item) {
                    used += item.length;
                }
            }

            // Rough estimate of localStorage limit (5MB for most browsers)
            const available = 5 * 1024 * 1024; // 5MB in characters
            const percentage = (used / available) * 100;

            return { used, available, percentage };
        } catch (error) {
            console.warn('Failed to get storage stats:', error);
            return { used: 0, available: 0, percentage: 0 };
        }
    }
}
