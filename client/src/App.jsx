import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from '../components/Navbar'
import HeroSection from '../components/Hero'
import FeaturesSection from '../components/Features'
import CropsSection from '../components/Cropsec'
import StatsBanner from '../components/Stats'
import TestimonialsSection from '../components/Testimonials'
import CTAAndFooter from '../components/Footer'
import AboutSection from '../components/About'
import AuthForm from '../components/Authform'
import DiagnoseSection from '../components/Analysis'



const App = () => {
  return (
    <div>
   <BrowserRouter><Routes>
    <Route path='/' element ={<AuthForm />} />
    <Route path='/home' element={
      <>
        <Navbar />
     <HeroSection />
     <AboutSection />
     <FeaturesSection />
     <CropsSection />
     <StatsBanner />
     <TestimonialsSection />
     <CTAAndFooter />
     {/* <DiagnoseSection />
     <AuthForm /> */}
      </>
    }
    />
<Route path='analysis' element={<>
   <Navbar />
  <DiagnoseSection/>
  </>} />
    </Routes></BrowserRouter>
    </div>
  )
}

export default App