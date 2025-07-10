import axios from 'axios';
import type { IDish, IApiResponse, IDishSearchQuery, IIngredientsQuery, IFilterOptions } from './type';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

// Create axios instance with base configuration
const api = axios.create({
    baseURL: `${BACKEND_URL}/api`,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// API service class for dish-related requests
export class DishAPI {
    /**
     * Fetch all dishes
     */
    static async getAllDishes(): Promise<IDish[]> {
        const response = await api.get<IApiResponse<IDish[]>>('/dishes');
        return response.data.data;
    }

    /**
     * Get dish by name
     */
    static async getDishByName(name: string): Promise<IDish | null> {
        try {
            const response = await api.get<IApiResponse<IDish>>(`/dishes/${encodeURIComponent(name)}`);
            return response.data.data;
        } catch (error) {
            if (axios.isAxiosError(error) && error.response?.status === 404) {
                return null;
            }
            throw error;
        }
    }

    /**
     * Search dishes with filters
     */
    static async searchDishes(query: IDishSearchQuery): Promise<IDish[]> {
        const params = new URLSearchParams();

        // Add simple filters
        if (query.name) params.append('name', query.name);
        if (query.diet) params.append('diet', query.diet);
        if (query.flavor_profile) params.append('flavor_profile', query.flavor_profile);
        if (query.course) params.append('course', query.course);
        if (query.state) params.append('state', query.state);
        if (query.region) params.append('region', query.region);

        // Add ingredients as comma-separated
        if (query.ingredients && query.ingredients.length > 0) {
            params.append('ingredients', query.ingredients.join(','));
        }

        // Add time range filters using LHS brackets notation
        if (query.prep_time?.gte !== undefined) {
            params.append('prep_time[gte]', query.prep_time.gte.toString());
        }
        if (query.prep_time?.lte !== undefined) {
            params.append('prep_time[lte]', query.prep_time.lte.toString());
        }
        if (query.cook_time?.gte !== undefined) {
            params.append('cook_time[gte]', query.cook_time.gte.toString());
        }
        if (query.cook_time?.lte !== undefined) {
            params.append('cook_time[lte]', query.cook_time.lte.toString());
        }

        const response = await api.get<IApiResponse<IDish[]>>(`/dishes/search?${params.toString()}`);
        return response.data.data;
    }

    /**
     * Get dishes by available ingredients
     */
    static async getDishesByIngredients(ingredients: string[]): Promise<IDish[]> {
        const requestBody: IIngredientsQuery = {
            available_ingredients: ingredients
        };

        const response = await api.post<IApiResponse<IDish[]>>('/dishes/by-ingredients', requestBody);
        return response.data.data;
    }

    /**
     * Get filter options for dropdowns
     */
    static async getFilterOptions(): Promise<IFilterOptions> {
        const response = await api.get<IApiResponse<IFilterOptions>>('/dishes/filters');
        return response.data.data;
    }

    /**
     * Auto-suggest search - searches across dish names, ingredients, and origins
     */
    static async getSearchSuggestions(query: string, limit: number = 10): Promise<IDish[]> {
        if (!query.trim()) return [];

        // Use the search endpoint with the query as name to get suggestions
        const searchQuery: IDishSearchQuery = { name: query.trim() };
        const dishes = await this.searchDishes(searchQuery);

        // Also search by ingredients and state/region
        const ingredientMatches = await this.searchDishes({
            ingredients: [query.trim()]
        });

        const locationMatches = await this.searchDishes({
            state: query.trim()
        });

        // Combine results and remove duplicates
        const allMatches = [...dishes, ...ingredientMatches, ...locationMatches];
        const uniqueMatches = allMatches.filter((dish, index, self) =>
            index === self.findIndex(d => d.name === dish.name)
        );

        return uniqueMatches.slice(0, limit);
    }
}

// Export default axios instance for other requests
export default api;
