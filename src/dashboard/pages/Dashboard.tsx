import { useEffect, useState } from "react";
import { supabase } from "../../shared/utils/supabase";
import { useNavigate } from "react-router-dom";
import type { Profile } from "../../shared/types/database";
import { TripCard, type TripWithCreator } from "../../trips/components/TripCard";

interface RequestItem {
    trip_id: string;
    user_id: string;
    status: string;
    requester: Profile;
    trip_location: string;
}

export default function Dashboard() {
    const navigate = useNavigate();
    const [requests, setRequests] = useState<RequestItem[]>([]);
    
    // My Trips State
    const [hostedTrips, setHostedTrips] = useState<TripWithCreator[]>([]);
    const [joinedTrips, setJoinedTrips] = useState<TripWithCreator[]>([]);
    const [activeTab, setActiveTab] = useState<'hosting' | 'joined'>('hosting');
    const [loadingTrips, setLoadingTrips] = useState(true);
    const [showFabMenu, setShowFabMenu] = useState(false);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // 1. Fetch Hosted Trips
            const { data: hostedData } = await supabase
                .from('trips')
                .select('*, creator:profiles!trips_creator_id_fkey(*)')
                .eq('creator_id', user.id)
                .order('start_time', { ascending: true });
            
            if (hostedData) setHostedTrips(hostedData as TripWithCreator[]);

            // 2. Fetch Joined Trips
            const { data: participations } = await supabase
                .from('trip_participants')
                .select('trip_id')
                .eq('user_id', user.id)
                .eq('status', 'Approved');

            if (participations && participations.length > 0) {
                const tripIds = participations.map(p => p.trip_id);
                const { data: joinedData } = await supabase
                    .from('trips')
                    .select('*, creator:profiles!trips_creator_id_fkey(*)')
                    .in('id', tripIds)
                    .order('start_time', { ascending: true });
                
                if (joinedData) setJoinedTrips(joinedData as TripWithCreator[]);
            }

            // 3. Fetch Requests
            if (hostedData && hostedData.length > 0) {
                const myTripIds = hostedData.map(t => t.id);
                const { data: requestsData } = await supabase
                    .from('trip_participants')
                    .select('*, requester:profiles!trip_participants_user_id_fkey(*)')
                    .in('trip_id', myTripIds)
                    .eq('status', 'Pending');

                if (requestsData) {
                    const formattedRequests = requestsData.map((r: any) => ({
                        trip_id: r.trip_id,
                        user_id: r.user_id,
                        status: r.status,
                        requester: r.requester,
                        trip_location: hostedData.find(t => t.id === r.trip_id)?.start_location || "Unknown Trip"
                    }));
                    setRequests(formattedRequests);
                }
            }
        } catch (error) {
            console.error("Error loading dashboard data");
        } finally {
            setLoadingTrips(false);
        }
    };

    const handleRequestAction = async (tripId: string, userId: string, action: 'Approved' | 'Rejected') => {
        try {
            const { error } = await supabase
                .from('trip_participants')
                .update({ status: action })
                .eq('trip_id', tripId)
                .eq('user_id', userId);

            if (error) throw error;
            setRequests(requests.filter(r => !(r.trip_id === tripId && r.user_id === userId)));
        } catch (error) {
            console.error("Failed to update request");
        }
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate("/login");
    };

    const handleDeleteTrip = async (tripId: string) => {
        if (!window.confirm("Are you sure you want to delete this trip? This action cannot be undone.")) {
            return;
        }

        try {
            const { error } = await supabase
                .from('trips')
                .delete()
                .eq('id', tripId);

            if (error) throw error;
            
            setHostedTrips(prev => prev.filter(t => t.id !== tripId));
        } catch (error) {
            console.error("Error deleting trip:", error);
            alert("Failed to delete trip. Please try again.");
        }
    };

    const displayTrips = activeTab === 'hosting' ? hostedTrips : joinedTrips;
    
    // Determine "Next Trip" (Hero)
    // Find the soonest trip from either hosted or joined that hasn't passed yet
    const allTrips = [...hostedTrips, ...joinedTrips].sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());
    const nextTrip = allTrips.find(t => new Date(t.start_time) > new Date());

    return (
        <div className="min-h-screen p-6 md:p-12 pb-32 relative">
            <div className="fixed top-[-100px] left-[-100px] w-[500px] h-[500px] bg-[#E6E2D6] rounded-full blur-[100px] -z-10 opacity-60"></div>
            <div className="fixed bottom-0 right-0 w-[600px] h-[600px] bg-[#D4C5B0] rounded-full blur-[120px] -z-10 opacity-40"></div>

            {/* Header */}
            <div className="flex justify-between items-center mb-10">
                <div className="flex flex-col">
                    <span className="text-sm font-medium tracking-[0.2em] text-[#888] mb-1">JOINT VENTURE</span>
                    <h1 className="text-3xl font-light text-[#2C2C2C]">Dashboard</h1>
                </div>
                <div className="flex items-center gap-4">
                     <button onClick={() => navigate('/profile')} className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-[#2C2C2C] border border-[#eee] hover:border-[#D4C5B0] transition-colors">
                        👤
                    </button>
                    <button onClick={handleLogout} className="text-sm text-[#888] hover:text-[#2C2C2C]">Log Out</button>
                </div>
            </div>

            {/* HERO SECTION: Next Trip */}
            {nextTrip && (
                <div className="mb-12 cursor-pointer group" onClick={() => navigate(`/trips/${nextTrip.id}`)}>
                    <div className="text-sm text-[#555] mb-3 ml-2">Up Next</div>
                    <div className="relative overflow-hidden rounded-[2.5rem] bg-[#2C2C2C] text-[#F2EFE9] p-8 md:p-12 shadow-2xl transition-transform hover:scale-[1.01]">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-[#333] rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/4"></div>
                        
                        <div className="relative z-10">
                             <div className="flex justify-between items-start mb-8">
                                <div>
                                    <h2 className="text-4xl md:text-5xl font-light mb-2">{nextTrip.start_location}</h2>
                                    <div className="h-[2px] w-12 bg-[#F2EFE9]/30 my-4"></div>
                                    <h2 className="text-4xl md:text-5xl font-light text-[#D4C5B0]">{nextTrip.end_location}</h2>
                                </div>
                                <div className="text-right">
                                    <div className="text-4xl font-medium">{new Date(nextTrip.start_time).getDate()}</div>
                                    <div className="text-xl opacity-70">{new Date(nextTrip.start_time).toLocaleString('default', { month: 'short' })}</div>
                                </div>
                             </div>
                             
                             <div className="flex items-center gap-4 text-sm opacity-80">
                                <span className="px-3 py-1 bg-white/10 rounded-full">{nextTrip.vehicle}</span>
                                <span className="px-3 py-1 bg-white/10 rounded-full">{nextTrip.max_people} Travelers</span>
                                <span className="ml-auto">View Trip →</span>
                             </div>
                        </div>
                    </div>
                </div>
            )}

            {/* REQUESTS INBOX (Collapsible or just standard) */}
            {requests.length > 0 && (
                <div className="mb-12">
                     <h2 className="text-xl font-light text-[#2C2C2C] mb-4 pl-2">Pending Requests</h2>
                     <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {requests.map(req => (
                            <div key={`${req.trip_id}-${req.user_id}`} className="bg-white/80 backdrop-blur-sm p-4 rounded-2xl border border-white shadow-sm flex items-center gap-4">
                                <div 
                                    onClick={() => navigate(`/profile/${req.user_id}`)}
                                    className="w-10 h-10 rounded-full bg-[#E6E2D6] overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
                                >
                                     {req.requester.avatar_url ? (
                                        <img src={req.requester.avatar_url} alt="avatar" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-[#555] font-bold text-xs">{req.requester.full_name?.[0]}</div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p 
                                        onClick={() => navigate(`/profile/${req.user_id}`)}
                                        className="font-medium text-sm text-[#2C2C2C] truncate cursor-pointer hover:underline"
                                    >
                                        {req.requester.full_name}
                                    </p>
                                    <p className="text-xs text-[#888] truncate">for <span className="text-[#555]">{req.trip_location}</span></p>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => handleRequestAction(req.trip_id, req.user_id, 'Approved')} className="w-8 h-8 rounded-full bg-[#E8F5E9] text-green-600 hover:bg-[#C8E6C9] flex items-center justify-center">✓</button>
                                    <button onClick={() => handleRequestAction(req.trip_id, req.user_id, 'Rejected')} className="w-8 h-8 rounded-full bg-[#FFEBEE] text-red-600 hover:bg-[#FFCDD2] flex items-center justify-center">✕</button>
                                </div>
                            </div>
                        ))}
                     </div>
                </div>
            )}

            {/* MY TRIPS LIST */}
            <div className="max-w-6xl mx-auto mb-24">
                <div className="flex items-center gap-6 mb-8 border-b border-[#D4C5B0]/30 pb-0">
                    <TabButton label="Hosting" active={activeTab === 'hosting'} onClick={() => setActiveTab('hosting')} />
                    <TabButton label="Going" active={activeTab === 'joined'} onClick={() => setActiveTab('joined')} />
                </div>
                
                {loadingTrips ? (
                     <div className="text-[#888] text-center py-12 animate-pulse">Loading journeys...</div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {displayTrips.length === 0 ? (
                             <EmptyState activeTab={activeTab} />
                        ) : (
                            displayTrips.map(trip => (
                                <TripCard 
                                    key={trip.id} 
                                    trip={trip} 
                                    isHost={activeTab === 'hosting'}
                                    onDelete={() => handleDeleteTrip(trip.id)}
                                />
                            ))
                        )}
                    </div>
                )}
            </div>

            {/* EXPLORE & INSPIRE SECTION */}
            <div className="max-w-6xl mx-auto mb-32 animate-in slide-in-from-bottom-20 duration-1000 delay-300">
                <div className="flex items-end justify-between mb-8">
                    <div>
                        <h2 className="text-2xl font-light text-[#2C2C2C] mb-2">Explore & Inspire</h2>
                        <p className="text-[#888] font-light">Tools for your journey.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Card 1: Discover */}
                    <div 
                        onClick={() => navigate('/discover')}
                        className="group relative h-64 rounded-[2rem] overflow-hidden cursor-pointer shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 bg-[#2C2C2C] text-[#F2EFE9]"
                    >
                         <div className="absolute inset-0 bg-gradient-to-br from-[#444] to-[#1a1a1a] opacity-100 group-hover:scale-110 transition-transform duration-700"></div>
                         <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-[50px] -translate-y-1/2 translate-x-1/2"></div>
                         <div className="absolute bottom-0 left-0 w-32 h-32 bg-black/20 rounded-full blur-[50px] translate-y-1/2 -translate-x-1/2"></div>
                         
                         <div className="relative z-10 h-full p-6 flex flex-col justify-between">
                             <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-2xl group-hover:bg-white group-hover:text-[#2C2C2C] transition-colors">🔭</div>
                             <div>
                                 <h3 className="text-xl font-medium mb-1">Discover</h3>
                                 <p className="text-sm opacity-60">Find open trips to join.</p>
                             </div>
                         </div>
                    </div>

                    {/* Card 2: Trending */}
                    <div 
                        onClick={() => navigate('/trending')}
                        className="group relative h-64 rounded-[2rem] overflow-hidden cursor-pointer shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 bg-[#E6E2D6] text-[#2C2C2C]"
                    >
                         <div className="absolute inset-0 bg-gradient-to-br from-[#F2EFE9] to-[#D4C5B0] opacity-100 group-hover:scale-110 transition-transform duration-700"></div>
                         
                         <div className="relative z-10 h-full p-6 flex flex-col justify-between">
                             <div className="w-12 h-12 rounded-full bg-white/40 backdrop-blur-md flex items-center justify-center text-2xl group-hover:bg-white transition-colors">🌍</div>
                             <div>
                                 <h3 className="text-xl font-medium mb-1">Trending</h3>
                                 <p className="text-sm opacity-60">See where others go.</p>
                             </div>
                         </div>
                    </div>

                    {/* Card 3: Solo Guide */}
                    <div 
                        onClick={() => navigate('/guide')}
                        className="group relative h-64 rounded-[2rem] overflow-hidden cursor-pointer shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 bg-[#2C2C2C] text-[#F2EFE9]"
                    >
                         <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=800&auto=format&fit=crop')] bg-cover bg-center grayscale group-hover:grayscale-0 transition-all duration-700 opacity-40 group-hover:opacity-60"></div>
                         <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                         
                         <div className="relative z-10 h-full p-6 flex flex-col justify-between">
                             <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-2xl group-hover:bg-[#D4C5B0] group-hover:text-[#2C2C2C] transition-colors">🧭</div>
                             <div>
                                 <h3 className="text-xl font-medium mb-1">Solo Guide</h3>
                                 <p className="text-sm opacity-80">Master the art of solo travel.</p>
                             </div>
                         </div>
                    </div>

                     {/* Card 4: Motivation */}
                    <div 
                        onClick={() => navigate('/motivation')}
                        className="group relative h-64 rounded-[2rem] overflow-hidden cursor-pointer shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 bg-[#D4C5B0] text-[#2C2C2C]"
                    >
                         <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=800&auto=format&fit=crop')] bg-cover bg-center grayscale group-hover:grayscale-0 transition-all duration-700 opacity-30 group-hover:opacity-50 mix-blend-overlay"></div>
                         <div className="absolute inset-0 bg-gradient-to-br from-[#D4C5B0] to-[#bfa885] opacity-90 group-hover:opacity-80 transition-opacity"></div>
                         
                         <div className="relative z-10 h-full p-6 flex flex-col justify-between">
                             <div className="w-12 h-12 rounded-full bg-white/30 backdrop-blur-md flex items-center justify-center text-xl group-hover:bg-white transition-colors">🔥</div>
                             <div>
                                 <h3 className="text-xl font-medium mb-1">Motivation</h3>
                                 <p className="text-sm opacity-60">Daily words of wisdom.</p>
                             </div>
                         </div>
                    </div>
                </div>
            </div>

            {/* FLOATING ACTION BUTTON (FAB) */}
            <div className="fixed bottom-8 right-8 z-50 flex flex-col items-end gap-4 pointer-events-none">
                {/* Expandable Menu */}
                {showFabMenu && (
                    <div className="flex flex-col gap-3 pointer-events-auto animate-in slide-in-from-bottom-10 fade-in duration-200">
                        <button 
                            onClick={() => navigate('/create-trip')}
                            className="flex items-center gap-3 bg-[#2C2C2C] text-[#F2EFE9] px-6 py-3 rounded-full shadow-xl hover:scale-105 transition-transform"
                        >
                            <span className="font-medium">Plan a Trip</span>
                            <span className="text-xl">✏️</span>
                        </button>
                        
                        <button 
                            onClick={() => navigate('/discover')}
                            className="flex items-center gap-3 bg-white text-[#2C2C2C] px-6 py-3 rounded-full shadow-xl hover:scale-105 transition-transform border border-[#eee]"
                        >
                            <span className="font-medium">Discover Trips</span>
                            <span className="text-xl">🔭</span>
                        </button>

                         <button 
                            onClick={() => navigate('/trending')}
                            className="flex items-center gap-3 bg-white text-[#2C2C2C] px-6 py-3 rounded-full shadow-xl hover:scale-105 transition-transform border border-[#eee]"
                        >
                            <span className="font-medium">Trending Locations</span>
                            <span className="text-xl">🌍</span>
                        </button>

                         <button 
                            onClick={() => navigate('/guide')}
                            className="flex items-center gap-3 bg-[#E6E2D6] text-[#2C2C2C] px-6 py-3 rounded-full shadow-xl hover:scale-105 transition-transform border border-[#D4C5B0]"
                        >
                            <span className="font-medium">Solo Guide</span>
                            <span className="text-xl">🧭</span>
                        </button>

                         <button 
                            onClick={() => navigate('/motivation')}
                            className="flex items-center gap-3 bg-[#2C2C2C] text-[#F2EFE9] px-6 py-3 rounded-full shadow-xl hover:scale-105 transition-transform border border-[#1a1a1a]"
                        >
                            <span className="font-medium">Motivation</span>
                            <span className="text-xl">🔥</span>
                        </button>
                    </div>
                )}

                {/* Main FAB Toggle */}
                <button 
                    onClick={() => setShowFabMenu(!showFabMenu)}
                    className={`pointer-events-auto w-16 h-16 rounded-full bg-[#D4C5B0] text-[#2C2C2C] shadow-2xl flex items-center justify-center text-3xl transition-transform duration-300 hover:scale-110 active:scale-95 ${showFabMenu ? 'rotate-45 bg-[#2C2C2C] text-white' : ''}`}
                >
                    +
                </button>
            </div>
        </div>
    )
}

function TabButton({label, active, onClick}: {label: string, active: boolean, onClick: () => void}) {
    return (
        <button 
            onClick={onClick}
            className={`text-lg font-light pb-3 px-2 transition-all relative ${
                active ? 'text-[#2C2C2C]' : 'text-[#888] hover:text-[#555]'
            }`}
        >
            {label}
            {active && <div className="absolute bottom-0 left-0 w-full h-[2px] bg-[#2C2C2C] rounded-full"></div>}
        </button>
    )
}

function EmptyState({activeTab}: {activeTab: string}) {
    return (
        <div className="col-span-full py-20 text-center opacity-60">
            <div className="text-4xl mb-4 grayscale">
                {activeTab === 'hosting' ? '⛺️' : '🎫'}
            </div>
            <p className="text-[#555] mb-2 font-medium">
                {activeTab === 'hosting' ? "No trips planned yet." : "No upcoming adventures."}
            </p>
            <p className="text-sm text-[#888]">
                {activeTab === 'hosting' ? "Time to start a new journey?" : "Find a group to join!"}
            </p>
        </div>
    )
}
