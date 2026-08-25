import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { 
  ArrowRight, 
  Star, 
  Zap, 
  Shield, 
  Users, 
  Award, 
  CheckCircle,
  Sparkles,
  Rocket,
  Target,
  TrendingUp,
  Quote,
  Mail,
  Phone,
  MapPin,
  Eye,
  Heart,
  Code,
  Globe,
  Briefcase,
  Calendar,
  Clock,
  Send
} from 'lucide-react';

// Register ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

const HomePage = () => {
  // Refs for GSAP animations and navigation
  const heroRef = useRef(null);
  const servicesRef = useRef(null);
  const aboutRef = useRef(null);
  const contactRef = useRef(null);
  const testimonialsRef = useRef(null);
  const [activeSection, setActiveSection] = useState('home');

  // Smooth scroll to section
  const scrollToSection = (sectionRef, sectionName) => {
    setActiveSection(sectionName);
    sectionRef.current?.scrollIntoView({ 
      behavior: 'smooth',
      block: 'start'
    });
  };

  // Initialize GSAP animations
  useEffect(() => {
    // Hero section animations
    const tl = gsap.timeline();
    tl.from(".hero-title", { 
      duration: 1.2, 
      y: 100, 
      opacity: 0, 
      ease: "power4.out" 
    })
    .from(".hero-subtitle", { 
      duration: 1, 
      y: 50, 
      opacity: 0, 
      ease: "power3.out" 
    }, "-=0.7")
    .from(".hero-cta", { 
      duration: 0.8, 
      y: 30, 
      opacity: 0, 
      ease: "power2.out" 
    }, "-=0.5")
    .from(".hero-stats", { 
      duration: 0.8, 
      y: 40, 
      opacity: 0, 
      ease: "power2.out" 
    }, "-=0.4");

    // Services cards animation
    gsap.from(".service-card", {
      scrollTrigger: {
        trigger: servicesRef.current,
        start: "top 80%",
        toggleActions: "play none none reverse"
      },
      duration: 0.8,
      y: 100,
      opacity: 0,
      stagger: 0.2,
      ease: "power3.out"
    });

    // About section animations
    gsap.from(".about-content", {
      scrollTrigger: {
        trigger: aboutRef.current,
        start: "top 80%",
        toggleActions: "play none none reverse"
      },
      duration: 1,
      x: -100,
      opacity: 0,
      ease: "power3.out"
    });

    gsap.from(".about-image", {
      scrollTrigger: {
        trigger: aboutRef.current,
        start: "top 80%",
        toggleActions: "play none none reverse"
      },
      duration: 1,
      x: 100,
      opacity: 0,
      ease: "power3.out"
    });

    // Contact form animation
    gsap.from(".contact-form", {
      scrollTrigger: {
        trigger: contactRef.current,
        start: "top 80%",
        toggleActions: "play none none reverse"
      },
      duration: 1,
      y: 100,
      opacity: 0,
      ease: "power3.out"
    });

    // Update active section on scroll
    const sections = [
      { ref: heroRef, name: 'home' },
      { ref: servicesRef, name: 'services' },
      { ref: aboutRef, name: 'about' },
      { ref: contactRef, name: 'contact' }
    ];

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const sectionName = sections.find(s => s.ref.current === entry.target)?.name;
            if (sectionName) setActiveSection(sectionName);
          }
        });
      },
      { threshold: 0.6 }
    );

    sections.forEach(section => {
      if (section.ref.current) observer.observe(section.ref.current);
    });

    // Cleanup
    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
      observer.disconnect();
    };
  }, []);

  // Services data
  const services = [
    {
      id: 1,
      title: 'Social Media Management',
      description: 'Complete social media solutions to grow your online presence and engage your audience.',
      features: [
        'Create posts, reels, stories',
        'Plan content calendars',
        'Grow followers & engagement',
        'Handle Instagram, Facebook, LinkedIn, etc.'
      ],
      icon: (
        <svg className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      color: "from-blue-500 to-cyan-500",
      bgColor: "bg-blue-50 dark:bg-blue-950"
    },
    {
      id: 2,
      title: 'Content Writing',
      description: 'Professional content that drives engagement and converts readers into customers.',
      features: [
        'Write blogs, captions, product descriptions',
        'SEO content for websites and social media',
        'Professional bios and About Us pages',
        'Brand storytelling and copywriting'
      ],
      icon: (
        <svg className="h-8 w-8 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      ),
      color: "from-purple-500 to-pink-500",
      bgColor: "bg-purple-50 dark:bg-purple-950"
    },
    {
      id: 3,
      title: 'Website Development',
      description: 'Modern, responsive websites that deliver exceptional user experiences.',
      features: [
        'Business, portfolio, and e-commerce sites',
        'Clean design + mobile responsive + fast loading',
        'Tech stack: HTML/CSS/JS, React, Node, WordPress',
        'SEO optimized and performance focused'
      ],
      icon: (
        <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
        </svg>
      ),
      color: "from-green-500 to-teal-500",
      bgColor: "bg-green-50 dark:bg-green-950"
    },
    {
      id: 4,
      title: 'Graphic Design',
      description: 'Eye-catching visuals and branding materials that make your business stand out.',
      features: [
        'Posters, brochures, flyers',
        'Magazines, newsletters, presentations',
        'Logos, branding kits, business cards',
        'Social media graphics and banners'
      ],
      icon: (
        <svg className="h-8 w-8 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      color: "from-orange-500 to-red-500",
      bgColor: "bg-orange-50 dark:bg-orange-950"
    },
  ];

  // Target audience data
  const targetAudience = [
    "Local businesses",
    "Startups & entrepreneurs", 
    "Influencers, creators",
    "Real estate agents, gyms, doctors, salons",
    "NGOs, schools, events"
  ];

  // Company stats
  const stats = [
    { number: "500+", label: "Projects Completed", icon: <Target className="w-6 h-6" /> },
    { number: "200+", label: "Happy Clients", icon: <Users className="w-6 h-6" /> },
    { number: "50+", label: "Team Members", icon: <Award className="w-6 h-6" /> },
    { number: "99.9%", label: "Success Rate", icon: <TrendingUp className="w-6 h-6" /> }
  ];

  // Client testimonials
  const testimonials = [
    {
      name: "Sarah Johnson",
      company: "TechStart Inc.",
      content: "Postify Studio transformed our digital presence completely. Their team delivered beyond our expectations.",
      rating: 5,
      avatar: "SJ"
    },
    {
      name: "Michael Chen",
      company: "GrowthCorp", 
      content: "The professionalism and quality of work from Postify Studio is outstanding. Highly recommend their services.",
      rating: 5,
      avatar: "MC"
    },
    {
      name: "Emily Rodriguez",
      company: "Creative Solutions",
      content: "Working with Postify Studio was a game-changer for our business. They truly understand what clients need.",
      rating: 5,
      avatar: "ER"
    }
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white overflow-hidden">
      {/* Fixed Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 dark:bg-black/90 backdrop-blur-md border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <Sparkles className="w-8 h-8 text-blue-600 dark:text-blue-400 animate-pulse" />
              <span className="text-xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent magical-text-glow">
                Postify Studio
              </span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              {[
                { name: 'Home', ref: heroRef, id: 'home' },
                { name: 'Services', ref: servicesRef, id: 'services' },
                { name: 'About', ref: aboutRef, id: 'about' },
                { name: 'Contact', ref: contactRef, id: 'contact' }
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.ref, item.id)}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-300 ${
                    activeSection === item.id
                      ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 scale-105'
                      : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:scale-105'
                  }`}
                >
                  {item.name}
                </button>
              ))}
              <Link
                to="/login"
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section 
        ref={heroRef}
        className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 pt-20"
      >
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-orange-50 via-white to-blue-50 dark:from-orange-900/20 dark:via-black dark:to-blue-900/20" />
        <div className="absolute inset-0 bg-grid opacity-20" />
        
        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-gradient-to-r from-primary-400 to-secondary-400 rounded-full blur-xl opacity-70 animate-float" />
        <div className="absolute bottom-32 right-16 w-32 h-32 bg-gradient-to-r from-accent-400 to-primary-400 rounded-full blur-2xl opacity-50 animate-float" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-gradient-to-r from-secondary-400 to-accent-400 rounded-full blur-lg opacity-60 animate-float" style={{ animationDelay: '4s' }} />

        <div className="relative z-10 max-w-6xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="mb-8"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-100 dark:bg-primary-900/30 border-2 border-primary-500 text-primary-600 dark:text-primary-400 font-semibold">
              <Sparkles className="w-4 h-4" />
              <span>Welcome to Postify Studio</span>
            </div>
          </motion.div>

          {/* Site Name */}
          <motion.h2 
            className="relative mb-8"
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <span className="text-4xl md:text-5xl lg:text-6xl font-black bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-600 bg-clip-text text-transparent drop-shadow-2xl filter brightness-125 magical-text-glow">
              POSTIFY STUDIO
            </span>
            
            {/* Magical Glow Effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-600 opacity-20 blur-2xl -z-10 animate-pulse"></div>
            
            {/* Lightning Bolts */}
            <div className="absolute -top-2 -left-2">
              <Zap className="w-6 h-6 text-yellow-400 animate-bounce" />
            </div>
            <div className="absolute -bottom-2 -right-2">
              <Zap className="w-6 h-6 text-pink-400 animate-bounce" style={{ animationDelay: '1s' }} />
            </div>
          </motion.h2>

          <h1 className="hero-title text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Transform Your</span>
            <span className="block text-black dark:text-white">Digital Presence</span>
          </h1>

          <p className="hero-subtitle text-lg md:text-xl lg:text-2xl text-gray-600 dark:text-gray-300 mb-8 max-w-4xl mx-auto font-medium leading-relaxed">
            We help businesses thrive in the digital world with innovative solutions for 
            <span className="text-primary-500 font-semibold"> web development</span>, 
            <span className="text-secondary-500 font-semibold"> digital marketing</span>, 
            <span className="text-accent-500 font-semibold"> brand strategy</span>, and 
            <span className="text-primary-500 font-semibold"> content creation</span>.
          </p>

          <div className="hero-cta flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
            <Link
              to="/signup"
              className="btn-brutal text-lg px-8 py-4 group"
            >
              <span className="flex items-center gap-3">
                GET STARTED FREE
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>
            
            <Link
              to="/services"
              className="btn-outline text-lg px-8 py-4 group"
            >
              <span className="flex items-center gap-3">
                EXPLORE SERVICES
                <Rocket className="w-5 h-5 group-hover:rotate-12 transition-transform" />
              </span>
            </Link>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-20 max-w-4xl mx-auto">
            {stats.map((stat, index) => (
              <div key={index} className="stat-item text-center">
                <div className="flex justify-center mb-2 text-primary-500">
                  {stat.icon}
                </div>
                <div className="text-3xl md:text-4xl font-black text-black dark:text-white">
                  {stat.number}
                </div>
                <div className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section ref={servicesRef} className="py-32 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-blue-950 dark:via-black dark:to-purple-950">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-20">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold mb-6"
            >
              <Sparkles className="w-5 h-5" />
              <span>We'll Offer</span>
            </motion.div>
            
            <motion.h2 
              className="text-5xl md:text-6xl lg:text-7xl font-black mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
            >
              OUR SERVICES
            </motion.h2>
            
            <motion.p 
              className="text-xl md:text-2xl text-gray-700 dark:text-gray-200 max-w-4xl mx-auto font-medium leading-relaxed"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              viewport={{ once: true }}
            >
              Comprehensive digital solutions to transform your business and accelerate growth
            </motion.p>
          </div>

          {/* Services Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
            {services.map((service, index) => (
              <motion.div
                key={service.id}
                className="service-card group relative"
                initial={{ opacity: 0, y: 100 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                viewport={{ once: true }}
                whileHover={{ y: -10 }}
              >
                {/* Card Background with Gradient */}
                <div className={`absolute inset-0 bg-gradient-to-br ${service.color} opacity-10 rounded-3xl group-hover:opacity-20 transition-all duration-500`} />
                
                {/* Main Card */}
                <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border-2 border-gray-200 dark:border-gray-700 rounded-3xl shadow-xl p-8 group-hover:shadow-2xl transition-all duration-500 hover:border-opacity-50">
                  {/* Service Icon */}
                  <div className={`w-20 h-20 rounded-2xl bg-gradient-to-r ${service.color} flex items-center justify-center text-white mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-lg`}>
                    {service.icon}
                  </div>
                  
                  {/* Service Title */}
                  <h3 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-purple-600 group-hover:bg-clip-text transition-all duration-500">
                    {service.title}
                  </h3>
                  
                  {/* Service Description */}
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6 text-lg">
                    {service.description}
                  </p>
                  
                  {/* Features List */}
                  <div className="space-y-3 mb-6">
                    {service.features.map((feature, idx) => (
                      <motion.div
                        key={idx}
                        className="flex items-start gap-3"
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: (index * 0.2) + (idx * 0.1) }}
                        viewport={{ once: true }}
                      >
                        <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700 dark:text-gray-300 font-medium">
                          {feature}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                  
                  {/* CTA Button */}
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Link 
                      to="/services" 
                      className={`inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r ${service.color} text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-300 group-hover:scale-105`}
                    >
                      Learn More
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Who We Help Section */}
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-green-500 to-teal-500 text-white font-semibold mb-8">
              <Users className="w-5 h-5" />
              <span>Who We'll Help</span>
            </div>
            
            <h3 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-8">
              Perfect for Every Business
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 max-w-6xl mx-auto">
              {targetAudience.map((audience, index) => (
                <motion.div
                  key={index}
                  className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-lg border border-gray-200 dark:border-gray-700 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 group"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -5 }}
                >
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Briefcase className="w-6 h-6 text-white" />
                  </div>
                  <p className="text-gray-800 dark:text-gray-200 font-semibold text-center group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-purple-600 group-hover:bg-clip-text transition-all duration-300">
                    {audience}
                  </p>
                </motion.div>
              ))}
            </div>
            
            {/* CTA for Services */}
            <motion.div
              className="mt-12"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              viewport={{ once: true }}
            >
              <Link
                to="/signup"
                className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white font-bold rounded-2xl text-lg hover:scale-105 transition-all duration-300 shadow-2xl hover:shadow-3xl group"
              >
                <Rocket className="w-6 h-6 group-hover:rotate-12 transition-transform" />
                Get Started Today
                <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section ref={testimonialsRef} className="py-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-black mb-6">
              <span className="text-gradient">CLIENT SUCCESS</span>
            </h2>
            <p className="text-xl text-neutral-600 dark:text-neutral-300 max-w-3xl mx-auto">
              See what our satisfied clients have to say about their experience
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                className="card-glass p-8 relative group hover:scale-105 transition-transform duration-300"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
              >
                <Quote className="w-8 h-8 text-primary-400 mb-4" />
                <p className="text-lg text-neutral-700 dark:text-neutral-200 mb-6 italic">
                  "{testimonial.content}"
                </p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center text-white font-bold">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <h4 className="font-bold text-black dark:text-white">
                      {testimonial.name}
                    </h4>
                    <p className="text-sm text-neutral-500">
                      {testimonial.role}
                    </p>
                  </div>
                </div>
                <div className="flex gap-1 mt-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-4 sm:px-6 lg:px-8 bg-black dark:bg-white text-white dark:text-black">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-5xl md:text-7xl font-black mb-8">
            READY TO START?
          </h2>
          <p className="text-xl md:text-2xl mb-12 text-neutral-300 dark:text-neutral-600">
            Join thousands of satisfied clients and transform your business today
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link
              to="/signup"
              className="bg-white text-black dark:bg-black dark:text-white font-bold px-8 py-4 rounded-xl text-lg hover:scale-105 transition-all duration-300 shadow-glow"
            >
              START YOUR JOURNEY
            </Link>
            <Link
              to="/contact"
              className="border-2 border-white dark:border-black text-white dark:text-black font-bold px-8 py-4 rounded-xl text-lg hover:bg-white hover:text-black dark:hover:bg-black dark:hover:text-white transition-all duration-300"
            >
              CONTACT US
            </Link>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section ref={aboutRef} className="py-20 bg-green-50 dark:bg-green-950">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              About Postify Studio
            </h2>
            <p className="text-xl text-gray-700 dark:text-gray-200 max-w-3xl mx-auto font-medium">
              Empowering businesses with innovative digital solutions and exceptional service.
            </p>
          </div>
          
          {/* Company Description */}
          <div className="text-center mb-16">
            <p className="text-xl text-gray-800 dark:text-gray-100 leading-relaxed font-semibold bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 max-w-4xl mx-auto">
              We are a team of passionate professionals dedicated to helping businesses 
              transform their digital presence and achieve unprecedented growth through 
              cutting-edge technology and creative excellence.
            </p>
          </div>

          {/* Vision & Mission */}
          <div className="grid md:grid-cols-2 gap-8 mb-16">
            {/* Vision */}
            <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-center mb-6">
                <Eye className="w-10 h-10 text-blue-600 dark:text-blue-400 mr-4" />
                <h3 className="text-3xl font-bold text-gray-900 dark:text-white">Our Vision</h3>
              </div>
              <p className="text-gray-800 dark:text-gray-200 leading-relaxed font-medium text-lg">
                To empower businesses worldwide with innovative digital solutions that drive growth, 
                enhance customer experiences, and create lasting impact in the digital economy.
              </p>
            </div>

            {/* Mission */}
            <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-center mb-6">
                <Target className="w-10 h-10 text-purple-600 dark:text-purple-400 mr-4" />
                <h3 className="text-3xl font-bold text-gray-900 dark:text-white">Our Mission</h3>
              </div>
              <p className="text-gray-800 dark:text-gray-200 leading-relaxed font-medium text-lg">
                To deliver exceptional digital experiences that combine creativity, technology, 
                and strategy to help our clients achieve their business objectives.
              </p>
            </div>
          </div>

          {/* Leadership Team */}
          <div>
            <h3 className="text-3xl font-bold text-gray-900 dark:text-white text-center mb-12">Our Leadership Team</h3>
            <div className="grid md:grid-cols-3 gap-8">
              {/* CEO Card */}
              <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 text-center group hover:scale-105 transition-transform duration-300">
                <div className="w-32 h-32 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-3xl mx-auto mb-6">
                  SB
                </div>
                <h4 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Shubham Badgujar</h4>
                <p className="text-blue-600 dark:text-blue-400 font-semibold text-lg mb-4">CEO & Founder</p>
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <Quote className="w-6 h-6 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
                  <p className="text-gray-700 dark:text-gray-300 italic font-medium">
                    "Innovation and excellence drive everything we do. Our mission is to transform businesses through digital solutions."
                  </p>
                </div>
              </div>

              {/* CTO Card */}
              <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 text-center group hover:scale-105 transition-transform duration-300">
                <div className="w-32 h-32 bg-gradient-to-r from-green-600 to-teal-600 rounded-full flex items-center justify-center text-white font-bold text-3xl mx-auto mb-6">
                  AR
                </div>
                <h4 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Alex Rodriguez</h4>
                <p className="text-green-600 dark:text-green-400 font-semibold text-lg mb-4">CTO</p>
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <Quote className="w-6 h-6 text-green-600 dark:text-green-400 mx-auto mb-2" />
                  <p className="text-gray-700 dark:text-gray-300 italic font-medium">
                    "Technology is the backbone of modern business. We build scalable solutions that grow with you."
                  </p>
                </div>
              </div>

              {/* CPO Card */}
              <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 text-center group hover:scale-105 transition-transform duration-300">
                <div className="w-32 h-32 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-white font-bold text-3xl mx-auto mb-6">
                  SM
                </div>
                <h4 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Sarah Martinez</h4>
                <p className="text-purple-600 dark:text-purple-400 font-semibold text-lg mb-4">CPO</p>
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <Quote className="w-6 h-6 text-purple-600 dark:text-purple-400 mx-auto mb-2" />
                  <p className="text-gray-700 dark:text-gray-300 italic font-medium">
                    "Great products start with understanding people. We create experiences that users love and businesses need."
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section ref={contactRef} className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Get In Touch
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Ready to transform your business? Let's discuss your project and create something amazing together.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-16 items-start">
            {/* Contact Form */}
            <div className="contact-form bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700">
              <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">Send us a Message</h3>
              <form className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      First Name *
                    </label>
                    <input
                      type="text"
                      required
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all duration-200"
                      placeholder="John"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      required
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all duration-200"
                      placeholder="Doe"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all duration-200"
                    placeholder="john@example.com"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all duration-200"
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Message *
                  </label>
                  <textarea
                    rows={6}
                    required
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all duration-200"
                    placeholder="Tell us about your project and how we can help you..."
                  ></textarea>
                </div>
                
                <button
                  type="submit"
                  className="w-full px-8 py-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all duration-200 flex items-center justify-center group shadow-lg hover:shadow-xl"
                >
                  Send Message
                  <Send className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </form>
            </div>

            {/* Contact Info */}
            <div className="space-y-8">
              <div>
                <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
                  Let's Start a Conversation
                </h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-lg">
                  We're here to help you achieve your business goals. Get in touch with us 
                  to discuss your project requirements and discover how we can transform your digital presence.
                </p>
              </div>

              <div className="space-y-6">
                <div className="flex items-start space-x-4 p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Mail className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Email Us</h4>
                    <p className="text-gray-600 dark:text-gray-300">contact@postifystudio.com</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">We'll respond within 24 hours</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4 p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Phone className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Call Us</h4>
                    <p className="text-gray-600 dark:text-gray-300">+1 (555) 123-4567</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Available Mon-Fri, 9AM-6PM EST</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4 p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
                  <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Visit Our Office</h4>
                    <p className="text-gray-600 dark:text-gray-300">
                      123 Business Avenue, Suite 100<br />
                      New York, NY 10001<br />
                      United States
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">By appointment only</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4 p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
                  <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Clock className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Business Hours</h4>
                    <p className="text-gray-600 dark:text-gray-300">
                      Monday - Friday: 9:00 AM - 6:00 PM EST<br />
                      Saturday: 10:00 AM - 4:00 PM EST<br />
                      Sunday: Closed
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            {/* Company Info */}
            <div className="md:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <Sparkles className="w-8 h-8 text-blue-400 animate-pulse" />
                <span className="text-2xl font-black bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent magical-text-glow">
                  Postify Studio
                </span>
              </div>
              <p className="text-gray-400 mb-6 max-w-md">
                Transforming businesses through innovative digital solutions, creative excellence, 
                and exceptional customer service.
              </p>
              
              {/* Social Media Icons */}
              <div className="flex space-x-4">
                <a 
                  href="https://instagram.com/postifystudio" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-gray-800 hover:bg-pink-600 rounded-lg flex items-center justify-center transition-all duration-300 hover:scale-110"
                  aria-label="Follow us on Instagram"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                  </svg>
                </a>
                
                <a 
                  href="https://linkedin.com/company/postifystudio" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-gray-800 hover:bg-blue-600 rounded-lg flex items-center justify-center transition-all duration-300 hover:scale-110"
                  aria-label="Connect with us on LinkedIn"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                  </svg>
                </a>
                
                <a 
                  href="https://facebook.com/postifystudio" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-gray-800 hover:bg-blue-500 rounded-lg flex items-center justify-center transition-all duration-300 hover:scale-110"
                  aria-label="Like us on Facebook"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                  </svg>
                </a>
              </div>
            </div>
            
            {/* Quick Links */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li>
                  <button
                    onClick={() => scrollToSection(heroRef, 'home')}
                    className="text-gray-400 hover:text-white transition-colors duration-200 cursor-pointer"
                  >
                    Home
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => scrollToSection(servicesRef, 'services')}
                    className="text-gray-400 hover:text-white transition-colors duration-200 cursor-pointer"
                  >
                    Services
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => scrollToSection(aboutRef, 'about')}
                    className="text-gray-400 hover:text-white transition-colors duration-200 cursor-pointer"
                  >
                    About
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => scrollToSection(contactRef, 'contact')}
                    className="text-gray-400 hover:text-white transition-colors duration-200 cursor-pointer"
                  >
                    Contact
                  </button>
                </li>
                <li>
                  <Link
                    to="/login"
                    className="text-gray-400 hover:text-white transition-colors duration-200"
                  >
                    Login
                  </Link>
                </li>
                <li>
                  <Link
                    to="/signup"
                    className="text-gray-400 hover:text-white transition-colors duration-200"
                  >
                    Sign Up
                  </Link>
                </li>
              </ul>
            </div>
            
            {/* Services */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Our Services</h3>
              <ul className="space-y-2">
                <li>
                  <span className="text-gray-400">Web Development</span>
                </li>
                <li>
                  <span className="text-gray-400">Digital Marketing</span>
                </li>
                <li>
                  <span className="text-gray-400">Brand Strategy</span>
                </li>
                <li>
                  <span className="text-gray-400">Content Creation</span>
                </li>
                <li>
                  <span className="text-gray-400">SEO Optimization</span>
                </li>
                <li>
                  <span className="text-gray-400">Social Media Management</span>
                </li>
              </ul>
            </div>
          </div>
          
          {/* Bottom Footer */}
          <div className="border-t border-gray-800 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-400 text-sm mb-4 md:mb-0">
                © 2025 Postify Studio. All rights reserved.
              </p>
              <div className="flex items-center space-x-4 text-sm text-gray-400">
                <span>CEO: Shubham Badgujar</span>
                <span>|</span>
                <a href="mailto:contact@postifystudio.com" className="hover:text-white transition-colors">
                  contact@postifystudio.com
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
