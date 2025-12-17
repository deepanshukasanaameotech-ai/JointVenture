import { useEffect, useState } from "react";
import { supabase } from "../../shared/utils/supabase";
import { useNavigate } from "react-router-dom";
import type { Profile as ProfileType } from "../../shared/types/database";

const PERSONALITY_TAGS = [
    "Singer", "Enthusiastic", "Adventurous", "Foodie", "Photographer", 
    "History Buff", "Nature Lover", "Night Owl", "Early Bird", "Chill"
];

export default function Profile() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [profile, setProfile] = useState<ProfileType | null>(null);
    const [isEditing, setIsEditing] = useState(false);

    // Edit State
    const [bio, setBio] = useState("");
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [fullName, setFullName] = useState("");

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                navigate('/login');
                return;
            }

            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();

            if (error) throw error;
            
            setProfile(data);
            setBio(data.bio || "");
            setSelectedTags(data.personality_tags || []);
            setFullName(data.full_name || "");
        } catch (error) {
            console.error("Error loading profile:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!profile) return;
        setSaving(true);
        try {
            const { error } = await supabase
                .from('profiles')
                .update({
                    bio,
                    personality_tags: selectedTags,
                    full_name: fullName,
                })
                .eq('id', profile.id);

            if (error) throw error;

            setProfile({ ...profile, bio, personality_tags: selectedTags, full_name: fullName });
            setIsEditing(false);
        } catch (error) {
            console.error("Error updating profile:", error);
            alert("Failed to save profile");
        } finally {
            setSaving(false);
        }
    };

    const toggleTag = (tag: string) => {
        if (selectedTags.includes(tag)) {
            setSelectedTags(selectedTags.filter(t => t !== tag));
        } else {
            if (selectedTags.length < 5) {
                setSelectedTags([...selectedTags, tag]);
            }
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center text-[#888]">Loading profile...</div>;

    return (
        <div className="min-h-screen p-6 md:p-12 pb-32">
             <div className="fixed top-[-100px] left-[-100px] w-[500px] h-[500px] bg-[#E6E2D6] rounded-full blur-[100px] -z-10 opacity-60"></div>

            <div className="max-w-2xl mx-auto">
                <button onClick={() => navigate('/dashboard')} className="text-sm text-[#888] mb-8 hover:text-[#2C2C2C]">← Back to Dashboard</button>

                <div className="bg-white/60 backdrop-blur-md border border-white/50 rounded-[2.5rem] p-8 md:p-12 shadow-sm">
                    <div className="flex justify-between items-center mb-8">
                        <h1 className="text-3xl font-light text-[#2C2C2C]">My Profile</h1>
                        <button 
                            onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                            disabled={saving}
                            className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${
                                isEditing 
                                ? "bg-[#2C2C2C] text-[#F2EFE9] hover:bg-black" 
                                : "bg-[#E6E2D6] text-[#555] hover:bg-[#D4C5B0]"
                            }`}
                        >
                            {saving ? "Saving..." : isEditing ? "Save Changes" : "Edit Profile"}
                        </button>
                    </div>

                    <div className="flex flex-col items-center mb-10">
                         <div className="w-24 h-24 rounded-full bg-[#E6E2D6] mb-4 overflow-hidden flex items-center justify-center text-2xl text-[#555]">
                             {profile?.avatar_url ? (
                                <img src={profile.avatar_url} alt="avatar" className="w-full h-full object-cover" />
                             ) : (
                                 profile?.full_name?.[0] || '?'
                             )}
                         </div>
                         {isEditing ? (
                             <input 
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                placeholder="Your Name"
                                className="text-center text-xl bg-transparent border-b border-[#ccc] focus:border-[#2C2C2C] outline-none pb-1"
                             />
                         ) : (
                             <h2 className="text-2xl text-[#2C2C2C] font-medium">{profile?.full_name || "Anonymous User"}</h2>
                         )}
                         <p className="text-sm text-[#888] mt-1">{profile?.created_at ? `Joined ${new Date(profile.created_at).toLocaleDateString()}` : ""}</p>
                    </div>

                    <div className="space-y-8">
                        <div>
                            <label className="block text-sm font-medium text-[#555] mb-3 ml-1">About Me</label>
                            {isEditing ? (
                                <textarea 
                                    value={bio}
                                    onChange={(e) => setBio(e.target.value)}
                                    className="w-full bg-[#F9F8F6] border-none text-[#2C2C2C] text-base px-6 py-4 rounded-2xl focus:ring-2 focus:ring-[#D4C5B0] outline-none h-32 resize-none"
                                    placeholder="Tell others about yourself..."
                                />
                            ) : (
                                <p className="text-[#2C2C2C] leading-relaxed bg-[#F9F8F6]/50 p-6 rounded-2xl border border-white/60">
                                    {profile?.bio || "No bio added yet."}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-[#555] mb-3 ml-1">My Vibe (Personality)</label>
                            <div className="flex flex-wrap gap-2">
                                {isEditing ? (
                                    PERSONALITY_TAGS.map(tag => (
                                        <button
                                            key={tag}
                                            onClick={() => toggleTag(tag)}
                                            className={`px-4 py-2 rounded-full text-sm transition-all border ${
                                                selectedTags.includes(tag) 
                                                ? "bg-[#2C2C2C] text-[#F2EFE9] border-[#2C2C2C]" 
                                                : "bg-white text-[#555] border-transparent hover:border-[#D4C5B0]"
                                            }`}
                                        >
                                            {tag}
                                        </button>
                                    ))
                                ) : (
                                    profile?.personality_tags?.length ? (
                                        profile.personality_tags.map(tag => (
                                            <span key={tag} className="px-4 py-2 bg-[#E6E2D6] text-[#555] rounded-full text-sm">
                                                {tag}
                                            </span>
                                        ))
                                    ) : (
                                        <span className="text-[#888] italic text-sm">No tags selected.</span>
                                    )
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
