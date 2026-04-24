/**
 * Motion configuration that respects user's motion preferences
 * Returns animation config or instant (no animation) based on prefers-reduced-motion
 */

export const prefersReducedMotion = () => {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
};

// For Framer Motion transitions
export const transitionConfig = prefersReducedMotion()
  ? { duration: 0 }
  : { duration: 0.3 };

// For Framer Motion variants
export const pageVariants = prefersReducedMotion()
  ? {
      initial: { opacity: 0 },
      animate: { opacity: 1, transition: { duration: 0 } },
      exit: { opacity: 0, transition: { duration: 0 } },
    }
  : {
      initial: { y: -20, opacity: 0 },
      animate: { y: 0, opacity: 1, transition: { duration: 0.3 } },
      exit: { y: 20, opacity: 0, transition: { duration: 0.2 } },
    };

export const staggerConfig = prefersReducedMotion()
  ? { staggerChildren: 0, delayChildren: 0 }
  : { staggerChildren: 0.05, delayChildren: 0.1 };

export const itemVariants = prefersReducedMotion()
  ? {
      hidden: { opacity: 0 },
      visible: { opacity: 1, transition: { duration: 0 } },
    }
  : {
      hidden: { opacity: 0, y: 10 },
      visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
    };
