import React from "react";

interface ConfirmDialogProps {
    open: boolean;
    title?: string;
    message?: string;
    onConfirm: () => void;
    onCancel: () => void;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
                                                         open,
                                                         title = "Confirm Delete",
                                                         message = "Are you sure you want to delete this application?",
                                                         onConfirm,
                                                         onCancel,
                                                     }) => {
    if (!open) return null;

    return (<div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
        <div className="w-full max-w-sm bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{title}</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-6">{message}</p>
            <div className="flex justify-end gap-3">
                <button
                    onClick={onCancel}
                    className="px-4 py-2 rounded bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-400 dark:hover:bg-gray-600 transition-colors"
                >
                    Cancel
                </button>
                <button
                    onClick={onConfirm}
                    className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 transition-colors"
                >
                    Delete
                </button>
            </div>
        </div>
    </div>);
};

export default ConfirmDialog;
