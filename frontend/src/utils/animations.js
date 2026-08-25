import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

/**
 * GSAP Animation Utilities for Postify Studio
 * 
 * This file contains reusable GSAP animations that can be used across the project.
 * Import these functions to add consistent animations to your components.
 */

/**
 * Animate elements into view with a staggered reveal
 * @param {string} selector - CSS selector for elements to animate
 * @param {number} staggerAmount - Time between each element animation (default: 0.1)
 * @param {number} duration - Animation duration (default: 0.6)
 * @param {number} yAmount - Amount to move in Y direction (default: 30)
 * @param {Function} onComplete - Callback function when animation completes
 * @returns {gsap.context} GSAP animation context
 */
export const staggerReveal = (
  selector, 
  staggerAmount = 0.1, 
  duration = 0.6, 
  yAmount = 30,
  onComplete = null
) => {
  return gsap.context(() => {
    const elements = gsap.utils.toArray(selector);
    
    gsap.fromTo(
      elements,
      { 
        opacity: 0, 
        y: yAmount 
      },
      { 
        opacity: 1, 
        y: 0, 
        duration: duration, 
        stagger: staggerAmount,
        ease: 'power2.out',
        onComplete: onComplete
      }
    );
  });
};

/**
 * Animate a hero section with overlapping effects
 * @param {string} containerSelector - The container element
 * @param {string} headingSelector - The heading element(s)
 * @param {string} contentSelector - The content element(s)
 * @param {string} ctaSelector - Call-to-action element(s)
 * @returns {gsap.context} GSAP animation context
 */
export const animateHeroSection = (
  containerSelector, 
  headingSelector, 
  contentSelector, 
  ctaSelector
) => {
  return gsap.context(() => {
    const tl = gsap.timeline();
    
    tl.fromTo(
      containerSelector,
      { opacity: 0 },
      { opacity: 1, duration: 0.5 }
    )
    .fromTo(
      headingSelector,
      { opacity: 0, y: 50 },
      { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' },
      '-=0.2'
    )
    .fromTo(
      contentSelector,
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' },
      '-=0.4'
    )
    .fromTo(
      ctaSelector,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.6, ease: 'back.out(1.7)' },
      '-=0.2'
    );
  });
};

/**
 * Create a scroll-triggered animation for elements
 * @param {string} triggerSelector - Element that triggers the animation
 * @param {string} targetSelector - Element(s) to animate
 * @param {Object} fromVars - Starting properties
 * @param {Object} toVars - Ending properties
 * @param {Object} scrollConfig - ScrollTrigger configuration
 * @returns {gsap.context} GSAP animation context
 */
export const createScrollAnimation = (
  triggerSelector,
  targetSelector,
  fromVars = { opacity: 0, y: 50 },
  toVars = { opacity: 1, y: 0, duration: 0.8 },
  scrollConfig = { 
    trigger: triggerSelector,
    start: 'top 80%',
    end: 'bottom 20%',
    toggleActions: 'play none none reverse'
  }
) => {
  return gsap.context(() => {
    gsap.fromTo(
      targetSelector,
      fromVars,
      {
        ...toVars,
        scrollTrigger: scrollConfig
      }
    );
  });
};

/**
 * Create a staggered card reveal animation on scroll
 * @param {string} containerSelector - Container that triggers the animation
 * @param {string} cardSelector - Individual card elements to animate
 * @param {number} staggerAmount - Time between each card animation (default: 0.1)
 * @returns {gsap.context} GSAP animation context
 */
export const staggeredCardReveal = (
  containerSelector,
  cardSelector,
  staggerAmount = 0.1
) => {
  return gsap.context(() => {
    const cards = gsap.utils.toArray(cardSelector);
    
    ScrollTrigger.batch(cards, {
      interval: 0.1,
      batchMax: 3,
      onEnter: (elements) => {
        gsap.fromTo(
          elements,
          { 
            opacity: 0, 
            y: 50,
            scale: 0.95
          },
          { 
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.6,
            stagger: staggerAmount,
            ease: 'power2.out'
          }
        );
      },
      onLeave: (elements) => {
        gsap.to(elements, { 
          opacity: 0,
          y: -30,
          scale: 0.95,
          duration: 0.6,
          stagger: staggerAmount,
          ease: 'power2.in'
        });
      },
      onEnterBack: (elements) => {
        gsap.to(elements, { 
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.6,
          stagger: staggerAmount,
          ease: 'power2.out'
        });
      },
      onLeaveBack: (elements) => {
        gsap.to(elements, { 
          opacity: 0,
          y: 50,
          scale: 0.95,
          duration: 0.6,
          stagger: staggerAmount,
          ease: 'power2.in'
        });
      }
    });
  });
};

/**
 * Create a text reveal animation
 * @param {string} textSelector - Text element selector
 * @param {number} duration - Animation duration (default: 1.5)
 * @param {string} ease - Animation easing function (default: 'power3.out')
 * @returns {gsap.context} GSAP animation context
 */
export const textReveal = (
  textSelector,
  duration = 1.5,
  ease = 'power3.out'
) => {
  return gsap.context(() => {
    const splitText = new SplitText(textSelector, { type: 'chars, words' });
    const chars = splitText.chars;
    
    gsap.set(chars, { y: 50, opacity: 0 });
    
    gsap.to(chars, {
      y: 0,
      opacity: 1,
      duration: duration,
      ease: ease,
      stagger: 0.02
    });
  });
};

/**
 * Create a page transition animation
 * @param {HTMLElement} container - Container element for the page
 * @param {Function} onComplete - Callback when animation completes
 * @returns {gsap.context} GSAP animation context
 */
export const pageTransition = (container, onComplete = null) => {
  return gsap.context(() => {
    // Initial state
    gsap.set(container, { opacity: 0 });
    
    const tl = gsap.timeline({
      onComplete: onComplete
    });
    
    tl.to(container, {
      opacity: 1,
      duration: 0.5,
      ease: 'power2.out'
    });
  });
};

/**
 * Create a hover animation for interactive elements
 * @param {string} selector - Elements to apply the hover effect to
 * @param {Object} hoverVars - Properties to animate on hover
 * @returns {Function} Cleanup function to remove event listeners
 */
export const createHoverAnimation = (
  selector,
  hoverVars = { y: -5, scale: 1.02, duration: 0.2 }
) => {
  const elements = gsap.utils.toArray(selector);
  
  const onMouseEnter = (e) => {
    gsap.to(e.currentTarget, hoverVars);
  };
  
  const onMouseLeave = (e) => {
    gsap.to(e.currentTarget, {
      y: 0,
      scale: 1,
      duration: 0.2
    });
  };
  
  elements.forEach(element => {
    element.addEventListener('mouseenter', onMouseEnter);
    element.addEventListener('mouseleave', onMouseLeave);
  });
  
  // Return cleanup function
  return () => {
    elements.forEach(element => {
      element.removeEventListener('mouseenter', onMouseEnter);
      element.removeEventListener('mouseleave', onMouseLeave);
    });
  };
};

/**
 * Create a counter animation
 * @param {string} selector - Element containing the counter
 * @param {number} endValue - Final value to count to
 * @param {number} duration - Animation duration in seconds (default: 2)
 * @param {string} prefix - Text before the number (default: '')
 * @param {string} suffix - Text after the number (default: '')
 * @returns {gsap.context} GSAP animation context
 */
export const animateCounter = (
  selector,
  endValue,
  duration = 2,
  prefix = '',
  suffix = ''
) => {
  return gsap.context(() => {
    const element = document.querySelector(selector);
    const obj = { count: 0 };
    
    gsap.to(obj, {
      count: endValue,
      duration: duration,
      ease: 'power2.out',
      onUpdate: function() {
        element.textContent = prefix + Math.floor(obj.count) + suffix;
      }
    });
  });
};

/**
 * Create a parallax scrolling effect
 * @param {string} selector - Elements to apply parallax to
 * @param {number} speed - Parallax speed (default: 0.5)
 * @returns {gsap.context} GSAP animation context
 */
export const createParallaxEffect = (selector, speed = 0.5) => {
  return gsap.context(() => {
    const elements = gsap.utils.toArray(selector);
    
    elements.forEach(element => {
      gsap.to(element, {
        y: () => element.offsetHeight * speed * -1,
        ease: 'none',
        scrollTrigger: {
          trigger: element,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true
        }
      });
    });
  });
};

export default {
  staggerReveal,
  animateHeroSection,
  createScrollAnimation,
  staggeredCardReveal,
  textReveal,
  pageTransition,
  createHoverAnimation,
  animateCounter,
  createParallaxEffect
};
