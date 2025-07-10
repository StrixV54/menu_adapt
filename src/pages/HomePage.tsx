import React, { useState } from 'react';
import DishesList from '../components/DishesList';
import DishSuggester from '../components/DishSuggester';

const HomePage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'list' | 'suggester'>('list');

    return (
        <div className="container mx-auto px-4 py-6">
            {/* Tab Navigation */}
            <div className="mb-6">
                <div className="border-b border-gray-200">
                    <nav className="-mb-px flex space-x-8">
                        <button
                            onClick={() => setActiveTab('list')}
                            className={`py-2 px-1 border-b-2 font-medium text-sm ${
                                activeTab === 'list'
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                            All Dishes
                        </button>
                        <button
                            onClick={() => setActiveTab('suggester')}
                            className={`py-2 px-1 border-b-2 font-medium text-sm ${
                                activeTab === 'suggester'
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                            Dish Suggester
                        </button>
                    </nav>
                </div>
            </div>

            {/* Tab Content */}
            <div className="min-h-[500px]">
                {activeTab === 'list' && (
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-6">Explore Dishes</h1>
                        <p className="text-gray-600 mb-6">
                            Browse through our collection of dishes with advanced filtering and sorting options.
                        </p>
                        <DishesList />
                    </div>
                )}

                {activeTab === 'suggester' && (
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-6">Dish Suggester</h1>
                        <p className="text-gray-600 mb-6">
                            Select the ingredients you have available, and we'll suggest dishes you can make.
                        </p>
                        <DishSuggester />
                    </div>
                )}
            </div>
        </div>
    );
};

export default HomePage;
