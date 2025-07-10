import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { DishAPI } from '../lib/api';
import DishDetails from '../components/DishDetails';

const DishDetailsPage: React.FC = () => {
    const { dishName } = useParams<{ dishName: string }>();

    const { data: dish, isLoading, error } = useQuery({
        queryKey: ['dish', dishName],
        queryFn: () => dishName ? DishAPI.getDishByName(dishName) : null,
        enabled: !!dishName,
    });

    if (isLoading) {
        return (
            <div className="container mx-auto px-4 py-6">
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    <span className="ml-3 text-gray-600">Loading dish details...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto px-4 py-6">
                <div className="bg-red-50 border border-red-200 rounded-md p-4">
                    <h2 className="text-lg font-semibold text-red-800 mb-2">Error Loading Dish</h2>
                    <p className="text-red-600 mb-4">
                        {error instanceof Error ? error.message : 'An unexpected error occurred'}
                    </p>
                    <Link
                        to="/"
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                    >
                        ← Back to Home
                    </Link>
                </div>
            </div>
        );
    }

    if (!dish) {
        return (
            <div className="container mx-auto px-4 py-6">
                <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                    <h2 className="text-lg font-semibold text-yellow-800 mb-2">Dish Not Found</h2>
                    <p className="text-yellow-600 mb-4">
                        The dish "{dishName}" could not be found in our database.
                    </p>
                    <Link
                        to="/"
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                    >
                        ← Back to Home
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-6">
            {/* Navigation */}
            <div className="mb-6">
                <Link
                    to="/"
                    className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4"
                >
                    ← Back to All Dishes
                </Link>
            </div>

            {/* Dish Details Component */}
            <DishDetails dish={dish} />
        </div>
    );
};

export default DishDetailsPage;
