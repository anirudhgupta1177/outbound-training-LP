import { Routes, Route } from 'react-router-dom';
import LandingPage from './components/pages/LandingPage';
import Checkout from './components/pages/Checkout';
import ThankYou from './components/pages/ThankYou';
import Course from './components/pages/Course';
import ModuleVideo from './components/pages/ModuleVideo';

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/checkout" element={<Checkout />} />
      <Route path="/thank-you" element={<ThankYou />} />
      <Route path="/course" element={<Course />} />
      <Route path="/course/:moduleId/:videoId" element={<ModuleVideo />} />
    </Routes>
  );
}

export default App;
