import { useEffect, useState } from "react";
import { supabase } from "../../shared/utils/supabase";
import { useNavigate, useParams } from "react-router-dom";
import type { Profile as ProfileType } from "../../shared/types/database";
import { ImageUpload } from "../../shared/components/ImageUpload";

const PERSONALITY_TAGS = [
    "Singer", "Enthusiastic", "Adventurous", "Foodie", "Photographer", 
    "History Buff", "Nature Lover", "Night Owl", "Early Bird", "Chill"
];

export default function Profile() {
    const navigate = useNavigate();
    const { userId } = useParams();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [profile, setProfile] = useState<ProfileType | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [isOwner, setIsOwner] = useState(false);

    // Edit State
    const [bio, setBio] = useState("");
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [fullName, setFullName] = useState("");
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
    const [travelPhotos, setTravelPhotos] = useState<string[]>([]);

    useEffect(() => {
        fetchProfile();
    }, [userId]);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            const { data: { user } } = await supabase.auth.getUser();
            
            let targetUserId = user?.id;
            let owner = true;

            // Precision Routing: If userId param exists, we are viewing someone else (or ourselves)
            if (userId) {
                targetUserId = userId;
                owner = userId === user?.id;
            } else if (!user) {
                // No param and no auth -> login
                navigate('/login');
                return;
            }

            setIsOwner(owner);

            if (!targetUserId) return;

            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', targetUserId)
                .single();

            if (error) throw error;
            
            setProfile(data);
            setBio(data.bio || "");
            setSelectedTags(data.personality_tags || []);
            setFullName(data.full_name || "");
            setAvatarUrl(data.avatar_url);
            setTravelPhotos(data.travel_photos || []);
        } catch (error) {
            console.error("Error loading profile:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!profile || !isOwner) return;
        setSaving(true);
        try {
            const { error } = await supabase
                .from('profiles')
                .update({
                    bio,
                    personality_tags: selectedTags,
                    full_name: fullName,
                    avatar_url: avatarUrl,
                    travel_photos: travelPhotos
                })
                .eq('id', profile.id);

            if (error) throw error;

            setProfile({ 
                ...profile, 
                bio, 
                personality_tags: selectedTags, 
                full_name: fullName,
                avatar_url: avatarUrl,
                travel_photos: travelPhotos
            });
            setIsEditing(false);
        } catch (error) {
            console.error("Error updating profile:", error);
            alert("Failed to save profile");
        } finally {
            setSaving(false);
        }
    };

    const toggleTag = (tag: string) => {
        if (!isEditing) return;
        if (selectedTags.includes(tag)) {
            setSelectedTags(selectedTags.filter(t => t !== tag));
        } else {
            if (selectedTags.length < 5) {
                setSelectedTags([...selectedTags, tag]);
            }
        }
    };

    const handleAddTravelPhoto = (url: string) => {
        if (travelPhotos.length < 4) {
            setTravelPhotos([...travelPhotos, url]);
        }
    };

    const handleRemoveTravelPhoto = (index: number) => {
        setTravelPhotos(travelPhotos.filter((_, i) => i !== index));
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center text-[#888]">Loading profile...</div>;

    return (
        <div className="min-h-screen p-6 md:p-12 pb-32">
             <div className="fixed top-[-100px] left-[-100px] w-[500px] h-[500px] bg-[#E6E2D6] rounded-full blur-[100px] -z-10 opacity-60"></div>

            <div className="max-w-2xl mx-auto">
                <button onClick={() => navigate(-1)} className="text-sm text-[#888] mb-8 hover:text-[#2C2C2C]">← Back</button>

                <div className="bg-white/60 backdrop-blur-md border border-white/50 rounded-[2.5rem] p-8 md:p-12 shadow-sm">
                    <div className="flex justify-between items-center mb-8">
                        <h1 className="text-3xl font-light text-[#2C2C2C]">{isOwner ? "My Profile" : "Traveler Profile"}</h1>
                        {isOwner && (
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
                        )}
                    </div>

                    <div className="flex flex-col items-center mb-10">
                        {isEditing && isOwner ? (
                            <div className="w-32 h-32 mb-4">
                                <ImageUpload 
                                    value={avatarUrl}
                                    onUpload={setAvatarUrl}
                                    className="w-full h-full rounded-full overflow-hidden"
                                    placeholder={<span className="text-sm">Upload</span>}
                                />
                            </div>
                        ) : (
                            <div className="w-24 h-24 rounded-full bg-[#E6E2D6] mb-4 overflow-hidden flex items-center justify-center text-2xl text-[#555]">
                                {profile?.avatar_url ? (
                                    <img src={profile.avatar_url} alt="avatar" className="w-full h-full object-cover" />
                                ) : (
                                    profile?.full_name?.[0] || '?'
                                )}
                            </div>
                        )}
                        
                         {isEditing && isOwner ? (
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
                            {isEditing && isOwner ? (
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

                        {/* Travel Photos Section */}
                        {(travelPhotos.length > 0 || isEditing) && (
                            <div>
                                <label className="block text-sm font-medium text-[#555] mb-3 ml-1">Travel Gallery {isEditing && "(Max 4)"}</label>
                                <div className="grid grid-cols-2 gap-4">
                                    {travelPhotos.map((photo, index) => (
                                        <div key={photo} className="relative aspect-square rounded-xl overflow-hidden group">
                                            <img src={photo} alt={`Travel ${index + 1}`} className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform" />
                                            {isEditing && isOwner && (
                                                <button 
                                                    onClick={() => handleRemoveTravelPhoto(index)}
                                                    className="absolute top-2 right-2 w-8 h-8 bg-black/50 text-white rounded-full flex items-center justify-center hover:bg-red-500 transition-colors"
                                                >
                                                    ✕
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                    
                                    {isEditing && isOwner && travelPhotos.length < 4 && (
                                        <div className="aspect-square">
                                            <ImageUpload 
                                                onUpload={handleAddTravelPhoto}
                                                className="w-full h-full rounded-xl"
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-[#555] mb-3 ml-1">Vibe (Personality)</label>
                            <div className="flex flex-wrap gap-2">
                                {isEditing && isOwner ? (
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
