import React from 'react';
import {useForm} from 'react-hook-form';
import {Application, ApplicationStatus} from '../types/application';
import api from '../utils/axios';

interface Props {
    app?: Application;
    onClose: () => void;
    onSuccess: () => void;
}

const ApplicationModal: React.FC<Props> = ({app, onClose, onSuccess}) => {
    const isEdit = Boolean(app);

    const {
        register, handleSubmit, watch, reset,
    } = useForm({
        defaultValues: {
            ...app,
            application_date: app?.application_date?.slice(0, 10) || '',
            interview_date: app?.interview_date?.slice(0, 10) || '',
            follow_up_date: app?.follow_up_date?.slice(0, 10) || '',
            status: app?.status || 'applied',
        },
    });

    const status = watch('status');

    const toISO = (date: string | undefined) => date ? new Date(date).toISOString() : undefined;

    const onSubmit = async (data: any) => {
        const payload = {
            ...data,
            application_date: toISO(data.application_date),
            interview_date: toISO(data.interview_date),
            follow_up_date: toISO(data.follow_up_date),
        };

        try {
            if (isEdit) {
                await api.put(`/applications/${app!.id}`, payload);
            } else {
                await api.post('/applications', {
                    ...payload, status: payload.status as ApplicationStatus,
                });
            }
            onSuccess();
            reset();
            onClose();
        } catch (err) {
            console.error(err);
        }
    };

    return (<div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {isEdit ? 'Edit' : 'New'} Application
                </h2>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Company Name *
                        </label>
                        <input
                            {...register('company_name', {required: true})}
                            placeholder="Enter company name"
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-colors"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Position Title *
                        </label>
                        <input
                            {...register('position_title', {required: true})}
                            placeholder="Enter position title"
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-colors"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Job Description
                        </label>
                        <textarea
                            {...register('job_description')}
                            placeholder="Enter job description"
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-colors resize-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Application URL
                        </label>
                        <input
                            {...register('application_url')}
                            placeholder="https://..."
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-colors"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Salary Range
                        </label>
                        <input
                            {...register('salary_range')}
                            placeholder="e.g., $80k - $120k"
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-colors"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Application Date
                        </label>
                        <input
                            {...register('application_date')}
                            type="date"
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Status
                        </label>
                        <select
                            {...register('status')}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors"
                        >
                            <option value="applied">Applied</option>
                            <option value="interview_scheduled">Interview Scheduled</option>
                            <option value="offer">Offer</option>
                            <option value="rejected">Rejected</option>
                        </select>
                    </div>

                    {['interview_scheduled', 'offer', 'rejected'].includes(status) && (
                        <div className="space-y-4 pt-2 border-t border-gray-200 dark:border-gray-700">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Interview Date
                                </label>
                                <input
                                    {...register('interview_date')}
                                    type="date"
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Follow-Up Date
                                </label>
                                <input
                                    {...register('follow_up_date')}
                                    type="date"
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors"
                                />
                            </div>
                        </div>)}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Notes
                        </label>
                        <textarea
                            {...register('notes')}
                            placeholder="Add any additional notes..."
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-colors resize-none"
                        />
                    </div>
                </div>
            </div>

            <div
                className="px-6 py-4 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
                <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-500 transition-colors"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    onClick={handleSubmit(onSubmit)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
                >
                    {isEdit ? 'Update' : 'Add'} Application
                </button>
            </div>
        </div>
    </div>);
};

export default ApplicationModal;
