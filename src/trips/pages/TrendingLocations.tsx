import { useEffect, useState } from "react";
import { getCurrentSeason, getTrendingLocations, type Season, type TrendingLocation } from "../../shared/utils/seasonalLocations";
import { useNavigate } from "react-router-dom";

export default function TrendingLocations() {
    const navigate = useNavigate();
    const [season, setSeason] = useState<Season>('Spring');
    const [locations, setLocations] = useState<TrendingLocation[]>([]);

    useEffect(() => {
        const currentSeason = getCurrentSeason();
        setSeason(currentSeason);
        setLocations(getTrendingLocations(currentSeason));
    }, []);

    // Function to manually toggle seasons for demonstration (optional)
    const toggleSeason = (newSeason: Season) => {
        setSeason(newSeason);
        setLocations(getTrendingLocations(newSeason));
    };

    const getSeasonColor = () => {
        switch(season) {
            case 'Spring': return 'text-pink-500';
            case 'Summer': return 'text-orange-500';
            case 'Autumn': return 'text-amber-700';
            case 'Winter': return 'text-blue-500';
            default: return 'text-[#2C2C2C]';
        }
    };

    return (
        <div className="min-h-screen bg-[#F2EFE9] text-[#2C2C2C]">
            {/* Header / Hero */}
            <div className="relative h-[40vh] min-h-[400px] w-full overflow-hidden bg-gray-900">
                <img 
                    src={locations[0]?.imageUrl || "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800"} 
                    alt="Hero" 
                    className="w-full h-full object-cover brightness-75 transition-all duration-700" 
                    onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=1200'; // Fallback
                    }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#2C2C2C] via-black/40 to-black/30"></div>
                
                <div className="absolute bottom-10 left-6 md:left-12 z-10">
                    <button onClick={() => navigate('/dashboard')} className="text-white/80 hover:text-white mb-4 flex items-center gap-2">
                        ← Back to Dashboard
                    </button>
                    <h1 className="text-5xl md:text-7xl font-light text-white tracking-tight drop-shadow-lg">
                        Trending this <span className={`font-semibold ${getSeasonColor()} drop-shadow-md`}>{season}</span>
                    </h1>
                    <p className="text-white/90 text-xl mt-2 max-w-xl font-light drop-shadow-md">
                        Curated destinations perfect for the current weather and vibes.
                    </p>
                </div>
            </div>

            {/* Season Selector Tabs */}
            <div className="max-w-7xl mx-auto px-6 md:px-12 py-8">
                <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
                    {(['Spring', 'Summer', 'Autumn', 'Winter'] as Season[]).map(s => (
                        <button
                            key={s}
                            onClick={() => toggleSeason(s)}
                            className={`px-6 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap shadow-sm ${
                                season === s 
                                    ? 'bg-[#2C2C2C] text-[#F2EFE9]' 
                                    : 'bg-white text-[#555] hover:bg-[#2C2C2C] hover:text-[#F2EFE9]'
                            }`}
                        >
                            {s}
                        </button>
                    ))}
                </div>
            </div>

            {/* Locations Grid */}
            <div className="max-w-7xl mx-auto px-6 md:px-12 pb-24">
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {locations.map(loc => (
                        <div 
                            key={loc.id}
                            className="group relative h-[450px] rounded-[2rem] overflow-hidden cursor-pointer shadow-lg hover:shadow-2xl transition-all duration-500 bg-gray-900"
                        >
                            <img 
                                src={loc.imageUrl} 
                                alt={loc.name} 
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-90 group-hover:opacity-100"
                                onError={(e) => {
                                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800';
                                }}
                            />
                            {/* Darker gradient for better text visibility */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-90"></div>
                            
                            <div className="absolute top-6 right-6 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full border border-white/30 text-white text-xs font-semibold z-10">
                                {loc.priceRange}
                            </div>

                            <div className="absolute bottom-0 left-0 p-8 w-full z-10">
                                <p className="text-white/80 text-sm uppercase tracking-wider mb-2 font-medium">{loc.country}</p>
                                <h2 className="text-3xl font-light text-white mb-2 drop-shadow-md">{loc.name}</h2>
                                <p className="text-white/90 text-sm line-clamp-2 mb-4 font-light leading-relaxed drop-shadow-sm">
                                    {loc.description}
                                </p>

                                {/* Persuasive Highlight */}
                                <div className="mb-4 pl-3 border-l-2 border-orange-400">
                                    <p className="text-white text-sm italic font-medium drop-shadow-sm">
                                        "{loc.whyVisit}"
                                    </p>
                                </div>
                                
                                <div className="flex flex-wrap gap-2 mb-6">
                                    {loc.tags.map(tag => (
                                        <span key={tag} className="text-[10px] bg-white/20 text-white px-2 py-1 rounded-md backdrop-blur-md border border-white/10">
                                            #{tag}
                                        </span>
                                    ))}
                                </div>

                                <button 
                                    className="w-full py-3 bg-white text-[#2C2C2C] rounded-xl font-medium hover:bg-[#E6E2D6] transition-colors shadow-lg"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        navigate(`/create-trip?location=${loc.name}`);
                                    }}
                                >
                                    Plan a Trip Here
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
