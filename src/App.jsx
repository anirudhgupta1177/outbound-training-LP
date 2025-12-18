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
        
        <Instructor />
        
        <CompleteSystem />
        
        <DashboardShowcase />
        
        <Personas />
        
        <ValueStack />
        
        <RiskReversal />
        
        <Urgency />
        
        <FAQ />
      </main>
      
      <Footer />
      
      {/* Mobile sticky CTA */}
      <MobileCTA />
    </div>
  );
}

export default App;
