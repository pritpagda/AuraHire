import datetime
import json
import os
from typing import Dict, Optional

import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

API_KEY = os.getenv("GEMINI_API_KEY")
if not API_KEY:
    raise ValueError("GEMINI_API_KEY not found in environment variables or .env file. Please set it.")

MODEL_NAME = "gemini-1.5-flash"
genai.configure(api_key=API_KEY)


class AIService:
    def __init__(self):
        self.model = genai.GenerativeModel(MODEL_NAME)

    async def _make_request(self, prompt: str, temperature: float) -> str:
        generation_config = {"temperature": temperature, "top_p": 1, "top_k": 0, }

        response = await self.model.generate_content_async(prompt, generation_config=generation_config,
                                                           tool_config=None)

        if response.candidates:
            return response.candidates[0].content.parts[0].text
        return ""

    async def analyze_resume(self, resume_content: str, job_description: str) -> Dict[str, Dict]:
        prompt = f"""
You are an expert resume analyst and ATS (Applicant Tracking System) compatibility checker.
Analyze the given resume against the job description.
Identify missing keywords, skill gaps, and provide actionable suggestions to optimize the resume for ATS and recruiters.

Output ONLY a JSON object in this format:

{{
    "optimization": {{
        "missing_keywords": [],
        "skill_gaps": [],
        "suggestions": [],
        "match_percentage": 0.0
    }},
    "ats": {{
        "score": 0,
        "feedback": [],
        "keyword_matches": {{
            "exact": [],
            "partial": []
        }},
        "formatting_issues": [],
        "recommendations": []
    }}
}}

Job Description:
---
{job_description}
---

Resume Content:
---
{resume_content}
---

Strictly follow the JSON format.
"""
        raw_response = await self._make_request(prompt, temperature=0.3)
        json_str = raw_response.strip()

        if "```json" in json_str:
            start = json_str.find("```json") + len("```json")
            end = json_str.rfind("```")
            if start != -1 and end != -1 and end > start:
                json_str = json_str[start:end].strip()
            else:
                json_str = json_str.replace("```json", "").replace("```", "").strip()
        elif "```" in json_str:
            start = json_str.find("```") + len("```")
            end = json_str.rfind("```")
            if start != -1 and end != -1 and end > start:
                json_str = json_str[start:end].strip()
            else:
                json_str = json_str.replace("```", "").strip()

        if not json_str or not json_str.startswith("{") or not json_str.endswith("}"):
            raise ValueError("Model response is not a valid JSON object.")

        try:
            return json.loads(json_str)
        except json.JSONDecodeError as e:
            return {"optimization": {"missing_keywords": [f"Failed to parse JSON response: {e}"], "skill_gaps": [],
                                     "suggestions": ["Ensure the model outputs valid JSON."], "match_percentage": 0.0},
                    "ats": {"score": 0, "feedback": [f"Failed to parse JSON response: {e}"], "keyword_matches": {},
                            "formatting_issues": [], "recommendations": ["Check prompt and output formatting."]}}

    async def generate_cover_letter(self, job_description: str, company_name: str, position_title: str,
                                    resume_content: Optional[str] = None, tone: str = "professional") -> Dict:
        today_str = datetime.datetime.now().strftime("%B %d, %Y")

        tone_instructions = {"formal": "Use formal, traditional business language.",
                             "confident": "Use confident, assertive language that highlights achievements.",
                             "friendly": "Use warm, approachable language while maintaining professionalism.",
                             "professional": "Use polished language that's neither too formal nor casual."}

        resume_section = f"\n\nRESUME CONTENT (for reference):\n{resume_content}" if resume_content else ""

        prompt = f'''
You are a sophisticated AI assistant tasked with crafting a professional, clear, and personalized cover letter based on the provided job description, company information, and optional resume content.

Start the letter exactly like this, replacing placeholders with realistic info:

[Your Full Name]
[Your Phone Number]
[Your Email Address]


{today_str}


[Addressee Name]
[Addressee Title]
{company_name}
[Address]
[City, State ZIP]

CRITICAL GUIDELINES:
- The cover letter should be no longer than one page with font size between 10-12 points.
- Address the letter directly to the hiring manager by name; if unknown, use "Dear Hiring Manager."
- Include the job reference number/code if available in the job description.
- The tone should reflect this instruction: {tone_instructions.get(tone.lower(), tone_instructions["professional"])}.

Cover Letter Structure:

1. Introduction (1st paragraph):
- State the purpose and provide a brief professional introduction.
- Specify why you are interested in the position **{position_title}** at **{company_name}**.
- Highlight your main strengths and skills relevant to the role.

Example: 
"I am a second year master’s student in MIT’s Technology and Policy Program (TPP) writing to apply for a consulting position in Navigant’s Emerging Technology & Business Strategy group. After speaking with John Smith at the MIT career fair, I realized that Navigant’s values of excellence, continuous development, entrepreneurial spirit, and integrity align with my principles. Moreover, I believe my knowledge of the energy sector, passion for data analysis, polished communication skills, and four years of consulting experience will enable me to deliver superior value for Navigant’s clients."

2. Body (2-3 paragraphs):
- Provide 2-3 concrete examples supporting your suitability.
- Do not merely repeat your resume; add context and detail.
- Link your skills directly to the role.

Example:
"As a graduate student in MIT’s Technology and Policy Program, I conduct research at the cutting edge of the energy sector, using statistical analysis to investigate trends in public acceptance of emerging technologies. Graduate classes and hands-on projects have prepared me to help Navigant excel. My leadership roles in student initiatives further demonstrate my ability to manage projects and collaborate effectively."

"Before MIT, my consulting experience at LMN Research Group and XYZ Consulting honed my technical writing, visual communication, and client engagement skills. These experiences align well with Navigant’s requirements for this role."

3. Closing (final paragraph):
- Reaffirm your enthusiasm and fit.
- Thank the reader and express interest in further discussion.

Example:
"I take pride in my critical thinking, communication, and leadership skills. These align well with Navigant’s values, and I look forward to contributing to your team. Thank you for your time and consideration, and I welcome the opportunity to discuss my qualifications further."

JOB DESCRIPTION:
{job_description}

RESUME (for reference):
{resume_section}

Write the full cover letter with appropriate greetings and closing, do NOT include placeholders like "[Your Name]". Generate plausible professional names and contact info if needed.
'''
        try:
            content = await self._make_request(prompt, temperature=0.7)
            return {"content": content.strip()}
        except Exception as e:
            return {"content": f"Error generating cover letter: {str(e)}"}
