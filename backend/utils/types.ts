export interface IDish {
    name: string;
    ingredients: string[];
    diet: 'vegetarian' | 'non vegetarian';
    prep_time: number | null;
    cook_time: number | null;
    flavor_profile: 'sweet' | 'spicy' | 'bitter' | 'sour' | null;
    course: 'main course' | 'dessert' | 'snack' | 'starter';
    state: string | null;
    region: 'North' | 'South' | 'East' | 'West' | 'North East' | 'Central' | null;
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

// Keep auth interfaces for future use
export interface ILoginBody {
    name: string;
    email: string;
    password: string;
}

export interface ISignUpBody {
    name: string;
    username: string;
    email: string;
    password: string;
}
