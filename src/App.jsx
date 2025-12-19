import { 
  Navbar, 
  Hero, 
  BeforeAfter, 
  Testimonials, 
  SystemFunnel, 
  CompleteSystem, 
  DashboardShowcase,
  Personas,
  Instructor,
  ValueStack,
  FAQ,
  Footer 
} from './components/sections';
import MobileCTA from './components/ui/MobileCTA';

function App() {
  return (
    <div className="min-h-screen bg-dark">
      <Navbar />
      
      <main>
        <Hero />
        
        {/* Section divider */}
        <div className="section-divider" />
        
        <BeforeAfter />
        
        <Testimonials />
        
        <div className="hidden md:block">
          <SystemFunnel />
        </div>
        
        <Instructor />
        
        <CompleteSystem />
        
        <div className="hidden md:block">
          <DashboardShowcase />
        </div>
        
        <ValueStack />
        
        <Personas />
        
        <FAQ />
      </main>
      
      <Footer />
      
      {/* Mobile sticky CTA */}
      <MobileCTA />
    </div>
  );
}

export default App;
