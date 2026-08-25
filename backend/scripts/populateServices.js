const mongoose = require('mongoose');
const { Service, Admin } = require('../models');
require('dotenv').config();

console.log('🔧 Environment check:');
console.log('   - NODE_ENV:', process.env.NODE_ENV);
console.log('   - MONGODB_URI:', process.env.MONGODB_URI);

// Connect to MongoDB with options
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
});

const sampleServices = [
  {
    name: "Social Media Management",
    description: "Comprehensive social media management including content creation, posting, engagement, and analytics across all major platforms.",
    category: "social-media-management",
    pricing: {
      type: "package",
      basePrice: 999,
      currency: "USD",
      packages: [
        {
          name: "Basic",
          description: "Perfect for small businesses",
          price: 499,
          features: ["2 platforms", "8 posts/month", "Basic analytics", "Email support"],
          deliveryTime: 30
        },
        {
          name: "Professional",
          description: "Ideal for growing businesses",
          price: 999,
          features: ["4 platforms", "20 posts/month", "Advanced analytics", "Priority support", "Content strategy"],
          deliveryTime: 30
        },
        {
          name: "Enterprise",
          description: "For large organizations",
          price: 1999,
          features: ["All platforms", "Unlimited posts", "Custom reporting", "24/7 support", "Strategy consulting"],
          deliveryTime: 30
        }
      ]
    },
    features: [
      "Content strategy and calendar planning",
      "Professional graphic design",
      "Community management",
      "Performance analytics",
      "Paid social advertising",
      "Influencer outreach"
    ],
    requirements: [
      "Access to social media accounts",
      "Brand guidelines (if available)",
      "Content preferences",
      "Target audience information"
    ],
    deliverables: [
      "Monthly content calendar",
      "Custom graphics and visuals",
      "Monthly performance report",
      "Community management",
      "Strategy recommendations"
    ],
    estimatedDeliveryTime: 7,
    tags: ["social-media", "marketing", "content", "advertising"],
    isActive: true
  },
  {
    name: "Website Development",
    description: "Custom website development from concept to launch. Modern, responsive websites built with the latest technologies.",
    category: "web-development",
    pricing: {
      type: "package",
      basePrice: 2999,
      currency: "USD",
      packages: [
        {
          name: "Landing Page",
          description: "Single page website",
          price: 1499,
          features: ["Responsive design", "Contact form", "Basic SEO", "1 month support"],
          deliveryTime: 7
        },
        {
          name: "Business Website",
          description: "Multi-page business website",
          price: 2999,
          features: ["5-10 pages", "CMS integration", "SEO optimization", "3 months support"],
          deliveryTime: 14
        },
        {
          name: "E-commerce",
          description: "Full online store",
          price: 4999,
          features: ["Product catalog", "Payment integration", "Inventory management", "6 months support"],
          deliveryTime: 21
        }
      ]
    },
    features: [
      "Custom responsive design",
      "Modern UI/UX",
      "Fast loading speed",
      "SEO optimization",
      "Content Management System",
      "Mobile-first approach"
    ],
    requirements: [
      "Website goals and objectives",
      "Content and images",
      "Branding materials",
      "Hosting account access"
    ],
    deliverables: [
      "Fully functional website",
      "Source code",
      "Documentation",
      "Training materials",
      "Maintenance guide"
    ],
    estimatedDeliveryTime: 14,
    tags: ["website", "development", "responsive", "seo"],
    isActive: true
  },
  {
    name: "Content Writing",
    description: "Professional content writing services including blog posts, articles, website copy, and marketing materials.",
    category: "content-writing",
    pricing: {
      type: "package",
      basePrice: 299,
      currency: "USD",
      packages: [
        {
          name: "Blog Package",
          description: "Monthly blog content",
          price: 299,
          features: ["4 blog posts", "SEO optimization", "Meta descriptions", "2 revisions"],
          deliveryTime: 7
        },
        {
          name: "Website Copy",
          description: "Complete website content",
          price: 799,
          features: ["5-10 pages", "SEO optimization", "Call-to-action copy", "Unlimited revisions"],
          deliveryTime: 10
        },
        {
          name: "Content Strategy",
          description: "Comprehensive content plan",
          price: 1299,
          features: ["Content calendar", "Keyword research", "Content templates", "Strategy guide"],
          deliveryTime: 14
        }
      ]
    },
    features: [
      "SEO-optimized content",
      "Engaging storytelling",
      "Industry research",
      "Plagiarism-free content",
      "Multiple revisions",
      "Fast turnaround"
    ],
    requirements: [
      "Target audience information",
      "Content topics/themes",
      "Brand voice guidelines",
      "Keywords (if available)"
    ],
    deliverables: [
      "Well-researched articles",
      "Meta descriptions",
      "Image suggestions",
      "Content calendar",
      "SEO recommendations"
    ],
    estimatedDeliveryTime: 5,
    tags: ["content", "writing", "seo", "blog"],
    isActive: true
  },
  {
    name: "Graphic Design",
    description: "Creative graphic design services for branding, marketing materials, and digital assets.",
    category: "graphic-design",
    pricing: {
      type: "package",
      basePrice: 599,
      currency: "USD",
      packages: [
        {
          name: "Logo Design",
          description: "Professional logo creation",
          price: 399,
          features: ["3 concepts", "5 revisions", "Vector files", "Usage guide"],
          deliveryTime: 5
        },
        {
          name: "Brand Identity",
          description: "Complete brand package",
          price: 999,
          features: ["Logo", "Business cards", "Letterhead", "Brand guidelines"],
          deliveryTime: 10
        },
        {
          name: "Marketing Materials",
          description: "Full marketing suite",
          price: 1499,
          features: ["Brochures", "Flyers", "Social media templates", "Email templates"],
          deliveryTime: 14
        }
      ]
    },
    features: [
      "Custom creative design",
      "Multiple concept options",
      "High-resolution files",
      "Vector formats",
      "Print-ready files",
      "Brand consistency"
    ],
    requirements: [
      "Design brief",
      "Brand preferences",
      "Target audience info",
      "Reference materials"
    ],
    deliverables: [
      "High-resolution designs",
      "Vector files (AI, EPS)",
      "Print-ready PDFs",
      "Web-optimized images",
      "Source files"
    ],
    estimatedDeliveryTime: 7,
    tags: ["design", "graphics", "branding", "logo"],
    isActive: true
  },
  {
    name: "SEO Optimization",
    description: "Comprehensive SEO services to improve your website's search engine rankings and organic traffic.",
    category: "seo-optimization",
    pricing: {
      type: "package",
      basePrice: 899,
      currency: "USD",
      packages: [
        {
          name: "SEO Audit",
          description: "Complete website analysis",
          price: 299,
          features: ["Technical audit", "Keyword analysis", "Competitor research", "Action plan"],
          deliveryTime: 3
        },
        {
          name: "On-Page SEO",
          description: "Website optimization",
          price: 899,
          features: ["Page optimization", "Content optimization", "Technical fixes", "Monthly reporting"],
          deliveryTime: 14
        },
        {
          name: "Full SEO Campaign",
          description: "Complete SEO management",
          price: 1999,
          features: ["On-page optimization", "Link building", "Content creation", "Monthly reports"],
          deliveryTime: 30
        }
      ]
    },
    features: [
      "Keyword research",
      "On-page optimization",
      "Technical SEO",
      "Content optimization",
      "Link building",
      "Performance tracking"
    ],
    requirements: [
      "Website access",
      "Google Analytics access",
      "Target keywords",
      "Business goals"
    ],
    deliverables: [
      "SEO audit report",
      "Optimized content",
      "Technical improvements",
      "Monthly reports",
      "Keyword rankings"
    ],
    estimatedDeliveryTime: 14,
    tags: ["seo", "optimization", "ranking", "traffic"],
    isActive: true
  },
  {
    name: "Digital Marketing Campaign",
    description: "Complete digital marketing campaigns including PPC, social media advertising, and email marketing.",
    category: "digital-marketing",
    pricing: {
      type: "package",
      basePrice: 1599,
      currency: "USD",
      packages: [
        {
          name: "Starter Campaign",
          description: "Basic digital marketing",
          price: 799,
          features: ["Google Ads setup", "Social media ads", "Basic reporting", "1 month management"],
          deliveryTime: 7
        },
        {
          name: "Growth Campaign",
          description: "Advanced marketing strategy",
          price: 1599,
          features: ["Multi-platform advertising", "Email marketing", "Conversion tracking", "3 months management"],
          deliveryTime: 14
        },
        {
          name: "Enterprise Campaign",
          description: "Full-scale marketing solution",
          price: 2999,
          features: ["Comprehensive strategy", "All platforms", "Advanced analytics", "6 months management"],
          deliveryTime: 21
        }
      ]
    },
    features: [
      "Multi-platform advertising",
      "Conversion tracking",
      "Email marketing automation",
      "Social media management",
      "Performance optimization",
      "Detailed reporting"
    ],
    requirements: [
      "Marketing goals",
      "Target audience data",
      "Advertising budget",
      "Brand assets"
    ],
    deliverables: [
      "Campaign strategy",
      "Ad creatives",
      "Performance reports",
      "Optimization recommendations",
      "ROI analysis"
    ],
    estimatedDeliveryTime: 14,
    tags: ["marketing", "advertising", "ppc", "campaigns"],
    isActive: true
  },
  {
    name: "Brand Identity Design",
    description: "Complete brand identity development including logo, colors, typography, and brand guidelines.",
    category: "branding",
    pricing: {
      type: "package",
      basePrice: 1299,
      currency: "USD",
      packages: [
        {
          name: "Logo Only",
          description: "Professional logo design",
          price: 499,
          features: ["3 logo concepts", "5 revisions", "Vector files", "Color variations"],
          deliveryTime: 7
        },
        {
          name: "Basic Branding",
          description: "Logo and basic brand elements",
          price: 999,
          features: ["Logo design", "Color palette", "Typography", "Business card design"],
          deliveryTime: 10
        },
        {
          name: "Complete Brand Identity",
          description: "Full brand development",
          price: 1999,
          features: ["Logo design", "Brand guidelines", "Stationery design", "Marketing templates"],
          deliveryTime: 21
        }
      ]
    },
    features: [
      "Logo design and variations",
      "Color palette development",
      "Typography selection",
      "Brand guidelines",
      "Application examples",
      "Vector and raster files"
    ],
    requirements: [
      "Brand vision and values",
      "Target audience information",
      "Industry preferences",
      "Competitor analysis"
    ],
    deliverables: [
      "Logo files (multiple formats)",
      "Brand guidelines document",
      "Color palette with codes",
      "Typography specifications",
      "Usage examples"
    ],
    estimatedDeliveryTime: 14,
    tags: ["branding", "logo", "identity", "design"],
    isActive: true
  },
  {
    name: "Video Editing & Production",
    description: "Professional video editing and production services for marketing, training, and promotional content.",
    category: "video-editing",
    pricing: {
      type: "package",
      basePrice: 799,
      currency: "USD",
      packages: [
        {
          name: "Basic Edit",
          description: "Simple video editing",
          price: 299,
          features: ["Cut and trim", "Basic transitions", "Color correction", "Audio sync"],
          deliveryTime: 5
        },
        {
          name: "Professional Edit",
          description: "Advanced video production",
          price: 799,
          features: ["Advanced editing", "Motion graphics", "Sound design", "Color grading"],
          deliveryTime: 10
        },
        {
          name: "Commercial Production",
          description: "Full video production",
          price: 1599,
          features: ["Script writing", "Professional editing", "Animation", "Multiple formats"],
          deliveryTime: 14
        }
      ]
    },
    features: [
      "Professional video editing",
      "Motion graphics and animation",
      "Color correction and grading",
      "Audio enhancement",
      "Multiple format delivery",
      "Revision rounds included"
    ],
    requirements: [
      "Raw footage or materials",
      "Video objectives",
      "Target audience",
      "Brand guidelines"
    ],
    deliverables: [
      "Edited video files",
      "Multiple format exports",
      "Source project files",
      "Thumbnail designs",
      "Video optimization"
    ],
    estimatedDeliveryTime: 10,
    tags: ["video", "editing", "production", "animation"],
    isActive: true
  }
];

async function populateServices() {
  try {
    console.log('🌱 Starting to populate services...');
    
    // Find an admin user to set as creator
    const admin = await Admin.findOne();
    if (!admin) {
      console.log('❌ No admin user found. Please create an admin first.');
      process.exit(1);
    }
    
    // Clear existing services
    await Service.deleteMany({});
    console.log('🗑️  Cleared existing services');
    
    // Add createdBy to each service
    const servicesWithCreator = sampleServices.map(service => ({
      ...service,
      createdBy: admin._id
    }));
    
    // Insert services
    const createdServices = await Service.insertMany(servicesWithCreator);
    console.log(`✅ Successfully created ${createdServices.length} services:`);
    
    createdServices.forEach(service => {
      console.log(`   - ${service.name} (${service.category})`);
    });
    
    console.log('🎉 Services population completed!');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error populating services:', error);
    process.exit(1);
  }
}

// Connect to database and populate
mongoose.connection.once('open', () => {
  console.log('📊 Connected to MongoDB');
  populateServices();
});

mongoose.connection.on('error', (error) => {
  console.error('❌ MongoDB connection error:', error);
  process.exit(1);
});