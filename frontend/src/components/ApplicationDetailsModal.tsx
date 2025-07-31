import React from "react";
import {Application} from "../types/application";

interface Props {
    app: Application | null;
    onClose: () => void;
}

const ApplicationDetailsModal: React.FC<Props> = ({app, onClose}) => {
    if (!app) return null;

    return (<div
        className="fixed inset-0 z-50 bg-gray-900 bg-opacity-75 flex items-center justify-center p-4 sm:p-6 lg:p-8 animate-fade-in">
        <div
            className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 animate-scale-in">

            <button
                onClick={onClose}
                className="absolute top-4 right-4 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors text-3xl leading-none font-semibold"
                aria-label="Close"
            >
                &times;
            </button>

            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-6 border-b border-gray-200 dark:border-gray-700 pb-3">
                Application Details
            </h2>

            <div className="space-y-4 text-gray-700 dark:text-gray-300">
                <DetailItem label="Company" value={app.company_name}/>
                <DetailItem label="Position" value={app.position_title}/>
                <DetailItem label="Status" value={app.status.replace(/_/g, " ")}/>
                <DetailItem label="Application Date" value={formatDate(app.application_date)}/>
                <DetailItem label="Interview Date" value={formatDate(app.interview_date)}/>
                <DetailItem label="Follow Up Date" value={formatDate(app.follow_up_date)}/>
                <DetailItem label="Salary Range" value={app.salary_range || "N/A"}/>
                <DetailItem label="Job Description" value={app.job_description || "N/A"} isPreformatted/>
                <DetailItem label="Application URL">
                    {app.application_url ? (<a
                        href={app.application_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 underline break-all transition-colors"
                    >
                        {app.application_url}
                    </a>) : ("N/A")}
                </DetailItem>
                <DetailItem label="Notes" value={app.notes || "N/A"} isPreformatted/>
            </div>
        </div>
    </div>);
};

const formatDate = (date?: string) => {
    return date ? new Date(date).toLocaleDateString() : "N/A";
};

interface DetailItemProps {
    label: string;
    value?: string | JSX.Element;
    isPreformatted?: boolean;
    children?: React.ReactNode;
}

const DetailItem: React.FC<DetailItemProps> = ({label, value, isPreformatted = false, children}) => (<div>
    <strong className="block mb-1 text-gray-900 dark:text-white">{label}:</strong>
    {isPreformatted ? (<p className="whitespace-pre-wrap text-sm">{value || children}</p>) : (
        <span className="text-base">{value || children}</span>)}
</div>);

export default ApplicationDetailsModal;
