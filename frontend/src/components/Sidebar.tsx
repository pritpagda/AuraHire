import React from 'react';
import {NavLink} from 'react-router-dom';
import {Edit, FileText, Home, ListChecks, Moon, Sun} from 'lucide-react';

const navItems = [{to: "/dashboard", icon: Home, label: "Dashboard"}, {
    to: "/applications", icon: ListChecks, label: "Applications"
}, {to: "/resumes", icon: FileText, label: "Resumes"}, {to: "/cover-letters", icon: Edit, label: "Cover Letter"},

];

const Sidebar: React.FC = () => {
    const [darkMode, setDarkMode] = React.useState(() => localStorage.getItem('theme') === 'dark');

    React.useEffect(() => {
        const html = document.documentElement;
        if (darkMode) {
            html.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            html.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    }, [darkMode]);

    return (<aside
        className="flex flex-col w-64 h-screen bg-white/60 dark:bg-gray-900/60 backdrop-blur-lg border-r border-gray-200 dark:border-gray-800 shadow-2xl rounded-tr-3xl rounded-br-3xl overflow-hidden transition-all duration-300">
        <div className="p-6 border-b border-gray-200 dark:border-gray-800">
            <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-500 dark:from-purple-400 dark:to-pink-500 tracking-tight">
                AuraHire
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Design your future</p>
        </div>

        <nav className="flex flex-col flex-grow p-4 space-y-2">
            {navItems.map(({to, icon: Icon, label}) => (<NavLink
                key={to}
                to={to}
                className={({isActive}) => `flex items-center gap-3 p-3 rounded-xl transition-all duration-300 ease-in-out group
              ${isActive ? 'bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 dark:from-blue-700 dark:to-purple-700 dark:text-white font-semibold shadow-md' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:shadow-sm'}`}
            >
                <Icon className="w-5 h-5 group-hover:scale-110 transition-transform duration-200"/>
                <span className="text-base">{label}</span>
            </NavLink>))}
        </nav>

        <div className="p-4 border-t border-gray-200 dark:border-gray-800">
            <button
                onClick={() => setDarkMode(prev => !prev)}
                className="flex items-center justify-center w-full p-3 rounded-xl border border-gray-300 dark:border-gray-600
                     bg-white/30 dark:bg-gray-700/30 backdrop-blur-md transition-all duration-300 hover:shadow-lg"
                aria-label="Toggle dark mode"
            >
                {darkMode ? (<Sun className="w-5 h-5 mr-3 text-yellow-500"/>) : (
                    <Moon className="w-5 h-5 mr-3 text-purple-600"/>)}
                <span className="text-base font-medium">{darkMode ? 'Light Mode' : 'Dark Mode'}</span>
            </button>
        </div>
    </aside>);
};

export default Sidebar;
