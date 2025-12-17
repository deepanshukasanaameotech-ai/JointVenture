import { useState } from "react";
import { supabase } from "../../shared/utils/supabase";
import { useNavigate } from "react-router-dom";
import type { VehicleType, FlexibilityType, TravelStyleType, PurposeType, VisibilityType } from "../../shared/types/database";

export default function CreateTrip() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [step, setStep] = useState(1);

    // Form Stats
    const [startLocation, setStartLocation] = useState("");
    const [endLocation, setEndLocation] = useState("");
    const [startTime, setStartTime] = useState("");
    const [endTime, setEndTime] = useState("");
    const [vehicle, setVehicle] = useState<VehicleType>("Car");
    const [flexibility, setFlexibility] = useState<FlexibilityType>("Flexible");
    const [travelStyle, setTravelStyle] = useState<TravelStyleType>("Backpacking");
    const [purpose, setPurpose] = useState<PurposeType>("Explore");
    const [visibility, setVisibility] = useState<VisibilityType>("Public");
    const [maxPeople, setMaxPeople] = useState(4);
    const [safetyRules, setSafetyRules] = useState("");
    
    // Dynamic Stops
    const [stops, setStops] = useState<{name: string}[]>([{name: ""}]);

    const handleNext = () => setStep(prev => prev + 1);
    const handleBack = () => setStep(prev => prev - 1);

    const handleAddStop = () => {
        setStops([...stops, {name: ""}]);
    };

    const handleRemoveStop = (index: number) => {
        const newStops = [...stops];
        newStops.splice(index, 1);
        setStops(newStops);
    };

    const handleStopChange = (index: number, value: string) => {
        const newStops = [...stops];
        newStops[index].name = value;
        setStops(newStops);
    };

    const handleSubmit = async () => {
        setLoading(true);
        setError(null);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Not authenticated");

            if (!startLocation || !endLocation || !startTime || !endTime) {
                throw new Error("Please fill in all required fields (Locations and Dates).");
            }

            // 1. Insert Trip
            const { data: tripData, error: tripError } = await supabase
                .from('trips')
                .insert({
                    creator_id: user.id,
                    start_location: startLocation,
                    end_location: endLocation,
                    start_time: new Date(startTime).toISOString(),
                    end_time: new Date(endTime).toISOString(),
                    vehicle,
                    flexibility,
                    travel_style: travelStyle,
                    purpose,
                    visibility,
                    max_people: maxPeople,
                    safety_rules: safetyRules
                })
                .select()
                .single();

            if (tripError) throw tripError;
            if (!tripData) throw new Error("Failed to create trip");

            // 2. Insert Stops (if any valid ones)
            const validStops = stops
                .filter(s => s.name.trim() !== "")
                .map((s, index) => ({
                    trip_id: tripData.id,
                    stop_name: s.name,
                    stop_order: index + 1
                }));

            if (validStops.length > 0) {
                const { error: stopsError } = await supabase
                    .from('trip_stops')
                    .insert(validStops);
                
                if (stopsError) throw stopsError;
            }

            // Success!
            navigate("/dashboard");
            
        } catch (err: any) {
            console.error("Failed to create trip");
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen p-6 md:p-12 pb-32">
            <div className="fixed top-[-100px] left-[-100px] w-[500px] h-[500px] bg-[#E6E2D6] rounded-full blur-[100px] -z-10 opacity-60"></div>
            
            <div className="max-w-2xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                     <button onClick={() => navigate('/dashboard')} className="text-sm text-[#888] hover:text-[#2C2C2C]">✕ Cancel</button>
                     <div className="text-sm font-medium text-[#2C2C2C]">Step {step} of 3</div>
                </div>

                <div className="mb-8">
                     <div className="h-1 w-full bg-[#E5E5E5] rounded-full overflow-hidden">
                        <div 
                            className="h-full bg-[#2C2C2C] transition-all duration-500 ease-out" 
                            style={{ width: `${(step / 3) * 100}%` }}
                        ></div>
                    </div>
                </div>

                {/* STEP 1: BASICS */}
                {step === 1 && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <h1 className="text-3xl font-light text-[#2C2C2C] mb-2">Where are we going?</h1>
                        <p className="text-[#888] mb-8 font-light">Let's start with the basics.</p>

                        <div className="bg-white/60 backdrop-blur-md border border-white/50 rounded-[2rem] p-8 shadow-sm space-y-6">
                            <InputGroup label="Start Location" value={startLocation} onChange={setStartLocation} placeholder="e.g. Mumbai" autoFocus />
                            <InputGroup label="Destination" value={endLocation} onChange={setEndLocation} placeholder="e.g. Goa" />
                            <div className="grid grid-cols-2 gap-4">
                                <InputGroup label="Start Date" value={startTime} onChange={setStartTime} type="datetime-local" />
                                <InputGroup label="End Date" value={endTime} onChange={setEndTime} type="datetime-local" />
                            </div>
                        </div>

                         <div className="mt-8 flex justify-end">
                            <button 
                                onClick={handleNext}
                                disabled={!startLocation || !endLocation || !startTime || !endTime}
                                className="px-8 py-4 bg-[#2C2C2C] text-[#F2EFE9] text-base font-medium rounded-full hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Next Step →
                            </button>
                        </div>
                    </div>
                )}

                {/* STEP 2: VIBE */}
                {step === 2 && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <h1 className="text-3xl font-light text-[#2C2C2C] mb-2">Set the Vibe</h1>
                        <p className="text-[#888] mb-8 font-light">How are we traveling?</p>

                        <div className="space-y-8">
                            <section>
                                <label className="block text-sm font-medium text-[#555] mb-3 ml-1">Vehicle</label>
                                <div className="grid grid-cols-3 gap-3">
                                    {['Car', 'Bike', 'Bus', 'Train', 'Aeroplane'].map(v => (
                                        <SelectionCard 
                                            key={v} 
                                            label={v} 
                                            selected={vehicle === v} 
                                            onClick={() => setVehicle(v as VehicleType)} 
                                        />
                                    ))}
                                </div>
                            </section>

                            <section>
                                <label className="block text-sm font-medium text-[#555] mb-3 ml-1">Travel Style</label>
                                <div className="grid grid-cols-3 gap-3">
                                    {['Backpacking', 'Budget', 'Luxury'].map(s => (
                                        <SelectionCard 
                                            key={s} 
                                            label={s} 
                                            selected={travelStyle === s} 
                                            onClick={() => setTravelStyle(s as TravelStyleType)} 
                                        />
                                    ))}
                                </div>
                            </section>

                            <section>
                                <label className="block text-sm font-medium text-[#555] mb-3 ml-1">Purpose</label>
                                <div className="grid grid-cols-3 gap-3">
                                    {['Explore', 'Adventure', 'Work'].map(p => (
                                        <SelectionCard 
                                            key={p} 
                                            label={p} 
                                            selected={purpose === p} 
                                            onClick={() => setPurpose(p as PurposeType)} 
                                        />
                                    ))}
                                </div>
                            </section>
                        </div>

                        <div className="mt-12 flex justify-between">
                            <button onClick={handleBack} className="px-6 py-4 text-[#555] font-medium hover:text-[#2C2C2C]">Back</button>
                            <button 
                                onClick={handleNext}
                                className="px-8 py-4 bg-[#2C2C2C] text-[#F2EFE9] text-base font-medium rounded-full hover:scale-[1.02] active:scale-[0.98] transition-all"
                            >
                                Next Step →
                            </button>
                        </div>
                    </div>
                )}

                {/* STEP 3: DETAILS */}
                {step === 3 && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <h1 className="text-3xl font-light text-[#2C2C2C] mb-2">Final Details</h1>
                        <p className="text-[#888] mb-8 font-light">Almost there.</p>

                        <div className="bg-white/60 backdrop-blur-md border border-white/50 rounded-[2rem] p-8 shadow-sm space-y-8">
                            <div>
                                <label className="block text-sm font-medium text-[#555] mb-2 ml-1">Max People (Including You)</label>
                                <div className="flex items-center gap-4">
                                    <button 
                                        onClick={() => setMaxPeople(Math.max(2, maxPeople - 1))}
                                        className="w-10 h-10 rounded-full bg-white border border-[#DDD] flex items-center justify-center text-lg hover:bg-[#F9F9F9]"
                                    >-</button>
                                    <span className="text-2xl font-light w-8 text-center">{maxPeople}</span>
                                    <button 
                                        onClick={() => setMaxPeople(maxPeople + 1)}
                                        className="w-10 h-10 rounded-full bg-[#2C2C2C] text-white flex items-center justify-center text-lg hover:bg-[#1a1a1a]"
                                    >+</button>
                                </div>
                            </div>

                             <div>
                                <label className="block text-sm font-medium text-[#555] mb-2 ml-1">Stops along the way (Optional)</label>
                                <div className="space-y-3">
                                    {stops.map((stop, index) => (
                                        <div key={index} className="flex gap-2">
                                            <input 
                                                value={stop.name}
                                                onChange={(e) => handleStopChange(index, e.target.value)}
                                                placeholder={`Stop ${index + 1}`}
                                                className="flex-1 bg-[#F9F8F6] border-none text-[#2C2C2C] text-sm px-5 py-3 rounded-xl focus:ring-2 focus:ring-[#D4C5B0] outline-none"
                                            />
                                            {stops.length > 1 && (
                                                <button 
                                                    onClick={() => handleRemoveStop(index)}
                                                    className="px-3 text-[#888] hover:text-red-500 transition-colors"
                                                >✕</button>
                                            )}
                                        </div>
                                    ))}
                                    <button 
                                        onClick={handleAddStop}
                                        className="text-sm text-[#2C2C2C] font-medium mt-2 hover:underline ml-1"
                                    >+ Add Stop</button>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <SelectGroup label="Flexibility" value={flexibility} onChange={(v: string) => setFlexibility(v as FlexibilityType)} options={['Flexible', 'Strict']} />
                                <SelectGroup label="Visibility" value={visibility} onChange={(v: string) => setVisibility(v as VisibilityType)} options={['Public', 'Limited']} />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-[#555] mb-2 ml-1">Safety Rules / Notes</label>
                                <textarea 
                                    value={safetyRules}
                                    onChange={(e) => setSafetyRules(e.target.value)}
                                    placeholder="e.g. No smoking, Valid ID required..."
                                    className="w-full bg-[#F9F8F6] border-none text-[#2C2C2C] text-sm px-6 py-4 rounded-xl focus:ring-2 focus:ring-[#D4C5B0] outline-none h-24 resize-none"
                                />
                            </div>
                        </div>

                        {error && <div className="mt-4 p-4 bg-red-50 text-red-500 rounded-xl text-center text-sm">{error}</div>}

                        <div className="mt-8 flex justify-between items-center">
                            <button onClick={handleBack} className="px-6 py-4 text-[#555] font-medium hover:text-[#2C2C2C]">Back</button>
                            <button 
                                onClick={handleSubmit}
                                disabled={loading}
                                className="px-10 py-4 bg-[#2C2C2C] text-[#F2EFE9] text-base font-medium rounded-full hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-70 shadow-lg"
                            >
                                {loading ? "Creating..." : "Publish Trip"}
                            </button>
                        </div>
                    </div>
                )}

            </div>
        </div>
    )
}

// Helper Components
function InputGroup({label, value, onChange, placeholder, type="text", autoFocus}: any) {
    return (
        <div>
            <label className="block text-sm font-medium text-[#555] mb-2 ml-1">{label}</label>
            <input 
                type={type}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                autoFocus={autoFocus}
                className="w-full bg-[#F9F8F6] border-none text-[#2C2C2C] text-lg px-6 py-4 rounded-2xl focus:ring-2 focus:ring-[#D4C5B0] outline-none transition-all placeholder:text-[#AAA]"
            />
        </div>
    )
}

function SelectionCard({label, selected, onClick}: {label: string, selected: boolean, onClick: () => void}) {
    return (
        <button 
            onClick={onClick}
            className={`py-4 px-2 rounded-xl text-sm font-medium transition-all duration-200 border ${
                selected 
                ? "bg-[#2C2C2C] text-[#F2EFE9] border-[#2C2C2C] shadow-md scale-[1.02]" 
                : "bg-white text-[#555] border-transparent hover:border-[#D4C5B0] hover:bg-[#FAF9F6]"
            }`}
        >
            {label}
        </button>
    )
}

function SelectGroup({label, value, onChange, options}: {label: string, value: string, onChange: (val: string) => void, options: string[]}) {
    return (
        <div>
            <label className="block text-sm font-medium text-[#555] mb-2 ml-1">{label}</label>
            <div className="relative">
                <select 
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="w-full bg-[#F9F8F6] border-none text-[#2C2C2C] text-lg px-6 py-4 rounded-2xl focus:ring-2 focus:ring-[#D4C5B0] outline-none transition-all appearance-none cursor-pointer"
                >
                    {options.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                    ))}
                </select>
                <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-[#888]">
                    ▼
                </div>
            </div>
        </div>
    )
}
