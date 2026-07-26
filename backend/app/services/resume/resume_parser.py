from typing import Optional
import fitz  # PyMuPDF
from docx import Document
import os


class ResumeParser:
    """Parse resume content from PDF and DOCX files."""

    def parse(self, file_path: str) -> str:
        """Parse resume and return plain text."""
        ext = os.path.splitext(file_path)[1].lower()

        if ext == ".pdf":
            return self._parse_pdf(file_path)
        elif ext == ".docx":
            return self._parse_docx(file_path)
        else:
            raise ValueError(f"Unsupported file format: {ext}")

    def _parse_pdf(self, file_path: str) -> str:
        """Parse PDF file."""
        doc = fitz.open(file_path)
        text = ""

        for page in doc:
            text += page.get_text()

        doc.close()
        return text.strip()

    def _parse_docx(self, file_path: str) -> str:
        """Parse DOCX file."""
        doc = Document(file_path)
        text = ""

        for paragraph in doc.paragraphs:
            text += paragraph.text + "\n"

        return text.strip()

    def extract_sections(self, text: str) -> dict:
        """Extract sections from resume text."""
        sections = {
            "contact": "",
            "summary": "",
            "experience": "",
            "education": "",
            "skills": "",
            "projects": ""
        }

        # Simple section extraction based on common headers
        lines = text.split("\n")
        current_section = None

        for line in lines:
            line_lower = line.lower().strip()

            if any(word in line_lower for word in ["contact", "email", "phone"]):
                current_section = "contact"
            elif any(word in line_lower for word in ["summary", "objective", "profile"]):
                current_section = "summary"
            elif any(word in line_lower for word in ["experience", "work history", "employment"]):
                current_section = "experience"
            elif any(word in line_lower for word in ["education", "academic"]):
                current_section = "education"
            elif any(word in line_lower for word in ["skills", "technologies", "competencies"]):
                current_section = "skills"
            elif any(word in line_lower for word in ["projects", "portfolio"]):
                current_section = "projects"

            if current_section and line.strip():
                sections[current_section] += line + "\n"

        return sections
