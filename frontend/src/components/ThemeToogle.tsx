import React, {useContext} from 'react';
import {ThemeContext} from '../contexts/ThemeContext';
import {Moon, Sun} from 'lucide-react';

const ThemeToggle: React.FC = () => {
    const {theme, toggleTheme} = useContext(ThemeContext);

    return (<button
        className="text-gray-500 hover:text-gray-900 dark:hover:text-white transition"
        onClick={toggleTheme}
        title="Toggle theme"
    >
        {theme === 'light' ? <Moon size={18}/> : <Sun size={18}/>}
    </button>);
};

export default ThemeToggle;
