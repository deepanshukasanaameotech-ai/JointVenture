
// Mock Data (Moved from Page to Service)
export interface NewsItem {
    id: number | string;
    title: string;
    description: string;
    source: { name: string };
    publishedAt: string;
    urlToImage: string;
    url: string;
    category?: string; // For mock data mainly, API doesn't always give category nicely in 'everything' endpoint
}

const MOCK_NEWS: NewsItem[] = [
    {
        id: 1,
        title: "Digital Nomad Visas: The 2024 Guide",
        description: "Japan, South Korea, and Italy have newly launched visas for remote workers. Here's what you need to know about income requirements and application processes.",
        source: { name: "Nomad Weekly" },
        publishedAt: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
        urlToImage: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=800&auto=format&fit=crop",
        url: "#",
        category: "Policy"
    },
    {
        id: 2,
        title: "Hidden Gems of The Balkans",
        description: "Why Albania and Montenegro are becoming the top budget-friendly alternatives to Greece and Croatia this summer.",
        source: { name: "Wanderlust Mag" },
        publishedAt: new Date(Date.now() - 18000000).toISOString(), // 5 hours ago
        urlToImage: "https://images.unsplash.com/photo-1569388330292-7a6a84116c7b?q=80&w=800&auto=format&fit=crop",
        url: "#",
        category: "Destinations"
    },
    {
        id: 3,
        title: "Sustainable Travel: New Carbon Laws",
        description: "European Union implements stricter carbon taxes on short-haul flights. How this affects your summer Eurotrip budget.",
        source: { name: "EcoTravel" },
        publishedAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
        urlToImage: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=800&auto=format&fit=crop",
        url: "#",
        category: "Sustainability"
    },
    {
        id: 4,
        title: "Best Solo Travel Hostels 2024",
        description: "A curated list of the most social and safe hostels in Southeast Asia for first-time solo travellers.",
        source: { name: "Solo Planet" },
        publishedAt: new Date(Date.now() - 87000000).toISOString(), // 1 day ago
        urlToImage: "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?q=80&w=800&auto=format&fit=crop",
        url: "#",
        category: "Tips"
    },
    {
        id: 5,
        title: "Airline Mistakes Fares: How to Spot Them",
        description: "A glitch in the system allowed travellers to book round-trip flights to New Zealand for $300. Here is how to catch the next one.",
        source: { name: "FlySmart" },
        publishedAt: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
        urlToImage: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=800&auto=format&fit=crop",
        url: "#",
        category: "Hacks"
    }
];

const API_KEY = import.meta.env.VITE_NEWS_API_KEY;
const BASE_URL = 'https://eventregistry.org/api/v1/article/getArticles';

export const fetchTravelNews = async (category: string = 'All'): Promise<NewsItem[]> => {
    // If no API key, return mock data
    if (!API_KEY) {
        console.warn("No VITE_NEWS_API_KEY found. Serving mock data.");
        if (category === 'All') return MOCK_NEWS;
        return MOCK_NEWS.filter(n => n.category === category);
    }

    try {
        // Construct query keywords based on category
        // Use phrases that are more likely to appear in consumer travel articles
        let keywords = ['travel advice', 'best destinations', 'travel tips', 'backpacking', 'hidden gems', 'solo travel'];
        
        if (category !== 'All') {
            // Add specific category keyword with high priority (or just add to the list)
            keywords.push(category.toLowerCase());
            if (category === 'Policy') keywords.push('visa', 'travel restrictions');
            if (category === 'Sustainability') keywords.push('eco-friendly travel', 'carbon footprint');
            if (category === 'Hacks') keywords.push('cheap flights', 'travel hacks');
        }

        const requestBody = {
            "action": "getArticles",
            "keyword": keywords,
            "keywordOper": "or",
            "lang": "eng",
            "articlesPage": 1,
            "articlesCount": 12,
            "articlesSortBy": "date",
            "articlesSortByAsc": false,
            "apiKey": API_KEY,
            "resultType": "articles",
            "articlesArgs": {
                "image": true,
                "domainContributors": false // simplified return
            }
        };

        const response = await fetch(BASE_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });
        
        if (!response.ok) {
            throw new Error(`API Error: ${response.statusText}`);
        }

        const data = await response.json();
        
        // Event Registry returns { "articles": { "results": [...] } }
        const results = data.articles?.results || [];

        const cleanArticles = results.map((article: any, index: number) => ({
            id: index, // Event Registry gives 'uri', but we can use index or uri
            title: article.title,
            description: article.body ? article.body.substring(0, 200) + '...' : (article.description || ''),
            source: { name: article.source?.title || 'Unknown Source' },
            publishedAt: article.dateTime || article.date, // 'dateTime' is usually standard
            urlToImage: article.image || 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=800&auto=format&fit=crop',
            url: article.url,
            category: category === 'All' ? 'General' : category
        }));

        return cleanArticles;

    } catch (error) {
        console.error("Failed to fetch news:", error);
        // Fallback to mock data on error
        if (category === 'All') return MOCK_NEWS;
        return MOCK_NEWS.filter(n => n.category === category);
    }
};
