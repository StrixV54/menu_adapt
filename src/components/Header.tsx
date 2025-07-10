import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { DishAPI } from '../lib/api';
import type { IDish } from '../lib/type';
import { StorageService } from '../lib/storage';

const Header: React.FC = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const searchRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();

    // Fetch search suggestions when user types
    const { data: suggestions = [], isLoading: isSuggestionsLoading } = useQuery({
        queryKey: ['suggestions', searchQuery],
        queryFn: () => DishAPI.getSearchSuggestions(searchQuery, 8),
        enabled: searchQuery.length >= 2,
        staleTime: 5 * 60 * 1000, // 5 minutes
    });

    // Handle clicks outside search to close suggestions
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setShowSuggestions(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Show suggestions when we have query and results
    useEffect(() => {
        if (searchQuery.length >= 2 && suggestions.length > 0) {
            setShowSuggestions(true);
        } else {
            setShowSuggestions(false);
        }
    }, [searchQuery, suggestions]);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearchQuery(value);
        setIsSearching(value.length >= 2);
    };

    const handleSuggestionClick = (dish: IDish) => {
        // Track recent search
        StorageService.addRecentSearch(dish.name);
        setSearchQuery('');
        setShowSuggestions(false);
        navigate(`/dish/${encodeURIComponent(dish.name)}`);
    };

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            // If we have exact matches, go to first one, otherwise search
            if (suggestions.length > 0) {
                const exactMatch = suggestions.find(dish =>
                    dish.name.toLowerCase() === searchQuery.toLowerCase()
                );
                if (exactMatch) {
                    navigate(`/dish/${encodeURIComponent(exactMatch.name)}`);
                } else {
                    navigate(`/dish/${encodeURIComponent(suggestions[0].name)}`);
                }
            }
            setSearchQuery('');
            setShowSuggestions(false);
        }
    };

    const getSuggestionType = (dish: IDish, query: string): string => {
        const lowerQuery = query.toLowerCase();
        if (dish.name.toLowerCase().includes(lowerQuery)) {
            return 'dish';
        } else if (dish.ingredients.some(ing => ing.toLowerCase().includes(lowerQuery))) {
            return 'ingredient';
        } else if (dish.state?.toLowerCase().includes(lowerQuery) ||
                   dish.region?.toLowerCase().includes(lowerQuery)) {
            return 'location';
        }
        return 'dish';
    };

    const highlightMatch = (text: string, query: string): React.ReactNode => {
        if (!query) return <span>{text}</span>;

        const lowerText = text.toLowerCase();
        const lowerQuery = query.toLowerCase();
        const index = lowerText.indexOf(lowerQuery);

        if (index === -1) return <span>{text}</span>;

        return (
            <span>
                {text.substring(0, index)}
                <span className="bg-yellow-200 font-semibold">
                    {text.substring(index, index + query.length)}
                </span>
                {text.substring(index + query.length)}
            </span>
        );
    };

    return (
        <header className="bg-white shadow-sm border-b">
            <div className="container mx-auto px-4 py-4">
                <div className="flex items-center justify-between">
                    {/* Logo/Title */}
                    <Link to="/" className="flex items-center space-x-2">
                        <div className="text-2xl font-bold text-blue-600">🍽️</div>
                        <div className="text-xl font-bold text-gray-900">MenuAdapt</div>
                    </Link>

                    {/* Search Box */}
                    <div className="flex-1 max-w-lg mx-8" ref={searchRef}>
                        <form onSubmit={handleSearchSubmit} className="relative">
                            <div className="relative">
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={handleSearchChange}
                                    onFocus={() => searchQuery.length >= 2 && setShowSuggestions(true)}
                                    placeholder="Search dishes, ingredients, or locations..."
                                    className="w-full px-4 py-2 pl-10 pr-4 text-gray-700 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:bg-white focus:border-blue-500"
                                />

                                {/* Search Icon */}
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </div>

                                {/* Loading Indicator */}
                                {isSearching && isSuggestionsLoading && (
                                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                                        <div className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                                    </div>
                                )}
                            </div>

                            {/* Search Suggestions */}
                            {showSuggestions && suggestions.length > 0 && (
                                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-96 overflow-y-auto">
                                    {suggestions.map((dish, index) => {
                                        const suggestionType = getSuggestionType(dish, searchQuery);
                                        return (
                                            <div
                                                key={`${dish.name}-${index}`}
                                                onClick={() => handleSuggestionClick(dish)}
                                                className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div className="flex-1">
                                                        <div className="font-medium text-gray-900">
                                                            {highlightMatch(dish.name, searchQuery)}
                                                        </div>
                                                        <div className="text-sm text-gray-500 mt-1">
                                                            {dish.course} • {dish.diet}
                                                            {dish.state && ` • ${dish.state}`}
                                                        </div>
                                                    </div>
                                                    <div className="ml-3">
                                                        <span className={`px-2 py-1 text-xs rounded-full ${
                                                            suggestionType === 'dish' ? 'bg-blue-100 text-blue-800' :
                                                            suggestionType === 'ingredient' ? 'bg-green-100 text-green-800' :
                                                            'bg-purple-100 text-purple-800'
                                                        }`}>
                                                            {suggestionType}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </form>
                    </div>

                    {/* Navigation Links */}
                    <nav className="flex items-center space-x-4">
                        <Link
                            to="/"
                            className="text-gray-700 hover:text-blue-600 font-medium"
                        >
                            Home
                        </Link>
                        <Link
                            to="/?tab=suggester"
                            className="text-gray-700 hover:text-blue-600 font-medium"
                        >
                            Suggest
                        </Link>
                    </nav>
                </div>
            </div>
        </header>
    );
};

export default Header;
