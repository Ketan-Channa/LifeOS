import React, { useState } from 'react';
import { Plus, Trash2, Clock, Zap, Calendar, Lock, Unlock, AlertCircle } from 'lucide-react';
import { PlanItemInput, Priority, EnergyLevel } from '../../../../shared/types/lifeos.types';

interface PlanItemBuilderProps {
  items: PlanItemInput[];
  onChange: (items: PlanItemInput[]) => void;
}

export const PlanItemBuilder: React.FC<PlanItemBuilderProps> = ({ items, onChange }) => {
  const [newItemTitle, setNewItemTitle] = useState('');
  const [newItemDuration, setNewItemDuration] = useState(60);
  const [newItemPriority, setNewItemPriority] = useState<Priority>('HIGH');
  const [newItemEnergy, setNewItemEnergy] = useState<EnergyLevel>('HIGH');
  const [newItemDeadline, setNewItemDeadline] = useState('Today');
  const [newItemCategory, setNewItemCategory] = useState('Project');
  const [newItemPrefTime, setNewItemPrefTime] = useState('');
  const [newItemFixed, setNewItemFixed] = useState(false);

  const handleAddItem = () => {
    if (!newItemTitle.trim()) return;
    const newItem: PlanItemInput = {
      id: `custom_${Date.now()}`,
      title: newItemTitle.trim(),
      durationMinutes: newItemDuration,
      priority: newItemPriority,
      category: newItemCategory,
      energyLevel: newItemEnergy,
      deadline: newItemDeadline,
      preferredStartTime: newItemPrefTime || undefined,
      isFixed: newItemFixed,
      isFlexible: !newItemFixed
    };
    onChange([...items, newItem]);
    setNewItemTitle('');
    setNewItemPrefTime('');
  };

  const handleRemoveItem = (idOrIndex: string | number) => {
    onChange(items.filter((item, idx) => item.id ? item.id !== idOrIndex : idx !== idOrIndex));
  };

  const handleToggleFixed = (index: number) => {
    const updated = [...items];
    updated[index].isFixed = !updated[index].isFixed;
    updated[index].isFlexible = !updated[index].isFixed;
    onChange(updated);
  };

  return (
    <div className="space-y-4 font-mono text-xs">
      
      {/* Quick Add Custom Item Form */}
      <div className="p-4 rounded-2xl bg-slate-900/90 border border-purple-500/20 space-y-3 font-sans">
        <span className="text-[10px] text-purple-300 font-bold uppercase tracking-wider font-mono block">
          + ADD CUSTOM EVENT / ACTIVITY FOR PLANNING
        </span>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
          <input
            type="text"
            placeholder="e.g. LifeOS Development, College, Gym..."
            value={newItemTitle}
            onChange={(e) => setNewItemTitle(e.target.value)}
            className="px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-purple-500"
          />

          <div className="flex items-center gap-2">
            <select
              value={newItemDuration}
              onChange={(e) => setNewItemDuration(Number(e.target.value))}
              className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 text-xs"
            >
              <option value={30}>30 mins</option>
              <option value={45}>45 mins</option>
              <option value={60}>60 mins (1h)</option>
              <option value={90}>90 mins (1.5h)</option>
              <option value={120}>120 mins (2h)</option>
              <option value={180}>180 mins (3h)</option>
            </select>

            <select
              value={newItemPriority}
              onChange={(e) => setNewItemPriority(e.target.value as Priority)}
              className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 text-xs"
            >
              <option value="URGENT">URGENT</option>
              <option value="HIGH">HIGH</option>
              <option value="MEDIUM">MEDIUM</option>
              <option value="LOW">LOW</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={newItemEnergy}
              onChange={(e) => setNewItemEnergy(e.target.value as EnergyLevel)}
              className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 text-xs"
            >
              <option value="HIGH">HIGH ENERGY</option>
              <option value="MEDIUM">MEDIUM ENERGY</option>
              <option value="LOW">LOW ENERGY</option>
            </select>

            <button
              type="button"
              onClick={handleAddItem}
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 font-bold text-white transition-colors flex items-center gap-1 shrink-0"
            >
              <Plus size={15} /> Add
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3 pt-1 text-[11px] text-slate-400">
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={newItemFixed}
              onChange={(e) => setNewItemFixed(e.target.checked)}
              className="rounded bg-slate-950 border-slate-700 text-purple-600 focus:ring-0"
            />
            <span className="flex items-center gap-1">
              {newItemFixed ? <Lock size={12} className="text-amber-400" /> : <Unlock size={12} className="text-slate-500" />}
              Fixed Time Block (Do Not Move)
            </span>
          </label>

          {newItemFixed && (
            <input
              type="text"
              placeholder="Start HH:MM e.g. 09:00"
              value={newItemPrefTime}
              onChange={(e) => setNewItemPrefTime(e.target.value)}
              className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 text-xs w-32 font-mono"
            />
          )}
        </div>
      </div>

      {/* Item List Header */}
      <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold uppercase">
        <span>ACTIVITIES FOR DAILY PLANNER ({items.length} ITEMS)</span>
        <span>DURATION & CONSTRAINTS</span>
      </div>

      {/* Active Items List */}
      <div className="space-y-2 max-h-64 overflow-y-auto pr-1 custom-scrollbar">
        {items.length === 0 ? (
          <div className="p-6 text-center text-slate-500 border border-dashed border-slate-800 rounded-2xl">
            No activities selected. Add items above or include tasks/habits.
          </div>
        ) : (
          items.map((item, idx) => (
            <div key={item.id || idx} className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3 font-sans">
              
              <div className="flex items-center gap-2.5 min-w-0">
                <button
                  type="button"
                  onClick={() => handleToggleFixed(idx)}
                  title={item.isFixed ? "Fixed block (Locked)" : "Flexible block"}
                  className="p-1 text-slate-400 hover:text-white"
                >
                  {item.isFixed ? <Lock size={14} className="text-amber-400" /> : <Unlock size={14} className="text-slate-600" />}
                </button>

                <div className="min-w-0">
                  <span className="font-bold text-slate-200 text-xs block truncate">{item.title}</span>
                  <span className="text-[10px] text-slate-400 font-mono flex items-center gap-2">
                    <span>{item.category}</span>
                    <span>•</span>
                    <span className="text-cyan-400 font-bold">{item.durationMinutes}m</span>
                    {item.preferredStartTime && (
                      <span className="text-amber-400">@{item.preferredStartTime}</span>
                    )}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className={`px-2 py-0.5 rounded-full border text-[9px] font-mono font-bold ${
                  item.priority === 'URGENT' ? 'bg-rose-500/20 text-rose-300 border-rose-500/30' :
                  item.priority === 'HIGH' ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' :
                  'bg-slate-800 text-slate-300 border-slate-700'
                }`}>
                  {item.priority}
                </span>

                <button
                  type="button"
                  onClick={() => handleRemoveItem(item.id || idx)}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>

            </div>
          ))
        )}
      </div>

    </div>
  );
};
