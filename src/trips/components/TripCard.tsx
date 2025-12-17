import { useNavigate } from "react-router-dom";
import type { Trip, Profile } from "../../shared/types/database";

export interface TripWithCreator extends Trip {
    creator: Profile;
}

function Badge({ text }: { text: string }) {
    return (
        <span className="px-3 py-1 bg-[#F9F8F6] rounded-lg text-xs text-[#666]">
            {text}
        </span>
    )
}

export function TripCard({ trip, isHost, onDelete }: { trip: TripWithCreator, isHost?: boolean, onDelete?: () => void }) {
    const navigate = useNavigate();

    return (
        <div className="group bg-white/70 backdrop-blur-sm border border-white/60 p-6 rounded-[2rem] hover:shadow-[0_15px_30px_-10px_rgba(0,0,0,0.08)] transition-all duration-300 hover:-translate-y-1 relative">
            <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-[#E6E2D6] overflow-hidden flex items-center justify-center text-sm font-medium text-[#555]">
                    {trip.creator.avatar_url ? (
                        <img src={trip.creator.avatar_url} alt="avatar" className="w-full h-full object-cover" />
                    ) : (
                        trip.creator.full_name?.[0] || '?'
                    )}
                </div>
                <div>
                    <h3 className="text-sm font-medium text-[#2C2C2C]">{trip.creator.full_name || 'Anonymous Traveler'}</h3>
                    <p className="text-xs text-[#888]">Creator</p>
                </div>
                <div className="ml-auto text-xs bg-[#F2EFE9] px-2 py-1 rounded-full text-[#555]">
                    {trip.travel_style}
                </div>
            </div>

            <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-[#2C2C2C]"></div>
                    <span className="text-lg text-[#2C2C2C]">{trip.start_location}</span>
                </div>
                <div className="border-l-2 border-dashed border-[#DDD] h-4 ml-[3px]"></div>
                <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-[#D4C5B0]"></div>
                    <span className="text-lg text-[#2C2C2C]">{trip.end_location}</span>
                </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-6">
                <Badge text={new Date(trip.start_time).toLocaleDateString()} />
                <Badge text={trip.vehicle} />
                <Badge text={`${trip.max_people} People Max`} />
            </div>

            <div className="flex gap-3">
                <button 
                    onClick={() => navigate(`/trips/${trip.id}`)}
                    className="flex-1 py-3 rounded-xl border border-[#2C2C2C] text-[#2C2C2C] font-medium hover:bg-[#2C2C2C] hover:text-[#F2EFE9] transition-colors"
                >
                    View Details
                </button>
                {isHost && onDelete && (
                    <button 
                        onClick={(e) => {
                            e.stopPropagation();
                            onDelete();
                        }}
                        className="w-12 flex items-center justify-center rounded-xl bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
                        title="Delete Trip"
                    >
                        🗑️
                    </button>
                )}
            </div>
        </div>
    )
}
