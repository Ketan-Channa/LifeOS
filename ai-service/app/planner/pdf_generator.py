import os
import io
from typing import Dict, Any, List
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable

def generate_plan_pdf_bytes(
    plan_name: str,
    date_str: str,
    overall_score: int,
    total_scheduled_hours: float,
    free_hours_remaining: float,
    schedule_blocks: List[Dict[str, Any]],
    score_breakdown: Dict[str, Any] = None,
    why_reasons: List[str] = None,
    ai_explanation: str = ""
) -> bytes:
    """
    Generates a high-quality printable PDF document for an AI Daily Plan using ReportLab.
    Returns bytes buffer.
    """
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        rightMargin=36,
        leftMargin=36,
        topMargin=36,
        bottomMargin=36
    )

    styles = getSampleStyleSheet()

    # Custom styles
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=20,
        leading=24,
        textColor=colors.HexColor('#4F46E5') # Indigo
    )

    subtitle_style = ParagraphStyle(
        'DocSubTitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=10,
        leading=13,
        textColor=colors.HexColor('#64748B')
    )

    section_style = ParagraphStyle(
        'SectionHeader',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=12,
        leading=16,
        textColor=colors.HexColor('#0F172A')
    )

    body_style = ParagraphStyle(
        'BodyTextCustom',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=12,
        textColor=colors.HexColor('#334155')
    )

    bold_body = ParagraphStyle(
        'BoldBody',
        parent=body_style,
        fontName='Helvetica-Bold'
    )

    story = []

    # 1. Header Banner
    header_data = [
        [
            Paragraph("<b>LIFEOS — AI DAILY PLAN</b>", title_style),
            Paragraph(f"<font color='#4F46E5'><b>PLAN SCORE: {overall_score} / 100</b></font>", ParagraphStyle('Score', parent=title_style, fontSize=16, alignment=2))
        ],
        [
            Paragraph(f"Date: <b>{date_str}</b> &nbsp;|&nbsp; Strategy: <b>{plan_name}</b>", subtitle_style),
            Paragraph(f"Workload: <b>{total_scheduled_hours}h</b> &nbsp;|&nbsp; Free Window: <b>{free_hours_remaining}h</b>", ParagraphStyle('SubR', parent=subtitle_style, alignment=2))
        ]
    ]

    header_table = Table(header_data, colWidths=[300, 240])
    header_table.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 2),
    ]))

    story.append(header_table)
    story.append(Spacer(1, 10))
    story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor('#E2E8F0'), spaceAfter=12))

    # 2. AI Reasoning / Explanation
    if ai_explanation:
        story.append(Paragraph("<b>AI PLANNING SUMMARY & STRATEGY TELEMETRY</b>", section_style))
        story.append(Spacer(1, 4))
        story.append(Paragraph(ai_explanation, body_style))
        story.append(Spacer(1, 10))

    # 3. Why This Plan?
    if why_reasons:
        story.append(Paragraph("<b>WHY THIS PLAN WAS GENERATED</b>", section_style))
        story.append(Spacer(1, 4))
        for r in why_reasons:
            story.append(Paragraph(f"• {r}", body_style))
        story.append(Spacer(1, 10))

    # 4. Schedule Timeline Table
    story.append(Paragraph("<b>DAILY TIMELINE SCHEDULING BLOCKS</b>", section_style))
    story.append(Spacer(1, 6))

    table_data = [
        [
            Paragraph("<b>Time Interval</b>", bold_body),
            Paragraph("<b>Activity Title</b>", bold_body),
            Paragraph("<b>Category</b>", bold_body),
            Paragraph("<b>Priority</b>", bold_body),
            Paragraph("<b>Duration</b>", bold_body)
        ]
    ]

    for b in schedule_blocks:
        t_str = f"{b.get('startTime')} - {b.get('endTime')}"
        title_p = Paragraph(f"<b>{b.get('title')}</b>", body_style)
        cat_p = Paragraph(b.get('category', 'General'), body_style)
        prio_p = Paragraph(f"<font color='{'#DC2626' if b.get('priority')=='URGENT' else '#D97706' if b.get('priority')=='HIGH' else '#4F46E5'}'><b>{b.get('priority', 'MEDIUM')}</b></font>", body_style)
        dur_p = Paragraph(f"{b.get('durationMinutes')}m", body_style)

        table_data.append([
            Paragraph(t_str, bold_body),
            title_p,
            cat_p,
            prio_p,
            dur_p
        ])

    timeline_table = Table(table_data, colWidths=[90, 210, 90, 80, 70])
    timeline_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#F1F5F9')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.HexColor('#0F172A')),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#E2E8F0')),
    ]))

    story.append(timeline_table)
    story.append(Spacer(1, 14))

    # 5. Footer Signature
    story.append(HRFlowable(width="100%", thickness=0.5, color=colors.HexColor('#CBD5E1'), spaceAfter=8))
    story.append(Paragraph("Generated using your tasks, goals, schedule, habits and LifeOS Intelligence Engine.", ParagraphStyle('Footer', parent=subtitle_style, alignment=1, fontSize=8)))

    doc.build(story)
    pdf_data = buffer.getvalue()
    buffer.close()
    return pdf_data
