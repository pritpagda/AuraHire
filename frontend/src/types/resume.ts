export interface Resume {

  _id: string;
  filename: string;
  content: string;
  created_at: string;
}

export interface OptimizationResult {
  missing_keywords: string[];
  suggestions: string[];
  match_percentage: number;
}
