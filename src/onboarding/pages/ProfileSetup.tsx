import { useState } from "react";
import { supabase } from "../../shared/utils/supabase";
import { useNavigate } from "react-router-dom";

const PERSONALITY_TAGS = [
    "Singer", "Enthusiastic", "Adventurous", "Foodie", "Photographer", 
    "History Buff", "Nature Lover", "Night Owl", "Early Bird", "Chill"
];

export default function ProfileSetup() {
    const navigate = useNavigate();
    const [fullName, setFullName] = useState("");
    const [bio, setBio] = useState("");
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const toggleTag = (tag: string) => {
        if (selectedTags.includes(tag)) {
            setSelectedTags(selectedTags.filter(t => t !== tag));
        } else {
            if (selectedTags.length < 5) {
                setSelectedTags([...selectedTags, tag]);
            }
        }
    };

    const handleSubmit = async () => {
        setLoading(true);
        setError(null);
        try {
            let { data: { user } } = await supabase.auth.getUser();
            
            if (!user) {
                // Try to refresh session
                const { data: { session } } = await supabase.auth.getSession();
                if (session?.user) {
                    user = session.user;
                } else {
                    throw new Error("You are not signed in. Please verify your email if you just signed up.");
                }
            }

            if (!fullName.trim()) throw new Error("Please enter your name.");

            const { error: updateError } = await supabase
                .from('profiles')
                .update({
                    full_name: fullName,
                    bio,
                    personality_tags: selectedTags,
                })
                .eq('id', user.id);

            if (updateError) throw updateError;
            
            navigate("/dashboard");
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen p-4">
             {/* Organic Background Shape Blur */}
             <div className="fixed top-[-100px] left-[-100px] w-[500px] h-[500px] bg-[#E6E2D6] rounded-full blur-[100px] -z-10 opacity-60"></div>
             <div className="fixed bottom-[-100px] right-[-100px] w-[400px] h-[400px] bg-[#D4C5B0] rounded-full blur-[80px] -z-10 opacity-60"></div>

            <div className="w-full max-w-lg bg-white/70 backdrop-blur-xl border border-white/50 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] rounded-[2.5rem] p-8 md:p-12">
                <h1 className="text-3xl font-light text-[#2C2C2C] mb-2 tracking-tight">Tell us about you</h1>
                <p className="text-[#888] mb-8 text-sm font-light">Build your profile to find the perfect travel buddies.</p>

                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-[#555] mb-2 ml-1">Full Name</label>
                        <input 
                            type="text"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            placeholder="John Doe"
                            className="w-full bg-[#F9F8F6] border-none text-[#2C2C2C] placeholder:text-[#AAA] text-base px-6 py-4 rounded-2xl focus:ring-2 focus:ring-[#D4C5B0] focus:bg-white transition-all outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-[#555] mb-2 ml-1">About Me</label>
                        <textarea 
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                            placeholder="I love hiking and exploring hidden gems..."
                            className="w-full bg-[#F9F8F6] border-none text-[#2C2C2C] placeholder:text-[#AAA] text-base px-6 py-4 rounded-2xl focus:ring-2 focus:ring-[#D4C5B0] focus:bg-white transition-all outline-none resize-none h-32"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-[#555] mb-3 ml-1">Personality (Pick up to 5)</label>
                        <div className="flex flex-wrap gap-2">
                            {PERSONALITY_TAGS.map(tag => (
                                <button
                                    key={tag}
                                    onClick={() => toggleTag(tag)}
                                    className={`px-4 py-2 rounded-full text-sm transition-all duration-200 border ${
                                        selectedTags.includes(tag) 
                                        ? "bg-[#2C2C2C] text-[#F2EFE9] border-[#2C2C2C]" 
                                        : "bg-white text-[#555] border-transparent hover:border-[#D4C5B0]"
                                    }`}
                                >
                                    {tag}
                                </button>
                            ))}
                        </div>
                    </div>

                    {error && (
                        <div className="p-3 bg-red-50 text-red-500 text-sm rounded-xl text-center">
                            {error}
                        </div>
                    )}

                    <button 
                        onClick={handleSubmit} 
                        disabled={loading}
                        className="w-full bg-[#1a1a1a] text-[#F2EFE9] text-base font-medium py-4 rounded-full mt-4 hover:scale-[1.02] active:scale-[0.98] transition-transform duration-200 disabled:opacity-70 disabled:cursor-not-allowed shadow-lg"
                    >
                        {loading ? "Saving..." : "Complete Profile"}
                    </button>
                </div>
            </div>
        </div>
    );
}
