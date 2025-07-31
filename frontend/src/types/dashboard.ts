export type ApplicationStatus =
    | "applied"
    | "interview_scheduled"
    | "interview_completed"
    | "offer"
    | "rejected"
    | "withdrawn";

export interface DashboardMetrics {
    total_applications: number;
    interview_rate: number;
    status_breakdown: { status: ApplicationStatus; count: number }[];
    success_metrics: {
        applications_this_month: number;
        offer_rate: number;
        rejection_rate: number;
        pending_applications: number;
        total_interviews: number;
    };
    recent_applications: {
        id: string; position_title: string; company_name: string; status: ApplicationStatus; created_at: string;
    }[];
}