import React, {useEffect, useState} from "react";
import api from "../utils/axios";
import {Application} from "../types/application";
import ApplicationCard from "../components/ApplicationCard";
import ApplicationModal from "../components/NewApplicationModal";
import ApplicationDetailsModal from "../components/ApplicationDetailsModal";
import {toast} from "react-toastify";
import {closestCenter, DndContext, DragEndEvent, PointerSensor, useSensor, useSensors,} from "@dnd-kit/core";
import {arrayMove, SortableContext, verticalListSortingStrategy,} from "@dnd-kit/sortable";

const STATUSES = ["applied", "interview_scheduled", "offer", "rejected"] as const;

const STATUS_CONFIG = {
    applied: {
        title: "Applied",
        color: "from-blue-500 to-cyan-500",
        bgColor: "bg-gradient-to-br from-blue-50 to-cyan-50",
        borderColor: "border-blue-200",
        icon: "📝",
    }, interview_scheduled: {
        title: "Interview Scheduled",
        color: "from-amber-500 to-orange-500",
        bgColor: "bg-gradient-to-br from-amber-50 to-orange-50",
        borderColor: "border-amber-200",
        icon: "📅",
    }, offer: {
        title: "Offer Received",
        color: "from-emerald-500 to-green-500",
        bgColor: "bg-gradient-to-br from-emerald-50 to-green-50",
        borderColor: "border-emerald-200",
        icon: "🎉",
    }, rejected: {
        title: "Rejected",
        color: "from-red-500 to-pink-500",
        bgColor: "bg-gradient-to-br from-red-50 to-pink-50",
        borderColor: "border-red-200",
        icon: "❌",
    },
};

const ApplicationTrackerPage: React.FC = () => {
    const [applications, setApplications] = useState<Application[]>([]);
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [selectedApp, setSelectedApp] = useState<Application | null>(null);
    const [detailsApp, setDetailsApp] = useState<Application | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [downloadLoading, setDownloadLoading] = useState(false);

    const fetchApplications = async () => {
        setLoading(true);
        try {
            const {data} = await api.get<Application[]>("/applications");
            setApplications(data.map((app) => ({...app, id: app._id})));
        } catch {
            toast.error("Failed to load applications");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchApplications();
    }, []);

    const openAddModal = () => {
        setSelectedApp(null);
        setShowModal(true);
    };

    const openEditModal = (app: Application) => {
        setSelectedApp(app);
        setShowModal(true);
    };

    const closeModal = () => setShowModal(false);

    const onSuccess = async () => {
        await fetchApplications();
        closeModal();
    };

    const handleDelete = async (id: string) => {
        try {
            await api.delete(`/applications/${id}`);
            toast.success("Application deleted");
            setApplications((apps) => apps.filter((app) => app.id !== id));
        } catch {
            toast.error("Failed to delete application");
        }
    };

    const sensors = useSensors(useSensor(PointerSensor));

    const onDragEnd = (event: DragEndEvent) => {
        const {active, over} = event;
        if (!over || active.id === over.id) return;

        const activeApp = applications.find((a) => a.id === active.id);
        const overApp = applications.find((a) => a.id === over.id);

        if (!activeApp || !overApp || activeApp.status !== overApp.status) return;

        const appsInStatus = applications.filter((a) => a.status === activeApp.status);
        const oldIndex = appsInStatus.findIndex((a) => a.id === active.id);
        const newIndex = appsInStatus.findIndex((a) => a.id === over.id);
        if (oldIndex === -1 || newIndex === -1) return;

        const reordered = arrayMove(appsInStatus, oldIndex, newIndex);

        const reorderedApps = [...applications];
        let idx = 0;
        for (let i = 0; i < reorderedApps.length; i++) {
            if (reorderedApps[i].status === activeApp.status) {
                reorderedApps[i] = reordered[idx++];
            }
        }
        setApplications(reorderedApps);
    };

    const openDetails = (app: Application) => setDetailsApp(app);
    const closeDetails = () => setDetailsApp(null);

    const counts = React.useMemo(() => Object.fromEntries(STATUSES.map((status) => [status, applications.filter((app) => app.status === status).length,])), [applications]);

    const downloadExcel = async () => {
        setDownloadLoading(true);
        try {
            const response = await api.get("/applications/download", {
                responseType: "blob",
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", "applications.xlsx");

            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);

            toast.success("Excel file downloaded");
        } catch (error) {
            toast.error("Failed to download Excel file");
        } finally {
            setDownloadLoading(false);
        }
    };

    return (<div
        className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-500 p-6 max-w-7xl mx-auto">
        <header className="flex flex-col sm:flex-row items-center justify-between mb-8 gap-4">
            <div>
                <h1 className="text-4xl font-bold">Application Tracker</h1>
                <p className="text-slate-600 dark:text-slate-400">
                    Manage your job applications with ease
                </p>
            </div>

            <div className="flex gap-4">
                <button
                    onClick={downloadExcel}
                    disabled={downloadLoading}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {downloadLoading ? "Downloading..." : "Download Excel"}
                </button>

                <button
                    onClick={openAddModal}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition duration-200"
                >
                    + New Application
                </button>
            </div>
        </header>

        <div className="mb-6">
            <input
                type="text"
                placeholder="Search by position or company..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full p-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            />
        </div>

        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={onDragEnd}
        >
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                {STATUSES.map((status) => {
                    const apps = applications
                        .filter((app) => app.status === status)
                        .filter((app) => app.position_title
                            .toLowerCase()
                            .includes(searchQuery.toLowerCase()) || app.company_name.toLowerCase().includes(searchQuery.toLowerCase()));

                    const {title, bgColor, borderColor, icon, color} = STATUS_CONFIG[status];
                    return (<SortableContext
                        key={status}
                        items={apps.map((a) => a.id)}
                        strategy={verticalListSortingStrategy}
                    >
                        <section
                            className="flex flex-col rounded-2xl shadow-sm border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                            <header
                                className={`${bgColor} ${borderColor} rounded-t-2xl p-4 flex justify-between items-center`}
                            >
                                <div className="flex items-center gap-2 text-lg font-semibold text-gray-800">
                                    <span>{icon}</span>
                                    <span>{title}</span>
                                </div>
                                <span
                                    className={`px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r ${color} bg-clip-text text-transparent bg-white/60 dark:bg-gray-900/60`}
                                >
                      {counts[status]}
                    </span>
                            </header>

                            <div className="p-4 space-y-4 min-h-[200px] overflow-auto">
                                {apps.length === 0 ? (
                                    <p className="text-center text-gray-400 dark:text-gray-500 mt-16 select-none">
                                        No applications yet
                                    </p>) : (apps.map((app) => (<ApplicationCard
                                    key={app.id}
                                    app={app}
                                    onDelete={handleDelete}
                                    onEdit={() => openEditModal(app)}
                                    onClick={() => openDetails(app)}
                                />)))}
                            </div>
                        </section>
                    </SortableContext>);
                })}
            </div>
        </DndContext>

        {showModal && (<ApplicationModal
            app={selectedApp ?? undefined}
            onClose={closeModal}
            onSuccess={onSuccess}
        />)}
        {detailsApp && (<ApplicationDetailsModal app={detailsApp} onClose={closeDetails}/>)}
    </div>);
};

export default ApplicationTrackerPage;
