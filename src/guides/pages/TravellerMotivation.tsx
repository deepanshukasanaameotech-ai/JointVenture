import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

interface Quote {
    text: string;
    author: string;
}

interface Bundle {
    title: string;
    description?: string;
    quotes: Quote[];
}

const bundles: Bundle[] = [
    {
        title: "🌍 Bundle 1: Why We Travel",
        quotes: [
            { text: "Travel makes one modest. You see what a tiny place you occupy in the world.", author: "Gustave Flaubert" },
            { text: "The world is a book, and those who do not travel read only one page.", author: "Saint Augustine" },
            { text: "Not all those who wander are lost.", author: "J.R.R. Tolkien" },
            { text: "To travel is to discover that everyone is wrong about other countries.", author: "Aldous Huxley" },
            { text: "Once the travel bug bites, there is no known antidote.", author: "Michael Palin" },
            { text: "We travel, initially, to lose ourselves; and we travel, next, to find ourselves.", author: "Pico Iyer" },
            { text: "Travel far enough, you meet yourself.", author: "David Mitchell" }
        ]
    },
    {
        title: "compass Bundle 2: Solo Travel & Independence",
        quotes: [
            { text: "The best journeys answer questions that in the beginning you didn’t even think to ask.", author: "Jeff Johnson" },
            { text: "You never really travel alone. The world is full of friends waiting to get to know you.", author: "Unknown" },
            { text: "Solo travel teaches you how strong you actually are.", author: "Unknown" },
            { text: "Traveling alone was the scariest thing I ever did — and the most empowering.", author: "Unknown" },
            { text: "Being alone on the road doesn’t mean being lonely.", author: "Unknown" },
            { text: "When you travel solo, you become your own anchor.", author: "Unknown" }
        ]
    },
    {
        title: "🔥 Bundle 3: Courage & Fear",
        quotes: [
            { text: "Fear is only temporary. Regret lasts forever.", author: "Unknown" },
            { text: "Life begins at the end of your comfort zone.", author: "Neale Donald Walsch" },
            { text: "Do one thing every day that scares you.", author: "Eleanor Roosevelt" },
            { text: "The cave you fear to enter holds the treasure you seek.", author: "Joseph Campbell" },
            { text: "If you wait until you’re ready, you’ll be waiting the rest of your life.", author: "Unknown" },
            { text: "Bravery isn’t loud. Sometimes it’s a quiet decision to keep going.", author: "Unknown" }
        ]
    },
    {
        title: "🌱 Bundle 4: Growth & Change",
        quotes: [
            { text: "Travel is never a matter of money but of courage.", author: "Paulo Coelho" },
            { text: "Wherever you go becomes a part of you somehow.", author: "Anita Desai" },
            { text: "Travel doesn’t just change where you are — it changes who you are.", author: "Unknown" },
            { text: "You leave different than you arrived.", author: "Unknown" },
            { text: "Every journey reshapes you, whether you notice or not.", author: "Unknown" }
        ]
    },
    {
        title: "🌅 Bundle 5: Loneliness, Solitude & Reflection",
        quotes: [
            { text: "Solitude is where I place my chaos to rest.", author: "Nikki Giovanni" },
            { text: "Loneliness is not lack of company, loneliness is lack of purpose.", author: "Unknown" },
            { text: "Sometimes being alone is the most honest place to be.", author: "Unknown" },
            { text: "You don’t always need answers. Sometimes you just need silence.", author: "Unknown" },
            { text: "The road teaches you how to sit with yourself.", author: "Unknown" }
        ]
    },
    {
        title: "🧳 Bundle 6: The Road Itself",
        quotes: [
            { text: "A journey is best measured in friends rather than miles.", author: "Tim Cahill" },
            { text: "Roads were made for journeys, not destinations.", author: "Confucius" },
            { text: "The road will challenge you, then reward you.", author: "Unknown" },
            { text: "Some roads test you before they reveal you.", author: "Unknown" }
        ]
    },
    {
        title: "🌄 Bundle 7: Hope & Perspective",
        quotes: [
            { text: "Wherever you are, be all there.", author: "Jim Elliot" },
            { text: "If happiness is the goal — and it should be — then adventures should be a top priority.", author: "Richard Branson" },
            { text: "The road has a way of reminding you that things pass.", author: "Unknown" },
            { text: "This moment will become a memory sooner than you think.", author: "Unknown" }
        ]
    },
    {
        title: "✨ Bundle 8: Quiet Power Quotes",
        quotes: [
            { text: "You are allowed to move slowly.", author: "Unknown" },
            { text: "You are not behind.", author: "Unknown" },
            { text: "Rest is not quitting.", author: "Unknown" },
            { text: "You are doing better than you think.", author: "Unknown" },
            { text: "Small steps still move you forward.", author: "Unknown" }
        ]
    },
    {
        title: "🌍 Bundle 9: Home, Distance & Return",
        quotes: [
            { text: "You can never go home again, but the truth is you can never leave home.", author: "Maya Angelou" },
            { text: "Travel teaches you what you miss — and what you don’t.", author: "Unknown" },
            { text: "Sometimes you leave to understand where you belong.", author: "Unknown" }
        ]
    },
     {
        title: "🧠 Bundle 10: Words for the Hard Days",
        quotes: [
            { text: "Bad days on the road still teach you something.", author: "Unknown" },
            { text: "You don’t need to love every moment to love the journey.", author: "Unknown" },
            { text: "Even the wrong turns are part of the story.", author: "Unknown" },
            { text: "Pause. Breathe. Continue.", author: "Unknown" }
        ]
    }
];

export default function TravellerMotivation() {
    const navigate = useNavigate();
    const [quoteOfDay, setQuoteOfDay] = useState<Quote | null>(null);
    const [expandedBundle, setExpandedBundle] = useState<number | null>(null);

    useEffect(() => {
        // Simple random quote of the day logic based on date to be consistent for the day
        const today = new Date();
        const seed = today.getFullYear() * 1000 + today.getMonth() * 100 + today.getDate();
        
        // Flatten all quotes
        const allQuotes = bundles.flatMap(b => b.quotes);
        const index = seed % allQuotes.length;
        setQuoteOfDay(allQuotes[index]);
    }, []);

    return (
        <div className="min-h-screen bg-[#F2EFE9] text-[#2C2C2C] pb-20 duration-500 animate-in fade-in">
             <div className="fixed top-[-100px] left-[-100px] w-[500px] h-[500px] bg-[#E6E2D6] rounded-full blur-[100px] -z-10 opacity-60"></div>
             <div className="fixed bottom-0 right-0 w-[600px] h-[600px] bg-[#D4C5B0] rounded-full blur-[120px] -z-10 opacity-40"></div>

             {/* Navigation */}
            <div className="p-6 md:p-12 flex justify-between items-center bg-white/50 backdrop-blur-md sticky top-0 z-50 border-b border-[#D4C5B0]/20">
                <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-[#555] hover:text-[#2C2C2C] transition-colors">
                    ← Back to Dashboard
                </button>
                <div className="text-sm tracking-widest uppercase font-medium">Traveller Motivation</div>
            </div>

            <div className="max-w-4xl mx-auto p-6 md:px-12 md:py-8">
                 {/* Hero: Quote of the Day */}
                 <div className="bg-[#2C2C2C] text-[#F2EFE9] rounded-[2.5rem] p-8 md:p-16 mb-16 shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-[#444] rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 opacity-50 group-hover:scale-110 transition-transform duration-1000"></div>
                    
                    <div className="relative z-10 text-center">
                        <div className="text-[#D4C5B0] text-sm tracking-[0.3em] uppercase mb-6">Quote of the Day</div>
                        {quoteOfDay && (
                            <div className="animate-in slide-in-from-bottom-4 duration-700">
                                <h1 className="text-3xl md:text-5xl font-light leading-tight mb-8 font-serif italic">
                                    "{quoteOfDay.text}"
                                </h1>
                                <p className="text-[#888] text-lg font-medium">— {quoteOfDay.author}</p>
                            </div>
                        )}
                    </div>
                 </div>

                 <div className="text-center mb-12">
                     <h2 className="text-2xl font-light mb-2">Moments of Clarity</h2>
                     <p className="text-[#666]">Words for when the road feels long.</p>
                 </div>

                 {/* Bundles Grid */}
                 <div className="grid gap-6">
                    {bundles.map((bundle, index) => (
                        <div 
                            key={index} 
                            className={`bg-white rounded-3xl overflow-hidden transition-all duration-500 shadow-sm hover:shadow-md border border-white ${expandedBundle === index ? 'ring-2 ring-[#D4C5B0]' : ''}`}
                        >
                            <button 
                                onClick={() => setExpandedBundle(expandedBundle === index ? null : index)}
                                className="w-full text-left p-6 md:p-8 flex justify-between items-center"
                            >
                                <h3 className="text-xl font-medium text-[#2C2C2C]">{bundle.title}</h3>
                                <span className={`text-2xl transition-transform duration-300 text-[#D4C5B0] ${expandedBundle === index ? 'rotate-180' : ''}`}>
                                    ↓
                                </span>
                            </button>
                            
                            <div className={`overflow-hidden transition-all duration-500 ease-in-out ${expandedBundle === index ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}`}>
                                <div className="p-6 md:p-8 pt-0 grid gap-6">
                                    {bundle.quotes.map((quote, qIndex) => (
                                        <div key={qIndex} className="bg-[#F9F8F6] p-6 rounded-2xl relative">
                                            <div className="text-4xl text-[#D4C5B0]/30 absolute top-2 left-4 font-serif">“</div>
                                            <p className="text-lg text-[#2C2C2C] mb-3 relative z-10">{quote.text}</p>
                                            <p className="text-sm text-[#888] font-medium text-right">— {quote.author}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                 </div>

                 <div className="text-center mt-20 opacity-60">
                     <p className="text-sm">You chose the road because something inside you wanted more than routine.</p>
                     <p className="text-sm mt-2">Keep going.</p>
                 </div>
            </div>
        </div>
    )
}
