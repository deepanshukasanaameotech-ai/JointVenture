export type Season = 'Spring' | 'Summer' | 'Autumn' | 'Winter';

export interface TrendingLocation {
    id: string;
    name: string;
    country: string;
    description: string;
    whyVisit: string;
    imageUrl: string;
    tags: string[];
    bestMonths: string[];
    priceRange: 'Budget' | 'Moderate' | 'Luxury';
}

export const getCurrentSeason = (): Season => {
    const month = new Date().getMonth(); 
    if (month >= 2 && month <= 4) return 'Spring'; 
    if (month >= 5 && month <= 7) return 'Summer'; 
    if (month >= 8 && month <= 10) return 'Autumn'; 
    return 'Winter'; 
};

// Validated Image URLs
const LOCATIONS_DB: Record<Season, TrendingLocation[]> = {
    Winter: [
        {
            id: 'w1',
            name: 'Gulmarg',
            country: 'Kashmir, India',
            description: 'A winter wonderland with snow-covered pine forests and some of the highest ski slopes in the world.',
            whyVisit: 'Experience the "Switzerland of India" without the visa. Ride the world\'s second-highest gondola and ski through pristine powder.',
            imageUrl: 'https://images.unsplash.com/photo-1548232979-6c557ee14752?auto=format&fit=crop&w=800&q=80', // Gulmarg/Snowish
            tags: ['Snow', 'Skiing', 'Honeymoon'],
            bestMonths: ['Dec', 'Jan', 'Feb'],
            priceRange: 'Luxury'
        },
        {
            id: 'w2',
            name: 'Rann of Kutch',
            country: 'Gujarat, India',
            description: 'A surreal vast expanse of white salt desert that comes alive during the Rann Utsav festival.',
            whyVisit: 'Witness the magical full moon reflecting on the endless white desert while staying in luxurious tents.',
            imageUrl: 'https://images.unsplash.com/photo-1599424888191-dcb2b6d19488?auto=format&fit=crop&w=800&q=80', // Desert/White
            tags: ['Desert', 'Culture', 'Festival'],
            bestMonths: ['Dec', 'Jan', 'Feb'],
            priceRange: 'Luxury'
        },
        {
            id: 'w3',
            name: 'Kerala',
            country: 'Kerala, India',
            description: 'The "God\'s Own Country" offers tranquil backwaters, beaches, and tea gardens.',
            whyVisit: 'Float through serene palm-fringed backwaters on a houseboat and rejuvenate with authentic Ayurveda.',
            imageUrl: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=800&q=80', // Kerala Boat
            tags: ['Nature', 'Relax', 'Houseboat'],
            bestMonths: ['Dec', 'Jan'],
            priceRange: 'Moderate'
        },
        {
            id: 'w4',
            name: 'Jaisalmer',
            country: 'Rajasthan, India',
            description: 'The Golden City, known for its yellow sandstone architecture and the massive Jaisalmer Fort.',
            whyVisit: 'Camp under the stars in the Thar Desert and explore the living fort that glows like gold at sunset.',
            imageUrl: 'https://images.unsplash.com/photo-1594998777121-6b2cb9622d10?auto=format&fit=crop&w=800&q=80', // Jaisalmer
            tags: ['Desert', 'History', 'Forts'],
            bestMonths: ['Nov', 'Dec', 'Jan'],
            priceRange: 'Moderate'
        }
    ],
    Spring: [
        {
            id: 'sp1',
            name: 'Rishikesh',
            country: 'Uttarakhand, India',
            description: 'The Yoga Capital of the World, situated beside the holy Ganges river.',
            whyVisit: 'Combine spirituality with adrenaline by white-water rafting on the Ganges and attending the mesmerizing evening Aarti.',
            imageUrl: 'https://images.unsplash.com/photo-1590439401490-5dd41eb93998?auto=format&fit=crop&w=800&q=80', // Rishikesh/Ganga
            tags: ['Yoga', 'Adventure', 'Spiritual'],
            bestMonths: ['Mar', 'Apr'],
            priceRange: 'Budget'
        },
        {
            id: 'sp2',
            name: 'Darjeeling',
            country: 'West Bengal, India',
            description: 'Queen of the Hills, famous for its lush tea gardens and breathtaking views.',
            whyVisit: 'Sip one of the world\'s best teas right where it grows and take a ride on the UNESCO heritage Toy Train.',
            imageUrl: 'https://images.unsplash.com/photo-1544634255-a6bfcd644265?auto=format&fit=crop&w=800&q=80', // Tea Garden
            tags: ['Mountains', 'Tea', 'Views'],
            bestMonths: ['Mar', 'Apr', 'May'],
            priceRange: 'Moderate'
        },
        {
            id: 'sp3',
            name: 'Coorg',
            country: 'Karnataka, India',
            description: 'The Scotland of India, misty landscapes filled with coffee plantations.',
            whyVisit: 'Wake up to the aroma of fresh coffee and trek through mist-covered hills in this lush paradise.',
            imageUrl: 'https://images.unsplash.com/photo-1596324838386-3532f1f53444?auto=format&fit=crop&w=800&q=80', // Green Hills
            tags: ['Nature', 'Coffee', 'Trekking'],
            bestMonths: ['Mar', 'Apr'],
            priceRange: 'Moderate'
        }
    ],
    Summer: [
        {
            id: 'su1',
            name: 'Ladakh',
            country: 'Ladakh, India',
            description: 'A land of high passes, stark mountains, and crystal clear lakes.',
            whyVisit: 'Embark on the ultimate road trip adventure across the world\'s highest motorable passes.',
            imageUrl: 'https://images.unsplash.com/photo-1581793745862-99fde7fa73d2?auto=format&fit=crop&w=800&q=80', // Ladakh
            tags: ['Adventure', 'Road Trip', 'Mountains'],
            bestMonths: ['Jun', 'Jul', 'Aug'],
            priceRange: 'Moderate'
        },
        {
            id: 'su2',
            name: 'Spiti Valley',
            country: 'Himachal, India',
            description: 'A cold desert mountain valley located high in the Himalayas.',
            whyVisit: 'Witness raw, untouched nature and ancient monasteries in one of the most secluded places on Earth.',
            imageUrl: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=800&q=80', // Mountains
            tags: ['Adventure', 'Offbeat', 'Monasteries'],
            bestMonths: ['Jun', 'Jul', 'Sep'],
            priceRange: 'Budget'
        },
        {
            id: 'su3',
            name: 'Tirthan Valley',
            country: 'Himachal, India',
            description: 'An offbeat riverside destination known for trout fishing.',
            whyVisit: 'Escape the tourist crowds and relax by the pristine Tirthan river in a hidden Himalayan gem.',
            imageUrl: 'https://images.unsplash.com/photo-1605649486186-4c317d743a51?auto=format&fit=crop&w=800&q=80', // River/Valley
            tags: ['Nature', 'Peace', 'Fishing'],
            bestMonths: ['May', 'Jun'],
            priceRange: 'Budget'
        }
    ],
    Autumn: [
        {
            id: 'au1',
            name: 'Varanasi',
            country: 'Uttar Pradesh, India',
            description: 'One of the world\'s oldest living cities, spiritual and intense.',
            whyVisit: 'Experience the mystical Dev Deepawali where the ghats are lit with a million oil lamps.',
            imageUrl: 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=800&q=80', // Varanasi
            tags: ['Spiritual', 'Culture', 'History'],
            bestMonths: ['Oct', 'Nov'],
            priceRange: 'Budget'
        },
        {
            id: 'au2',
            name: 'Meghalaya',
            country: 'Meghalaya, India',
            description: 'The Abode of Clouds, famous for living root bridges.',
            whyVisit: 'Walk on bio-engineered living root bridges and swim in the crystal clear waters of Dawki.',
            imageUrl: 'https://images.unsplash.com/photo-1634152962476-4b8a00e1915c?auto=format&fit=crop&w=800&q=80', // Waterfall/Green
            tags: ['Nature', 'Waterfalls', 'Adventure'],
            bestMonths: ['Sep', 'Oct'],
            priceRange: 'Moderate'
        },
        {
            id: 'au3',
            name: 'Udaipur',
            country: 'Rajasthan, India',
            description: 'The City of Lakes, filled with lavish palaces.',
            whyVisit: 'Live like royalty in lake-view palaces and watch the sunset turn the City Palace golden.',
            imageUrl: 'https://images.unsplash.com/photo-1590766940555-d36c28fb426f?auto=format&fit=crop&w=800&q=80', // Palace
            tags: ['Luxury', 'Romance', 'History'],
            bestMonths: ['Oct', 'Nov'],
            priceRange: 'Luxury'
        }
    ]
};

export const getTrendingLocations = (season: Season): TrendingLocation[] => {
    return LOCATIONS_DB[season] || [];
};
