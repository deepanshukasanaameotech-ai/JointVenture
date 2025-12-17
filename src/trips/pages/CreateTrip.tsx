import { useState } from "react";
import { supabase } from "../../shared/utils/supabase";
import { useNavigate } from "react-router-dom";
import type { VehicleType, FlexibilityType, TravelStyleType, PurposeType, VisibilityType } from "../../shared/types/database";

export default function CreateTrip() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

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
            
            <div className="max-w-3xl mx-auto">
                <button onClick={() => navigate('/dashboard')} className="text-sm text-[#888] mb-6 hover:text-[#2C2C2C]">← Back to Dashboard</button>
                <h1 className="text-4xl font-light text-[#2C2C2C] mb-2">Plan your Journey</h1>
                <p className="text-[#888] mb-10 font-light">Create a trip and invite others to join.</p>

                <div className="space-y-12">
                    
                    {/* Section 1: Route */}
                    <section className="bg-white/60 backdrop-blur-md border border-white/50 rounded-[2rem] p-8 shadow-sm">
                        <h2 className="text-xl font-medium text-[#2C2C2C] mb-6">Route & Timing</h2>
                        <div className="grid md:grid-cols-2 gap-6">
                            <InputGroup label="Start Location" value={startLocation} onChange={setStartLocation} placeholder="e.g. Mumbai" />
                            <InputGroup label="Destination" value={endLocation} onChange={setEndLocation} placeholder="e.g. Goa" />
                            <InputGroup label="Start Date/Time" value={startTime} onChange={setStartTime} type="datetime-local" />
                            <InputGroup label="End Date/Time" value={endTime} onChange={setEndTime} type="datetime-local" />
                        </div>

                        <div className="mt-8">
                            <label className="block text-sm font-medium text-[#555] mb-3 ml-1">Stops along the way</label>
                            <div className="space-y-3">
                                {stops.map((stop, index) => (
                                    <div key={index} className="flex gap-2">
                                        <input 
                                            value={stop.name}
                                            onChange={(e) => handleStopChange(index, e.target.value)}
                                            placeholder={`Stop ${index + 1}`}
                                            className="flex-1 bg-[#F9F8F6] border-none text-[#2C2C2C] text-sm px-5 py-3 rounded-xl focus:ring-2 focus:ring-[#D4C5B0] outline-none"
                                        />
                                        <button 
                                            onClick={() => handleRemoveStop(index)}
                                            className="px-4 text-[#888] hover:text-red-500 transition-colors"
                                        >✕</button>
                                    </div>
                                ))}
                                <button 
                                    onClick={handleAddStop}
                                    className="text-sm text-[#2C2C2C] font-medium mt-2 hover:underline ml-1"
                                >+ Add Stop</button>
                            </div>
                        </div>
                    </section>

                    {/* Section 2: Details */}
                    <section className="bg-white/60 backdrop-blur-md border border-white/50 rounded-[2rem] p-8 shadow-sm">
                        <h2 className="text-xl font-medium text-[#2C2C2C] mb-6">Trip Details</h2>
                        <div className="grid md:grid-cols-2 gap-6 mb-6">
                            <SelectGroup label="Vehicle" value={vehicle} onChange={(v: string) => setVehicle(v as VehicleType)} options={['Car', 'Bus', 'Bike', 'Train', 'Aeroplane']} />
                            <SelectGroup label="Travel Style" value={travelStyle} onChange={(v: string) => setTravelStyle(v as TravelStyleType)} options={['Backpacking', 'Budget', 'Luxury']} />
                            <SelectGroup label="Purpose" value={purpose} onChange={(v: string) => setPurpose(v as PurposeType)} options={['Explore', 'Adventure', 'Work']} />
                            <SelectGroup label="Flexibility" value={flexibility} onChange={(v: string) => setFlexibility(v as FlexibilityType)} options={['Flexible', 'Strict']} />
                        </div>
                        
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-[#555] mb-2 ml-1">Max People (Including You)</label>
                                <input 
                                    type="number" 
                                    min={2}
                                    value={maxPeople}
                                    onChange={(e) => setMaxPeople(parseInt(e.target.value))}
                                    className="w-full bg-[#F9F8F6] border-none text-[#2C2C2C] text-sm px-6 py-4 rounded-xl focus:ring-2 focus:ring-[#D4C5B0] outline-none"
                                />
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

                             <SelectGroup label="Visibility" value={visibility} onChange={(v: string) => setVisibility(v as VisibilityType)} options={['Public', 'Limited']} />
                        </div>
                    </section>

                    {error && <div className="p-4 bg-red-50 text-red-500 rounded-xl text-center">{error}</div>}

                    <button 
                        onClick={handleSubmit}
                        disabled={loading}
                        className="w-full bg-[#1a1a1a] text-[#F2EFE9] text-lg font-medium py-5 rounded-full hover:scale-[1.01] active:scale-[0.99] transition-all shadow-xl disabled:opacity-70"
                    >
                        {loading ? "Creating Trip..." : "Publish Trip"}
                    </button>

                </div>
            </div>
        </div>
    )
}

// Helper Components
function InputGroup({label, value, onChange, placeholder, type="text"}: any) {
    return (
        <div>
            <label className="block text-sm font-medium text-[#555] mb-2 ml-1">{label}</label>
            <input 
                type={type}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-full bg-[#F9F8F6] border-none text-[#2C2C2C] text-sm px-6 py-4 rounded-xl focus:ring-2 focus:ring-[#D4C5B0] outline-none transition-all placeholder:text-[#AAA]"
            />
        </div>
    )
}

function SelectGroup({label, value, onChange, options}: any) {
    return (
        <div>
            <label className="block text-sm font-medium text-[#555] mb-2 ml-1">{label}</label>
            <div className="relative">
                <select 
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="w-full bg-[#F9F8F6] border-none text-[#2C2C2C] text-sm px-6 py-4 rounded-xl focus:ring-2 focus:ring-[#D4C5B0] outline-none appearance-none"
                >
                    {options.map((opt: string) => <option key={opt} value={opt}>{opt}</option>)}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#888]">▼</div>
            </div>
        </div>
    )
}
