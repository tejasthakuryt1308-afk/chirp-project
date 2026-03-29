import { Routes, Route, Navigate } from 'react-router-dom';
import TopNavBar from './components/Layout/TopNavBar';
import SideNavBar from './components/Layout/SideNavBar';
import RightSidebar from './components/Layout/RightSidebar';
import MobileNav from './components/Layout/MobileNav';
import Home from './pages/Home';
import Profile from './pages/Profile';
import Search from './pages/Search';
import Bookmarks from './pages/Bookmarks';
import Login from './components/Auth/Login';
import Signup from './components/Auth/Signup';
import ForgotPassword from './components/Auth/ForgotPassword';
import ResetPassword from './components/Auth/ResetPassword';
import NotFound from './pages/NotFound';
import { useState } from 'react';
import { useAuth } from './context/AuthContext';

function Shell({ children }) {
  const [results, setResults] = useState([]);
  return (
    <div className="min-h-screen">
      <TopNavBar onSearchResults={setResults} />
      <div className="mx-auto flex max-w-7xl gap-6 px-4 py-6">
        <SideNavBar />
        <div className="min-w-0 flex-1">
          {results.length ? (
            <div className="mb-4 glass rounded-[28px] p-4">
              <div className="font-headline text-white mb-3">Search results</div>
              <div className="space-y-2">
                {results.map((item) => (
                  <div key={item._id} className="rounded-2xl bg-white/5 px-4 py-3">{item.text}</div>
                ))}
              </div>
            </div>
          ) : null}
          {children}
        </div>
        <RightSidebar />
      </div>
      <MobileNav />
    </div>
  );
}

function ProtectedHome() {
  const { user } = useAuth();
  return user ? <Shell><Home /></Shell> : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<ProtectedHome />} />
      <Route path="/profile/:id" element={<Shell><Profile /></Shell>} />
      <Route path="/search" element={<Shell><Search /></Shell>} />
      <Route path="/bookmarks" element={<Shell><Bookmarks /></Shell>} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password/:token" element={<ResetPassword />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
