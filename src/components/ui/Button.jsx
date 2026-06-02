import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { HiArrowRight } from 'react-icons/hi';

const PAYMENT_URL = '/checkout';

export default function Button({
  children,
  variant = 'primary',
  size = 'lg',
  href,
  className = '',
  showArrow = false,
  onClick,
  ...props
}) {
  const baseStyles = 'font-display font-bold rounded-xl transition-all duration-300 inline-flex items-center justify-center gap-2 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold';

  const variants = {
    primary: 'hero-cta text-dark',
    secondary: 'bg-purple border-2 border-purple-light text-white hover:bg-purple-light',
    outline: 'bg-transparent border-2 border-gold text-gold hover:bg-gold hover:text-dark',
  };

  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
    xl: 'px-10 py-5 text-xl',
  };

  const finalHref = href === '#checkout' || !href ? PAYMENT_URL : href;
  const isExternal = finalHref && finalHref.startsWith('http');
  const isInternal = finalHref && finalHref.startsWith('/');

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
      {showArrow && <HiArrowRight className="arrow-icon w-5 h-5" />}
    </Component>
  );
}
