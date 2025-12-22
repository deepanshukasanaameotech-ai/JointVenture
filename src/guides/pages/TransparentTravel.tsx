import { useState } from "react";
import { useNavigate } from "react-router-dom";

interface ExpenseLog {
    id: string;
    activity: string;
    cost: number;
    category: string;
    note: string;
    isHidden: boolean;
    timestamp: Date;
}

export default function TransparentTravel() {
    const navigate = useNavigate();
    
    // Tab State
    const [activeTab, setActiveTab] = useState<'expenses' | 'oil'>('expenses');

    // Expense State
    const [budget, setBudget] = useState<number>(2000);
    const [currency, setCurrency] = useState("₹");
    const [logs, setLogs] = useState<ExpenseLog[]>([]);
    const [editingLogId, setEditingLogId] = useState<string | null>(null);
    
    // Expense Form Input State
    const [activity, setActivity] = useState("");
    const [cost, setCost] = useState("");
    const [note, setNote] = useState("");
    const [isHidden, setIsHidden] = useState(false);
    const [category, setCategory] = useState("🍽️");

    // Oil Calculator State
    const [fuelType, setFuelType] = useState<'petrol' | 'diesel'>('petrol');
    const [oilRate, setOilRate] = useState<string>("96.00"); // Default generic petrol price
    const [distance, setDistance] = useState<string>("");
    const [mileage, setMileage] = useState<string>("15"); // Default generic mileage

    const categories = ["🍽️", "🚇", "🏨", "🎫", "🎁", "✈️", "🍺"];
    const currencies = ["₹", "$", "€", "£", "¥"];
    
    // Stats
    const totalSpent = logs.reduce((sum, log) => sum + log.cost, 0);
    const hiddenSpent = logs.filter(l => l.isHidden).reduce((sum, l) => sum + l.cost, 0);
    const remaining = budget - totalSpent;
    const progress = Math.min((totalSpent / budget) * 100, 100);

    // Oil Calculation
    const distVal = parseFloat(distance) || 0;
    const mileageVal = parseFloat(mileage) || 1;
    const rateVal = parseFloat(oilRate) || 0;
    const estimatedFuel = distVal / mileageVal;
    const estimatedCost = estimatedFuel * rateVal;

    const handleFuelTypeChange = (type: 'petrol' | 'diesel') => {
        setFuelType(type);
        // Generic approximate defaults for India
        if (type === 'petrol') setOilRate("96.00");
        if (type === 'diesel') setOilRate("88.00");
    };

    const handleSubmitLog = (e: React.FormEvent) => {
        e.preventDefault();
        if (!activity || !cost) return;

        if (editingLogId) {
            // Update existing log
            setLogs(logs.map(log => 
                log.id === editingLogId 
                ? { 
                    ...log, 
                    activity, 
                    cost: parseFloat(cost), 
                    category, 
                    note, 
                    isHidden 
                  } 
                : log
            ));
            setEditingLogId(null);
        } else {
            // Create new log
            const newLog: ExpenseLog = {
                id: crypto.randomUUID(),
                activity,
                cost: parseFloat(cost),
                category,
                note,
                isHidden,
                timestamp: new Date()
            };
            setLogs([newLog, ...logs]);
        }
        
        // Reset form
        resetForm();
    };

    const resetForm = () => {
        setActivity("");
        setCost("");
        setNote("");
        setIsHidden(false);
        setCategory("🍽️");
        setEditingLogId(null);
    };

    const handleEdit = (log: ExpenseLog) => {
        setEditingLogId(log.id);
        setActivity(log.activity);
        setCost(log.cost.toString());
        setCategory(log.category);
        setNote(log.note);
        setIsHidden(log.isHidden);
        setActiveTab('expenses'); // Ensure we switch back if editing
    };

    const handleDelete = (id: string, e: React.MouseEvent) => {
        e.stopPropagation(); 
        if (window.confirm("Delete this log?")) {
             setLogs(logs.filter(l => l.id !== id));
             if (editingLogId === id) resetForm();
        }
    };

    return (
        <div className="min-h-screen bg-[#F9F8F6] text-[#2C2C2C] pb-20 animate-in fade-in">
             {/* Background Atmosphere */}
             <div className="fixed top-[-100px] left-[-100px] w-[500px] h-[500px] bg-[#E6E2D6] rounded-full blur-[100px] -z-10 opacity-60"></div>
             
             {/* Navigation */}
            <div className="p-6 md:p-8 flex justify-between items-center bg-white/50 backdrop-blur-md sticky top-0 z-50 border-b border-[#D4C5B0]/20">
                <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-[#555] hover:text-[#2C2C2C] transition-colors">
                    ← Back
                </button>
                <div className="text-sm tracking-widest uppercase font-medium">Transparent Traveller</div>
            </div>

            <div className="max-w-6xl mx-auto p-4 md:p-8">
                 {/* Tabs */}
                 <div className="flex justify-center mb-8">
                    <div className="bg-[#EEE] p-1 rounded-2xl flex gap-2">
                        <button 
                            onClick={() => setActiveTab('expenses')}
                            className={`px-6 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'expenses' ? 'bg-white shadow-sm text-[#2C2C2C]' : 'text-[#888] hover:text-[#555]'}`}
                        >
                            EXPENSES LOG
                        </button>
                        <button 
                            onClick={() => setActiveTab('oil')}
                            className={`px-6 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'oil' ? 'bg-white shadow-sm text-[#2C2C2C]' : 'text-[#888] hover:text-[#555]'}`}
                        >
                            OIL CALCULATOR
                        </button>
                    </div>
                 </div>

                 {/* EXPENSE LOG TAB */}
                 {activeTab === 'expenses' && (
                     <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 animate-in slide-in-from-bottom-4">
                        {/* LEFT: Input & Controls */}
                        <div className="flex flex-col gap-8 order-2 lg:order-1">
                            <div className={`bg-white p-6 md:p-8 rounded-[2rem] shadow-sm border border-[#eee] transition-all duration-300 ring-offset-2 ring-offset-[#F9F8F6] ${editingLogId ? 'ring-2 ring-[#2C2C2C]' : ''}`}>
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-2xl font-light">{editingLogId ? 'Edit Log' : 'Log a Cost'}</h2>
                                    {editingLogId && (
                                        <button onClick={resetForm} className="text-xs font-bold text-[#888] hover:text-red-500 uppercase tracking-wider">Cancel Edit</button>
                                    )}
                                </div>
                                
                                <form onSubmit={handleSubmitLog} className="flex flex-col gap-4">
                                    <div>
                                        <label className="text-xs font-bold text-[#888] uppercase tracking-wider mb-2 block">What was it?</label>
                                        <input 
                                            type="text" 
                                            value={activity}
                                            onChange={(e) => setActivity(e.target.value)}
                                            placeholder="e.g. Airport Coffee, Train Ticket"
                                            className="w-full bg-[#f4f4f4] border-none rounded-xl p-4 text-lg focus:ring-2 focus:ring-[#2C2C2C]"
                                            autoFocus
                                        />
                                    </div>

                                    <div className="flex gap-4">
                                        <div className="flex-1">
                                            <label className="text-xs font-bold text-[#888] uppercase tracking-wider mb-2 block">Cost ({currency})</label>
                                            <input 
                                                type="number" 
                                                value={cost}
                                                onChange={(e) => setCost(e.target.value)}
                                                placeholder="0.00"
                                                className="w-full bg-[#f4f4f4] border-none rounded-xl p-4 text-lg font-mono focus:ring-2 focus:ring-[#2C2C2C]"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-[#888] uppercase tracking-wider mb-2 block">Category</label>
                                            <div className="flex bg-[#f4f4f4] rounded-xl p-1 overflow-x-auto">
                                                {categories.slice(0, 3).map(c => (
                                                    <button 
                                                        key={c}
                                                        type="button"
                                                        onClick={() => setCategory(c)}
                                                        className={`w-10 h-10 md:w-12 md:h-12 rounded-lg flex items-center justify-center text-xl transition-colors shrink-0 ${category === c ? 'bg-white shadow-sm scale-110' : 'opacity-40 hover:opacity-100'}`}
                                                    >
                                                        {c}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-xs font-bold text-[#888] uppercase tracking-wider mb-2 block">Hidden Cost?</label>
                                        <div 
                                            onClick={() => setIsHidden(!isHidden)}
                                            className={`cursor-pointer border-2 rounded-xl p-4 flex items-center gap-4 transition-colors ${isHidden ? 'border-red-400 bg-red-50' : 'border-[#eee] hover:border-[#ddd]'}`}
                                        >
                                            <div className={`w-6 h-6 rounded-md border flex items-center justify-center ${isHidden ? 'bg-red-500 border-red-500 text-white' : 'border-[#ccc]'}`}>
                                                {isHidden && "✓"}
                                            </div>
                                            <div className="flex-1">
                                                <span className={`font-medium ${isHidden ? 'text-red-600' : 'text-[#555]'}`}>Mark as "Hidden Cost"</span>
                                                <p className="text-xs opacity-60">Was this an unexpected tax, fee, or surcharge?</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-xs font-bold text-[#888] uppercase tracking-wider mb-2 block">Notes (Optional)</label>
                                        <textarea 
                                            value={note}
                                            onChange={(e) => setNote(e.target.value)}
                                            placeholder="Why was this expensive? Was it worth it?"
                                            className="w-full bg-[#f4f4f4] border-none rounded-xl p-4 h-24 resize-none focus:ring-2 focus:ring-[#2C2C2C]"
                                        ></textarea>
                                    </div>

                                    <button type="submit" className={`h-14 rounded-xl font-medium mt-2 hover:scale-[1.02] active:scale-[0.98] transition-transform shadow-lg ${editingLogId ? 'bg-[#555] text-white' : 'bg-[#2C2C2C] text-[#F2EFE9]'}`}>
                                        {editingLogId ? 'Update Log' : 'Add to Log +'}
                                    </button>
                                </form>
                            </div>

                            <div className="bg-[#D4C5B0] p-8 rounded-[2rem] text-[#2C2C2C]">
                                <h3 className="text-xl font-bold mb-4">Budget Settings</h3>
                                <div className="flex flex-col gap-4">
                                    <div className="flex items-center gap-4">
                                        <div className="text-sm font-medium opacity-70 w-24">Currency</div>
                                        <div className="flex gap-2">
                                            {currencies.map(c => (
                                                <button 
                                                    key={c}
                                                    onClick={() => setCurrency(c)}
                                                    className={`w-8 h-8 rounded-full border border-black/10 flex items-center justify-center text-sm transition-all ${currency === c ? 'bg-[#2C2C2C] text-white scale-110' : 'bg-white/40 hover:bg-white'}`}
                                                >
                                                    {c}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="text-sm font-medium opacity-70 w-24">Total Budget</div>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold opacity-50">{currency}</span>
                                            <input 
                                                type="number" 
                                                value={budget} 
                                                onChange={(e) => setBudget(parseFloat(e.target.value) || 0)}
                                                className="bg-white/40 border-none rounded-lg p-2 pl-8 w-32 font-mono font-bold text-lg focus:ring-2 focus:ring-[#2C2C2C]" 
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* RIGHT: Live Receipt */}
                        <div className="order-1 lg:order-2">
                            <div className="bg-white p-6 md:p-10 shadow-2xl relative border-t-8 border-[#2C2C2C] min-h-[700px] flex flex-col font-mono text-sm">
                                {/* Zigzag Top */}
                                <div className="absolute top-[-10px] left-0 w-full h-[20px] bg-white [mask-image:linear-gradient(45deg,transparent_75%,black_75%),linear-gradient(-45deg,transparent_75%,black_75%)] [mask-size:20px_20px]"></div>
                                
                                <div className="text-center mb-8 pb-8 border-b-2 border-dashed border-[#ddd]">
                                    <h2 className="text-2xl font-bold uppercase tracking-widest">TRIP LOG</h2>
                                    <p className="text-[#888] mt-2">{new Date().toLocaleDateString()}</p>
                                </div>

                                {/* Empty State */}
                                {logs.length === 0 && (
                                    <div className="flex-1 flex flex-col items-center justify-center text-[#ccc] py-12">
                                        <div className="text-4xl mb-4 grayscale opacity-30">🧾</div>
                                        <p>No expenses logged yet.</p>
                                        <p className="text-xs">Start adding items on the left.</p>
                                    </div>
                                )}

                                {/* Items List */}
                                <div className="flex-1 space-y-6 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                                    {logs.map((log) => (
                                        <div key={log.id} className={`flex flex-col group animate-in slide-in-from-left-4 p-2 rounded-lg transition-colors cursor-pointer border border-transparent ${editingLogId === log.id ? 'bg-[#f0f0f0] border-[#ccc]' : 'hover:bg-[#fafafa]'}`} onClick={() => handleEdit(log)}>
                                            <div className="flex justify-between items-start">
                                                <div className="flex gap-3">
                                                    <span className="text-lg">{log.category}</span>
                                                    <div>
                                                        <div className="font-bold text-base">{log.activity}</div>
                                                        <div className="text-xs text-[#888]">{log.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="font-bold text-base">{currency}{log.cost.toFixed(2)}</div>
                                                    <div className="flex gap-2 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <span className="text-[10px] text-[#555] uppercase font-bold tracking-wider">Edit</span>
                                                        <button onClick={(e) => handleDelete(log.id, e)} className="text-[10px] text-red-400 hover:text-red-600">DELETE</button>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            {log.isHidden && (
                                                <div className="ml-8 mt-1 text-red-500 text-xs italic flex items-center gap-1">
                                                    <span>⚠️ Unexpected / Hidden Cost</span>
                                                </div>
                                            )}
                                            
                                            {log.note && (
                                                <div className="ml-8 mt-1 text-[#666] text-xs bg-[#f4f4f4] p-2 rounded-lg italic border-l-2 border-[#ccc]">
                                                    "{log.note}"
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                {/* Totals Section */}
                                <div className="mt-8 pt-6 border-t-2 border-dashed border-[#2C2C2C]">
                                    <div className="flex justify-between mb-2">
                                        <span>Budget</span>
                                        <span>{currency}{budget.toFixed(2)}</span>
                                    </div>
                                    
                                    {/* Progress Bar */}
                                    <div className="w-full h-2 bg-[#eee] rounded-full overflow-hidden mb-4">
                                        <div 
                                            className={`h-full transition-all duration-500 ${remaining < 0 ? 'bg-red-500' : 'bg-[#2C2C2C]'}`} 
                                            style={{width: `${progress}%`}}
                                        ></div>
                                    </div>

                                    <div className="flex justify-between mb-2 text-[#555]">
                                        <span>Subtotal</span>
                                        <span>{currency}{(totalSpent - hiddenSpent).toFixed(2)}</span>
                                    </div>
                                    {hiddenSpent > 0 && (
                                        <div className="flex justify-between mb-2 text-red-500 font-bold">
                                            <span>Hidden Fees / Surprise</span>
                                            <span>+ {currency}{hiddenSpent.toFixed(2)}</span>
                                        </div>
                                    )}
                                    
                                    <div className="flex justify-between text-2xl font-bold mt-4 pt-4 border-t border-[#eee]">
                                        <span>TOTAL</span>
                                        <span>{currency}{totalSpent.toFixed(2)}</span>
                                    </div>
                                    
                                    <div className={`flex justify-between text-sm mt-2 font-medium ${remaining < 0 ? 'text-red-500' : 'text-green-600'}`}>
                                        <span>{remaining < 0 ? 'Over Budget' : 'Remaining'}</span>
                                        <span>{remaining < 0 ? '-' : ''}{currency}{Math.abs(remaining).toFixed(2)}</span>
                                    </div>
                                </div>
                                
                                {/* Zigzag Bottom */}
                                <div className="absolute bottom-[-10px] left-0 w-full h-[20px] bg-white [mask-image:linear-gradient(45deg,transparent_75%,black_75%),linear-gradient(-45deg,transparent_75%,black_75%)] [mask-size:20px_20px]"></div>
                            </div>
                        </div>
                     </div>
                 )}

                 {/* OIL CALCULATOR TAB */}
                 {activeTab === 'oil' && (
                     <div className="max-w-xl mx-auto animate-in slide-in-from-right-4">
                         <div className="bg-white p-8 rounded-[2rem] shadow-xl border border-[#eee]">
                             <div className="text-center mb-8">
                                 <div className="text-4xl mb-4">⛽</div>
                                 <h2 className="text-2xl font-bold text-[#2C2C2C]">Trip Fuel Estimator</h2>
                                 <p className="text-[#888] text-sm mt-2">Estimate costs for your Indian road trip.</p>
                             </div>

                             <div className="space-y-6">
                                 {/* Example: Fuel Type */}
                                 <div>
                                     <label className="text-xs font-bold text-[#888] uppercase tracking-wider mb-3 block">Fuel Type</label>
                                     <div className="grid grid-cols-2 gap-4">
                                         <button 
                                            onClick={() => handleFuelTypeChange('petrol')}
                                            className={`p-4 rounded-xl border-2 font-medium transition-all ${fuelType === 'petrol' ? 'border-[#2C2C2C] bg-[#2C2C2C] text-white' : 'border-[#eee] hover:border-[#ddd]'}`}
                                         >
                                             Petrol
                                         </button>
                                         <button 
                                            onClick={() => handleFuelTypeChange('diesel')}
                                            className={`p-4 rounded-xl border-2 font-medium transition-all ${fuelType === 'diesel' ? 'border-[#2C2C2C] bg-[#2C2C2C] text-white' : 'border-[#eee] hover:border-[#ddd]'}`}
                                         >
                                             Diesel
                                         </button>
                                     </div>
                                 </div>

                                 {/* Rate & Average */}
                                 <div className="grid grid-cols-2 gap-4">
                                     <div>
                                         <label className="text-xs font-bold text-[#888] uppercase tracking-wider mb-2 block">Oil Rate (₹/L)</label>
                                         <input 
                                            type="number" 
                                            value={oilRate}
                                            onChange={(e) => setOilRate(e.target.value)}
                                            className="w-full bg-[#f4f4f4] border-none rounded-xl p-4 text-lg font-mono font-bold focus:ring-2 focus:ring-[#2C2C2C]"
                                         />
                                     </div>
                                     <div>
                                         <label className="text-xs font-bold text-[#888] uppercase tracking-wider mb-2 block">Mileage (km/L)</label>
                                         <input 
                                            type="number" 
                                            value={mileage}
                                            onChange={(e) => setMileage(e.target.value)}
                                            className="w-full bg-[#f4f4f4] border-none rounded-xl p-4 text-lg font-mono font-bold focus:ring-2 focus:ring-[#2C2C2C]"
                                         />
                                     </div>
                                 </div>

                                 {/* Distance */}
                                 <div>
                                     <label className="text-xs font-bold text-[#888] uppercase tracking-wider mb-2 block">Distance (km)</label>
                                     <input 
                                        type="number" 
                                        value={distance}
                                        onChange={(e) => setDistance(e.target.value)}
                                        placeholder="e.g. 500"
                                        className="w-full bg-[#f4f4f4] border-none rounded-xl p-4 text-2xl font-mono font-bold focus:ring-2 focus:ring-[#2C2C2C]"
                                        autoFocus
                                     />
                                 </div>

                                 {/* Results */}
                                 <div className="bg-[#2C2C2C] text-[#F2EFE9] rounded-2xl p-6 mt-4">
                                     <div className="flex justify-between items-end mb-4 opacity-80">
                                         <div className="text-sm">Est. Fuel Needed</div>
                                         <div className="font-mono text-xl">{estimatedFuel.toFixed(1)} L</div>
                                     </div>
                                     <div className="flex justify-between items-end pt-4 border-t border-white/20">
                                         <div>
                                             <div className="text-sm opacity-60 uppercase tracking-widest">Est. Cost</div>
                                             <div className="text-3xl font-bold mt-1">₹{estimatedCost.toFixed(0)}</div>
                                         </div>
                                         <div className="text-right text-xs opacity-50 max-w-[150px]">
                                             *Approximate only. Actuals depend on traffic & driving style.
                                         </div>
                                     </div>
                                 </div>

                                 <div className="bg-blue-50 text-blue-800 p-4 rounded-xl text-xs flex gap-3 items-start leading-relaxed">
                                     <span className="text-lg">ℹ️</span>
                                     <p>This calculator provides a generic estimate. Actual mileage may vary significantly due to Indian road conditions, city traffic, AC usage, and payload.</p>
                                 </div>
                             </div>
                         </div>
                     </div>
                 )}
            </div>
        </div>
    )
}
