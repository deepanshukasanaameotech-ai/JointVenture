import { createBrowserRouter } from "react-router-dom";
import Auth from "../auth/pages/Auth";
import ProfileSetup from "../onboarding/pages/ProfileSetup";
import Dashboard from "../dashboard/pages/Dashboard";
import CreateTrip from "../trips/pages/CreateTrip";
import Discover from "../trips/pages/Discover";
import TripDetails from "../trips/pages/TripDetails";
import Profile from "../users/pages/Profile";
import TrendingLocations from "../trips/pages/TrendingLocations";

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
    {path: "/trending", element: <TrendingLocations />}
])