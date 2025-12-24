import { Routes, Route } from 'react-router-dom';
import LandingPage from './components/pages/LandingPage';
import Checkout from './components/pages/Checkout';
import ThankYou from './components/pages/ThankYou';

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/checkout" element={<Checkout />} />
      <Route path="/thank-you" element={<ThankYou />} />
    </Routes>
  );
}

export default App;
