import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

// Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import CustomCursor from './components/CustomCursor';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import CreateCampaign from './pages/CreateCampaign';
import CampaignDetails from './pages/CampaignDetails';
import ExploreNGOs from './pages/ExploreNGOs';
import OrganizationProfile from './pages/OrganizationProfile';
import CreateOrganization from './pages/CreateOrganization';
import Search from './pages/Search';
import Dashboard from './pages/Dashboard';
import RoleSelection from './pages/RoleSelection';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

function App() {
  return (
    <HelmetProvider>
      <ThemeProvider>
        <AuthProvider>
          <Router>
            <div className="App">
            <CustomCursor />
            <Navbar />
            <main>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/join" element={<RoleSelection />} />
                <Route path="/register" element={<Register />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/explore-ngos" element={<ExploreNGOs />} />
                <Route path="/search" element={<Search />} />
                <Route path="/organization/:id" element={<OrganizationProfile />} />
                <Route path="/create-organization" element={<CreateOrganization />} />
                <Route path="/create-campaign" element={<CreateCampaign />} />
                <Route path="/campaign/:id" element={<CampaignDetails />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password/:token" element={<ResetPassword />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </Router>
        </AuthProvider>
      </ThemeProvider>
    </HelmetProvider>
  );
}

export default App;
