import React, {useCallback, useRef, useState} from 'react';
import {UploadCloud} from 'lucide-react';
import api from '../utils/axios';
import {toast} from 'react-toastify';

interface ResumeUploaderProps {
    onUploadSuccess: () => void;
}

const ResumeUploader: React.FC<ResumeUploaderProps> = ({onUploadSuccess}) => {
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const [isUploading, setIsUploading] = useState(false);

    const uploadFile = useCallback(async (file: File) => {
        if (!file) return;
        const formData = new FormData();
        formData.append('file', file);

        try {
            setIsUploading(true);
            await api.post('/resumes/upload', formData, {
                headers: {'Content-Type': 'multipart/form-data'},
            });
            toast.success('Resume uploaded successfully!');
            onUploadSuccess();
        } catch {
            toast.error('Failed to upload resume. Please try again.');
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    }, [onUploadSuccess]);

    const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        const file = e.dataTransfer.files[0];
        if (file) uploadFile(file);
    }, [uploadFile]);

    const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) uploadFile(file);
    }, [uploadFile]);

    const handleClick = useCallback(() => {
        fileInputRef.current?.click();
    }, []);

    const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
    }, []);

    return (<div
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg
                 text-center cursor-pointer transition-all duration-200 ease-in-out
                 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-blue-400 dark:hover:border-blue-500"
    >
        <UploadCloud className="w-10 h-10 text-gray-500 dark:text-gray-400 mb-3"/>
        <p className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-1">
            Drag & drop your resume here
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400">
            or <span className="text-blue-600 dark:text-blue-400 font-semibold">click to browse</span>
        </p>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">(Supports PDF, DOC, DOCX files)</p>

        <input
            type="file"
            accept=".pdf,.doc,.docx"
            hidden
            ref={fileInputRef}
            onChange={handleFileChange}
        />

        {isUploading && (<div className="mt-4 flex items-center text-blue-600 dark:text-blue-400 animate-pulse">
            <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-600 dark:text-blue-400"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
            >
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor"
                        strokeWidth="4"></circle>
                <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
            </svg>
            Uploading your resume...
        </div>)}
    </div>);
};

export default ResumeUploader;
