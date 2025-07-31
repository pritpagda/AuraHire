import React, {useEffect, useState} from "react";
import api from "../utils/axios";
import {toast} from "react-toastify";
import {Cell, Pie, PieChart, ResponsiveContainer} from "recharts";
import {Activity, Briefcase, Calendar, Target, TrendingUp} from "lucide-react";
import type {ApplicationStatus, DashboardMetrics} from "../types/dashboard";

const statusColors: Record<ApplicationStatus, string> = {
    applied: "#64748b",
    interview_scheduled: "#fbbf24",
    interview_completed: "#3b82f6",
    offer: "#10b981",
    rejected: "#ef4444",
    withdrawn: "#6b7280",
};

const statusBadgeClasses: Record<ApplicationStatus, string> = {
    applied: "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200",
    interview_scheduled: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
    interview_completed: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
    offer: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
    rejected: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
    withdrawn: "bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300",
};

const Dashboard: React.FC = () => {
    const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api
            .get("/analytics/dashboard")
            .then((res) => setMetrics(res.data))
            .catch(() => toast.error("Failed to load dashboard"))
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (<CenteredMessage message="Loading dashboard..." spinner/>);
    }

    if (!metrics) {
        return (<CenteredMessage message="No data available" icon={<Briefcase className="w-12 h-12 opacity-50"/>}/>);
    }

    const pieData = metrics.status_breakdown.map(({status, count}) => ({
        name: status.replace(/_/g, " "), value: count, color: statusColors[status],
    }));

    return (<div
        className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="max-w-7xl mx-auto p-6 space-y-8">
            <Header/>
            <Stats metrics={metrics}/>
            <MainContent pieData={pieData} metrics={metrics}/>
            <RecentApplications applications={metrics.recent_applications}/>
        </div>
    </div>);
};

const CenteredMessage: React.FC<{ message: string; spinner?: boolean; icon?: React.ReactNode }> = ({
                                                                                                       message,
                                                                                                       spinner,
                                                                                                       icon
                                                                                                   }) => (<div
    className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
    <div className="text-center space-y-4">
        {spinner && <div
            className="animate-spin h-12 w-12 rounded-full border-3 border-blue-600 border-t-transparent mx-auto"/>}
        {icon && <div className="mx-auto mb-2">{icon}</div>}
        <p className="text-gray-600 dark:text-gray-400">{message}</p>
    </div>
</div>);

const Header: React.FC = () => (<header className="text-center space-y-4 py-8">
    <div className="flex justify-center items-center gap-3">
        <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl text-white shadow-lg">
            <Briefcase className="w-8 h-8"/>
        </div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
            Dashboard
        </h1>
    </div>
    <p className="text-lg text-gray-600 dark:text-gray-400">Track your job search progress</p>
</header>);

const Stats: React.FC<{ metrics: DashboardMetrics }> = ({metrics}) => (<section className="grid md:grid-cols-3 gap-6">
    <StatCard
        icon={<Target className="w-6 h-6"/>}
        label="Total Applications"
        value={metrics.total_applications}
        gradient="from-blue-500 to-blue-600"
        bgGradient="from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20"
    />
    <StatCard
        icon={<TrendingUp className="w-6 h-6"/>}
        label="Interview Rate"
        value={`${metrics.interview_rate.toFixed(1)}%`}
        gradient="from-amber-500 to-orange-600"
        bgGradient="from-amber-50 to-orange-100 dark:from-amber-900/20 dark:to-orange-800/20"
    />
    <StatCard
        icon={<Activity className="w-6 h-6"/>}
        label="This Month"
        value={metrics.success_metrics.applications_this_month}
        gradient="from-green-500 to-emerald-600"
        bgGradient="from-green-50 to-emerald-100 dark:from-green-900/20 dark:to-emerald-800/20"
    />
</section>);

const StatCard: React.FC<{
    icon: React.ReactNode; label: string; value: string | number; gradient: string; bgGradient: string;
}> = ({icon, label, value, gradient, bgGradient}) => (<div
    className={`bg-gradient-to-br ${bgGradient} backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 dark:border-gray-700/50 hover:shadow-xl hover:scale-105 transition-all duration-300`}
>
    <div className="flex items-center gap-4">
        <div className={`p-3 bg-gradient-to-br ${gradient} rounded-2xl text-white shadow-md`}>{icon}</div>
        <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">{label}</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{value}</p>
        </div>
    </div>
</div>);

const MainContent: React.FC<{
    pieData: { name: string; value: number; color: string }[]; metrics: DashboardMetrics
}> = ({
          pieData, metrics,
      }) => (<section className="grid lg:grid-cols-2 gap-8">
    <ApplicationStatusChart pieData={pieData}/>
    <SuccessMetrics metrics={metrics.success_metrics}/>
</section>);

const ApplicationStatusChart: React.FC<{ pieData: { name: string; value: number; color: string }[] }> = ({pieData}) => (
    <div
        className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 dark:border-gray-700/50 p-6 hover:shadow-xl transition-shadow duration-300">
        <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-xl">
                <Briefcase className="w-5 h-5 text-gray-600 dark:text-gray-300"/>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Application Status</h2>
        </div>

        {pieData.length ? (<>
            <div className="h-64 mb-4">
                <ResponsiveContainer>
                    <PieChart>
                        <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={2}
                             dataKey="value">
                            {pieData.map(({color}, i) => (<Cell key={i} fill={color}/>))}
                        </Pie>
                    </PieChart>
                </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-2 gap-3">
                {pieData.map(({name, value, color}, i) => (<div
                    key={i}
                    className="flex items-center gap-2 p-2 rounded-lg bg-gray-50 dark:bg-gray-700/50"
                >
                    <span className="w-3 h-3 rounded-full flex-shrink-0" style={{backgroundColor: color}}/>
                    <span className="text-sm capitalize truncate text-gray-700 dark:text-gray-300">{name}</span>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white ml-auto">{value}</span>
                </div>))}
            </div>
        </>) : (<div className="h-64 flex items-center justify-center text-gray-500 dark:text-gray-400">
            <div className="text-center">
                <Briefcase className="w-12 h-12 mx-auto mb-2 opacity-50"/>
                <p>No data available</p>
            </div>
        </div>)}
    </div>);

const SuccessMetrics: React.FC<{ metrics: DashboardMetrics["success_metrics"] }> = ({
                                                                                        metrics,
                                                                                    }) => (<div
    className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 dark:border-gray-700/50 p-6 space-y-4 hover:shadow-xl transition-shadow duration-300">
    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Success Metrics</h2>

    <Metric label="Offer Rate" value={`${metrics.offer_rate.toFixed(1)}%`}
            bg="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20"
            text="text-green-700 dark:text-green-300" border="border-green-200 dark:border-green-800"/>
    <Metric label="Rejection Rate" value={`${metrics.rejection_rate.toFixed(1)}%`}
            bg="bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20"
            text="text-red-700 dark:text-red-300" border="border-red-200 dark:border-red-800"/>
    <Metric label="Pending Applications" value={metrics.pending_applications}
            bg="bg-gradient-to-r from-blue-50 to-sky-50 dark:from-blue-900/20 dark:to-sky-900/20"
            text="text-blue-700 dark:text-blue-300" border="border-blue-200 dark:border-blue-800"/>
    <Metric label="Total Interviews" value={metrics.total_interviews}
            bg="bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20"
            text="text-amber-700 dark:text-amber-300" border="border-amber-200 dark:border-amber-800"/>
</div>);

const Metric: React.FC<{
    label: string; value: string | number; bg: string; text: string; border: string;
}> = ({label, value, bg, text, border}) => (<div
    className={`flex justify-between items-center p-4 rounded-xl border ${bg} ${border} hover:shadow-sm transition-shadow duration-200`}>
    <span className={`text-sm font-medium ${text}`}>{label}</span>
    <span className={`text-lg font-bold ${text}`}>{value}</span>
</div>);

const RecentApplications: React.FC<{ applications: DashboardMetrics["recent_applications"] }> = ({
                                                                                                     applications,
                                                                                                 }) => (<section
    className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 dark:border-gray-700/50 p-6 hover:shadow-xl transition-shadow duration-300">
    <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-xl">
            <Calendar className="w-5 h-5 text-gray-600 dark:text-gray-300"/>
        </div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Recent Applications</h2>
    </div>

    {applications.length ? (<div className="space-y-3">
        {applications.map((app) => (<div
            key={app.id}
            className="group flex justify-between items-center p-4 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:shadow-md transition-all duration-200 hover:scale-[1.01]"
        >
            <div className="flex items-center gap-4">
                <div
                    className="p-2 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 rounded-xl group-hover:from-blue-100 group-hover:to-blue-200 dark:group-hover:from-blue-900/30 dark:group-hover:to-blue-800/30 transition-colors">
                    <Briefcase
                        className="w-4 h-4 text-gray-600 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-300"/>
                </div>
                <div>
                    <p className="font-semibold text-gray-900 dark:text-white">{app.position_title}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{app.company_name}</p>
                </div>
            </div>
            <span
                className={`text-sm px-3 py-1 rounded-full font-semibold capitalize cursor-default select-none ${statusBadgeClasses[app.status]}`}
            >
              {app.status.replace(/_/g, " ")}
            </span>
        </div>))}
    </div>) : (<p className="text-gray-600 dark:text-gray-400 text-center">No recent applications</p>)}
</section>);

export default Dashboard;
