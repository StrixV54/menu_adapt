import React from 'react';
import type { IDish } from '../lib/type';

interface DishDetailsProps {
    dish: IDish;
}

const DishDetails: React.FC<DishDetailsProps> = ({ dish }) => {
    const formatTime = (minutes: number | null): string => {
        if (!minutes) return 'Not specified';
        if (minutes < 60) return `${minutes} min`;
        const hours = Math.floor(minutes / 60);
        const remainingMinutes = minutes % 60;
        return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
    };

    const getDietIcon = (diet: string): string => {
        return diet === 'vegetarian' ? '🥬' : '🍖';
    };

    const getFlavorIcon = (flavor: string | null): string => {
        switch (flavor) {
            case 'sweet': return '🍯';
            case 'spicy': return '🌶️';
            case 'bitter': return '🥬';
            case 'sour': return '🍋';
            default: return '🍽️';
        }
    };

    const getCourseIcon = (course: string): string => {
        switch (course) {
            case 'main course': return '🍽️';
            case 'dessert': return '🍰';
            case 'snack': return '🥨';
            case 'starter': return '🥗';
            default: return '🍴';
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-8 text-white">
                <h1 className="text-3xl font-bold mb-2">{dish.name}</h1>
                <div className="flex items-center space-x-4 text-blue-100">
                    <span className="flex items-center">
                        {getDietIcon(dish.diet)}
                        <span className="ml-2 capitalize">{dish.diet}</span>
                    </span>
                    <span className="flex items-center">
                        {getCourseIcon(dish.course)}
                        <span className="ml-2 capitalize">{dish.course}</span>
                    </span>
                    {dish.flavor_profile && (
                        <span className="flex items-center">
                            {getFlavorIcon(dish.flavor_profile)}
                            <span className="ml-2 capitalize">{dish.flavor_profile}</span>
                        </span>
                    )}
                </div>
            </div>

            <div className="p-6">
                {/* Main Details Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    {/* Left Column */}
                    <div className="space-y-6">
                        {/* Ingredients */}
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                                🥘 Ingredients
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {dish.ingredients.map((ingredient, index) => (
                                    <span
                                        key={index}
                                        className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium"
                                    >
                                        {ingredient}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Cooking Times */}
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                                ⏱️ Cooking Information
                            </h3>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <span className="text-gray-700 font-medium">Preparation Time</span>
                                    <span className="text-gray-900 font-semibold">
                                        {formatTime(dish.prep_time)}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <span className="text-gray-700 font-medium">Cooking Time</span>
                                    <span className="text-gray-900 font-semibold">
                                        {formatTime(dish.cook_time)}
                                    </span>
                                </div>
                                {dish.prep_time && dish.cook_time && (
                                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                                        <span className="text-blue-700 font-medium">Total Time</span>
                                        <span className="text-blue-900 font-bold">
                                            {formatTime(dish.prep_time + dish.cook_time)}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-6">
                        {/* Origin Information */}
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                                📍 Origin
                            </h3>
                            <div className="space-y-3">
                                {dish.state && (
                                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                        <span className="text-gray-700 font-medium">State</span>
                                        <span className="text-gray-900 font-semibold">{dish.state}</span>
                                    </div>
                                )}
                                {dish.region && (
                                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                        <span className="text-gray-700 font-medium">Region</span>
                                        <span className="text-gray-900 font-semibold">{dish.region}</span>
                                    </div>
                                )}
                                {!dish.state && !dish.region && (
                                    <div className="p-3 bg-gray-50 rounded-lg text-gray-500 text-center">
                                        Origin information not available
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Dish Categories */}
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                                🏷️ Categories
                            </h3>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <span className="text-gray-700 font-medium">Diet Type</span>
                                    <div className="flex items-center">
                                        <span className="mr-2">{getDietIcon(dish.diet)}</span>
                                        <span className="text-gray-900 font-semibold capitalize">
                                            {dish.diet}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <span className="text-gray-700 font-medium">Course</span>
                                    <div className="flex items-center">
                                        <span className="mr-2">{getCourseIcon(dish.course)}</span>
                                        <span className="text-gray-900 font-semibold capitalize">
                                            {dish.course}
                                        </span>
                                    </div>
                                </div>
                                {dish.flavor_profile && (
                                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                        <span className="text-gray-700 font-medium">Flavor Profile</span>
                                        <div className="flex items-center">
                                            <span className="mr-2">{getFlavorIcon(dish.flavor_profile)}</span>
                                            <span className="text-gray-900 font-semibold capitalize">
                                                {dish.flavor_profile}
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="border-t pt-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Overview</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center p-4 bg-blue-50 rounded-lg">
                            <div className="text-2xl font-bold text-blue-600">
                                {dish.ingredients.length}
                            </div>
                            <div className="text-sm text-blue-700">Ingredients</div>
                        </div>

                        <div className="text-center p-4 bg-green-50 rounded-lg">
                            <div className="text-2xl font-bold text-green-600">
                                {formatTime(dish.prep_time)}
                            </div>
                            <div className="text-sm text-green-700">Prep Time</div>
                        </div>

                        <div className="text-center p-4 bg-purple-50 rounded-lg">
                            <div className="text-2xl font-bold text-purple-600">
                                {formatTime(dish.cook_time)}
                            </div>
                            <div className="text-sm text-purple-700">Cook Time</div>
                        </div>

                        <div className="text-center p-4 bg-orange-50 rounded-lg">
                            <div className="text-2xl font-bold text-orange-600 capitalize">
                                {dish.diet === 'vegetarian' ? 'Veg' : 'Non-Veg'}
                            </div>
                            <div className="text-sm text-orange-700">Diet Type</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DishDetails;
