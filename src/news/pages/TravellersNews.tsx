import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchTravelNews, type NewsItem } from "../services/newsService";

export default function TravellersNews() {
    const navigate = useNavigate();
    const [filter, setFilter] = useState("All");
    const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
    const [loading, setLoading] = useState(true);

    const filters = ["All", "Policy", "Destinations", "Sustainability", "Tips", "Hacks"];

    useEffect(() => {
        loadNews();
    }, [filter]);

    const loadNews = async () => {
        setLoading(true);
        const data = await fetchTravelNews(filter);
        setNewsItems(data);
        setLoading(false);
    };

    // Helper to format date relative time
    const getRelativeTime = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
        
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
        return `${Math.floor(diffInSeconds / 86400)}d ago`;
    };

    return (
        <div className="min-h-screen p-6 md:p-12 pb-32">
            {/* Background Atmosphere */}
            <div className="fixed top-[-100px] left-[-100px] w-[500px] h-[500px] bg-[#E6E2D6] rounded-full blur-[100px] -z-10 opacity-60"></div>
            <div className="fixed bottom-0 right-0 w-[600px] h-[600px] bg-[#D4C5B0] rounded-full blur-[120px] -z-10 opacity-40"></div>

            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                     <div className="flex items-center gap-4">
                        <button onClick={() => navigate('/dashboard')} className="text-sm text-[#888] hover:text-[#2C2C2C] self-start mt-2">← Back</button>
                        <div>
                            <h1 className="text-3xl md:text-4xl font-light text-[#2C2C2C]">Travellers News</h1>
                            <p className="text-[#888] font-light mt-1">Updates, hacks, and stories from the road.</p>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex gap-2 overflow-x-auto pb-6 mb-6 no-scrollbar">
                    {filters.map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-5 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                                filter === f 
                                ? 'bg-[#2C2C2C] text-[#F2EFE9] shadow-lg scale-105' 
                                : 'bg-white/60 text-[#888] hover:text-[#2C2C2C] hover:bg-white border border-transparent hover:border-[#eee]'
                            }`}
                        >
                            {f}
                        </button>
                    ))}
                </div>

                {/* News Grid */}
                {loading ? (
                    <div className="text-center text-[#888] mt-20 flex flex-col items-center gap-4">
                        <div className="w-8 h-8 border-2 border-[#D4C5B0] border-t-[#2C2C2C] rounded-full animate-spin"></div>
                        <p>Fetching latest stories...</p>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {newsItems.map((news, index) => (
                            <div 
                                key={news.id}
                                className="group bg-white/60 backdrop-blur-md border border-white/50 rounded-[2rem] overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer"
                                onClick={() => window.open(news.url, '_blank')}
                                style={{animationDelay: `${index * 50}ms`}} 
                            >
                                <div className="h-48 overflow-hidden relative">
                                    <img 
                                        src={news.urlToImage} 
                                        alt={news.title}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=800&auto=format&fit=crop';
                                        }}
                                    />
                                    {news.category && (
                                        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-[#2C2C2C]">
                                            {news.category}
                                        </div>
                                    )}
                                </div>
                                
                                <div className="p-6 flex flex-col h-[calc(100%-12rem)]">
                                    <div className="flex items-center gap-2 mb-3 text-xs text-[#888]">
                                        <span className="font-bold text-[#D4C5B0] uppercase tracking-wide truncate max-w-[150px]">{news.source.name}</span>
                                        <span>•</span>
                                        <span>{getRelativeTime(news.publishedAt)}</span>
                                    </div>
                                    
                                    <h3 className="text-xl font-medium text-[#2C2C2C] mb-3 leading-tight group-hover:text-[#D4C5B0] transition-colors line-clamp-2">
                                        {news.title}
                                    </h3>
                                    
                                    <p className="text-[#666] text-sm leading-relaxed mb-6 flex-grow line-clamp-3">
                                        {news.description}
                                    </p>
                                    
                                    <button className="flex items-center gap-2 text-sm font-medium text-[#2C2C2C] group-hover:gap-3 transition-all mt-auto">
                                        Read Story <span className="text-lg">→</span>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
