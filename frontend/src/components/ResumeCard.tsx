import React, {useState} from 'react';
import api from '../utils/axios';
import {toast} from 'react-toastify';
import {ATSData, OptimizationData, Resume} from '../types/index';
import {AlertCircle, Bot, CheckCircle2, File, Search, Sparkles, Target, Zap} from 'lucide-react';

interface ResumeCardProps {
    resume: Resume;
}

const ResumeCard: React.FC<ResumeCardProps> = ({resume}) => {
    const [jobDescription, setJobDescription] = useState('');
    const [optimization, setOptimization] = useState<OptimizationData | null>(null);
    const [ats, setAts] = useState<ATSData | null>(null);
    const [loading, setLoading] = useState(false);

    const getColor = (score: number) => {
        if (score >= 80) return 'emerald';
        if (score >= 60) return 'amber';
        return 'red';
    };

    const analyzeResume = async () => {
        if (!jobDescription.trim()) {
            toast.error('Please add a job description first!');
            return;
        }
        setLoading(true);
        try {
            const {data} = await api.post<{ optimization: OptimizationData; ats: ATSData }>('/analyze_resume', {
                resume_id: resume._id, job_description: jobDescription,
            });
            setOptimization(data.optimization);
            setAts(data.ats);
            toast.success('Resume analysis complete!');
        } catch {
            toast.error('Failed to analyze resume.');
        } finally {
            setLoading(false);
        }
    };

    const colorClasses = {
        red: 'text-red-700', amber: 'text-amber-700', emerald: 'text-emerald-700',
    };

    return (<div
        className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 overflow-hidden">
        <div className="p-6 text-gray-900 dark:text-white flex justify-between items-center">
            <div>
                <h3 className="text-2xl font-bold mb-2">{resume.filename}</h3>
                <p className="text-gray-600 dark:text-gray-400">
                    📅 {new Date(resume.created_at).toLocaleDateString('en-US', {
                    year: 'numeric', month: 'long', day: 'numeric'
                })}
                </p>
            </div>
            <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                <File size={32}/>
            </div>
        </div>

        <div className="p-6 space-y-6">
            <label htmlFor="job-description"
                   className="flex items-center text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
                <Target className="mr-2" size={18}/> Target Job Description
            </label>
            <textarea
                id="job-description"
                rows={6}
                className="w-full p-5 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500 focus:ring-opacity-20 dark:bg-gray-800 dark:text-white placeholder-gray-400 resize-none shadow-sm"
                placeholder="Paste the job description here to get personalized optimization insights..."
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                disabled={loading}
                aria-label="Job Description"
            />
            <div className="text-xs text-gray-400 text-right">{jobDescription.length} characters</div>

            <button
                onClick={analyzeResume}
                disabled={loading || !jobDescription.trim()}
                className="w-full py-4 px-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-xl hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50 shadow-lg hover:shadow-xl transition-transform duration-200 transform hover:scale-[1.02]"
                aria-busy={loading}
            >
                {loading ? (<div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                    Analyzing Your Resume...
                </div>) : (<div className="flex items-center justify-center">
                    <Sparkles className="mr-2" size={18}/> Optimize My Resume
                </div>)}
            </button>

            {(optimization || ats) && (<div className="pt-8 border-t border-gray-200 dark:border-gray-700 space-y-8">
                {optimization && (<section>
                    <h3 className="flex items-center text-2xl font-bold text-gray-800 dark:text-white mb-6">
                        <CheckCircle2 className="mr-3" size={24}/> Resume Optimization
                    </h3>
                    <div
                        className={`rounded-xl p-6 border-l-4 border-blue-500 bg-gray-50 dark:bg-gray-800`}>
                        <div className="flex justify-between items-center text-gray-700 dark:text-gray-300">
                            <span className="text-lg font-medium">Job Match Score</span>
                            <span
                                className={`text-3xl font-bold ${colorClasses[getColor(optimization.match_percentage)]}`}>
                      {optimization.match_percentage.toFixed(1)}%
                    </span>
                        </div>
                    </div>
                    {optimization.missing_keywords.length > 0 && (<div
                        className="mt-6 p-6 bg-red-50 dark:bg-red-900 rounded-xl border border-red-200 dark:border-red-800">
                        <h4 className="flex items-center text-lg font-semibold text-red-700 dark:text-red-400 mb-4">
                            <Search className="mr-2" size={20}/> Missing Keywords
                        </h4>
                        <div className="flex flex-wrap gap-2">
                            {optimization.missing_keywords.map((keyword, i) => (<span
                                key={i}
                                className="px-3 py-1 bg-red-100 dark:bg-red-800 text-red-700 dark:text-red-300 rounded-full text-sm font-medium"
                            >
                          {keyword}
                        </span>))}
                        </div>
                    </div>)}
                    {optimization.skill_gaps.length > 0 && (<div
                        className="mt-6 p-6 bg-amber-50 dark:bg-amber-900 rounded-xl border border-amber-200 dark:border-amber-800">
                        <h4 className="flex items-center text-lg font-semibold text-amber-700 dark:text-amber-400 mb-4">
                            <Zap className="mr-2" size={20}/> Skill Enhancement Areas
                        </h4>
                        <div className="space-y-2">
                            {optimization.skill_gaps.map((skill, i) => (<div
                                key={i}
                                className="p-3 bg-amber-100 dark:bg-amber-800 rounded-lg text-amber-800 dark:text-amber-200 flex items-center"
                            >
                                                    <span
                                                        className="w-2 h-2 bg-amber-500 rounded-full mr-3"></span> {skill}
                            </div>))}
                        </div>
                    </div>)}
                    {optimization.suggestions.length > 0 && (<div
                        className="mt-6 p-6 bg-emerald-50 dark:bg-emerald-900 rounded-xl border border-emerald-200 dark:border-emerald-800">
                        <h4 className="flex items-center text-lg font-semibold text-emerald-700 dark:text-emerald-400 mb-4">
                            <CheckCircle2 className="mr-2" size={20}/> Optimization Suggestions
                        </h4>
                        <div className="space-y-3">
                            {optimization.suggestions.map((suggestion, i) => (<div
                                key={i}
                                className="p-4 bg-emerald-100 dark:bg-emerald-800 rounded-lg text-emerald-800 dark:text-emerald-200 flex items-start"
                            >
                                <span className="text-emerald-500 mr-3 mt-0.5">✓</span> {suggestion}
                            </div>))}
                        </div>
                    </div>)}
                </section>)}

                {ats && (<section>
                    <h3 className="flex items-center text-2xl font-bold text-gray-800 dark:text-white mb-6">
                        <Bot className="mr-3" size={24}/> ATS Compatibility
                    </h3>
                    <div
                        className={`rounded-xl p-6 border-l-4 border-purple-500 bg-purple-50 dark:bg-purple-900 dark:bg-opacity-20 ${colorClasses[getColor(ats.score)]}`}
                    >
                        <div className="flex justify-between items-center font-medium">
                            <span>ATS Compatibility Score</span>
                            <div className="flex items-center text-3xl font-bold">
                                {ats.score} <span className="text-lg ml-1">/100</span>
                            </div>
                        </div>
                    </div>
                    {ats.feedback.length > 0 && (<div
                        className="mt-6 p-6 bg-blue-50 dark:bg-blue-900 rounded-xl border border-blue-200 dark:border-blue-800">
                        <h4 className="flex items-center text-lg font-semibold text-blue-700 dark:text-blue-400 mb-4">
                            <CheckCircle2 className="mr-2" size={20}/> ATS Feedback
                        </h4>
                        <div className="space-y-3">
                            {ats.feedback.map((fb, i) => (<div
                                key={i}
                                className="p-3 bg-blue-100 dark:bg-blue-800 rounded-lg text-blue-800 dark:text-blue-200"
                            >
                                {fb}
                            </div>))}
                        </div>
                    </div>)}
                    {ats.keyword_matches && (<div
                        className="mt-6 p-6 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                        <h4 className="flex items-center text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4">
                            <Search className="mr-2" size={20}/> Keyword Analysis
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {ats.keyword_matches.exact?.map((keyword, i) => (<div
                                key={`exact-${i}`}
                                className="flex justify-between items-center p-3 rounded-lg bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200"
                            >
                                <span className="font-medium">{keyword}</span>
                                <span className="text-lg">✅</span>
                            </div>))}
                            {ats.keyword_matches.partial?.map((keyword, i) => (<div
                                key={`partial-${i}`}
                                className="flex justify-between items-center p-3 rounded-lg bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200"
                            >
                                <span className="font-medium">{keyword}</span>
                                <span className="text-lg">🟡</span>
                            </div>))}
                        </div>
                    </div>)}
                    {ats.formatting_issues.length > 0 && (<div
                        className="mt-6 p-6 bg-orange-50 dark:bg-orange-900 rounded-xl border border-orange-200 dark:border-orange-800">
                        <h4 className="flex items-center text-lg font-semibold text-orange-700 dark:text-orange-400 mb-4">
                            <AlertCircle className="mr-2" size={20}/> Formatting Issues
                        </h4>
                        <div className="space-y-3">
                            {ats.formatting_issues.map((issue, i) => (<div
                                key={i}
                                className="p-3 bg-orange-100 dark:bg-orange-800 rounded-lg text-orange-800 dark:text-orange-200 flex items-start"
                            >
                                <span className="text-orange-500 mr-3 mt-0.5">⚡</span> {issue}
                            </div>))}
                        </div>
                    </div>)}
                    {ats.recommendations.length > 0 && (<div
                        className="mt-6 p-6 bg-purple-50 dark:bg-purple-900 rounded-xl border border-purple-200 dark:border-purple-800">
                        <h4 className="flex items-center text-lg font-semibold text-purple-700 dark:text-purple-400 mb-4">
                            <Zap className="mr-2" size={20}/> Enhancement Recommendations
                        </h4>
                        <div className="space-y-3">
                            {ats.recommendations.map((rec, i) => (<div
                                key={i}
                                className="p-3 bg-purple-100 dark:bg-purple-800 rounded-lg text-purple-800 dark:text-purple-200 flex items-start"
                            >
                                <span className="text-purple-500 mr-3 mt-0.5">⚡</span> {rec}
                            </div>))}
                        </div>
                    </div>)}
                </section>)}
            </div>)}
        </div>
    </div>);
};

export default ResumeCard;
