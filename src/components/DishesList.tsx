import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { DishAPI } from '../lib/api';
import type { IDish, ISortConfig, IFilterConfig } from '../lib/type';

const DishesList: React.FC = () => {
    // State management
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(20);
    const [sortConfig, setSortConfig] = useState<ISortConfig>({ field: 'name', direction: 'asc' });
    const [filters, setFilters] = useState<IFilterConfig>({});
    const [showFilters, setShowFilters] = useState(false);

    // Fetch dishes data
    const { data: allDishes = [], isLoading, error } = useQuery({
        queryKey: ['dishes'],
        queryFn: DishAPI.getAllDishes,
        staleTime: 10 * 60 * 1000, // 10 minutes
    });

    // Fetch filter options
    const { data: filterOptions } = useQuery({
        queryKey: ['filterOptions'],
        queryFn: DishAPI.getFilterOptions,
        staleTime: 30 * 60 * 1000, // 30 minutes
    });

    // Apply filters and sorting
    const filteredAndSortedDishes = useMemo(() => {
        let result = [...allDishes];

        // Apply filters
        if (filters.diet) {
            result = result.filter(dish => dish.diet === filters.diet);
        }
        if (filters.flavor_profile) {
            result = result.filter(dish => dish.flavor_profile === filters.flavor_profile);
        }
        if (filters.course) {
            result = result.filter(dish => dish.course === filters.course);
        }
        if (filters.state) {
            result = result.filter(dish => dish.state === filters.state);
        }
        if (filters.region) {
            result = result.filter(dish => dish.region === filters.region);
        }
        if (filters.ingredients && filters.ingredients.length > 0) {
            result = result.filter(dish =>
                filters.ingredients!.some(ingredient =>
                    dish.ingredients.some(dishIngredient =>
                        dishIngredient.toLowerCase().includes(ingredient.toLowerCase())
                    )
                )
            );
        }
        if (filters.prep_time) {
            result = result.filter(dish =>
                dish.prep_time !== null &&
                dish.prep_time >= filters.prep_time!.min &&
                dish.prep_time <= filters.prep_time!.max
            );
        }
        if (filters.cook_time) {
            result = result.filter(dish =>
                dish.cook_time !== null &&
                dish.cook_time >= filters.cook_time!.min &&
                dish.cook_time <= filters.cook_time!.max
            );
        }

        // Apply sorting
        result.sort((a, b) => {
            const aValue = a[sortConfig.field];
            const bValue = b[sortConfig.field];

            if (aValue === null && bValue === null) return 0;
            if (aValue === null) return sortConfig.direction === 'asc' ? 1 : -1;
            if (bValue === null) return sortConfig.direction === 'asc' ? -1 : 1;

            let comparison = 0;
            if (typeof aValue === 'string' && typeof bValue === 'string') {
                comparison = aValue.localeCompare(bValue);
            } else if (typeof aValue === 'number' && typeof bValue === 'number') {
                comparison = aValue - bValue;
            } else if (Array.isArray(aValue) && Array.isArray(bValue)) {
                comparison = aValue.length - bValue.length;
            }

            return sortConfig.direction === 'asc' ? comparison : -comparison;
        });

        return result;
    }, [allDishes, filters, sortConfig]);

    // Pagination
    const totalPages = Math.ceil(filteredAndSortedDishes.length / pageSize);
    const paginatedDishes = useMemo(() => {
        const startIndex = (currentPage - 1) * pageSize;
        return filteredAndSortedDishes.slice(startIndex, startIndex + pageSize);
    }, [filteredAndSortedDishes, currentPage, pageSize]);

    // Reset to first page when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [filters]);

    const handleSort = (field: keyof IDish) => {
        if (field === sortConfig.field) {
            setSortConfig({
                field,
                direction: sortConfig.direction === 'asc' ? 'desc' : 'asc'
            });
        } else {
            setSortConfig({ field, direction: 'asc' });
        }
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleFilterChange = (key: keyof IFilterConfig, value: any) => {
        setFilters(prev => ({
            ...prev,
            [key]: value
        }));
    };

    const clearFilters = () => {
        setFilters({});
    };

    const formatTime = (minutes: number | null): string => {
        if (!minutes) return '-';
        if (minutes < 60) return `${minutes}m`;
        const hours = Math.floor(minutes / 60);
        const remainingMinutes = minutes % 60;
        return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
    };

    const getSortIcon = (field: keyof IDish) => {
        if (sortConfig.field !== field) {
            return <span className="text-gray-400">↕</span>;
        }
        return sortConfig.direction === 'asc' ? '↑' : '↓';
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-gray-600">Loading dishes...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <h3 className="text-lg font-semibold text-red-800 mb-2">Error Loading Dishes</h3>
                <p className="text-red-600">
                    {error instanceof Error ? error.message : 'An unexpected error occurred'}
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Filters Section */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Filters & Sorting</h3>
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
                        >
                            {showFilters ? 'Hide Filters' : 'Show Filters'}
                        </button>
                        {Object.keys(filters).length > 0 && (
                            <button
                                onClick={clearFilters}
                                className="px-3 py-1 text-sm bg-gray-600 text-white rounded-md hover:bg-gray-700"
                            >
                                Clear All
                            </button>
                        )}
                    </div>
                </div>

                {showFilters && filterOptions && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {/* Diet Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Diet Type</label>
                            <select
                                value={filters.diet || ''}
                                onChange={(e) => handleFilterChange('diet', e.target.value || undefined)}
                                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                            >
                                <option value="">All</option>
                                {filterOptions.diets.map(diet => (
                                    <option key={diet} value={diet}>{diet}</option>
                                ))}
                            </select>
                        </div>

                        {/* Flavor Profile Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Flavor Profile</label>
                            <select
                                value={filters.flavor_profile || ''}
                                onChange={(e) => handleFilterChange('flavor_profile', e.target.value || undefined)}
                                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                            >
                                <option value="">All</option>
                                {filterOptions.flavor_profiles.map(flavor => (
                                    <option key={flavor} value={flavor}>{flavor}</option>
                                ))}
                            </select>
                        </div>

                        {/* Course Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Course</label>
                            <select
                                value={filters.course || ''}
                                onChange={(e) => handleFilterChange('course', e.target.value || undefined)}
                                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                            >
                                <option value="">All</option>
                                {filterOptions.courses.map(course => (
                                    <option key={course} value={course}>{course}</option>
                                ))}
                            </select>
                        </div>

                        {/* State Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                            <select
                                value={filters.state || ''}
                                onChange={(e) => handleFilterChange('state', e.target.value || undefined)}
                                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                            >
                                <option value="">All</option>
                                {filterOptions.states.map(state => (
                                    <option key={state} value={state}>{state}</option>
                                ))}
                            </select>
                        </div>

                        {/* Region Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Region</label>
                            <select
                                value={filters.region || ''}
                                onChange={(e) => handleFilterChange('region', e.target.value || undefined)}
                                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                            >
                                <option value="">All</option>
                                {filterOptions.regions.map(region => (
                                    <option key={region} value={region}>{region}</option>
                                ))}
                            </select>
                        </div>

                        {/* Page Size */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Items per page</label>
                            <select
                                value={pageSize}
                                onChange={(e) => {
                                    setPageSize(Number(e.target.value));
                                    setCurrentPage(1);
                                }}
                                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                            >
                                <option value={10}>10</option>
                                <option value={20}>20</option>
                                <option value={50}>50</option>
                                <option value={100}>100</option>
                            </select>
                        </div>
                    </div>
                )}

                {/* Results Summary */}
                <div className="mt-4 text-sm text-gray-600">
                    Showing {filteredAndSortedDishes.length} of {allDishes.length} dishes
                    {Object.keys(filters).length > 0 && ' (filtered)'}
                </div>
            </div>

            {/* Table */}
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th
                                    onClick={() => handleSort('name')}
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                >
                                    <div className="flex items-center">
                                        Dish Name {getSortIcon('name')}
                                    </div>
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Diet
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Course
                                </th>
                                <th
                                    onClick={() => handleSort('prep_time')}
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                >
                                    <div className="flex items-center">
                                        Prep Time {getSortIcon('prep_time')}
                                    </div>
                                </th>
                                <th
                                    onClick={() => handleSort('cook_time')}
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                >
                                    <div className="flex items-center">
                                        Cook Time {getSortIcon('cook_time')}
                                    </div>
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Flavor
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Origin
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Ingredients
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {paginatedDishes.map((dish, index) => (
                                <tr key={`${dish.name}-${index}`} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <Link
                                            to={`/dish/${encodeURIComponent(dish.name)}`}
                                            className="text-blue-600 hover:text-blue-800 font-medium hover:underline"
                                        >
                                            {dish.name}
                                        </Link>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                                            dish.diet === 'vegetarian'
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-red-100 text-red-800'
                                        }`}>
                                            {dish.diet === 'vegetarian' ? 'Veg' : 'Non-Veg'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">
                                        {dish.course}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {formatTime(dish.prep_time)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {formatTime(dish.cook_time)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">
                                        {dish.flavor_profile || '-'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {dish.state || '-'}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-900">
                                        <div className="flex flex-wrap gap-1">
                                            {dish.ingredients.slice(0, 3).map((ingredient, idx) => (
                                                <span
                                                    key={idx}
                                                    className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
                                                >
                                                    {ingredient}
                                                </span>
                                            ))}
                                            {dish.ingredients.length > 3 && (
                                                <span className="px-2 py-1 bg-gray-200 text-gray-600 rounded text-xs">
                                                    +{dish.ingredients.length - 3} more
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200">
                        <div className="flex-1 flex justify-between sm:hidden">
                            <button
                                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                                disabled={currentPage === 1}
                                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                            >
                                Previous
                            </button>
                            <button
                                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                                disabled={currentPage === totalPages}
                                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                            >
                                Next
                            </button>
                        </div>
                        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                            <div>
                                <p className="text-sm text-gray-700">
                                    Showing {(currentPage - 1) * pageSize + 1} to{' '}
                                    {Math.min(currentPage * pageSize, filteredAndSortedDishes.length)} of{' '}
                                    {filteredAndSortedDishes.length} results
                                </p>
                            </div>
                            <div>
                                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                                    <button
                                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                                        disabled={currentPage === 1}
                                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                                    >
                                        ←
                                    </button>

                                    {/* Page numbers */}
                                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                        let pageNum;
                                        if (totalPages <= 5) {
                                            pageNum = i + 1;
                                        } else if (currentPage <= 3) {
                                            pageNum = i + 1;
                                        } else if (currentPage >= totalPages - 2) {
                                            pageNum = totalPages - 4 + i;
                                        } else {
                                            pageNum = currentPage - 2 + i;
                                        }

                                        return (
                                            <button
                                                key={pageNum}
                                                onClick={() => setCurrentPage(pageNum)}
                                                className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                                    currentPage === pageNum
                                                        ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                                                        : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                                                }`}
                                            >
                                                {pageNum}
                                            </button>
                                        );
                                    })}

                                    <button
                                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                                        disabled={currentPage === totalPages}
                                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                                    >
                                        →
                                    </button>
                                </nav>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DishesList;
