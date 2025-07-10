// Dish data structure matching backend schema
export interface IDish {
    id?: number;
    name: string;
    ingredients: string[];
    diet: 'vegetarian' | 'non vegetarian';
    prep_time: number | null;
    cook_time: number | null;
    flavor_profile: 'sweet' | 'spicy' | 'bitter' | 'sour' | null;
    course: 'main course' | 'dessert' | 'snack' | 'starter';
    state: string | null;
    region: 'North' | 'South' | 'East' | 'West' | 'North East' | 'Central' | null;
    created_at?: string;
    updated_at?: string;
}

// API Response types
export interface IApiResponse<T> {
    success: boolean;
    message?: string;
    count?: number;
    data: T;
    error?: string;
}

export interface IDishSearchQuery {
    name?: string;
    ingredients?: string[];
    diet?: 'vegetarian' | 'non vegetarian';
    flavor_profile?: 'sweet' | 'spicy' | 'bitter' | 'sour';
    course?: 'main course' | 'dessert' | 'snack' | 'starter';
    state?: string;
    region?: 'North' | 'South' | 'East' | 'West' | 'North East' | 'Central';
    prep_time?: {
        gte?: number;
        lte?: number;
    };
    cook_time?: {
        gte?: number;
        lte?: number;
    };
}

export interface IIngredientsQuery {
    available_ingredients: string[];
}

export interface IFilterOptions {
    diets: string[];
    flavor_profiles: string[];
    courses: string[];
    states: string[];
    regions: string[];
    ingredients: string[];
}

// Component Props types
export interface IPaginationData {
    page: number;
    pageSize: number;
    total: number;
}

export interface ISortConfig {
    field: keyof IDish;
    direction: 'asc' | 'desc';
}

export interface IFilterConfig {
    diet?: string;
    flavor_profile?: string;
    course?: string;
    state?: string;
    region?: string;
    ingredients?: string[];
    prep_time?: { min: number; max: number };
    cook_time?: { min: number; max: number };
}

// Search suggestion types
export interface ISearchSuggestion {
    type: 'dish' | 'ingredient' | 'location';
    value: string;
    dish?: IDish;
}

// User state for browser storage
export interface IUserState {
    selectedIngredients: string[];
    recentSearches: string[];
    favoriteFilters: IFilterConfig[];
    theme?: 'light' | 'dark';
}

// Auth types (for bonus feature)
export interface IUser {
    id: string;
    name: string;
    email: string;
    preferences?: IUserState;
}

export interface IAuthState {
    user: IUser | null;
    isAuthenticated: boolean;
    isLoading: boolean;
}
