import { useState } from "react";
import { supabase } from "../utils/supabase";

interface ImageUploadProps {
    value?: string | null;
    onUpload: (url: string) => void;
    bucket?: string;
    onLoading?: (isLoading: boolean) => void;
    className?: string;
    placeholder?: React.ReactNode;
}

export function ImageUpload({ 
    value, 
    onUpload, 
    bucket = "user-content", 
    onLoading,
    className = "",
    placeholder
}: ImageUploadProps) {
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const uploadImage = async (event: React.ChangeEvent<HTMLInputElement>) => {
        try {
            setError(null);
            setUploading(true);
            onLoading?.(true);

            if (!event.target.files || event.target.files.length === 0) {
                throw new Error("You must select an image to upload.");
            }

            const file = event.target.files[0];
            
            // Client-Side Validation
            if (!file.type.startsWith("image/")) {
                throw new Error("Only image files are allowed.");
            }
            if (file.size > 5 * 1024 * 1024) { // 5MB
                throw new Error("File size must be less than 5MB.");
            }

            const fileExt = file.name.split(".").pop();
            const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
            
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("User not authenticated");

            // Path Isolation: {user_id}/{filename}
            const filePath = `${user.id}/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from(bucket)
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            // Get Public URL
            const { data: { publicUrl } } = supabase.storage
                .from(bucket)
                .getPublicUrl(filePath);

            onUpload(publicUrl);
        } catch (error: any) {
            setError(error.message);
            console.error("Upload failed:", error);
        } finally {
            setUploading(false);
            onLoading?.(false);
        }
    };

    return (
        <div className={`relative ${className}`}>
            {value ? (
                <div className="relative group w-full h-full">
                    <img 
                        src={value} 
                        alt="Uploaded" 
                        className="w-full h-full object-cover rounded-xl"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-xl pointer-events-none">
                        <span className="text-white text-xs font-medium">Change</span>
                    </div>
                </div>
            ) : (
                <div className="w-full h-full flex items-center justify-center bg-[#F9F8F6] border-2 border-dashed border-[#DDD] rounded-xl hover:border-[#D4C5B0] transition-colors cursor-pointer text-[#888]">
                    {placeholder || <span className="text-2xl">+</span>}
                </div>
            )}

            <input
                type="file"
                accept="image/*"
                onChange={uploadImage}
                disabled={uploading}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
            />
            
            {uploading && (
                <div className="absolute inset-0 bg-white/50 flex items-center justify-center rounded-xl pointer-events-none">
                    <div className="w-5 h-5 border-2 border-[#2C2C2C] border-t-transparent rounded-full animate-spin"></div>
                </div>
            )}

            {error && (
                <div className="absolute -bottom-8 left-0 text-xs text-red-500 bg-red-50 px-2 py-1 rounded">
                    {error}
                </div>
            )}
        </div>
    );
}
