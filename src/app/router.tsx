import { createBrowserRouter } from "react-router-dom";
import Auth from "../auth/pages/Auth";
import ProfileSetup from "../onboarding/pages/ProfileSetup";
import Dashboard from "../dashboard/pages/Dashboard";
import CreateTrip from "../trips/pages/CreateTrip";
import Discover from "../trips/pages/Discover";
import TripDetails from "../trips/pages/TripDetails";
import Profile from "../users/pages/Profile";
import TrendingLocations from "../trips/pages/TrendingLocations";
import SoloTravelGuide from "../guides/pages/SoloTravelGuide";
import TravellerMotivation from "../guides/pages/TravellerMotivation";
import TransparentTravel from "../guides/pages/TransparentTravel";
import TravellersNews from "../news/pages/TravellersNews";

export const router = createBrowserRouter([
    {path: "/", element: <Auth />},
    {path: "/login", element: <Auth />},
    {path: "/signup", element: <Auth />},
    {path: "/profile-setup", element: <ProfileSetup />},
    {path: "/dashboard", element: <Dashboard />},
    {path: "/create-trip", element: <CreateTrip />},
    {path: "/discover", element: <Discover />},
    {path: "/trips/:tripId", element: <TripDetails />},
    {path: "/profile", element: <Profile />},
    {path: "/profile/:userId", element: <Profile />},
    {path: "/trending", element: <TrendingLocations />},
    {path: "/guide", element: <SoloTravelGuide />},
    {path: "/motivation", element: <TravellerMotivation />},
    {path: "/transparency", element: <TransparentTravel />},
    {path: "/news", element: <TravellersNews />}
])