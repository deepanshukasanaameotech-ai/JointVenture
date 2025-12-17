import { useEffect, useState } from "react";
import { supabase } from "../../shared/utils/supabase";
import { useNavigate } from "react-router-dom";
import { TripCard, type TripWithCreator } from "../components/TripCard";

export default function Discover() {
    const navigate = useNavigate();
    const [trips, setTrips] = useState<TripWithCreator[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchTrips();
    }, []);

    const fetchTrips = async () => {
        try {
            // Explicitly specify the relationship to resolve ambiguity
            const { data, error } = await supabase
                .from('trips')
                .select('*, creator:profiles!trips_creator_id_fkey(*)')
                .eq('visibility', 'Public')
                .order('start_time', { ascending: true });

            if (error) {
                console.error("Failed to fetch trips");
                throw error;
            }
            setTrips(data as unknown as TripWithCreator[]);
        } catch (error: any) {
            console.error("Error loading trips");
            setError(error.message || "Failed to load trips");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen p-6 md:p-12 pb-32">
            <div className="fixed top-[-100px] left-[-100px] w-[500px] h-[500px] bg-[#E6E2D6] rounded-full blur-[100px] -z-10 opacity-60"></div>
            
            <div className="max-w-6xl mx-auto">
                <div className="flex items-center gap-4 mb-8">
                    <button onClick={() => navigate('/dashboard')} className="text-sm text-[#888] hover:text-[#2C2C2C] self-start mt-2">← Back</button>
                    <div>
                        <h1 className="text-4xl font-light text-[#2C2C2C]">Discover Trips</h1>
                        <p className="text-[#888] font-light mt-1">Find your next adventure buddy.</p>
                    </div>
                </div>

                {error && (
                    <div className="bg-red-50 text-red-500 p-4 rounded-xl mb-6">
                        <p>Error loading trips: {error}</p>
                        <p className="text-xs text-red-400 mt-1">Check console for details.</p>
                    </div>
                )}

                {loading ? (
                    <div className="text-center text-[#888] mt-20">Loading adventures...</div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {trips.length === 0 ? (
                            <div className="col-span-full text-center py-20 bg-white/50 rounded-[2rem] border border-white">
                                <p className="text-[#888]">No upcoming trips found. Be the first to create one!</p>
                                <button 
                                    onClick={() => navigate('/create-trip')}
                                    className="mt-4 px-6 py-2 bg-[#2C2C2C] text-[#F2EFE9] rounded-full text-sm"
                                >
                                    Create Trip
                                </button>
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
