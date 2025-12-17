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
            // Get trip_ids where user is an approved participant
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

            // 3. Fetch Requests (Existing Logic)
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
            alert("Action failed");
        }
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate("/login");
    };

    const displayTrips = activeTab === 'hosting' ? hostedTrips : joinedTrips;

    return (
        <div className="min-h-screen p-6 md:p-12 pb-32">
            <div className="fixed top-[-100px] left-[-100px] w-[500px] h-[500px] bg-[#E6E2D6] rounded-full blur-[100px] -z-10 opacity-60"></div>
            <div className="fixed bottom-0 right-0 w-[600px] h-[600px] bg-[#D4C5B0] rounded-full blur-[120px] -z-10 opacity-40"></div>


            {/* Header */}
            <div className="flex justify-between items-center mb-16">
                <div>
                    <div className="mb-2">
                         <span className="text-2xl font-medium tracking-[0.2em] text-[#555]">
                            Joint Venture
                        </span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-light text-[#2C2C2C] tracking-tight">
                        Where to next?
                    </h1>
                </div>
                <div className="flex items-center gap-6">
                    <button 
                        onClick={() => navigate('/profile')}
                        className="text-sm font-medium text-[#2C2C2C] hover:underline"
                    >
                        My Profile
                    </button>
                    <button 
                        onClick={handleLogout}
                        className="text-sm text-[#888] hover:text-[#2C2C2C] transition-colors"
                    >
                        Log Out
                    </button>
                </div>
            </div>

            {/* Requests Inbox */}
            {requests.length > 0 && (
                <div className="mb-12 max-w-5xl mx-auto">
                     <h2 className="text-2xl font-light text-[#2C2C2C] mb-6 pl-2">Incoming Requests</h2>
                     <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {requests.map(req => (
                            <div key={`${req.trip_id}-${req.user_id}`} className="bg-white/80 backdrop-blur-sm p-6 rounded-3xl border border-white shadow-sm flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-[#E6E2D6] overflow-hidden">
                                     {req.requester.avatar_url ? (
                                        <img src={req.requester.avatar_url} alt="avatar" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-[#555] font-medium">{req.requester.full_name?.[0] || '?'}</div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium text-[#2C2C2C] truncate">{req.requester.full_name || 'User'}</p>
                                    <p className="text-xs text-[#888] truncate">wants to join <span className="font-medium text-[#555]">{req.trip_location}</span></p>
                                </div>
                                <div className="flex gap-2">
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); handleRequestAction(req.trip_id, req.user_id, 'Approved'); }}
                                        className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center hover:bg-green-200 transition-colors"
                                        title="Approve"
                                    >✓</button>
                                     <button 
                                        onClick={(e) => { e.stopPropagation(); handleRequestAction(req.trip_id, req.user_id, 'Rejected'); }}
                                        className="w-8 h-8 rounded-full bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-100 transition-colors"
                                        title="Reject"
                                    >✕</button>
                                </div>
                            </div>
                        ))}
                     </div>
                </div>
            )}

            {/* My Trips Dashboard */}
            <div className="max-w-6xl mx-auto mb-16">
                <div className="flex items-center gap-8 mb-8 border-b border-[#D4C5B0]/30 pb-2">
                    <button 
                         onClick={() => setActiveTab('hosting')}
                         className={`text-xl font-light pb-2 transition-all ${
                             activeTab === 'hosting' ? 'text-[#2C2C2C] border-b-2 border-[#2C2C2C]' : 'text-[#888] hover:text-[#555]'
                         }`}
                    >
                        Hosting
                    </button>
                    <button 
                         onClick={() => setActiveTab('joined')}
                         className={`text-xl font-light pb-2 transition-all ${
                             activeTab === 'joined' ? 'text-[#2C2C2C] border-b-2 border-[#2C2C2C]' : 'text-[#888] hover:text-[#555]'
                         }`}
                    >
                        Joined Groups
                    </button>
                </div>
                
                {loadingTrips ? (
                     <div className="text-[#888] text-center py-12">Loading trips...</div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {displayTrips.length === 0 ? (
                             <div className="col-span-full py-20 bg-white/40 border border-[#fff] rounded-[2rem] text-center">
                                 <p className="text-[#888] mb-4">
                                     {activeTab === 'hosting' 
                                         ? "You haven't created any trips yet." 
                                         : "You haven't joined any groups yet."}
                                 </p>
                                 <button 
                                    onClick={() => navigate(activeTab === 'hosting' ? '/create-trip' : '/discover')}
                                    className="px-6 py-2 bg-[#2C2C2C] text-[#F2EFE9] rounded-full text-sm hover:bg-[#1a1a1a]"
                                 >
                                    {activeTab === 'hosting' ? 'Create a Trip' : 'Discover Trips'}
                                 </button>
                             </div>
                        ) : (
                            displayTrips.map(trip => (
                                <TripCard key={trip.id} trip={trip} />
                            ))
                        )}
                    </div>
                )}
            </div>

            {/* Action Cards (Smaller/Secondary now) */}
            <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto opacity-90">
                {/* Discover Card */}
                <div 
                    onClick={() => navigate('/trending')}
                    className="h-[200px] bg-white/60 backdrop-blur-md border border-white/50 rounded-[2rem] p-8 cursor-pointer hover:bg-white/80 transition-all hover:-translate-y-1 flex flex-col justify-between"
                >
                    <div className="flex justify-between items-start">
                        <span className="text-xs uppercase tracking-wider bg-[#2C2C2C] text-[#F2EFE9] px-3 py-1 rounded-full">Explore</span>
                        <svg width="20" height="20" stroke="currentColor" fill="none" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                    </div>
                    <h2 className="text-2xl font-light text-[#2C2C2C]">Trending Places</h2>
                </div>

                {/* Create Trip Card */}
                <div 
                    onClick={() => navigate('/create-trip')}
                    className="h-[200px] bg-[#2C2C2C] border border-[#2C2C2C] rounded-[2rem] p-8 cursor-pointer hover:-translate-y-1 transition-all flex flex-col justify-between"
                >
                    <div className="flex justify-between items-start">
                        <span className="text-xs uppercase tracking-wider bg-[#444] text-[#F2EFE9] px-3 py-1 rounded-full">Host</span>
                        <svg width="20" height="20" stroke="#F2EFE9" fill="none" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                    </div>
                    <h2 className="text-2xl font-light text-[#F2EFE9]">Plan New Trip</h2>
                </div>
            </div>
        </div>
    )
}
