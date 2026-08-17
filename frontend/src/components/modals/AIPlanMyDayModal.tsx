import React, { useState, useEffect } from 'react';
import { Sparkles, X, Calendar, Clock, CheckCircle2, AlertTriangle, Layers, Download, Sliders, RefreshCw, FileText } from 'lucide-react';
import { PlanItemBuilder } from '../planner/PlanItemBuilder';
import { AIPlanComparison } from '../planner/AIPlanComparison';
import { generateAIPlans, applyAIPlan, downloadPlanPDF } from '../../services/ai_plans.api';
import { MultiPlanGenerationResponse, PlanItemInput, CandidatePlanData } from '../../../../shared/types/lifeos.types';

interface AIPlanMyDayModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialDate?: string;
  date?: string;
}

export const AIPlanMyDayModal: React.FC<AIPlanMyDayModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialDate,
  date
}) => {
  const targetInitialDate = initialDate || date;
  // Step State: 1 = Setup & Items, 2 = Plan Comparison & Selection
  const [step, setStep] = useState<1 | 2>(1);

  // Planning Setup Configuration
  const [planningDate, setPlanningDate] = useState<string>(targetInitialDate || new Date().toISOString().split('T')[0]);
  const [windowStart, setWindowStart] = useState<string>('06:00');
  const [windowEnd, setWindowEnd] = useState<string>('23:00');
  const [planningStyle, setPlanningStyle] = useState<string>('BALANCED');
  const [maxWorkloadHours, setMaxWorkloadHours] = useState<string>('8.0');
  const [breakPreferenceMinutes, setBreakPreferenceMinutes] = useState<number>(15);

  // Items List
  const [items, setItems] = useState<PlanItemInput[]>([]);

  // Generation Response & Selected Plan
  const [generationResponse, setGenerationResponse] = useState<MultiPlanGenerationResponse | null>(null);
  const [selectedPlanId, setSelectedPlanId] = useState<string>('plan_a');
  
  // UI & Confirmation Loading State
  const [isLoading, setIsLoading] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setPlanningDate(targetInitialDate || new Date().toISOString().split('T')[0]);
      setStep(1);
      setError('');
      setGenerationResponse(null);
    }
  }, [isOpen, targetInitialDate]);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    try {
      setIsLoading(true);
      setError('');

      const payload = {
        date: planningDate,
        windowStart,
        windowEnd,
        planningStyle,
        maxWorkloadHours: maxWorkloadHours === 'NONE' ? null : Number(maxWorkloadHours),
        breakPreferenceMinutes,
        items
      };

      const response = await generateAIPlans(payload);
      setGenerationResponse(response);
      setSelectedPlanId(response.recommendedPlanId || 'plan_a');
      setIsLoading(false);
      setStep(2);
    } catch (err: any) {
      setError(err.message || 'Failed to generate multi-candidate plans.');
      setIsLoading(false);
    }
  };

  const getSelectedPlanData = (): CandidatePlanData | null => {
    if (!generationResponse || !generationResponse.plans) return null;
    return generationResponse.plans.find(p => p.planId === selectedPlanId) || generationResponse.plans[0];
  };

  const handleConfirmApply = async () => {
    const activePlan = getSelectedPlanData();
    if (!activePlan) return;

    try {
      setIsApplying(true);
      setError('');

      await applyAIPlan(planningDate, activePlan);

      setIsApplying(false);
      setShowConfirmModal(false);
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to apply plan to database.');
      setIsApplying(false);
    }
  };

  const handleDownloadPDF = async () => {
    const activePlan = getSelectedPlanData();
    if (!activePlan) return;

    try {
      setIsDownloading(true);
      setError('');
      await downloadPlanPDF(planningDate, activePlan);
      setIsDownloading(false);
    } catch (err: any) {
      setError('PDF download failed. Please try again.');
      setIsDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-3 md:p-6 overflow-hidden select-none">
      
      {/* Modal Container Card with Fixed Bounds */}
      <div className="w-full max-w-6xl max-h-[92vh] flex flex-col glass-card rounded-3xl border border-purple-500/30 bg-slate-950/95 text-slate-100 shadow-2xl overflow-hidden">
        
        {/* FIXED HEADER */}
        <div className="flex items-center justify-between p-5 px-6 border-b border-slate-800 bg-slate-950 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-500/20 to-indigo-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Sparkles size={20} />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-white tracking-tight flex items-center gap-2">
                ✨ AI PLAN MY DAY 2.0
              </h3>
              <p className="text-[11px] text-slate-400 font-mono">
                Multi-Event Intelligent Planner • Real-time Constraint & Strategy Solver
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* SCROLLABLE BODY */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1 custom-scrollbar">
          
          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2 font-mono">
              <AlertTriangle size={16} /> {error}
            </div>
          )}

          {/* STEP 1: CONFIGURATION & ITEM BUILDER */}
          {step === 1 && (
            <div className="space-y-5 font-mono text-xs">
              
              {/* Setup Controls Panel */}
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3 font-sans">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-purple-300 font-bold uppercase font-mono tracking-wider flex items-center gap-1.5">
                    <Sliders size={13} /> PLANNING PARAMETERS & BOUNDS
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">TARGET DATE: {planningDate}</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  {/* Date Shortcut */}
                  <div>
                    <label className="text-[10px] text-slate-400 uppercase font-mono block mb-1">PLANNING DATE</label>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setPlanningDate(new Date().toISOString().split('T')[0])}
                        className={`px-2.5 py-1.5 rounded-lg border text-xs font-mono font-bold ${
                          planningDate === new Date().toISOString().split('T')[0] ? 'bg-purple-600 border-purple-500 text-white' : 'bg-slate-950 border-slate-800 text-slate-400'
                        }`}
                      >
                        Today
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const tmr = new Date();
                          tmr.setDate(tmr.getDate() + 1);
                          setPlanningDate(tmr.toISOString().split('T')[0]);
                        }}
                        className={`px-2.5 py-1.5 rounded-lg border text-xs font-mono font-bold ${
                          planningDate !== new Date().toISOString().split('T')[0] ? 'bg-purple-600 border-purple-500 text-white' : 'bg-slate-950 border-slate-800 text-slate-400'
                        }`}
                      >
                        Tomorrow
                      </button>
                    </div>
                  </div>

                  {/* Planning Window */}
                  <div>
                    <label className="text-[10px] text-slate-400 uppercase font-mono block mb-1">PLANNING WINDOW</label>
                    <div className="flex items-center gap-1 font-mono">
                      <input
                        type="text"
                        value={windowStart}
                        onChange={(e) => setWindowStart(e.target.value)}
                        className="w-16 px-2 py-1 rounded-lg bg-slate-950 border border-slate-800 text-center text-xs"
                      />
                      <span className="text-slate-500">-</span>
                      <input
                        type="text"
                        value={windowEnd}
                        onChange={(e) => setWindowEnd(e.target.value)}
                        className="w-16 px-2 py-1 rounded-lg bg-slate-950 border border-slate-800 text-center text-xs"
                      />
                    </div>
                  </div>

                  {/* Max Workload Limit */}
                  <div>
                    <label className="text-[10px] text-slate-400 uppercase font-mono block mb-1">MAX WORKLOAD</label>
                    <select
                      value={maxWorkloadHours}
                      onChange={(e) => setMaxWorkloadHours(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs"
                    >
                      <option value="NONE">No Limit</option>
                      <option value="4.0">4 Hours</option>
                      <option value="6.0">6 Hours</option>
                      <option value="8.0">8 Hours</option>
                      <option value="10.0">10 Hours</option>
                    </select>
                  </div>

                  {/* Break Preference */}
                  <div>
                    <label className="text-[10px] text-slate-400 uppercase font-mono block mb-1">BREAK PREFERENCE</label>
                    <select
                      value={breakPreferenceMinutes}
                      onChange={(e) => setBreakPreferenceMinutes(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs"
                    >
                      <option value={0}>No Automatic Breaks</option>
                      <option value={15}>Every 45-60 Mins (15m Break)</option>
                      <option value={30}>Every 90 Mins (30m Break)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Event Input Builder */}
              <PlanItemBuilder items={items} onChange={setItems} />

            </div>
          )}

          {/* STEP 2: MULTI-PLAN CANDIDATE COMPARISON & SELECTION */}
          {step === 2 && generationResponse && (
            <div className="space-y-5 font-mono text-xs">
              
              {/* Overload Alert Banner */}
              {generationResponse.isOverloaded && generationResponse.overloadMessage && (
                <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs space-y-1">
                  <span className="font-bold uppercase tracking-wide flex items-center gap-1.5">
                    <AlertTriangle size={15} /> CAPACITY OVERLOAD WARNING
                  </span>
                  <p className="font-sans leading-relaxed text-slate-300">{generationResponse.overloadMessage}</p>
                </div>
              )}

              {/* Multi-Plan Comparison Grid */}
              <AIPlanComparison
                plans={generationResponse.plans}
                selectedPlanId={selectedPlanId}
                onSelectPlan={setSelectedPlanId}
              />

            </div>
          )}

        </div>

        {/* FIXED FOOTER */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-4 px-6 border-t border-slate-800 bg-slate-950 shrink-0">
          {step === 1 ? (
            <>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-slate-400 hover:text-white transition-colors text-xs font-bold"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleGenerate}
                disabled={isLoading}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 font-bold text-xs text-white transition-all shadow-lg shadow-purple-600/30 flex items-center gap-2 disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    Generating Candidate Plans...
                  </>
                ) : (
                  <>
                    <Sparkles size={15} /> Generate 4 Candidate Plans
                  </>
                )}
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white transition-colors flex items-center gap-1.5 text-xs font-bold"
              >
                <RefreshCw size={14} /> Back / Modify Inputs
              </button>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleDownloadPDF}
                  disabled={isDownloading}
                  className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 hover:text-white transition-colors flex items-center gap-1.5 text-xs font-bold disabled:opacity-50"
                >
                  <Download size={14} /> {isDownloading ? 'Downloading...' : 'Download PDF'}
                </button>

                <button
                  type="button"
                  onClick={() => setShowConfirmModal(true)}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 font-bold text-xs text-white transition-all shadow-lg shadow-purple-600/30 flex items-center gap-2"
                >
                  <CheckCircle2 size={16} /> Apply Selected Plan
                </button>
              </div>
            </>
          )}
        </div>

        {/* CONFIRMATION POPUP MODAL */}
        {showConfirmModal && getSelectedPlanData() && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 font-sans select-none">
            <div className="w-full max-w-md glass-card rounded-3xl border border-purple-500/30 p-6 space-y-4 bg-slate-950 text-slate-100 shadow-2xl">
              
              <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
                <div className="w-9 h-9 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
                  <CheckCircle2 size={18} />
                </div>
                <div>
                  <h4 className="font-bold text-base text-white">CONFIRM PLAN APPLICATION</h4>
                  <p className="text-xs text-slate-400 font-mono">Apply schedule events to MySQL database</p>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed font-mono">
                Are you sure you want to apply <strong>{getSelectedPlanData()?.planName}</strong> to your LifeOS schedule for <strong>{planningDate}</strong>?
              </p>

              <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 space-y-1.5 text-xs font-mono text-slate-300">
                <div className="flex justify-between">
                  <span>Events to Create:</span>
                  <strong className="text-emerald-400 font-bold">{getSelectedPlanData()?.scheduledItemsCount}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Total Workload:</span>
                  <strong className="text-white font-bold">{getSelectedPlanData()?.totalScheduledHours}h</strong>
                </div>
                <div className="flex justify-between">
                  <span>Remaining Free Time:</span>
                  <strong className="text-cyan-400 font-bold">{getSelectedPlanData()?.freeHoursRemaining}h</strong>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowConfirmModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white transition-colors text-xs font-bold"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleConfirmApply}
                  disabled={isApplying}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 font-bold text-white transition-all shadow-lg text-xs flex items-center gap-1.5 disabled:opacity-50"
                >
                  {isApplying ? 'Applying Plan...' : 'Confirm & Apply'}
                </button>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export const AIDailyPlanModal = AIPlanMyDayModal;
