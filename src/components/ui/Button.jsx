import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const PAYMENT_URL = '/checkout';

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
  const isExternal = finalHref && finalHref.startsWith('http');
  const isInternal = finalHref && finalHref.startsWith('/');
  const isHash = finalHref && finalHref.startsWith('#');
  
  // Use Link for internal routes, anchor for external/hash links, button if no href
  let Component;
  let componentProps = {};
  
  if (!finalHref) {
    Component = motion.button;
  } else if (isInternal) {
    Component = Link;
    componentProps = { to: finalHref };
  } else {
    Component = motion.a;
    componentProps = { href: finalHref };
    if (isExternal) {
      componentProps.target = '_blank';
      componentProps.rel = 'noopener noreferrer';
    }
  }

  return (
    <Component
      {...componentProps}
      onClick={onClick}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.98 }}
      {...props}
    >
      {children}
    </Component>
  );
}
