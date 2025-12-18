import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";

export default function SoloTravelGuide() {
    const navigate = useNavigate();
    const [activeSection, setActiveSection] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);

    const sections = [
        {
            title: "General Solo Travel Guide",
            subtitle: "A complete, calm, and practical guide designed to be read end-to-end.",
            content: "Solo travel is not about isolation — it is about freedom, awareness, and self-trust. Millions of people travel alone every day, safely and confidently.",
            bg: "bg-[#2C2C2C]",
            text: "text-[#F2EFE9]",
            accent: "text-[#D4C5B0]"
        },
        {
            title: "1. The Core Mindset",
            subtitle: "Safety begins with mindset, not tools.",
            points: [
                "Awareness over anxiety — notice your surroundings",
                "Confidence discourages problems — walk with purpose",
                "Prepared, not rigid — plan enough, adapt easily",
                "Trust patterns, not excuses",
                "You owe no one explanations"
            ],
            bg: "bg-[#D4C5B0]",
            text: "text-[#2C2C2C]",
            accent: "text-white"
        },
        {
            title: "2. Smart Preparation",
            subtitle: "Preparation reduces 80% of avoidable issues.",
            cards: [
                { head: "Documents", body: "Keep digital & physical copies. Store separately." },
                { head: "Planning", body: "Share itinerary. Save numbers offline." },
                { head: "Packing", body: "Pack light. Avoid flashy items. Use anti-theft bags." }
            ],
            bg: "bg-[#E6E2D6]",
            text: "text-[#2C2C2C]",
            accent: "text-[#888]"
        },
        {
            title: "3. Arrival & First Day",
            subtitle: "Your first 24 hours matter most.",
            points: [
                "Arrive during daylight",
                "Pre-decide transport",
                "Observe how locals behave",
                "Get familiar with your neighborhood"
            ],
            bg: "bg-[#2C2C2C]",
            text: "text-[#F2EFE9]",
            accent: "text-[#D4C5B0]"
        },
        {
            title: "4. Moving Around",
            subtitle: "Navigate with confidence.",
            cards: [
                { head: "Public Transport", body: "Keep bags in front. Sit near families." },
                { head: "Ride Apps", body: "Use registered services. Check plates." },
                { head: "Walking", body: "Walk with purpose. Avoid shortcuts." }
            ],
            bg: "bg-[#F2EFE9]",
            text: "text-[#2C2C2C]",
            accent: "text-[#D4C5B0]"
        },
        {
            title: "5. Accommodation Safety",
            subtitle: "Where you stay affects how you feel.",
            points: [
                "Choose well-reviewed, central areas",
                "Avoid revealing room numbers",
                "Lock doors and windows",
                "Trust your instinct — relocate if needed"
            ],
            bg: "bg-[#D4C5B0]",
            text: "text-[#2C2C2C]",
            accent: "text-white"
        },
        {
            title: "6. Daily Routine",
            subtitle: "Small habits make a big difference.",
            points: [
                "Dress to blend in",
                "Carry minimal valuables",
                "Split cash into multiple locations",
                "Avoid oversharing plans publicly"
            ],
            bg: "bg-[#E6E2D6]",
            text: "text-[#2C2C2C]",
            accent: "text-[#888]"
        },
        {
            title: "7. Meeting New People",
            subtitle: "Social connection is part of travel — do it wisely.",
            points: [
                "Meet in public places first",
                "Share limited personal details",
                "Avoid pressure or rushed plans",
                "Always have an exit strategy"
            ],
            bg: "bg-[#2C2C2C]",
            text: "text-[#F2EFE9]",
            accent: "text-[#D4C5B0]"
        },
        {
            title: "8. Night Travel",
            subtitle: "Night requires extra awareness, not fear.",
            points: [
                "Know your return route beforehand",
                "Limit intoxication",
                "Watch drinks being made",
                "Leave early if energy shifts"
            ],
            bg: "bg-[#1a1a1a]",
            text: "text-white",
            accent: "text-[#D4C5B0]"
        },
        {
            title: "9. Cultural Respect",
            subtitle: "Respect increases safety.",
            points: [
                "Learn basic cultural norms",
                "Dress appropriately",
                "Respect religious spaces",
                "Observe locals before acting"
            ],
            bg: "bg-[#D4C5B0]",
            text: "text-[#2C2C2C]",
            accent: "text-white"
        },
        {
            title: "10. Digital Safety",
            subtitle: "Your digital presence matters.",
            points: [
                "Avoid public Wi-Fi for banking",
                "Use VPN where needed",
                "Lock devices",
                "Be mindful of location sharing"
            ],
            bg: "bg-[#E6E2D6]",
            text: "text-[#2C2C2C]",
            accent: "text-[#888]"
        },
         {
            title: "11. Health & Well-Being",
            subtitle: "Your body is your primary asset.",
            points: [
                "Stay hydrated",
                "Rest when needed",
                "Listen to fatigue",
                "Carry essential medications"
            ],
            bg: "bg-[#F2EFE9]",
            text: "text-[#2C2C2C]",
            accent: "text-[#D4C5B0]"
        },
        {
            title: "12. Handling Issues",
            subtitle: "If something feels wrong...",
            points: [
                "Stay calm",
                "Move to public spaces",
                "Seek help confidently",
                "Trust your judgement"
            ],
            bg: "bg-[#2C2C2C]",
            text: "text-[#F2EFE9]",
            accent: "text-[#D4C5B0]"
        },
        {
            title: "13. Closing",
            subtitle: "Travel With Confidence",
            content: "Solo travel builds resilience. You are more capable than you think. Travel smart. Stay curious. Trust yourself.",
            buttonText: "Start Your Journey",
            action: () => navigate('/dashboard'),
            bg: "bg-[#D4C5B0]",
            text: "text-[#2C2C2C]",
            accent: "text-white"
        }
    ];

    const handleScroll = () => {
        if (containerRef.current) {
            const scrollValues = containerRef.current.scrollTop;
            const height = containerRef.current.clientHeight;
            const index = Math.round(scrollValues / height);
            setActiveSection(index);
        }
    };

    return (
        <div 
            ref={containerRef}
            onScroll={handleScroll}
            className="h-screen w-full overflow-y-scroll snap-y snap-mandatory scroll-smooth"
            style={{scrollbarWidth: 'none', msOverflowStyle: 'none'}}
        >
            <div className="fixed top-6 right-6 z-50 mix-blend-difference">
                <button onClick={() => navigate('/dashboard')} className="text-white font-medium hover:opacity-70 transition-opacity">✕ Close</button>
            </div>

            {/* Progress Bar */}
            <div className="fixed top-0 left-0 w-full h-1 z-50 flex gap-0.5 px-1 py-1">
                {sections.map((_, i) => (
                    <div 
                        key={i} 
                        className={`h-full flex-1 rounded-full transition-all duration-300 ${i <= activeSection ? 'bg-white/80' : 'bg-white/20'}`}
                    />
                ))}
            </div>

            {sections.map((section, index) => (
                <div 
                    key={index} 
                    className={`h-screen w-full snap-start flex flex-col justify-center items-center p-8 md:p-12 relative overflow-hidden ${section.bg} ${section.text}`}
                >
                    {/* Background Elements */}
                    <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
                    <div className="absolute bottom-0 left-0 w-96 h-96 bg-black/5 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>

                    <div className="max-w-2xl w-full z-10 animate-in fade-in slide-in-from-bottom-8 duration-700 fill-mode-both" style={{animationDelay: '100ms'}}>
                        <h1 className="text-4xl md:text-6xl font-bold mb-4 tracking-tight leading-tight">
                            {section.title}
                        </h1>
                        <p className={`text-xl md:text-2xl font-light mb-12 opacity-90 ${section.accent}`}>
                            {section.subtitle}
                        </p>

                        {section.content && (
                            <p className="text-lg md:text-xl leading-relaxed opacity-80 mb-8">
                                {section.content}
                            </p>
                        )}

                        {section.points && (
                            <ul className="space-y-4">
                                {section.points.map((point, i) => (
                                    <li key={i} className="flex items-start gap-4 text-lg md:text-xl opacity-80">
                                        <span className="mt-1.5 w-2 h-2 rounded-full bg-current shrink-0"></span>
                                        {point}
                                    </li>
                                ))}
                            </ul>
                        )}

                        {section.cards && (
                            <div className="grid gap-4">
                                {section.cards.map((card, i) => (
                                    <div key={i} className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/10">
                                        <h3 className="font-bold text-lg mb-1">{card.head}</h3>
                                        <p className="opacity-80 text-sm">{card.body}</p>
                                    </div>
                                ))}
                            </div>
                        )}

                        {section.buttonText && (
                            <button 
                                onClick={section.action}
                                className="mt-8 px-8 py-4 bg-[#2C2C2C] text-[#F2EFE9] rounded-full font-bold text-lg hover:scale-105 transition-transform shadow-xl"
                            >
                                {section.buttonText}
                            </button>
                        )}
                    </div>
                </div>
            ))}
        </div>
    )
}
