from typing import List, Dict
import re


class SkillExtractor:
    """Extract skills from resume text using NLP."""

    # Common technical skills
    TECHNICAL_SKILLS = {
        "programming_languages": [
            "python", "javascript", "typescript", "java", "c++", "c#", "go", "rust",
            "ruby", "php", "swift", "kotlin", "scala", "r", "matlab", "sql"
        ],
        "frameworks": [
            "react", "vue", "angular", "node.js", "express", "django", "flask",
            "fastapi", "spring", "rails", "next.js", "nuxt.js", "svelte"
        ],
        "databases": [
            "postgresql", "mysql", "mongodb", "redis", "elasticsearch", "dynamodb",
            "sqlite", "cassandra", "neo4j", "firebase"
        ],
        "cloud_platforms": [
            "aws", "azure", "gcp", "google cloud", "heroku", "digitalocean", "vercel"
        ],
        "devops": [
            "docker", "kubernetes", "ci/cd", "jenkins", "github actions", "terraform",
            "ansible", "prometheus", "grafana"
        ],
        "tools": [
            "git", "github", "gitlab", "bitbucket", "jira", "confluence", "slack",
            "vscode", "intellij", "vim", "emacs"
        ]
    }

    # Common soft skills
    SOFT_SKILLS = [
        "communication", "leadership", "teamwork", "problem solving",
        "analytical", "creative", "adaptable", "organized", "detail-oriented",
        "time management", "critical thinking", "collaboration", "mentoring"
    ]

    def extract(self, text: str) -> List[Dict]:
        """Extract skills from text."""
        text_lower = text.lower()
        skills = []

        # Extract technical skills
        for category, skill_list in self.TECHNICAL_SKILLS.items():
            for skill in skill_list:
                if skill in text_lower:
                    skills.append({
                        "name": skill.title(),
                        "category": "technical",
                        "subcategory": category,
                        "proficiency": self._estimate_proficiency(skill, text_lower)
                    })

        # Extract soft skills
        for skill in self.SOFT_SKILLS:
            if skill in text_lower:
                skills.append({
                    "name": skill.title(),
                    "category": "soft",
                    "subcategory": "soft_skills",
                    "proficiency": "intermediate"
                })

        return skills

    def _estimate_proficiency(self, skill: str, text: str) -> str:
        """Estimate skill proficiency based on context."""
        # Simple heuristic - could be improved with NLP
        expert_keywords = ["expert", "advanced", "years", "extensive", "deep"]
        beginner_keywords = ["basic", "familiar", "beginner", "learning"]

        for keyword in expert_keywords:
            if keyword in text and skill in text:
                return "advanced"

        for keyword in beginner_keywords:
            if keyword in text and skill in text:
                return "beginner"

        return "intermediate"
