import { useEffect, useState } from "react";
import { supabase } from "../../shared/utils/supabase";
import { useNavigate } from "react-router-dom";
import { TripCard, type TripWithCreator } from "../components/TripCard";

export default function Discover() {
    const navigate = useNavigate();
    const [trips, setTrips] = useState<TripWithCreator[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Filters
    const [searchQuery, setSearchQuery] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [travelStyle, setTravelStyle] = useState<string>("All");
    const [startDate, setStartDate] = useState("");

    // Debounce search input
    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(searchQuery), 500);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    useEffect(() => {
        fetchTrips();
    }, [debouncedSearch, travelStyle, startDate]);

    const fetchTrips = async () => {
        setLoading(true);
        setError(null);
        try {
            let query = supabase
                .from('trips')
                .select('*, creator:profiles!trips_creator_id_fkey(*)')
                .eq('visibility', 'Public')
                .order('start_time', { ascending: true });

            // Apply Filters
            if (debouncedSearch) {
                // Search in start_location OR end_location
                query = query.or(`start_location.ilike.%${debouncedSearch}%,end_location.ilike.%${debouncedSearch}%`);
            }

            if (travelStyle !== "All") {
                query = query.eq('travel_style', travelStyle);
            }

            if (startDate) {
                query = query.gte('start_time', new Date(startDate).toISOString());
            }

            const { data, error } = await query;

            if (error) {
                console.error("Failed to fetch trips");
                throw error;
            }
            setTrips(data as unknown as TripWithCreator[]);
        } catch (error: any) {
            console.error("Error loading trips", error);
            setError(error.message || "Failed to load trips");
        } finally {
            setLoading(false);
        }
    };

    const clearFilters = () => {
        setSearchQuery("");
        setTravelStyle("All");
        setStartDate("");
    };

    return (
        <div className="min-h-screen p-6 md:p-12 pb-32">
            <div className="fixed top-[-100px] left-[-100px] w-[500px] h-[500px] bg-[#E6E2D6] rounded-full blur-[100px] -z-10 opacity-60"></div>
            
            <div className="max-w-6xl mx-auto">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                    <div className="flex items-center gap-4">
                        <button onClick={() => navigate('/dashboard')} className="text-sm text-[#888] hover:text-[#2C2C2C] self-start mt-2">← Back</button>
                        <div>
                            <h1 className="text-3xl md:text-4xl font-light text-[#2C2C2C]">Discover Trips</h1>
                            <p className="text-[#888] font-light mt-1">Find your next adventure buddy.</p>
                        </div>
                    </div>
                    
                    <button 
                         onClick={() => navigate('/create-trip')}
                         className="px-6 py-3 bg-[#2C2C2C] text-[#F2EFE9] rounded-full text-sm font-medium hover:scale-[1.02] transition-transform shadow-lg self-start md:self-auto"
                    >
                        + Create Trip
                    </button>
                </div>

                {/* Filters Section */}
                <div className="bg-white/60 backdrop-blur-md border border-white/50 rounded-[2rem] p-6 shadow-sm mb-8 animate-in fade-in slide-in-from-bottom-2">
                    <div className="grid md:grid-cols-4 gap-4">
                        {/* Search */}
                        <div className="md:col-span-2">
                             <label className="text-xs font-bold text-[#888] uppercase tracking-wider mb-2 block ml-1">Search Destinations</label>
                             <div className="relative">
                                 <input 
                                    type="text" 
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="e.g. Goa, Manali, Paris..."
                                    className="w-full bg-white border border-[#eee] rounded-xl px-4 py-3 pl-10 focus:ring-2 focus:ring-[#D4C5B0] outline-none transition-all"
                                 />
                                 <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#888]">🔍</div>
                             </div>
                        </div>

                        {/* Travel Style */}
                        <div>
                            <label className="text-xs font-bold text-[#888] uppercase tracking-wider mb-2 block ml-1">Vibe</label>
                            <select 
                                value={travelStyle}
                                onChange={(e) => setTravelStyle(e.target.value)}
                                className="w-full bg-white border border-[#eee] rounded-xl px-4 py-3 outline-none cursor-pointer focus:ring-2 focus:ring-[#D4C5B0]"
                            >
                                <option value="All">All Vibes</option>
                                <option value="Backpacking">Backpacking</option>
                                <option value="Budget">Budget</option>
                                <option value="Luxury">Luxury</option>
                            </select>
                        </div>

                        {/* Date */}
                        <div>
                             <label className="text-xs font-bold text-[#888] uppercase tracking-wider mb-2 block ml-1">After Date</label>
                             <input 
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="w-full bg-white border border-[#eee] rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#D4C5B0]"
                             />
                        </div>
                    </div>
                    
                    {/* Active Filters Summary */}
                    {(searchQuery || travelStyle !== 'All' || startDate) && (
                        <div className="mt-4 flex items-center gap-2">
                            <span className="text-xs text-[#888]">Active Filters:</span>
                            <button onClick={clearFilters} className="text-xs text-red-400 hover:text-red-500 font-medium bg-red-50 px-3 py-1 rounded-full transition-colors">
                                Clear All ✕
                            </button>
                        </div>
                    )}
                </div>

                {error && (
                    <div className="bg-red-50 text-red-500 p-4 rounded-xl mb-6">
                        <p>Error loading trips: {error}</p>
                    </div>
                )}

                {loading ? (
                    <div className="text-center text-[#888] mt-20 flex flex-col items-center gap-4">
                        <div className="w-8 h-8 border-2 border-[#D4C5B0] border-t-[#2C2C2C] rounded-full animate-spin"></div>
                        <p>Finding adventures...</p>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {trips.length === 0 ? (
                            <div className="col-span-full text-center py-20 bg-white/50 rounded-[2rem] border border-white">
                                <div className="text-4xl mb-4 grayscale opacity-30">🌍</div>
                                <p className="text-[#888] text-lg">No trips found matching your filters.</p>
                                <button onClick={clearFilters} className="text-[#2C2C2C] underline mt-2 hover:opacity-70">Clear filters</button>
                            </div>
                        ) : (
                            trips.map(trip => (
                                <TripCard key={trip.id} trip={trip} />
                            ))
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
