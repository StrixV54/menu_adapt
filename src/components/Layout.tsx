import React from 'react';
import Header from './Header';

interface LayoutProps {
    children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
    return (
        <div className="min-h-screen bg-gray-50">
            <Header />
            <main className="min-h-screen">
                {children}
            </main>
            <footer className="bg-white border-t border-gray-200 py-8 mt-12">
                <div className="container mx-auto px-4">
                    <div className="text-center text-gray-600">
                        <p>&copy; 2024 MenuAdapt. Built with React and TypeScript.</p>
                        <p className="text-sm mt-2">
                            Discover dishes based on available ingredients and explore culinary traditions.
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Layout;
