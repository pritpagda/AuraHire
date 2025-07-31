export type ApplicationStatus = 'applied' | 'interview_scheduled' | 'offer' | 'rejected';

export interface Application {
    id: string;
    _id: string;
    company_name: string;
    position_title: string;
    job_description?: string;
    application_url?: string;
    resume_id?: string;
    cover_letter_id?: string;
    status: ApplicationStatus;
    notes?: string;
    salary_range?: string;
    location?: string;
    application_date?: string;
    interview_date?: string;
    follow_up_date?: string;
    user_id?: string;
    created_at?: string;
    updated_at?: string;
}

