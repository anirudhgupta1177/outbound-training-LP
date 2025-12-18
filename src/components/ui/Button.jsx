import { motion } from 'framer-motion';

const PAYMENT_URL = 'https://anirudhgupta1177.systeme.io/payment';

export default function Button({ 
  children, 
  variant = 'primary', 
  size = 'lg', 
  href,
  className = '',
  onClick,
  ...props 
}) {
  const baseStyles = 'font-display font-bold rounded-xl transition-all duration-300 inline-flex items-center justify-center gap-2';
  
  const variants = {
    primary: 'btn-gold text-dark',
    secondary: 'bg-purple border-2 border-purple-light text-white hover:bg-purple-light',
    outline: 'bg-transparent border-2 border-gold text-gold hover:bg-gold hover:text-dark',
  };
  
  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
    xl: 'px-10 py-5 text-xl',
  };

  // Default to payment URL for checkout links
  const finalHref = href === '#checkout' || !href ? PAYMENT_URL : href;
  const isExternal = finalHref.startsWith('http');
  
  const Component = finalHref ? motion.a : motion.button;
  const externalProps = isExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {};

  return (
    <Component
      href={finalHref}
      onClick={onClick}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.98 }}
      {...externalProps}
      {...props}
    >
      {children}
    </Component>
  );
}
