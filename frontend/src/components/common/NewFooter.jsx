import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Sparkles, 
  Mail, 
  Phone, 
  MapPin, 
  Twitter, 
  Facebook, 
  Instagram, 
  Linkedin,
  ArrowRight,
  Heart
} from 'lucide-react';

const NewFooter = () => {
  const currentYear = new Date().getFullYear();

  const footerSections = [
    {
      title: 'Company',
      links: [
        { name: 'About Us', href: '/about' },
        { name: 'Our Services', href: '/services' },
        { name: 'Contact', href: '/contact' },
        { name: 'Careers', href: '/careers' }
      ]
    },
    {
      title: 'Services',
      links: [
        { name: 'Web Development', href: '/services/web' },
        { name: 'Mobile Apps', href: '/services/mobile' },
        { name: 'Design', href: '/services/design' },
        { name: 'Consulting', href: '/services/consulting' }
      ]
    },
    {
      title: 'Support',
      links: [
        { name: 'Help Center', href: '/help' },
        { name: 'Documentation', href: '/docs' },
        { name: 'Community', href: '/community' },
        { name: 'Status', href: '/status' }
      ]
    },
    {
      title: 'Legal',
      links: [
        { name: 'Privacy Policy', href: '/privacy' },
        { name: 'Terms of Service', href: '/terms' },
        { name: 'Cookie Policy', href: '/cookies' },
        { name: 'GDPR', href: '/gdpr' }
      ]
    }
  ];

  const socialLinks = [
    { name: 'Twitter', icon: <Twitter className="w-5 h-5" />, href: '#' },
    { name: 'Facebook', icon: <Facebook className="w-5 h-5" />, href: '#' },
    { name: 'Instagram', icon: <Instagram className="w-5 h-5" />, href: '#' },
    { name: 'LinkedIn', icon: <Linkedin className="w-5 h-5" />, href: '#' }
  ];

  const contactInfo = [
    { icon: <Mail className="w-5 h-5" />, text: 'hello@postifystudio.com' },
    { icon: <Phone className="w-5 h-5" />, text: '+1 (555) 123-4567' },
    { icon: <MapPin className="w-5 h-5" />, text: 'New York, NY 10001' }
  ];

  return (
    <footer className="bg-black text-white relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-10 left-10 w-32 h-32 bg-primary-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-20 w-40 h-40 bg-secondary-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 w-24 h-24 bg-accent-500/10 rounded-full blur-2xl" />
      </div>

      {/* Main Footer Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        {/* Top Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-16">
          {/* Brand Section */}
          <div className="lg:col-span-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <Link to="/" className="flex items-center gap-3 mb-6 group">
                <div className="w-12 h-12 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-2xl flex items-center justify-center transform transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <span className="text-3xl font-black text-white group-hover:text-primary-400 transition-colors">
                  PostifyStudio
                </span>
              </Link>
              
              <p className="text-lg text-neutral-300 mb-8 leading-relaxed">
                Transforming ideas into digital reality with cutting-edge solutions, 
                exceptional design, and unmatched performance.
              </p>

              {/* Contact Info */}
              <div className="space-y-4">
                {contactInfo.map((item, index) => (
                  <div key={index} className="flex items-center gap-3 text-neutral-300 hover:text-primary-400 transition-colors">
                    <div className="w-10 h-10 bg-neutral-800 rounded-xl flex items-center justify-center">
                      {item.icon}
                    </div>
                    <span className="font-medium">{item.text}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Links Sections */}
          <div className="lg:col-span-8 grid grid-cols-2 md:grid-cols-4 gap-8">
            {footerSections.map((section, sectionIndex) => (
              <motion.div
                key={section.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: sectionIndex * 0.1 }}
                viewport={{ once: true }}
              >
                <h3 className="text-xl font-black text-white mb-6 uppercase tracking-wider">
                  {section.title}
                </h3>
                <ul className="space-y-3">
                  {section.links.map((link) => (
                    <li key={link.name}>
                      <Link
                        to={link.href}
                        className="text-neutral-300 hover:text-primary-400 transition-colors duration-300 font-medium group flex items-center gap-2"
                      >
                        {link.name}
                        <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Newsletter Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="bg-gradient-to-r from-primary-500/10 to-secondary-500/10 rounded-2xl p-8 mb-16 border border-primary-500/20"
        >
          <div className="max-w-2xl mx-auto text-center">
            <h3 className="text-3xl font-black text-white mb-4">
              STAY IN THE LOOP
            </h3>
            <p className="text-neutral-300 mb-8 text-lg">
              Get the latest updates, exclusive offers, and insider insights delivered to your inbox.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email..."
                className="flex-1 input-neon"
              />
              <button className="btn-brutal px-8 py-3 whitespace-nowrap">
                SUBSCRIBE
              </button>
            </div>
          </div>
        </motion.div>

        {/* Bottom Section */}
        <div className="border-t-2 border-neutral-800 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-neutral-300 text-center md:text-left">
              <p className="font-medium">
                © {currentYear} Postify Studio. All rights reserved.
              </p>
              <p className="text-sm flex items-center justify-center md:justify-start gap-1 mt-1">
                Made with <Heart className="w-4 h-4 text-red-500 animate-pulse" /> by the Postify Studio team
              </p>
            </div>

            {/* Social Links */}
            <div className="flex items-center gap-4">
              <span className="text-neutral-400 font-semibold uppercase tracking-wider text-sm">
                Follow Us:
              </span>
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  className="w-12 h-12 bg-neutral-800 hover:bg-primary-500 rounded-xl flex items-center justify-center text-neutral-300 hover:text-white transition-all duration-300 hover:scale-110 hover:shadow-glow"
                  aria-label={social.name}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default NewFooter;
