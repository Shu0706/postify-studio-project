import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const ServicesPage = () => {
  // State for active service tab
  const [activeTab, setActiveTab] = useState('social');

  // Animation variants
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6 }
    }
  };

  // Services data
  const services = [
    {
      id: 'social',
      title: 'Social Media Management',
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      ),
      description: "Boost your online presence with strategic social media management. We handle content creation, community engagement, and analytics to grow your audience and drive conversions.",
      features: [
        "Content strategy and calendar planning",
        "Regular posting across platforms",
        "Community management and engagement",
        "Performance analytics and reporting",
        "Paid social media advertising",
        "Influencer partnership management"
      ],
      image: "social-media-service.jpg"
    },
    {
      id: 'web',
      title: 'Website Development',
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
        </svg>
      ),
      description: "Create a stunning, functional website that converts visitors into customers. Our development team builds custom websites that are responsive, fast, and optimized for search engines.",
      features: [
        "Custom design and development",
        "Responsive for all devices",
        "E-commerce functionality",
        "Content Management Systems",
        "SEO optimization",
        "Website maintenance and support"
      ],
      image: "web-development-service.jpg"
    },
    {
      id: 'content',
      title: 'Content Writing',
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      ),
      description: "Engage your audience with compelling, SEO-optimized content. Our writers create blog posts, articles, website copy, and more to tell your brand story and drive traffic.",
      features: [
        "Blog posts and articles",
        "Website copy and landing pages",
        "Email newsletters",
        "Product descriptions",
        "SEO content strategy",
        "Ghostwriting services"
      ],
      image: "content-writing-service.jpg"
    },
    {
      id: 'design',
      title: 'Graphic Design',
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      description: "Make your brand stand out with eye-catching visuals. Our designers create logos, marketing materials, social media graphics, and more to strengthen your brand identity.",
      features: [
        "Logo and brand identity design",
        "Social media graphics",
        "Marketing materials",
        "Packaging design",
        "UI/UX design for web and mobile",
        "Illustration and infographics"
      ],
      image: "graphic-design-service.jpg"
    }
  ];

  // Find active service
  const activeService = services.find(service => service.id === activeTab);

  return (
    <div className="bg-white dark:bg-gray-900">
      {/* Hero Section */}
      <section className="relative py-20 md:py-28 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="max-w-4xl mx-auto text-center"
            initial="hidden"
            animate="visible"
            variants={fadeIn}
          >
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Our Services
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
              Comprehensive digital solutions to help your business thrive online.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Services Tabs */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Tabs */}
          <div className="flex flex-wrap justify-center mb-12">
            <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-1 flex flex-wrap">
              {services.map(service => (
                <button
                  key={service.id}
                  onClick={() => setActiveTab(service.id)}
                  className={`px-4 py-2 md:px-6 md:py-3 rounded-md transition-colors flex items-center ${
                    activeTab === service.id
                      ? 'bg-white dark:bg-gray-700 text-primary shadow-sm'
                      : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <span className="mr-2">{service.icon}</span>
                  <span className="hidden md:inline">{service.title}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Active Service Content */}
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="grid md:grid-cols-2 gap-12 items-center"
          >
            <div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                {activeService.title}
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                {activeService.description}
              </p>
              <ul className="space-y-3 mb-8">
                {activeService.features.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <svg className="h-6 w-6 text-primary mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                  </li>
                ))}
              </ul>
              <Link
                to={`/login`}
                className="btn-primary inline-block"
              >
                Get Started
              </Link>
            </div>
            <div className="bg-gray-200 dark:bg-gray-700 aspect-video rounded-lg shadow-lg flex items-center justify-center">
              <span className="text-gray-500 dark:text-gray-400">Service Image Placeholder</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-16 md:py-24 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="max-w-3xl mx-auto text-center mb-16"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Our Process
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              How we work with you to deliver exceptional results
            </p>
          </motion.div>

          <div className="grid md:grid-cols-4 gap-8">
            {/* Step 1 */}
            <motion.div 
              className="relative"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center text-xl font-bold mb-4 z-10 relative">
                1
              </div>
              <div className="hidden md:block absolute top-6 left-12 w-full h-0.5 bg-gray-300 dark:bg-gray-700 -z-10"></div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Discovery</h3>
              <p className="text-gray-600 dark:text-gray-300">
                We learn about your business, goals, and challenges through in-depth consultation.
              </p>
            </motion.div>

            {/* Step 2 */}
            <motion.div 
              className="relative"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center text-xl font-bold mb-4 z-10 relative">
                2
              </div>
              <div className="hidden md:block absolute top-6 left-12 w-full h-0.5 bg-gray-300 dark:bg-gray-700 -z-10"></div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Strategy</h3>
              <p className="text-gray-600 dark:text-gray-300">
                We develop a tailored plan based on your unique needs and industry insights.
              </p>
            </motion.div>

            {/* Step 3 */}
            <motion.div 
              className="relative"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
            >
              <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center text-xl font-bold mb-4 z-10 relative">
                3
              </div>
              <div className="hidden md:block absolute top-6 left-12 w-full h-0.5 bg-gray-300 dark:bg-gray-700 -z-10"></div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Implementation</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Our team executes the strategy with regular updates and collaboration.
              </p>
            </motion.div>

            {/* Step 4 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
            >
              <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center text-xl font-bold mb-4">
                4
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Results & Refinement</h3>
              <p className="text-gray-600 dark:text-gray-300">
                We measure success, provide detailed reporting, and continuously optimize.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="max-w-3xl mx-auto text-center mb-16"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Flexible Pricing
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Choose the plan that works best for your business
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Basic Plan */}
            <motion.div 
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden border border-gray-200 dark:border-gray-700"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">Basic</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">For small businesses</p>
                <div className="flex items-baseline">
                  <span className="text-4xl font-bold text-gray-900 dark:text-white">$499</span>
                  <span className="text-gray-600 dark:text-gray-300 ml-2">/month</span>
                </div>
              </div>
              <div className="p-6">
                <ul className="space-y-3 mb-6">
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-primary mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-600 dark:text-gray-300">2 social media platforms</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-primary mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-600 dark:text-gray-300">8 posts per month</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-primary mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-600 dark:text-gray-300">Basic analytics</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-primary mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-600 dark:text-gray-300">Email support</span>
                  </li>
                </ul>
                <Link
                  to="/login"
                  className="block w-full py-2 px-4 text-center bg-white border border-primary text-primary hover:bg-primary/5 rounded-md font-medium transition-colors"
                >
                  Get Started
                </Link>
              </div>
            </motion.div>

            {/* Pro Plan */}
            <motion.div 
              className="bg-white dark:bg-gray-800 rounded-lg shadow-xl overflow-hidden border-2 border-primary transform scale-105 z-10"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <div className="bg-primary text-white text-center py-2 text-sm font-semibold">
                MOST POPULAR
              </div>
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">Professional</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">For growing businesses</p>
                <div className="flex items-baseline">
                  <span className="text-4xl font-bold text-gray-900 dark:text-white">$999</span>
                  <span className="text-gray-600 dark:text-gray-300 ml-2">/month</span>
                </div>
              </div>
              <div className="p-6">
                <ul className="space-y-3 mb-6">
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-primary mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-600 dark:text-gray-300">4 social media platforms</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-primary mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-600 dark:text-gray-300">20 posts per month</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-primary mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-600 dark:text-gray-300">Advanced analytics</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-primary mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-600 dark:text-gray-300">Priority support</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-primary mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-600 dark:text-gray-300">Content strategy</span>
                  </li>
                </ul>
                <Link
                  to="/login"
                  className="block w-full py-2 px-4 text-center bg-primary text-white hover:bg-blue-600 rounded-md font-medium transition-colors"
                >
                  Get Started
                </Link>
              </div>
            </motion.div>

            {/* Enterprise Plan */}
            <motion.div 
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden border border-gray-200 dark:border-gray-700"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
            >
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">Enterprise</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">For large organizations</p>
                <div className="flex items-baseline">
                  <span className="text-4xl font-bold text-gray-900 dark:text-white">$1,999</span>
                  <span className="text-gray-600 dark:text-gray-300 ml-2">/month</span>
                </div>
              </div>
              <div className="p-6">
                <ul className="space-y-3 mb-6">
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-primary mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-600 dark:text-gray-300">All social platforms</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-primary mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-600 dark:text-gray-300">Unlimited posts</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-primary mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-600 dark:text-gray-300">Custom reporting</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-primary mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-600 dark:text-gray-300">24/7 dedicated support</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-primary mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-600 dark:text-gray-300">Strategy consulting</span>
                  </li>
                </ul>
                <Link
                  to="/login"
                  className="block w-full py-2 px-4 text-center bg-white border border-primary text-primary hover:bg-primary/5 rounded-md font-medium transition-colors"
                >
                  Contact Sales
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-primary">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="max-w-3xl mx-auto text-center text-white"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl font-bold mb-6">
              Ready to Transform Your Digital Presence?
            </h2>
            <p className="text-xl mb-8">
              Let's create something amazing together.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/contact"
                className="bg-white text-primary hover:bg-gray-100 font-medium py-3 px-8 rounded-md transition-colors"
              >
                Contact Us
              </Link>
              <Link
                to="/signup"
                className="bg-transparent border border-white text-white hover:bg-white/10 font-medium py-3 px-8 rounded-md transition-colors"
              >
                Sign Up Now
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default ServicesPage;
