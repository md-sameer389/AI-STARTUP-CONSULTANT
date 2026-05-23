import os
from datetime import datetime
from typing import Dict, Any, List
import structlog
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.units import inch
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether
from reportlab.pdfgen import canvas

logger = structlog.get_logger(__name__)

class NumberedCanvas(canvas.Canvas):
    """
    Two-pass canvas to dynamically compute and print total page count in the footer.
    """
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.pages = []

    def showPage(self):
        self.pages.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        page_count = len(self.pages)
        for page in self.pages:
            self.__dict__.update(page)
            self.draw_footer(page_count)
            self.draw_header()
            super().showPage()
        super().save()

    def draw_footer(self, page_count: int):
        self.saveState()
        self.setFont("Helvetica", 9)
        self.setFillColor(colors.HexColor("#475569"))
        
        # Don't draw headers/footers on cover page
        if self._pageNumber > 1:
            footer_text = f"Page {self._pageNumber} of {page_count}"
            self.drawRightString(letter[0] - 54, 36, footer_text)
            self.drawString(54, 36, "StartupAI Consulting — Confidential Report")
            
            # Bottom line divider
            self.setStrokeColor(colors.HexColor("#cbd5e1"))
            self.setLineWidth(0.5)
            self.line(54, 48, letter[0] - 54, 48)
            
        self.restoreState()

    def draw_header(self):
        self.saveState()
        if self._pageNumber > 1:
            self.setFont("Helvetica-Bold", 8)
            self.setFillColor(colors.HexColor("#0f172a"))
            self.drawString(54, letter[1] - 36, "AI STARTUP CONSULTANT PLAN")
            
            self.setFont("Helvetica", 8)
            self.setFillColor(colors.HexColor("#64748b"))
            self.drawRightString(letter[0] - 54, letter[1] - 36, datetime.now().strftime("%B %Y"))
            
            # Top divider
            self.setStrokeColor(colors.HexColor("#e2e8f0"))
            self.setLineWidth(0.5)
            self.line(54, letter[1] - 42, letter[0] - 54, letter[1] - 42)
        self.restoreState()


class PDFGenerator:
    @staticmethod
    def _create_style_sheet() -> Dict[str, ParagraphStyle]:
        styles = getSampleStyleSheet()
        
        # Custom palette
        primary = colors.HexColor("#0f172a") # Navy
        secondary = colors.HexColor("#0d9488") # Teal
        text_color = colors.HexColor("#334155") # Slate
        
        custom_styles = {
            "CoverTitle": ParagraphStyle(
                "CoverTitle",
                parent=styles["Normal"],
                fontName="Helvetica-Bold",
                fontSize=28,
                leading=34,
                textColor=primary,
                alignment=1, # Centered
                spaceAfter=15
            ),
            "CoverSubtitle": ParagraphStyle(
                "CoverSubtitle",
                parent=styles["Normal"],
                fontName="Helvetica",
                fontSize=14,
                leading=18,
                textColor=secondary,
                alignment=1,
                spaceAfter=50
            ),
            "CoverMeta": ParagraphStyle(
                "CoverMeta",
                parent=styles["Normal"],
                fontName="Helvetica",
                fontSize=10,
                leading=14,
                textColor=text_color,
                alignment=1
            ),
            "ReportH1": ParagraphStyle(
                "ReportH1",
                parent=styles["Heading1"],
                fontName="Helvetica-Bold",
                fontSize=20,
                leading=24,
                textColor=primary,
                spaceBefore=15,
                spaceAfter=10,
                keepWithNext=True
            ),
            "ReportH2": ParagraphStyle(
                "ReportH2",
                parent=styles["Heading2"],
                fontName="Helvetica-Bold",
                fontSize=14,
                leading=18,
                textColor=secondary,
                spaceBefore=12,
                spaceAfter=8,
                keepWithNext=True
            ),
            "ReportBody": ParagraphStyle(
                "ReportBody",
                parent=styles["Normal"],
                fontName="Helvetica",
                fontSize=10,
                leading=14,
                textColor=text_color,
                spaceBefore=4,
                spaceAfter=8
            ),
            "ReportBullet": ParagraphStyle(
                "ReportBullet",
                parent=styles["Normal"],
                fontName="Helvetica",
                fontSize=10,
                leading=14,
                textColor=text_color,
                leftIndent=15,
                firstLineIndent=-10,
                spaceBefore=3,
                spaceAfter=3
            ),
            "TableText": ParagraphStyle(
                "TableText",
                parent=styles["Normal"],
                fontName="Helvetica",
                fontSize=9,
                leading=11,
                textColor=text_color
            ),
            "TableHeaderText": ParagraphStyle(
                "TableHeaderText",
                parent=styles["Normal"],
                fontName="Helvetica-Bold",
                fontSize=9,
                leading=11,
                textColor=colors.white
            )
        }
        return custom_styles

    @classmethod
    def generate_report(cls, report_data: Dict[str, Any], output_path: str) -> str:
        """
        Creates a beautifully styled, print-ready PDF containing the full startup plan.
        """
        logger.info("Generating PDF report", path=output_path)
        
        # Ensure parent directory exists
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        
        doc = SimpleDocTemplate(
            output_path,
            pagesize=letter,
            leftMargin=54,  # 0.75 in
            rightMargin=54,
            topMargin=54,
            bottomMargin=54
        )
        
        styles = cls._create_style_sheet()
        story = []

        startup_idea = report_data.get("startup_idea", "Your Startup Idea")

        # ----------------------------------------------------
        # COVER PAGE
        # ----------------------------------------------------
        story.append(Spacer(1, 150))
        # Top branding accent line
        story.append(Table(
            [[""]], 
            colWidths=[letter[0] - 108], 
            rowHeights=[6], 
            style=TableStyle([
                ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#0d9488")),
                ("BOTTOMPADDING", (0,0), (-1,-1), 0),
                ("TOPPADDING", (0,0), (-1,-1), 0),
            ])
        ))
        story.append(Spacer(1, 20))
        story.append(Paragraph(f"STARTUP FEASIBILITY & STRATEGY REPORT", styles["CoverSubtitle"]))
        story.append(Paragraph(f'"{startup_idea}"', styles["CoverTitle"]))
        story.append(Spacer(1, 100))
        
        created_date = datetime.now().strftime("%B %d, %Y")
        story.append(Paragraph(f"<b>Generated by:</b> StartupAI Multi-Agent Analyst Suite<br/>"
                               f"<b>Date:</b> {created_date}<br/>"
                               f"<b>Classification:</b> Proprietary & Confidential", styles["CoverMeta"]))
        
        story.append(PageBreak())

        # ----------------------------------------------------
        # SECTION 1: MARKET RESEARCH
        # ----------------------------------------------------
        market = report_data.get("market_research", {}) or {}
        story.append(Paragraph("1. Market Research & Trends", styles["ReportH1"]))
        
        size = market.get("market_size", "Data unavailable")
        story.append(Paragraph(f"<b>Market Size Assessment:</b> {size}", styles["ReportBody"]))
        story.append(Spacer(1, 5))
        
        # Target demographics
        story.append(Paragraph("Target Demographics", styles["ReportH2"]))
        demographics = market.get("target_demographics", []) or []
        for demo in demographics:
            story.append(Paragraph(f"• {demo}", styles["ReportBullet"]))
            
        # Trends
        story.append(Paragraph("Industry & Tech Trends", styles["ReportH2"]))
        trends = market.get("industry_trends", []) or []
        for trend in trends:
            story.append(Paragraph(f"• {trend}", styles["ReportBullet"]))
            
        # Demand signals
        story.append(Paragraph("Consumer Demand Signals", styles["ReportH2"]))
        signals = market.get("demand_signals", []) or []
        for signal in signals:
            story.append(Paragraph(f"• {signal}", styles["ReportBullet"]))
            
        # Summary
        summary = market.get("summary", "")
        if summary:
            story.append(Paragraph("Market Analyst Summary", styles["ReportH2"]))
            story.append(Paragraph(summary, styles["ReportBody"]))

        story.append(PageBreak())

        # ----------------------------------------------------
        # SECTION 2: COMPETITOR ANALYSIS
        # ----------------------------------------------------
        comp_data = report_data.get("competitor_analysis", {}) or {}
        story.append(Paragraph("2. Competitive Intelligence", styles["ReportH1"]))
        
        competitors = comp_data.get("competitors", []) or []
        if competitors:
            # Competitors Table
            table_data = [[
                Paragraph("<b>Competitor</b>", styles["TableHeaderText"]),
                Paragraph("<b>Pricing</b>", styles["TableHeaderText"]),
                Paragraph("<b>Strengths</b>", styles["TableHeaderText"]),
                Paragraph("<b>Weaknesses</b>", styles["TableHeaderText"]),
                Paragraph("<b>Differentiator</b>", styles["TableHeaderText"])
            ]]
            
            # Width parameters
            w_col = [80, 70, 110, 110, 110]
            
            for c in competitors:
                name = c.get("name", "N/A")
                website = c.get("website", "")
                pricing = c.get("pricing", "N/A")
                
                # Format bullet arrays as text strings
                strengths = "<br/>".join([f"• {s}" for s in c.get("strengths", [])]) or "N/A"
                weaknesses = "<br/>".join([f"• {w}" for w in c.get("weaknesses", [])]) or "N/A"
                diff = c.get("differentiator", "N/A")
                
                table_data.append([
                    Paragraph(f"<b>{name}</b><br/>{website}", styles["TableText"]),
                    Paragraph(pricing, styles["TableText"]),
                    Paragraph(strengths, styles["TableText"]),
                    Paragraph(weaknesses, styles["TableText"]),
                    Paragraph(diff, styles["TableText"])
                ])
                
            comp_table = Table(table_data, colWidths=w_col)
            comp_table.setStyle(TableStyle([
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#0f172a")),
                ("ALIGN", (0, 0), (-1, -1), "LEFT"),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#cbd5e1")),
                ("TOPPADDING", (0, 0), (-1, -1), 6),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
                ("LEFTPADDING", (0, 0), (-1, -1), 6),
                ("RIGHTPADDING", (0, 0), (-1, -1), 6),
                ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.HexColor("#f8fafc"), colors.white])
            ]))
            story.append(comp_table)
            story.append(Spacer(1, 15))
            
        gap = comp_data.get("market_gap", "")
        if gap:
            story.append(Paragraph("Identified Market Opportunity & Gap", styles["ReportH2"]))
            story.append(Paragraph(gap, styles["ReportBody"]))

        story.append(PageBreak())

        # ----------------------------------------------------
        # SECTION 3: BUSINESS STRATEGY
        # ----------------------------------------------------
        strategy = report_data.get("business_strategy", {}) or {}
        story.append(Paragraph("3. Business Strategy & Go-To-Market", styles["ReportH1"]))
        
        model = strategy.get("business_model", "")
        if model:
            story.append(Paragraph("Core Business Model", styles["ReportH2"]))
            story.append(Paragraph(model, styles["ReportBody"]))
            
        # Target audience
        audience = strategy.get("target_audience", {}) or {}
        primary_aud = audience.get("primary", "")
        secondary_aud = audience.get("secondary", "")
        if primary_aud or secondary_aud:
            story.append(Paragraph("Target Customer Segments", styles["ReportH2"]))
            if primary_aud:
                story.append(Paragraph(f"<b>Primary:</b> {primary_aud}", styles["ReportBody"]))
            if secondary_aud:
                story.append(Paragraph(f"<b>Secondary:</b> {secondary_aud}", styles["ReportBody"]))
                
        # Pricing tiers
        pricing_tiers = strategy.get("pricing_tiers", []) or []
        if pricing_tiers:
            story.append(Paragraph("Proposed Pricing Structure", styles["ReportH2"]))
            tier_data = [[
                Paragraph("<b>Pricing Tier</b>", styles["TableHeaderText"]),
                Paragraph("<b>Price Point</b>", styles["TableHeaderText"]),
                Paragraph("<b>Key Features included</b>", styles["TableHeaderText"])
            ]]
            for tier in pricing_tiers:
                tier_name = tier.get("tier", "N/A")
                price = tier.get("price", "N/A")
                features = ", ".join(tier.get("features", [])) or "N/A"
                tier_data.append([
                    Paragraph(f"<b>{tier_name}</b>", styles["TableText"]),
                    Paragraph(price, styles["TableText"]),
                    Paragraph(features, styles["TableText"])
                ])
            
            tier_table = Table(tier_data, colWidths=[120, 100, 260])
            tier_table.setStyle(TableStyle([
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#0d9488")),
                ("ALIGN", (0, 0), (-1, -1), "LEFT"),
                ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#cbd5e1")),
                ("TOPPADDING", (0, 0), (-1, -1), 6),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
                ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.HexColor("#f8fafc"), colors.white])
            ]))
            story.append(tier_table)
            story.append(Spacer(1, 10))

        # Marketing & GTM
        gtm = strategy.get("go_to_market_strategy", []) or []
        if gtm:
            story.append(Paragraph("Go-To-Market Execution Plan", styles["ReportH2"]))
            for idx, step in enumerate(gtm):
                story.append(Paragraph(f"<b>Phase {idx+1}:</b> {step}", styles["ReportBullet"]))
                
        channels = strategy.get("marketing_channels", []) or []
        if channels:
            story.append(Paragraph("Recommended Acquisition Channels", styles["ReportH2"]))
            for chan in channels:
                story.append(Paragraph(f"• {chan}", styles["ReportBullet"]))

        story.append(PageBreak())

        # ----------------------------------------------------
        # SECTION 4: FINANCIALS
        # ----------------------------------------------------
        financials = report_data.get("financials", {}) or {}
        story.append(Paragraph("4. Financial Projections & Economics", styles["ReportH1"]))
        
        # Startup costs
        costs = financials.get("startup_costs", {}) or {}
        if costs:
            story.append(Paragraph("Initial Startup CapEx & OpEx", styles["ReportH2"]))
            cost_data = [
                [Paragraph("<b>Category</b>", styles["TableHeaderText"]), Paragraph("<b>Estimated Cost Range</b>", styles["TableHeaderText"])],
                [Paragraph("Product Development & Engineering", styles["TableText"]), Paragraph(costs.get("development", "N/A"), styles["TableText"])],
                [Paragraph("Technology & Server Infrastructure", styles["TableText"]), Paragraph(costs.get("infrastructure", "N/A"), styles["TableText"])],
                [Paragraph("Initial Marketing & Launch Acquisition", styles["TableText"]), Paragraph(costs.get("marketing", "N/A"), styles["TableText"])],
                [Paragraph("Legal, Compliance & Registration", styles["TableText"]), Paragraph(costs.get("legal", "N/A"), styles["TableText"])],
                [Paragraph("<b>Total Estimated Budget</b>", styles["TableText"]), Paragraph(f"<b>{costs.get('total_estimated', 'N/A')}</b>", styles["TableText"])]
            ]
            cost_table = Table(cost_data, colWidths=[240, 240])
            cost_table.setStyle(TableStyle([
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#0f172a")),
                ("ALIGN", (0, 0), (-1, -1), "LEFT"),
                ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#cbd5e1")),
                ("TOPPADDING", (0, 0), (-1, -1), 6),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
                ("BACKGROUND", (0, -1), (-1, -1), colors.HexColor("#f1f5f9"))
            ]))
            story.append(cost_table)
            story.append(Spacer(1, 15))

        monthly = financials.get("monthly_operational_costs", "")
        if monthly:
            story.append(Paragraph(f"<b>Monthly Operational Cost Structure:</b> {monthly}", styles["ReportBody"]))
            
        projections = financials.get("revenue_projection", {}) or {}
        if projections:
            story.append(Paragraph("Revenue Forecast Model", styles["ReportH2"]))
            proj_data = [
                [Paragraph("<b>Time Horizon</b>", styles["TableHeaderText"]), Paragraph("<b>Estimated Revenue Run-Rate</b>", styles["TableHeaderText"])],
                [Paragraph("Month 6 Run-Rate", styles["TableText"]), Paragraph(projections.get("month_6", "N/A"), styles["TableText"])],
                [Paragraph("Month 12 Run-Rate", styles["TableText"]), Paragraph(projections.get("month_12", "N/A"), styles["TableText"])],
                [Paragraph("Month 24 Run-Rate", styles["TableText"]), Paragraph(projections.get("month_24", "N/A"), styles["TableText"])]
            ]
            proj_table = Table(proj_data, colWidths=[240, 240])
            proj_table.setStyle(TableStyle([
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#0d9488")),
                ("ALIGN", (0, 0), (-1, -1), "LEFT"),
                ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#cbd5e1")),
                ("TOPPADDING", (0, 0), (-1, -1), 6),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
                ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.HexColor("#f8fafc"), colors.white])
            ]))
            story.append(proj_table)
            story.append(Spacer(1, 10))

        breakeven = financials.get("break_even_estimate", "")
        if breakeven:
            story.append(Paragraph(f"<b>Estimated Time to Break-Even:</b> {breakeven}", styles["ReportBody"]))
            
        funding = financials.get("funding_recommendation", "")
        if funding:
            story.append(Paragraph("Strategic Funding Recommendation", styles["ReportH2"]))
            story.append(Paragraph(funding, styles["ReportBody"]))

        story.append(PageBreak())

        # ----------------------------------------------------
        # SECTION 5: SWOT ANALYSIS
        # ----------------------------------------------------
        swot = report_data.get("swot", {}) or {}
        story.append(Paragraph("5. SWOT Matrix Analysis", styles["ReportH1"]))
        story.append(Spacer(1, 10))
        
        # 2x2 grid representing SWOT. Ensure wrapping using Paragraph inside tables.
        strengths_list = "<br/>".join([f"• {x}" for x in swot.get("strengths", [])]) or "Data missing"
        weaknesses_list = "<br/>".join([f"• {x}" for x in swot.get("weaknesses", [])]) or "Data missing"
        opp_list = "<br/>".join([f"• {x}" for x in swot.get("opportunities", [])]) or "Data missing"
        threats_list = "<br/>".join([f"• {x}" for x in swot.get("threats", [])]) or "Data missing"

        swot_matrix_data = [
            [
                Paragraph("<b>STRENGTHS (Internal)</b><br/>" + strengths_list, styles["TableText"]),
                Paragraph("<b>WEAKNESSES (Internal)</b><br/>" + weaknesses_list, styles["TableText"])
            ],
            [
                Paragraph("<b>OPPORTUNITIES (External)</b><br/>" + opp_list, styles["TableText"]),
                Paragraph("<b>THREATS (External)</b><br/>" + threats_list, styles["TableText"])
            ]
        ]
        
        swot_table = Table(swot_matrix_data, colWidths=[235, 235], rowHeights=[200, 200])
        swot_table.setStyle(TableStyle([
            ("GRID", (0, 0), (-1, -1), 1, colors.HexColor("#94a3b8")),
            ("BACKGROUND", (0, 0), (0, 0), colors.HexColor("#f0fdf4")),  # Light Green
            ("BACKGROUND", (1, 0), (1, 0), colors.HexColor("#fef2f2")),  # Light Red
            ("BACKGROUND", (0, 1), (0, 1), colors.HexColor("#eff6ff")),  # Light Blue
            ("BACKGROUND", (1, 1), (1, 1), colors.HexColor("#fffbeb")),  # Light Yellow/Orange
            ("VALIGN", (0, 0), (-1, -1), "TOP"),
            ("TOPPADDING", (0, 0), (-1, -1), 10),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 10),
            ("LEFTPADDING", (0, 0), (-1, -1), 10),
            ("RIGHTPADDING", (0, 0), (-1, -1), 10),
        ]))
        story.append(swot_table)

        story.append(PageBreak())

        # ----------------------------------------------------
        # SECTION 6: PITCH DECK SLIDES
        # ----------------------------------------------------
        deck = report_data.get("pitch_deck", {}) or {}
        story.append(Paragraph("6. Investor Pitch Deck Outline", styles["ReportH1"]))
        
        slides = deck.get("slides", []) or []
        for s in slides:
            num = s.get("slide_number", 0)
            title = s.get("title", f"Slide {num}")
            headline = s.get("headline", "")
            bullets = s.get("bullet_points", [])
            notes = s.get("speaker_notes", "")
            
            slide_elements = [
                Paragraph(f"<b>Slide {num}: {title}</b>", styles["ReportH2"]),
                Paragraph(f"<i>Headline: {headline}</i>", styles["ReportBody"]),
            ]
            
            for b in bullets:
                slide_elements.append(Paragraph(f"• {b}", styles["ReportBullet"]))
                
            if notes:
                slide_elements.append(Spacer(1, 5))
                slide_elements.append(Paragraph(f"<b>Speaker Notes:</b> {notes}", styles["ReportBody"]))
                
            slide_elements.append(Spacer(1, 10))
            
            story.append(KeepTogether(slide_elements))

        # Build Document
        doc.build(story, canvasmaker=NumberedCanvas)
        logger.info("PDF document successfully built", path=output_path)
        return output_path
