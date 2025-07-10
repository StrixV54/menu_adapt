import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import DishDetailsPage from './pages/DishDetailsPage';

// Create a query client for React Query
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: 2,
            refetchOnWindowFocus: false,
            staleTime: 5 * 60 * 1000, // 5 minutes
        },
    },
});

function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <Router>
                <Layout>
                    <Routes>
                        {/* Home page with dishes list and suggester */}
                        <Route path="/" element={<HomePage />} />

                        {/* Dish details page */}
                        <Route path="/dish/:dishName" element={<DishDetailsPage />} />

                        {/* Catch-all route for 404 */}
                        <Route path="*" element={
                            <div className="container mx-auto px-4 py-16 text-center">
                                <h1 className="text-4xl font-bold text-gray-900 mb-4">404 - Page Not Found</h1>
                                <p className="text-gray-600 mb-8">
                                    The page you're looking for doesn't exist.
                                </p>
                                <a
                                    href="/"
                                    className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                                >
                                    Go Home
                                </a>
                            </div>
                        } />
                    </Routes>
                </Layout>
            </Router>
        </QueryClientProvider>
    );
}

export default App;
