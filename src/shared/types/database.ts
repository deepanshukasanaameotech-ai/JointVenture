export type VehicleType = 'Bus' | 'Car' | 'Bike' | 'Train' | 'Aeroplane';
export type FlexibilityType = 'Strict' | 'Flexible';
export type TravelStyleType = 'Budget' | 'Luxury' | 'Backpacking';
export type PurposeType = 'Explore' | 'Work' | 'Adventure';
export type VisibilityType = 'Public' | 'Limited';
export type ParticipantStatus = 'Pending' | 'Approved' | 'Rejected';

export interface Profile {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
    bio: string | null;
    personality_tags: string[] | null;
    created_at: string;
}

export interface Trip {
    id: string;
    creator_id: string;
    start_location: string;
    end_location: string;
    start_time: string;
    end_time: string;
    vehicle: VehicleType;
    flexibility: FlexibilityType;
    travel_style: TravelStyleType;
    purpose: PurposeType;
    visibility: VisibilityType;
    max_people: number;
    safety_rules: string | null;
    created_at: string;
}

export interface TripStop {
    id: string;
    trip_id: string;
    stop_name: string;
    stop_order: number;
    created_at: string;
}

export interface TripParticipant {
    trip_id: string;
    user_id: string;
    status: ParticipantStatus;
    created_at: string;
}
