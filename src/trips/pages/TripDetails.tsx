import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../../shared/utils/supabase";
import type { Trip, Profile, TripStop } from "../../shared/types/database";

interface FullTrip extends Trip {
    creator: Profile;
    stops: TripStop[];
}

interface Message {
    id: string;
    content: string;
    user_id: string;
    created_at: string;
    user?: Profile;
}

interface Participant {
    trip_id: string;
    user_id: string;
    status: string;
    user: Profile;
}

export default function TripDetails() {
    const { tripId } = useParams();
    const navigate = useNavigate();
    const [trip, setTrip] = useState<FullTrip | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [joinStatus, setJoinStatus] = useState<'Pending' | 'Approved' | 'Rejected' | 'none' | 'owner'>('none');
    const [currentUser, setCurrentUser] = useState<string | null>(null);

    // Chat & Management State
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [participants, setParticipants] = useState<Participant[]>([]);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (tripId) {
            fetchTripDetails();
        }
    }, [tripId]);

    // Poll/Subscribe for Chat
    useEffect(() => {
        if (!tripId || (joinStatus !== 'Approved' && joinStatus !== 'owner')) return;

        fetchMessages();
        fetchParticipants();

        const channel = supabase
            .channel('public:trip_messages')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'trip_messages', filter: `trip_id=eq.${tripId}` }, 
            () => fetchMessages())
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, [tripId, joinStatus]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const fetchMessages = async () => {
        const { data, error } = await supabase
            .from('trip_messages')
            .select('*, user:profiles!trip_messages_user_id_fkey(*)')
            .eq('trip_id', tripId)
            .order('created_at', { ascending: true });
        
        if (!error && data) setMessages(data as Message[]);
    };

    const fetchParticipants = async () => {
        const { data, error } = await supabase
            .from('trip_participants')
            .select('*, user:profiles!trip_participants_user_id_fkey(*)')
            .eq('trip_id', tripId)
            .eq('status', 'Approved');
        
        if (!error && data) setParticipants(data as any[]);
    };

    const sendMessage = async () => {
        if (!newMessage.trim() || !currentUser || !trip) return;
        try {
            await supabase.from('trip_messages').insert({
                trip_id: trip.id,
                user_id: currentUser,
                content: newMessage
            });
            setNewMessage("");
        } catch (error) {
            console.error("Failed to send message");
        }
    };

    const removeParticipant = async (userId: string) => {
        if (!confirm("This will remove the user from the trip. Continue?")) return;
        try {
            await supabase
                .from('trip_participants')
                .update({ status: 'Rejected' })
                .eq('trip_id', trip?.id)
                .eq('user_id', userId);
            
            setParticipants(participants.filter(p => p.user_id !== userId));
        } catch (error) {
            alert("Failed to remove user");
        }
    };

    const fetchTripDetails = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) setCurrentUser(user.id);

            // Fetch Trip + Creator
            const { data: tripData, error: tripError } = await supabase
                .from('trips')
                .select('*, creator:profiles!trips_creator_id_fkey(*)')
                .eq('id', tripId)
                .single();

            if (tripError) throw tripError;

            // Fetch Stops
            const { data: stopsData, error: stopsError } = await supabase
                .from('trip_stops')
                .select('*')
                .eq('trip_id', tripId)
                .order('stop_order', { ascending: true });

            if (stopsError) throw stopsError;

            setTrip({
                ...tripData,
                creator: tripData.creator,
                stops: stopsData || []
            } as FullTrip);

            // Check if owner
            if (user && tripData.creator_id === user.id) {
                setJoinStatus('owner');
            } else if (user) {
                // Check if already joined - use maybeSingle to avoid 406 error if not found
                const { data: participantData } = await supabase
                    .from('trip_participants')
                    .select('status')
                    .eq('trip_id', tripId)
                    .eq('user_id', user.id)
                    .maybeSingle();
                
                if (participantData) {
                    setJoinStatus(participantData.status as any); // Cast because DB returns string
                }
            }

        } catch (err: any) {
            // Generic error for safety
            console.error("Error loading trip details");
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleJoinTrip = async () => {
        if (!currentUser || !trip) return;
        
        try {
            const { error } = await supabase
                .from('trip_participants')
                .insert({
                    trip_id: trip.id,
                    user_id: currentUser,
                    status: 'Pending' // Capitalized to match Enum
                });

            if (error) throw error;
            setJoinStatus('Pending');
            alert("Request sent! The host will review your request.");
        } catch (err: any) {
            console.error("Join request failed");
            alert("Failed to join trip: " + err.message);
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center text-[#888]">Loading trip details...</div>;
    if (error || !trip) return <div className="min-h-screen flex items-center justify-center text-red-500">Error: {error || "Trip not found"}</div>;

    const renderJoinButton = () => {
        if (joinStatus === 'owner') {
            return (
                <button className="px-8 py-3 bg-[#E6E2D6] text-[#888] rounded-full font-medium cursor-default">
                    You are the Host
                </button>
            );
        }
        if (joinStatus === 'Approved') {
             return (
                <button className="px-8 py-3 bg-green-100 text-green-700 rounded-full font-medium cursor-default">
                    ✓ Joined
                </button>
            );
        }
        if (joinStatus === 'Pending') {
             return (
                <button className="px-8 py-3 bg-yellow-50 text-yellow-600 rounded-full font-medium cursor-default border border-yellow-200">
                    Request Pending
                </button>
            );
        }
        if (joinStatus === 'Rejected') {
             return (
                <button className="px-8 py-3 bg-red-50 text-red-500 rounded-full font-medium cursor-default">
                    Request Rejected
                </button>
            );
        }
        return (
            <button 
                onClick={handleJoinTrip}
                className="px-8 py-3 bg-[#D4C5B0] text-[#2C2C2C] rounded-full font-medium hover:bg-[#C4B5A0] transition-colors shadow-lg shadow-[#D4C5B0]/20"
            >
                Request to Join
            </button>
        );
    };

    return (
        <div className="min-h-screen p-6 md:p-12 pb-32">
            <div className="fixed top-[-100px] right-[-100px] w-[500px] h-[500px] bg-[#E6E2D6] rounded-full blur-[100px] -z-10 opacity-60"></div>

            <div className="max-w-4xl mx-auto">
                <button onClick={() => navigate('/discover')} className="text-sm text-[#888] mb-8 hover:text-[#2C2C2C]">← Back to Discover</button>

                {/* Header Section */}
                <div className="bg-white/60 backdrop-blur-md border border-white/50 rounded-[2.5rem] p-8 md:p-12 shadow-sm mb-8">
                    <div className="flex flex-col md:flex-row justify-between items-start gap-6">
                        <div>
                            <div className="flex items-center gap-3 mb-4">
                                <span className="px-3 py-1 bg-[#2C2C2C] text-[#F2EFE9] rounded-full text-xs uppercase tracking-wider">
                                    {trip.travel_style}
                                </span>
                                <span className="px-3 py-1 bg-[#fff] border border-[#eee] rounded-full text-xs text-[#555]">
                                    {trip.vehicle}
                                </span>
                                 <span className="px-3 py-1 bg-[#fff] border border-[#eee] rounded-full text-xs text-[#555]">
                                    {trip.flexibility} Schedule
                                </span>
                            </div>
                            <h1 className="text-3xl md:text-5xl font-light text-[#2C2C2C] mb-4">
                                {trip.start_location} <span className="text-[#AAA] font-thin">to</span> {trip.end_location}
                            </h1>
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-[#E6E2D6] overflow-hidden">
                                     {trip.creator.avatar_url ? (
                                        <img src={trip.creator.avatar_url} alt="avatar" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-xs font-medium text-[#555]">{trip.creator.full_name?.[0] || '?'}</div>
                                    )}
                                </div>
                                <p className="text-[#555] text-sm md:text-base">Hosted by <span className="font-medium text-[#2C2C2C]">{trip.creator.full_name || 'Anonymous'}</span></p>
                            </div>
                        </div>

                        <div className="flex flex-col items-end text-right">
                             <p className="text-[#888] text-sm">Departing</p>
                             <p className="text-xl md:text-2xl text-[#2C2C2C] font-light mb-4">{new Date(trip.start_time).toLocaleDateString()}</p>
                             
                             {renderJoinButton()}
                        </div>
                    </div>
                </div>

                {/* Chat & Management Section (Visible to Approved Members or Owner) */}
                {(joinStatus === 'Approved' || joinStatus === 'owner') && (
                    <div className="grid md:grid-cols-3 gap-6 mb-8">
                        {/* Chat Window */}
                        <div className="md:col-span-2 bg-white/80 backdrop-blur-md border border-white/60 rounded-[2rem] p-6 shadow-sm h-[500px] flex flex-col">
                            <h3 className="text-lg font-medium text-[#2C2C2C] mb-4 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-green-500"></span> Group Chat
                            </h3>
                            
                            <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2 scrollbar-thin scrollbar-thumb-gray-200">
                                {messages.length === 0 ? (
                                    <div className="h-full flex items-center justify-center">
                                        <p className="text-[#888] text-sm italic">No messages yet. Start the conversation!</p>
                                    </div>
                                ) : (
                                    messages.map(msg => {
                                        const isMe = msg.user_id === currentUser;
                                        return (
                                            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                                <div className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${
                                                    isMe ? 'bg-[#2C2C2C] text-[#F2EFE9] rounded-br-none' : 'bg-[#F2EFE9] text-[#2C2C2C] rounded-bl-none'
                                                }`}>
                                                    {!isMe && <p className="text-[10px] opacity-70 mb-1 font-medium">{msg.user?.full_name}</p>}
                                                    <p>{msg.content}</p>
                                                </div>
                                            </div>
                                        )
                                    })
                                )}
                                <div ref={messagesEndRef} />
                            </div>

                            <div className="flex gap-2">
                                <input 
                                    type="text" 
                                    value={newMessage}
                                    onChange={e => setNewMessage(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && sendMessage()}
                                    placeholder="Type a message..."
                                    className="flex-1 bg-[#F9F8F6] border-none rounded-full px-6 py-3 text-sm focus:ring-1 focus:ring-[#2C2C2C] outline-none"
                                />
                                <button 
                                    onClick={sendMessage}
                                    className="w-10 h-10 rounded-full bg-[#D4C5B0] text-[#2C2C2C] flex items-center justify-center hover:bg-[#C4B5A0] transition-colors"
                                >
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                                </button>
                            </div>
                        </div>

                        {/* Participants List */}
                        <div className="bg-white/80 backdrop-blur-md border border-white/60 rounded-[2rem] p-6 shadow-sm h-fit">
                            <h3 className="text-lg font-medium text-[#2C2C2C] mb-4">Trip Members ({participants.length + 1})</h3>
                            <div className="space-y-4">
                                {/* Host */}
                                <div className="flex items-center gap-3 opacity-70">
                                    <div className="w-8 h-8 rounded-full bg-[#E6E2D6] overflow-hidden flex items-center justify-center text-xs">
                                        {trip.creator.avatar_url ? <img src={trip.creator.avatar_url} className="w-full h-full object-cover" alt="host"/> : trip.creator.full_name?.[0]}
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium">{trip.creator.full_name}</p>
                                        <p className="text-[10px] text-[#888] uppercase">Host</p>
                                    </div>
                                </div>
                                
                                {/* Participants */}
                                {participants.map(p => (
                                    <div key={p.user_id} className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-[#E6E2D6] overflow-hidden flex items-center justify-center text-xs">
                                            {p.user.avatar_url ? <img src={p.user.avatar_url} className="w-full h-full object-cover" alt="user"/> : p.user.full_name?.[0]}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium truncate">{p.user.full_name}</p>
                                        </div>
                                        {joinStatus === 'owner' && (
                                            <button 
                                                onClick={() => removeParticipant(p.user_id)}
                                                className="text-xs text-red-500 hover:text-red-700 font-medium px-2 py-1 rounded bg-red-50 hover:bg-red-100 transition-colors"
                                            >
                                                Remove
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                <div className="grid md:grid-cols-3 gap-8">
                    {/* Itinerary Column */}
                    <div className="md:col-span-2 space-y-8">
                        <section>
                            <h2 className="text-2xl font-light text-[#2C2C2C] mb-6">Itinerary</h2>
                            <div className="relative pl-8 border-l border-[#DDD] space-y-12">
                                {/* Start */}
                                <div className="relative">
                                    <div className="absolute -left-[39px] top-1 w-5 h-5 rounded-full bg-[#2C2C2C] border-4 border-[#F2EFE9]"></div>
                                    <h3 className="text-lg font-medium text-[#2C2C2C]">{trip.start_location}</h3>
                                    <p className="text-sm text-[#888]">{new Date(trip.start_time).toLocaleString()}</p>
                                </div>

                                {/* Stops */}
                                {trip.stops.map(stop => (
                                    <div key={stop.id} className="relative">
                                        <div className="absolute -left-[37px] top-1.5 w-4 h-4 rounded-full bg-[#D4C5B0] border-2 border-[#F2EFE9]"></div>
                                        <h3 className="text-lg text-[#555]">{stop.stop_name}</h3>
                                        <p className="text-xs text-[#888] uppercase tracking-wide mt-1">Stop {stop.stop_order}</p>
                                    </div>
                                ))}

                                {/* End */}
                                <div className="relative">
                                    <div className="absolute -left-[39px] top-1 w-5 h-5 rounded-full bg-[#2C2C2C] border-4 border-[#F2EFE9]"></div>
                                    <h3 className="text-lg font-medium text-[#2C2C2C]">{trip.end_location}</h3>
                                    <p className="text-sm text-[#888]">{new Date(trip.end_time).toLocaleString()}</p>
                                </div>
                            </div>
                        </section>

                        {trip.safety_rules && (
                            <section className="bg-[#fff] p-6 rounded-3xl border border-[#eee]">
                                <h3 className="text-sm font-bold text-[#2C2C2C] uppercase tracking-wider mb-3">Safety & Rules</h3>
                                <p className="text-[#555] leading-relaxed">{trip.safety_rules}</p>
                            </section>
                        )}
                    </div>

                    {/* Sidebar Details */}
                    <div className="space-y-6">
                        <div className="bg-[#2C2C2C] p-6 rounded-3xl text-[#F2EFE9]">
                            <h3 className="text-sm font-medium uppercase tracking-wider opacity-60 mb-4">Trip Vibe</h3>
                            <div className="flex flex-wrap gap-2">
                                <Badge text={trip.purpose} dark />
                                <Badge text={trip.travel_style} dark />
                                <Badge text={`${trip.max_people} People Max`} dark />
                            </div>
                        </div>

                         <div className="bg-white/60 p-6 rounded-3xl border border-white/50">
                            <h3 className="text-sm font-bold text-[#2C2C2C] uppercase tracking-wider mb-4">The Creator</h3>
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 rounded-full bg-[#E6E2D6] shrink-0 overflow-hidden">
                                    {trip.creator.avatar_url ? (
                                        <img src={trip.creator.avatar_url} alt="avatar" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-[#555]">{trip.creator.full_name?.[0]}</div>
                                    )}
                                </div>
                                <div>
                                    <p className="text-[#2C2C2C] font-medium">{trip.creator.full_name}</p>
                                    <p className="text-sm text-[#666] mt-1 leading-snug">{trip.creator.bio || "No bio yet."}</p>
                                    
                                    <div className="flex flex-wrap gap-1 mt-3">
                                        {trip.creator.personality_tags?.slice(0, 3).map(tag => (
                                            <span key={tag} className="text-[10px] bg-[#E6E2D6] text-[#555] px-2 py-0.5 rounded-full">{tag}</span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

function Badge({ text, dark }: { text: string; dark?: boolean }) {
    return (
        <span className={`px-3 py-1.5 rounded-lg text-xs font-medium ${dark ? 'bg-[#444] text-[#F2EFE9]' : 'bg-[#e5e5e5] text-[#444]'}`}>
            {text}
        </span>
    )
}
