from fpdf import FPDF
from datetime import datetime
import io
import re

def clean_text(text: str) -> str:
    """Remove special characters that latin-1 can't encode."""
    if not text:
        return ""
    # Replace common special chars with ASCII equivalents
    text = text.replace("\u2014", "-")   # em dash
    text = text.replace("\u2013", "-")   # en dash
    text = text.replace("\u2018", "'")   # left single quote
    text = text.replace("\u2019", "'")   # right single quote
    text = text.replace("\u201c", '"')   # left double quote
    text = text.replace("\u201d", '"')   # right double quote
    text = text.replace("\u2022", "*")   # bullet
    text = text.replace("\u2026", "...") # ellipsis
    # Remove markdown bold/italic markers
    text = re.sub(r'\*\*(.*?)\*\*', r'\1', text)
    text = re.sub(r'\*(.*?)\*', r'\1', text)
    # Remove any remaining non-latin-1 characters
    text = text.encode("latin-1", errors="replace").decode("latin-1")
    return text

class CrimeReportPDF(FPDF):
    def header(self):
        self.set_font("Helvetica", "B", 14)
        self.set_text_color(30, 60, 120)
        self.cell(0, 10, "Karnataka State Police - Crime Intelligence Report", align="C", new_x="LMARGIN", new_y="NEXT")
        self.set_font("Helvetica", "", 9)
        self.set_text_color(100, 100, 100)
        self.cell(0, 6, f"Generated: {datetime.now().strftime('%d %b %Y, %I:%M %p')}", align="C", new_x="LMARGIN", new_y="NEXT")
        self.ln(3)
        self.set_draw_color(30, 60, 120)
        self.set_line_width(0.5)
        self.line(10, self.get_y(), 200, self.get_y())
        self.ln(4)

    def footer(self):
        self.set_y(-15)
        self.set_font("Helvetica", "I", 8)
        self.set_text_color(150, 150, 150)
        self.cell(0, 10, f"Page {self.page_no()} | Confidential - For Official Use Only", align="C")

def generate_chat_pdf(conversation: list[dict], query_results: list[dict] = None) -> bytes:
    pdf = CrimeReportPDF()
    pdf.add_page()
    pdf.set_auto_page_break(auto=True, margin=15)

    # Conversation section
    pdf.set_font("Helvetica", "B", 11)
    pdf.set_text_color(30, 60, 120)
    pdf.cell(0, 8, "Conversation History", new_x="LMARGIN", new_y="NEXT")
    pdf.ln(2)

    for turn in conversation:
        role = turn.get("role", "user")
        content = clean_text(turn.get("content", ""))

        if role == "user":
            pdf.set_fill_color(240, 245, 255)
            pdf.set_font("Helvetica", "B", 9)
            pdf.set_text_color(30, 60, 120)
            pdf.cell(0, 6, "Investigator:", new_x="LMARGIN", new_y="NEXT", fill=True)
        else:
            pdf.set_fill_color(248, 248, 248)
            pdf.set_font("Helvetica", "B", 9)
            pdf.set_text_color(60, 120, 60)
            pdf.cell(0, 6, "AI Assistant:", new_x="LMARGIN", new_y="NEXT", fill=True)

        pdf.set_font("Helvetica", "", 9)
        pdf.set_text_color(40, 40, 40)
        pdf.multi_cell(0, 5, content, new_x="LMARGIN", new_y="NEXT")
        pdf.ln(2)

    # Query results table
    if query_results and len(query_results) > 0:
        pdf.add_page()
        pdf.set_font("Helvetica", "B", 11)
        pdf.set_text_color(30, 60, 120)
        pdf.cell(0, 8, f"Query Results ({len(query_results)} records)", new_x="LMARGIN", new_y="NEXT")
        pdf.ln(2)

        cols = list(query_results[0].keys())
        col_width = min(180 / len(cols), 40)

        pdf.set_fill_color(30, 60, 120)
        pdf.set_text_color(255, 255, 255)
        pdf.set_font("Helvetica", "B", 7)
        for col in cols:
            pdf.cell(col_width, 7, clean_text(str(col)[:15]), border=1, fill=True)
        pdf.ln()

        pdf.set_font("Helvetica", "", 7)
        pdf.set_text_color(40, 40, 40)
        for i, row in enumerate(query_results[:100]):
            pdf.set_fill_color(245, 245, 255) if i % 2 == 0 else pdf.set_fill_color(255, 255, 255)
            for col in cols:
                val = clean_text(str(row.get(col, ""))[:18])
                pdf.cell(col_width, 6, val, border=1, fill=True)
            pdf.ln()

    output = io.BytesIO()
    pdf.output(output)
    return output.getvalue()