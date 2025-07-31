import React from 'react';
import {BrowserRouter as Router, Navigate, Route, Routes} from 'react-router-dom';

import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import ResumeManager from './pages/ResumeManager';
import CoverLetter from './pages/CoverLetter';
import ApplicationTracker from './pages/ApplicationTracker';
import ThemeToggle from './components/ThemeToogle';
import ErrorBoundary from './components/ErrorBoundary';


const App: React.FC = () => {
    return (<Router>
        <div className="flex h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
            <Sidebar/>
            <main className="flex-1 overflow-y-auto p-4">
                <div className="flex justify-end mb-4">
                    <ThemeToggle/>
                </div>
                <ErrorBoundary>
                    <Routes>
                        <Route path="/" element={<Navigate to="/dashboard"/>}/>
                        <Route path="/dashboard" element={<Dashboard/>}/>
                        <Route path="/resumes" element={<ResumeManager/>}/>
                        <Route path="/cover-letters" element={<CoverLetter/>}/>
                        <Route path="/applications" element={<ApplicationTracker/>}/>
                        <Route path="*" element={<div className="text-red-500">404 - Page Not Found</div>}/>
                    </Routes>
                </ErrorBoundary>
            </main>
        </div>
    </Router>);
};

export default App;
