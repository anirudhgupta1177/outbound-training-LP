import { motion } from 'framer-motion';
import { HiMail, HiPhone } from 'react-icons/hi';
import { FaLinkedin } from 'react-icons/fa';
import logo from '../../assets/logo.png';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative py-8 md:py-12 border-t border-white/10">
      {/* Background */}
      <div className="absolute inset-0 bg-dark-secondary" />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8 mb-8 md:mb-12">
          {/* Brand */}
          <div>
            <img src={logo} alt="The Organic Buzz" className="h-8 md:h-10 w-auto mb-3 md:mb-4" />
            <p className="text-text-secondary text-xs md:text-sm max-w-md mb-3 md:mb-4">
              AI-Powered Outbound Systems That Actually Work
            </p>
            <p className="text-text-muted text-xs md:text-sm">
              Trusted by 1132+ students
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-white font-bold mb-3 md:mb-4 text-sm md:text-base">Quick Links</h4>
            <ul className="space-y-1.5 md:space-y-2">
              {[
                { label: 'Who I Am', href: '#instructor' },
                { label: 'Testimonials', href: '#testimonials' },
                { label: 'Refund Policy', href: '#risk-reversal' },
                { label: 'Contact Support', href: 'https://mail.google.com/mail/?view=cm&fs=1&to=anirudh@theorganicbuzz.com' },
              ].map((link, index) => (
                <li key={index}>
                  <a 
                    href={link.href}
                    className="text-text-muted hover:text-gold transition-colors text-xs md:text-sm"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="sm:col-span-2 md:col-span-1">
            <h4 className="text-white font-bold mb-3 md:mb-4 text-sm md:text-base">Contact</h4>
            <ul className="space-y-2 md:space-y-3">
              <li className="flex items-center gap-2 text-text-muted text-xs md:text-sm">
                <FaLinkedin className="w-3 h-3 md:w-4 md:h-4 text-gold" />
                <a href="https://www.linkedin.com/in/theoutboundguy" target="_blank" rel="noopener noreferrer" className="hover:text-gold transition-colors">
                  LinkedIn Profile
                </a>
              </li>
              <li className="flex items-center gap-2 text-text-muted text-xs md:text-sm">
                <HiMail className="w-3 h-3 md:w-4 md:h-4 text-gold" />
                <a href="https://mail.google.com/mail/?view=cm&fs=1&to=anirudh@theorganicbuzz.com" target="_blank" rel="noopener noreferrer" className="hover:text-gold transition-colors">
                  anirudh@theorganicbuzz.com
                </a>
              </li>
              <li className="flex items-center gap-2 text-text-muted text-xs md:text-sm">
                <HiPhone className="w-3 h-3 md:w-4 md:h-4 text-gold" />
                <a href="tel:+919098456224" className="hover:text-gold transition-colors">
                  +91-9098456224
                </a>
              </li>
              <li className="text-text-muted text-xs md:text-sm">
                Response time: Within 24 hours
              </li>
            </ul>
          </div>
        </div>

        {/* Trust badges */}
        <div className="flex flex-wrap justify-center gap-2 md:gap-4 mb-6 md:mb-8">
          <span className="px-2 md:px-3 py-1 md:py-1.5 rounded-full bg-white/5 text-text-muted text-xs">
            💯 30-Day Guarantee
          </span>
          <span className="px-2 md:px-3 py-1 md:py-1.5 rounded-full bg-white/5 text-text-muted text-xs">
            🔒 Secure Payment
          </span>
          <span className="px-2 md:px-3 py-1 md:py-1.5 rounded-full bg-white/5 text-text-muted text-xs">
            ⭐ 4.9/5 Rating
          </span>
          <span className="px-2 md:px-3 py-1 md:py-1.5 rounded-full bg-white/5 text-text-muted text-xs">
            👥 1132+ Students
          </span>
        </div>

        {/* Bottom bar */}
        <div className="pt-6 md:pt-8 border-t border-white/10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-3 md:gap-4">
            <p className="text-text-muted text-xs md:text-sm text-center">
              Copyright © {currentYear} The Organic Buzz. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
