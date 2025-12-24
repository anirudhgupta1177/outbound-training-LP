import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { HiCheckCircle, HiMail, HiHome } from 'react-icons/hi';

export default function ThankYou() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-dark flex items-center justify-center py-12 px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl w-full"
      >
        <div className="glass-card rounded-xl md:rounded-2xl p-8 md:p-12 text-center">
          {/* Success Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="mb-6 flex justify-center"
          >
            <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-success/20 flex items-center justify-center">
              <HiCheckCircle className="w-12 h-12 md:w-16 md:h-16 text-success" />
            </div>
          </motion.div>

          {/* Success Message */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-3xl md:text-4xl font-display font-bold text-white mb-4"
          >
            Payment Successful!
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-text-secondary text-lg md:text-xl mb-8"
          >
            Thank you for your purchase. You now have access to the Complete AI-Powered Outbound System.
          </motion.p>

          {/* Next Steps */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-dark-secondary rounded-lg p-6 mb-8 text-left"
          >
            <h2 className="text-xl font-display font-bold text-white mb-4">
              What Happens Next?
            </h2>
            <ul className="space-y-3 text-text-secondary">
              <li className="flex items-start gap-3">
                <span className="text-gold text-xl mt-0.5">1.</span>
                <span>You'll receive an email with your login credentials and access link within the next few minutes.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-gold text-xl mt-0.5">2.</span>
                <span>Check your inbox (and spam folder) for an email from <span className="text-gold">anirudh@theorganicbuzz.com</span>.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-gold text-xl mt-0.5">3.</span>
                <span>Join the private WhatsApp community to get instant support from 1,132+ members.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-gold text-xl mt-0.5">4.</span>
                <span>Start with Module 1 to define your ICP and build your offer.</span>
              </li>
            </ul>
          </motion.div>

          {/* Support */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mb-8 p-4 bg-gold/10 border border-gold/30 rounded-lg"
          >
            <p className="text-text-secondary mb-2">
              Have questions or need help?
            </p>
            <a
              href="mailto:anirudh@theorganicbuzz.com"
              className="inline-flex items-center gap-2 text-gold hover:text-gold-light transition-colors"
            >
              <HiMail className="w-5 h-5" />
              <span>anirudh@theorganicbuzz.com</span>
            </a>
          </motion.div>

          {/* Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <button
              onClick={() => navigate('/')}
              className="btn-gold text-dark font-display font-bold rounded-xl px-8 py-4 text-lg transition-all duration-300 hover:scale-105 inline-flex items-center justify-center gap-2"
            >
              <HiHome className="w-5 h-5" />
              <span>Back to Home</span>
            </button>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}

