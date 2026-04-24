/**
 * Simplified motion configuration - opacity only, no transforms
 * Optimized for performance on all devices (including weak GPUs)
 * Duration: 0.15s (fast, snappy feel)
 */

export const prefersReducedMotion = () => {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
};

// Simplified page transitions - opacity only, no y transform
export const pageVariants = prefersReducedMotion()
  ? {
      initial: { opacity: 0 },
      animate: { opacity: 1, transition: { duration: 0 } },
      exit: { opacity: 0, transition: { duration: 0 } },
    }
  : {
      initial: { opacity: 0 },
      animate: { opacity: 1, transition: { duration: 0.15 } },
      exit: { opacity: 0, transition: { duration: 0.1 } },
    };

// Fast stagger for grid items - reduced stagger time
export const staggerConfig = prefersReducedMotion()
  ? { staggerChildren: 0, delayChildren: 0 }
  : { staggerChildren: 0.02, delayChildren: 0.05 };

// Simple item fade in - no scale/y transform
export const itemVariants = prefersReducedMotion()
  ? {
      hidden: { opacity: 0 },
      visible: { opacity: 1, transition: { duration: 0 } },
    }
  : {
      hidden: { opacity: 0 },
      visible: { opacity: 1, transition: { duration: 0.12 } },
    };

// Dropdown/modal animations - opacity only
export const dropdownVariants = prefersReducedMotion()
  ? {
      hidden: { opacity: 0 },
      visible: { opacity: 1, transition: { duration: 0 } },
      exit: { opacity: 0, transition: { duration: 0 } },
    }
  : {
      hidden: { opacity: 0 },
      visible: { opacity: 1, transition: { duration: 0.1 } },
      exit: { opacity: 0, transition: { duration: 0.08 } },
    };

