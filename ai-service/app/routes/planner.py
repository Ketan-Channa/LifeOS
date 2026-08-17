from fastapi import APIRouter, HTTPException, Response
from typing import Dict, Any
from app.planner.schemas import (
    PlanningParameters,
    MultiPlanGenerationResponse,
    PDFExportRequest
)
from app.planner.planner_engine import generate_multi_candidate_plans
from app.planner.pdf_generator import generate_plan_pdf_bytes

router = APIRouter(prefix="/planner", tags=["planner"])

@router.post("/generate", response_model=MultiPlanGenerationResponse)
def generate_plans_endpoint(payload: PlanningParameters):
    try:
        response = generate_multi_candidate_plans(payload)
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/pdf-export")
def pdf_export_endpoint(payload: PDFExportRequest):
    try:
        pdf_bytes = generate_plan_pdf_bytes(
            plan_name=payload.planName,
            date_str=payload.date,
            overall_score=payload.overallScore,
            total_scheduled_hours=payload.totalScheduledHours,
            free_hours_remaining=payload.freeHoursRemaining,
            schedule_blocks=[b.dict() for b in payload.scheduleBlocks],
            why_reasons=payload.whyThisPlanReasons or [],
            ai_explanation=payload.aiExplanation or ""
        )

        filename = f"LifeOS_AI_Plan_{payload.date}.pdf"

        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={
                "Content-Disposition": f"attachment; filename={filename}"
            }
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
