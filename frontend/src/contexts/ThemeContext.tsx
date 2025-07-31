import React, {createContext, useEffect, useState} from 'react';

export const ThemeContext = createContext({
    theme: 'light', toggleTheme: () => {
    },
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({children}) => {
    const [theme, setTheme] = useState<'light' | 'dark'>('light');

    useEffect(() => {
        const stored = localStorage.getItem('theme');
        if (stored === 'dark') {
            setTheme('dark');
            document.documentElement.classList.add('dark');
        }
    }, []);

    const toggleTheme = () => {
        const nextTheme = theme === 'light' ? 'dark' : 'light';
        setTheme(nextTheme);
        localStorage.setItem('theme', nextTheme);
        document.documentElement.classList.toggle('dark');
    };

    return (<ThemeContext.Provider value={{theme, toggleTheme}}>
        {children}
    </ThemeContext.Provider>);
};
