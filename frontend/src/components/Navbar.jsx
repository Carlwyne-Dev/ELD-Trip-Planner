import React from 'react';
import { useDarkMode } from '../hooks/useDarkMode';
import { Moon, Sun, Truck } from 'lucide-react';

export default function Navbar() {
    const { isDark, toggle } = useDarkMode();

    return (
        <nav className="sticky top-0 z-50 backdrop-blur-md bg-white/70 dark:bg-asphalt/70 border-b border-gray-200 dark:border-faded-line/30 transition-all duration-300">
            <div className="max-w-7xl mx-auto px-4 lg:px-8">
                <div className="flex justify-between items-center h-20">
                    <div className="flex items-center space-x-3 group cursor-pointer">
                        <div className="bg-gradient-to-br from-amber to-orange-500 p-2 rounded-xl shadow-lg transform group-hover:scale-105 transition-transform duration-300">
                            <Truck className="w-6 h-6 text-white" />
                        </div>
                        <h1 className="font-display text-3xl tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-slate to-gray-600 dark:from-fog-white dark:to-gray-300">
                            ELD PLANNER
                        </h1>
                    </div>
                    <button
                        onClick={toggle}
                        className="p-3 rounded-xl bg-white dark:bg-road-gray shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300 border border-gray-100 dark:border-gray-800"
                        aria-label="Toggle dark mode"
                    >
                        {isDark ? <Sun className="w-5 h-5 text-amber" /> : <Moon className="w-5 h-5 text-slate" />}
                    </button>
                </div>
            </div>
        </nav>
    );
}
