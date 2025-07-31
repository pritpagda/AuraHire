import React, {useEffect, useRef, useState} from "react";
import api from "../utils/axios";
import {Resume} from "../types/resume";
import type {FormData} from "../types/coverLetter";
import {ClipboardCopy, FileText, Wand2} from "lucide-react";
import {useForm} from "react-hook-form";

const tones = [{label: "professional", emoji: "💼"}, {label: "friendly", emoji: "😊"}, {
    label: "persuasive", emoji: "🔥"
}, {label: "formal", emoji: "🎩"}, {label: "confident", emoji: "🚀"},];

const CoverLetterForm: React.FC = () => {
    const [resumes, setResumes] = useState<Resume[]>([]);
    const [coverLetter, setCoverLetter] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);
    const [loading, setLoading] = useState(true);
    const resultRef = useRef<HTMLDivElement>(null);

    const {
        register, handleSubmit, watch, formState: {errors},
    } = useForm<FormData>({defaultValues: {tone: "professional"}});

    const selectedTone = watch("tone");

    const fetchResumes = async () => {
        try {
            setLoading(true);
            const {data} = await api.get("/resumes");
            setResumes(data);
        } catch (err) {
            console.error("Error loading resumes:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchResumes();
    }, []);

    const onSubmit = async (data: FormData) => {
        try {
            setCoverLetter(null);
            setLoading(true);
            const res = await api.post("/cover-letters/generate", data);
            setCoverLetter(res.data.content || "");
        } catch (err) {
            console.error("Error generating cover letter:", err);
        } finally {
            setLoading(false);
            setTimeout(() => {
                resultRef.current?.scrollIntoView({behavior: "smooth"});
            }, 200);
        }
    };

    const copyToClipboard = async () => {
        if (!coverLetter) return;
        try {
            await navigator.clipboard.writeText(coverLetter);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error("Copy failed:", err);
        }
    };

    return (<div className="min-h-screen p-6 bg-gray-50 dark:bg-gray-900 text-slate-900 dark:text-white">
        <div className="max-w-7xl mx-auto space-y-10">
            <header className="text-center space-y-3">
                <div className="flex justify-center items-center gap-3">
                    <Wand2 className="w-8 h-8 text-indigo-600"/>
                    <h1 className="text-4xl font-bold">Cover Letter Generator</h1>
                </div>
                <p className="text-slate-600 dark:text-slate-400">
                    Generate tailored cover letters with ease.
                </p>
            </header>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div>
                    <label className="block mb-2 font-semibold">Job Description *</label>
                    <textarea
                        {...register("job_description", {required: true})}
                        className="w-full p-4 border rounded-lg bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700"
                        placeholder="Paste the job description here..."
                        rows={5}
                    />
                </div>

                <div>
                    <label className="block mb-2 font-semibold">Company Name *</label>
                    <input
                        {...register("company_name", {required: true})}
                        className="w-full p-4 border rounded-lg bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700"
                        placeholder="e.g., OpenAI"
                    />
                </div>

                <div>
                    <label className="block mb-2 font-semibold">Position Title *</label>
                    <input
                        {...register("position_title", {required: true})}
                        className="w-full p-4 border rounded-lg bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700"
                        placeholder="e.g., Software Engineer"
                    />
                </div>

                <div>
                    <label className="block mb-2 font-semibold">Select Resume *</label>
                    <select
                        {...register("resume_id", {required: true})}
                        className="w-full p-4 pr-10 border rounded-lg bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 appearance-none"
                        defaultValue=""
                    >
                        <option value="" disabled>
                            -- Choose a resume --
                        </option>
                        {resumes.map(({_id, filename}) => (<option key={_id} value={_id}>
                            {filename}
                        </option>))}
                    </select>
                </div>

                <div>
                    <label className="block mb-2 font-semibold">Tone *</label>
                    <div className="flex flex-wrap gap-3">
                        {tones.map(({label, emoji}) => (<label
                            key={label}
                            className={`cursor-pointer px-4 py-2 border rounded-lg text-sm font-medium
                    ${selectedTone === label ? "bg-indigo-600 text-white border-indigo-600" : "border-gray-300 dark:border-gray-700"}`}
                        >
                            <input
                                type="radio"
                                value={label}
                                {...register("tone")}
                                className="hidden"
                            />
                            {emoji} {label.charAt(0).toUpperCase() + label.slice(1)}
                        </label>))}
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow disabled:opacity-50"
                >
                    {loading ? "⏳ Generating..." : "🚀 Generate Cover Letter"}
                </button>
            </form>

            <div ref={resultRef} className="space-y-4">
                <h2 className="text-2xl font-semibold flex items-center gap-2">
                    <FileText className="w-5 h-5 text-indigo-600"/>
                    Generated Cover Letter
                </h2>
                {coverLetter ? (<div
                    className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-6 rounded-xl shadow">
              <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-slate-800 dark:text-slate-100">
                {coverLetter}
              </pre>
                    <button
                        onClick={copyToClipboard}
                        className="mt-4 flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
                    >
                        <ClipboardCopy className="w-4 h-4"/>
                        {copied ? "Copied!" : "Copy to Clipboard"}
                    </button>
                </div>) : (<p className="text-slate-600 dark:text-slate-400">
                    Fill out the form and click generate to get your letter.
                </p>)}
            </div>
        </div>
    </div>);
};

export default CoverLetterForm;
