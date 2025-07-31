export interface Resume {
    _id: string;
    filename: string;
    content: string;
    created_at: string;
}

export interface OptimizationData {
    missing_keywords: string[];
    skill_gaps: string[];
    suggestions: string[];
    improved_content?: string;
    match_percentage: number;
}

export interface ATSData {
    score: number;
    feedback: string[];
    keyword_matches: {
        exact: string[]; partial: string[];
    };
    formatting_issues: string[];
    recommendations: string[];
}
