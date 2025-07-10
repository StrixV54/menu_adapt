import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { DishAPI } from '../lib/api';
import type { IDish } from '../lib/type';
import { StorageService } from '../lib/storage';

const DishSuggester: React.FC = () => {
    const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);
    const [availableIngredients, setAvailableIngredients] = useState<string[]>([]);
    const [ingredientSearch, setIngredientSearch] = useState('');

    // Fetch all dishes to extract unique ingredients
    const { data: allDishes = [], isLoading: isDishesLoading } = useQuery({
        queryKey: ['dishes'],
        queryFn: DishAPI.getAllDishes,
        staleTime: 10 * 60 * 1000, // 10 minutes
    });

    // Extract unique ingredients from all dishes
    useEffect(() => {
        if (allDishes.length > 0) {
            const ingredientsSet = new Set<string>();
            allDishes.forEach(dish => {
                dish.ingredients.forEach(ingredient => {
                    ingredientsSet.add(ingredient);
                });
            });
            setAvailableIngredients(Array.from(ingredientsSet).sort());
        }
    }, [allDishes]);

    // Fetch suggested dishes based on selected ingredients
    const { data: suggestedDishes = [], isLoading: isSuggestionsLoading } = useQuery({
        queryKey: ['suggestedDishes', selectedIngredients],
        queryFn: () => DishAPI.getDishesByIngredients(selectedIngredients),
        enabled: selectedIngredients.length > 0,
        staleTime: 5 * 60 * 1000, // 5 minutes
    });

    // Load selected ingredients from storage on component mount
    useEffect(() => {
        const saved = StorageService.loadSelectedIngredients();
        if (saved.length > 0) {
            setSelectedIngredients(saved);
        }
    }, []);

    // Save selected ingredients to storage whenever they change
    useEffect(() => {
        StorageService.saveSelectedIngredients(selectedIngredients);
    }, [selectedIngredients]);

    const addIngredient = (ingredient: string) => {
        if (!selectedIngredients.includes(ingredient)) {
            setSelectedIngredients(prev => [...prev, ingredient]);
            setIngredientSearch('');
        }
    };

    const removeIngredient = (ingredient: string) => {
        setSelectedIngredients(prev => prev.filter(ing => ing !== ingredient));
    };

    const clearAllIngredients = () => {
        setSelectedIngredients([]);
    };

    // Filter available ingredients based on search
    const filteredIngredients = availableIngredients.filter(ingredient =>
        ingredient.toLowerCase().includes(ingredientSearch.toLowerCase()) &&
        !selectedIngredients.includes(ingredient)
    );

    // Group suggested dishes by how many of the selected ingredients they use
    const groupedSuggestions = suggestedDishes.reduce((groups, dish) => {
        const matchingIngredients = dish.ingredients.filter(ingredient =>
            selectedIngredients.some(selected =>
                ingredient.toLowerCase().includes(selected.toLowerCase()) ||
                selected.toLowerCase().includes(ingredient.toLowerCase())
            )
        );

        const matchCount = matchingIngredients.length;
        if (!groups[matchCount]) {
            groups[matchCount] = [];
        }
        groups[matchCount].push({ dish, matchingIngredients });
        return groups;
    }, {} as Record<number, Array<{ dish: IDish; matchingIngredients: string[] }>>);

    const formatTime = (minutes: number | null): string => {
        if (!minutes) return 'Not specified';
        if (minutes < 60) return `${minutes} min`;
        const hours = Math.floor(minutes / 60);
        const remainingMinutes = minutes % 60;
        return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
    };

    if (isDishesLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-gray-600">Loading ingredient database...</span>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Ingredient Selection */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Your Available Ingredients</h3>

                {/* Search Bar */}
                <div className="mb-4">
                    <div className="relative">
                        <input
                            type="text"
                            value={ingredientSearch}
                            onChange={(e) => setIngredientSearch(e.target.value)}
                            placeholder="Search for ingredients..."
                            className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                        />
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                    </div>
                </div>

                {/* Selected Ingredients */}
                {selectedIngredients.length > 0 && (
                    <div className="mb-4">
                        <div className="flex items-center justify-between mb-2">
                            <h4 className="text-sm font-medium text-gray-700">
                                Selected Ingredients ({selectedIngredients.length})
                            </h4>
                            <button
                                onClick={clearAllIngredients}
                                className="text-sm text-red-600 hover:text-red-800"
                            >
                                Clear All
                            </button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {selectedIngredients.map(ingredient => (
                                <div
                                    key={ingredient}
                                    className="flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                                >
                                    <span>{ingredient}</span>
                                    <button
                                        onClick={() => removeIngredient(ingredient)}
                                        className="ml-2 text-blue-600 hover:text-blue-800"
                                    >
                                        ×
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Available Ingredients */}
                {ingredientSearch && (
                    <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Available Ingredients</h4>
                        <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-lg">
                            {filteredIngredients.length > 0 ? (
                                <div className="p-2">
                                    {filteredIngredients.slice(0, 20).map(ingredient => (
                                        <button
                                            key={ingredient}
                                            onClick={() => addIngredient(ingredient)}
                                            className="block w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded"
                                        >
                                            {ingredient}
                                        </button>
                                    ))}
                                    {filteredIngredients.length > 20 && (
                                        <div className="px-3 py-2 text-sm text-gray-500">
                                            ... and {filteredIngredients.length - 20} more
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="p-4 text-sm text-gray-500 text-center">
                                    No ingredients found matching "{ingredientSearch}"
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Quick Add Common Ingredients */}
                <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Common Ingredients</h4>
                    <div className="flex flex-wrap gap-2">
                        {['rice', 'wheat flour', 'onion', 'tomato', 'ginger', 'garlic', 'salt', 'oil', 'sugar', 'milk', 'ghee', 'cumin seeds'].map(ingredient => (
                            <button
                                key={ingredient}
                                onClick={() => addIngredient(ingredient)}
                                disabled={selectedIngredients.includes(ingredient)}
                                className={`px-3 py-1 text-sm rounded-md border ${
                                    selectedIngredients.includes(ingredient)
                                        ? 'bg-gray-100 text-gray-400 border-gray-300 cursor-not-allowed'
                                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                }`}
                            >
                                {ingredient}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Suggested Dishes */}
            {selectedIngredients.length > 0 && (
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">
                            Suggested Dishes
                        </h3>
                        {isSuggestionsLoading && (
                            <div className="flex items-center">
                                <div className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full mr-2"></div>
                                <span className="text-sm text-gray-600">Finding dishes...</span>
                            </div>
                        )}
                    </div>

                    {!isSuggestionsLoading && suggestedDishes.length === 0 && (
                        <div className="text-center py-8">
                            <div className="text-gray-400 text-6xl mb-4">🤔</div>
                            <h4 className="text-lg font-medium text-gray-900 mb-2">No dishes found</h4>
                            <p className="text-gray-600">
                                Try adding more common ingredients or different combinations.
                            </p>
                        </div>
                    )}

                    {!isSuggestionsLoading && suggestedDishes.length > 0 && (
                        <div className="space-y-6">
                            {Object.keys(groupedSuggestions)
                                .map(Number)
                                .sort((a, b) => b - a) // Sort by match count descending
                                .map(matchCount => (
                                    <div key={matchCount}>
                                        <h4 className="text-md font-semibold text-gray-800 mb-3">
                                            {matchCount === 1
                                                ? `Dishes using 1 of your ingredients (${groupedSuggestions[matchCount].length})`
                                                : `Dishes using ${matchCount} of your ingredients (${groupedSuggestions[matchCount].length})`
                                            }
                                        </h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {groupedSuggestions[matchCount].map(({ dish, matchingIngredients }, index) => (
                                                <div
                                                    key={`${dish.name}-${index}`}
                                                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                                                >
                                                    <div className="flex items-start justify-between mb-2">
                                                        <Link
                                                            to={`/dish/${encodeURIComponent(dish.name)}`}
                                                            className="text-lg font-medium text-blue-600 hover:text-blue-800 hover:underline"
                                                        >
                                                            {dish.name}
                                                        </Link>
                                                        <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                                                            dish.diet === 'vegetarian'
                                                                ? 'bg-green-100 text-green-800'
                                                                : 'bg-red-100 text-red-800'
                                                        }`}>
                                                            {dish.diet === 'vegetarian' ? 'Veg' : 'Non-Veg'}
                                                        </span>
                                                    </div>

                                                    <div className="text-sm text-gray-600 mb-3">
                                                        <span className="capitalize">{dish.course}</span>
                                                        {dish.flavor_profile && (
                                                            <span> • <span className="capitalize">{dish.flavor_profile}</span></span>
                                                        )}
                                                    </div>

                                                    <div className="mb-3">
                                                        <div className="text-sm font-medium text-gray-700 mb-1">
                                                            Matching ingredients:
                                                        </div>
                                                        <div className="flex flex-wrap gap-1">
                                                            {matchingIngredients.map((ingredient, idx) => (
                                                                <span
                                                                    key={idx}
                                                                    className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs"
                                                                >
                                                                    {ingredient}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>

                                                    <div className="mb-3">
                                                        <div className="text-sm font-medium text-gray-700 mb-1">
                                                            Additional ingredients needed:
                                                        </div>
                                                        <div className="flex flex-wrap gap-1">
                                                            {dish.ingredients
                                                                .filter(ingredient =>
                                                                    !selectedIngredients.some(selected =>
                                                                        ingredient.toLowerCase().includes(selected.toLowerCase()) ||
                                                                        selected.toLowerCase().includes(ingredient.toLowerCase())
                                                                    )
                                                                )
                                                                .slice(0, 5)
                                                                .map((ingredient, idx) => (
                                                                    <span
                                                                        key={idx}
                                                                        className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
                                                                    >
                                                                        {ingredient}
                                                                    </span>
                                                                ))
                                                            }
                                                            {dish.ingredients.length - matchingIngredients.length > 5 && (
                                                                <span className="px-2 py-1 bg-gray-200 text-gray-600 rounded text-xs">
                                                                    +{dish.ingredients.length - matchingIngredients.length - 5} more
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center justify-between text-sm text-gray-600">
                                                        <span>
                                                            Prep: {formatTime(dish.prep_time)}
                                                        </span>
                                                        <span>
                                                            Cook: {formatTime(dish.cook_time)}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))
                            }
                        </div>
                    )}
                </div>
            )}

            {selectedIngredients.length === 0 && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
                    <div className="text-gray-400 text-6xl mb-4">🥘</div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Start selecting ingredients</h3>
                    <p className="text-gray-600">
                        Choose the ingredients you have available, and we'll suggest delicious dishes you can make with them.
                    </p>
                </div>
            )}
        </div>
    );
};

export default DishSuggester;
