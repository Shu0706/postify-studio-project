import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Star, Heart, Users, Target, Award, Eye, Zap, Globe, Lightbulb, Rocket, Shield } from 'lucide-react';
import { fadeIn, stagger, scaleIn } from '../../utils/motionVariants';

const AboutPage = () => {
  const teamMembers = [
    {
      name: "Alexandra Chen",
      role: "Creative Director",
      image: "/api/placeholder/300/300",
      bio: "A visionary artist with over 8 years of experience in digital design and brand storytelling.",
      specialties: ["Brand Identity", "Visual Strategy", "Creative Direction"],
      status: "active"
    },
    {
      name: "Marcus Rivera",
      role: "Lead Designer",
      image: "/api/placeholder/300/300",
      bio: "Master of visual aesthetics with a passion for creating designs that speak to the soul.",
      specialties: ["UI/UX Design", "Motion Graphics", "Brand Development"],
      status: "busy"
    },
    {
      name: "Sofia Andersson",
      role: "Social Media Strategist",
      image: "/api/placeholder/300/300",
      bio: "Digital native who understands the pulse of social media and how to make content viral.",
      specialties: ["Content Strategy", "Social Analytics", "Trend Analysis"],
      status: "active"
    }
  ];

  const values = [
    {
      icon: <Heart className="w-8 h-8" />,
      title: "Passion-Driven",
      description: "We pour our hearts into every project, treating your brand as our own masterpiece."
    },
    {
      icon: <Star className="w-8 h-8" />,
      title: "Excellence First",
      description: "Quality isn't negotiable. We deliver nothing less than stellar work every single time."
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Collaborative Spirit",
      description: "Your vision combined with our expertise creates magic that transforms businesses."
    },
    {
      icon: <Target className="w-8 h-8" />,
      title: "Results-Focused",
      description: "Beautiful design means nothing without impact. We create art that drives real results."
    }
  ];

  const achievements = [
    {
      icon: <Award className="w-6 h-6" />,
      text: "500+ Projects",
      desc: "Successfully completed"
    },
    {
      icon: <Users className="w-6 h-6" />,
      text: "200+ Clients",
      desc: "Worldwide satisfaction"
    },
    {
      icon: <Star className="w-6 h-6" />,
      text: "98% Rating",
      desc: "Client satisfaction"
    },
    {
      icon: <Globe className="w-6 h-6" />,
      text: "25+ Countries",
      desc: "Global reach"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50 overflow-hidden">
      {/* Magical Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute top-40 right-10 w-96 h-96 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-96 h-96 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-4000"></div>
        
        {/* Floating particles */}
        <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full animate-float"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 4}s`,
                animationDuration: `${4 + Math.random() * 4}s`
              }}
            />
          ))}
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative pt-20 pb-16 md:pt-32 md:pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-96 h-96 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 rounded-full blur-3xl opacity-20 animate-pulse"></div>
            </div>
            
            <h1 className="relative text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 mb-6 animate-shimmer">
              About{' '}
              <span className="relative inline-block">
                <span className="relative z-10 font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 drop-shadow-2xl animate-glow">
                  Postify Studio
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 blur-xl opacity-30 animate-pulse"></div>
              </span>
            </h1>
            
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed"
            >
              Where creativity meets technology to forge digital masterpieces that captivate, inspire, and transform businesses into legendary brands.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 md:py-24 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center"
          >
            <motion.div variants={fadeIn} className="relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur opacity-20"></div>
              <div className="relative bg-white p-8 rounded-2xl shadow-2xl border border-purple-100">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center mb-6">
                  <Rocket className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-3xl font-bold text-gray-900 mb-6">Our Mission</h3>
                <p className="text-lg text-gray-600 leading-relaxed">
                  To democratize exceptional design and empower businesses of all sizes to tell their stories through visually stunning, strategically crafted content that drives real growth and meaningful connections.
                </p>
              </div>
            </motion.div>

            <motion.div variants={fadeIn} className="relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl blur opacity-20"></div>
              <div className="relative bg-white p-8 rounded-2xl shadow-2xl border border-blue-100">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl flex items-center justify-center mb-6">
                  <Eye className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-3xl font-bold text-gray-900 mb-6">Our Vision</h3>
                <p className="text-lg text-gray-600 leading-relaxed">
                  To become the world's most trusted creative partner, where innovation meets artistry, and every project becomes a testament to the transformative power of exceptional design.
                </p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-purple-900 via-pink-900 to-blue-900 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-purple-600/20 to-pink-600/20 animate-pulse"></div>
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full animate-twinkle"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`
              }}
            />
          ))}
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-black text-white mb-6">
              Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400 animate-shimmer">Core Values</span>
            </h2>
            <p className="text-xl text-white/80 max-w-3xl mx-auto">
              The principles that guide every decision, every design, and every relationship we build.
            </p>
          </motion.div>

          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {values.map((value, index) => (
              <motion.div
                key={index}
                variants={scaleIn}
                className="group relative p-8 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-all duration-300"
                whileHover={{ y: -10, scale: 1.02 }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative">
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-400 to-pink-400 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    {value.icon}
                  </div>
                  <h4 className="text-xl font-bold text-white mb-4">{value.title}</h4>
                  <p className="text-white/80 leading-relaxed">{value.description}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 md:py-24 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 mb-6 animate-shimmer">
              Meet Our Creative Wizards
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              The magical minds behind every extraordinary creation, dedicated to bringing your wildest visions to life.
            </p>
          </motion.div>

          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {teamMembers.map((member, index) => (
              <motion.div
                key={index}
                variants={fadeIn}
                className="group relative"
                whileHover={{ y: -10 }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 rounded-3xl blur opacity-20 group-hover:opacity-40 transition-all duration-300"></div>
                <div className="relative bg-white p-8 rounded-3xl shadow-xl border border-purple-100 group-hover:shadow-2xl transition-all duration-300">
                  <div className="relative mb-6">
                    <div className="w-24 h-24 mx-auto bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white text-2xl font-bold group-hover:scale-110 transition-transform duration-300">
                      {member.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className={`absolute top-0 right-8 w-4 h-4 rounded-full ${member.status === 'active' ? 'bg-green-400' : 'bg-yellow-400'} animate-pulse`}></div>
                  </div>
                  
                  <h4 className="text-xl font-bold text-gray-900 mb-2 text-center">{member.name}</h4>
                  <p className="text-purple-600 font-semibold mb-4 text-center">{member.role}</p>
                  <p className="text-gray-600 text-sm leading-relaxed mb-4">{member.bio}</p>
                  
                  <div className="flex flex-wrap gap-2 justify-center">
                    {member.specialties.map((specialty, idx) => (
                      <span key={idx} className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                        {specialty}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Achievements Section */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
        <div className="absolute inset-0">
          {[...Array(30)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-white rounded-full animate-float opacity-20"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 4}s`,
                animationDuration: `${6 + Math.random() * 4}s`
              }}
            />
          ))}
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-black text-white mb-6">
              Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400 animate-shimmer">Achievements</span>
            </h2>
            <p className="text-xl text-white/80 max-w-3xl mx-auto">
              Numbers that tell the story of our journey and the trust our clients place in us.
            </p>
          </motion.div>

          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-4 gap-8"
          >
            {achievements.map((item, index) => (
              <motion.div
                key={index}
                variants={scaleIn}
                className="group text-center p-6 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-all duration-300"
                whileHover={{ y: -10 }}
              >
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/20 flex items-center justify-center text-white group-hover:bg-white group-hover:text-purple-700 transition-all duration-300">
                  {item.icon}
                </div>
                <h4 className="text-lg font-bold text-white mb-1">{item.text}</h4>
                <p className="text-sm text-white/80">{item.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-primary">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl blur-2xl opacity-20"></div>
            <div className="relative bg-white p-12 rounded-3xl shadow-2xl">
              <h2 className="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 mb-6">
                Ready to Create Magic Together?
              </h2>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Join hundreds of businesses who've transformed their brands with our creative expertise.
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 group"
              >
                Start Your Journey
                <Sparkles className="inline-block ml-2 w-5 h-5 group-hover:animate-spin" />
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
