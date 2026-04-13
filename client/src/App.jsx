import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar'
import HeroSection from './components/Hero'
import FeaturesSection from './components/Features'
import CropsSection from './components/Cropsec'
import StatsBanner from './components/Stats'
import TestimonialsSection from './components/Testimonials'
import CTAAndFooter from './components/Footer'
import AboutSection from './components/About'
import AuthForm from './components/Authform'
import DiagnoseSection from './components/Analysis'
import { useAuth } from './context/AuthContext'

const AuthRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontSize: '18px', color: '#2d5a27' }}>Loading...</div>;
  }
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : children;
};

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontSize: '18px', color: '#2d5a27' }}>Loading...</div>;
  }
  return isAuthenticated ? children : <Navigate to="/" replace />;
};

const App = () => {
  const { isAuthenticated, loading } = useAuth();

  return (
    <div>
      <Toaster position="top-right" />
      <BrowserRouter>
        <Routes>
          <Route path='/' element={
            <AuthRoute>
              <AuthForm />
            </AuthRoute>
          } />
          <Route path='/home' element={<Navigate to="/dashboard" replace />} />
          <Route path='/dashboard' element={
            <ProtectedRoute>
              <>
                <Navbar />
                <HeroSection />
                <AboutSection />
                <FeaturesSection />
                <CropsSection />
                <StatsBanner />
                <TestimonialsSection />
                <CTAAndFooter />
              </>
            </ProtectedRoute>
          } />
          <Route path='/analysis' element={
            <ProtectedRoute>
              <>
                <Navbar />
                <DiagnoseSection />
              </>
            </ProtectedRoute>
          } />
          <Route path='*' element={
            loading ? <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontSize: '18px', color: '#2d5a27' }}>Loading...</div> : <Navigate to={isAuthenticated ? '/dashboard' : '/'} replace />
          } />
        </Routes>
      </BrowserRouter>
    </div>
  )
}

export default App
