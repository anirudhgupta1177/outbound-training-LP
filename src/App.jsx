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
  RiskReversal,
  Urgency,
  FAQ,
  FinalCTA,
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
        
        <SystemFunnel />
        
        <CompleteSystem />
        
        <DashboardShowcase />
        
        <Personas />
        
        <Instructor />
        
        <ValueStack />
        
        <RiskReversal />
        
        <Urgency />
        
        <FAQ />
        
        <FinalCTA />
      </main>
      
      <Footer />
      
      {/* Mobile sticky CTA */}
      <MobileCTA />
    </div>
  );
}

export default App;
