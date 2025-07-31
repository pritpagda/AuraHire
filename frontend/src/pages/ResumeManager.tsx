import React, {ChangeEvent, useEffect, useState} from "react";
import api from "../utils/axios";
import {Resume} from "../types/resume";
import ResumeUploader from "../components/ResumeUploader";
import ResumeCard from "../components/ResumeCard";
import {ChevronDown, FileText, Upload} from "lucide-react";

const ResumeManager: React.FC = () => {
    const [resumes, setResumes] = useState<Resume[]>([]);
    const [selectedResumeId, setSelectedResumeId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchResumes = async () => {
        setLoading(true);
        try {
            const {data} = await api.get("/resumes");
            setResumes(data);
            setSelectedResumeId(data.length ? data[0]._id : null);
        } catch (error) {
            console.error("Error loading resumes:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSelect = (e: ChangeEvent<HTMLSelectElement>) => {
        setSelectedResumeId(e.target.value);
    };

    useEffect(() => {
        fetchResumes();
    }, []);

    const selectedResume = resumes.find(r => r._id === selectedResumeId) || null;

    if (loading) {
        return (<div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
            <div className="animate-spin h-16 w-16 rounded-full border-4 border-indigo-600 border-t-transparent"/>
        </div>);
    }

    return (<div className="min-h-screen p-6 bg-gray-50 dark:bg-gray-900 text-slate-900 dark:text-white">
        <div className="max-w-7xl mx-auto space-y-10">

            <header className="text-center space-y-3">
                <div className="flex justify-center items-center gap-3">
                    <FileText className="w-8 h-8 text-indigo-600"/>
                    <h1 className="text-4xl font-bold">Resume Manager</h1>
                </div>
                <p className="text-slate-600 dark:text-slate-400">
                    Manage and optimize your resumes for job applications.
                </p>
            </header>

            <section className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow border dark:border-gray-700">
                <div className="flex items-center gap-2 mb-4">
                    <Upload className="w-5 h-5 text-indigo-600"/>
                    <h2 className="text-xl font-semibold">Upload Resume</h2>
                </div>
                <ResumeUploader onUploadSuccess={fetchResumes}/>
            </section>

            {resumes.length === 0 ? (<div
                className="bg-white dark:bg-gray-800 p-12 text-center rounded-xl shadow border dark:border-gray-700">
                <div
                    className="w-20 h-20 mx-auto flex items-center justify-center bg-slate-100 dark:bg-gray-700 rounded-full mb-6">
                    <FileText className="w-10 h-10 text-slate-400 dark:text-slate-500"/>
                </div>
                <h3 className="text-xl font-bold mb-2">No Resumes Found</h3>
                <p className="text-slate-600 dark:text-slate-400">
                    Upload your first resume above to get started.
                </p>
            </div>) : (<div className="space-y-8">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow border dark:border-gray-700">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold">Choose a Resume</h2>
                        <span className="text-sm text-slate-600 dark:text-slate-400">
                  {resumes.length} uploaded
                </span>
                    </div>
                    <div className="relative">
                        <select
                            value={selectedResumeId || ""}
                            onChange={handleSelect}
                            className="w-full px-5 py-3 pr-10 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none"
                        >
                            {resumes.map(({_id, filename, created_at}) => (<option key={_id} value={_id}>
                                {filename} (Uploaded: {new Date(created_at).toLocaleDateString()})
                            </option>))}
                        </select>
                        <div
                            className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-gray-700 dark:text-gray-300">
                            <ChevronDown className="w-5 h-5"/>
                        </div>
                    </div>
                </div>

                {selectedResume ? (<ResumeCard resume={selectedResume}/>) : (<div
                    className="bg-white dark:bg-gray-800 p-12 text-center rounded-xl shadow border dark:border-gray-700 text-slate-600 dark:text-slate-400">
                    Please select a resume to view its details.
                </div>)}
            </div>)}
        </div>
    </div>);
};

export default ResumeManager;
