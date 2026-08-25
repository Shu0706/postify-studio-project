const express = require('express');
const { body } = require('express-validator');
const { auth } = require('../middlewares/auth');
const { handleValidationErrors } = require('../middlewares/validation');
const OpenAI = require('openai');

const router = express.Router();

// Initialize OpenAI client only if API key is provided
let openai = null;
if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your-openai-api-key-here') {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  });
  console.log('✅ OpenAI client initialized successfully');
} else {
  console.warn('⚠️  OpenAI API key not configured. AI features will be disabled.');
}

/**
 * @route   POST /api/ai/ask
 * @desc    Ask ChatGPT a question
 * @access  Private (Client only)
 */
router.post('/ask', 
  auth,
  [
    body('message')
      .isLength({ min: 1, max: 1000 })
      .withMessage('Message must be between 1 and 1000 characters')
      .trim(),
    body('context')
      .optional()
      .isLength({ max: 500 })
      .withMessage('Context must not exceed 500 characters')
      .trim()
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      // Check if OpenAI is available
      if (!openai) {
        return res.status(503).json({
          success: false,
          message: 'AI service is currently unavailable. Please contact support for assistance.'
        });
      }

      const { message, context } = req.body;
      
      // Check if user is a client
      if (req.user.role !== 'client') {
        return res.status(403).json({
          success: false,
          message: 'AI assistant is only available for clients'
        });
      }

      // Create system prompt for business context
      const systemPrompt = `You are an AI assistant for Postify Studio, a digital marketing agency that provides social media management, content creation, graphic design, and digital marketing services. 

Your role is to help clients with:
- Social media content ideas and strategies
- Marketing advice and best practices
- Creative suggestions for their campaigns
- General business growth tips
- Platform-specific content recommendations (Instagram, Facebook, Twitter, LinkedIn, TikTok)

Keep responses professional, helpful, and focused on digital marketing and business growth. If asked about topics outside of marketing/business, politely redirect to marketing-related topics.

${context ? `Additional context: ${context}` : ''}`;

      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: systemPrompt
          },
          {
            role: "user",
            content: message
          }
        ],
        max_tokens: 500,
        temperature: 0.7
      });

      const aiResponse = completion.choices[0].message.content;

      // Log the interaction for analytics
      console.log(`AI Query from client ${req.user.userId}: ${message.substring(0, 50)}...`);

      res.json({
        success: true,
        data: {
          response: aiResponse,
          timestamp: new Date().toISOString(),
          tokensUsed: completion.usage.total_tokens
        }
      });

    } catch (error) {
      console.error('OpenAI API Error:', error);
      
      if (error.code === 'insufficient_quota') {
        return res.status(503).json({
          success: false,
          message: 'AI service temporarily unavailable. Please try again later.'
        });
      }

      res.status(500).json({
        success: false,
        message: 'Failed to get AI response. Please try again.'
      });
    }
  }
);

/**
 * @route   POST /api/ai/suggestions
 * @desc    Get content suggestions for specific service types
 * @access  Private (Client only)
 */
router.post('/suggestions',
  auth,
  [
    body('serviceType')
      .isIn(['social_media', 'content_creation', 'graphic_design', 'seo', 'paid_ads'])
      .withMessage('Invalid service type'),
    body('industry')
      .optional()
      .isLength({ max: 100 })
      .withMessage('Industry must not exceed 100 characters')
      .trim(),
    body('tone')
      .optional()
      .isIn(['professional', 'casual', 'creative', 'formal', 'friendly'])
      .withMessage('Invalid tone')
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      // Check if OpenAI is available
      if (!openai) {
        return res.status(503).json({
          success: false,
          message: 'AI service is currently unavailable. Please contact support for assistance.'
        });
      }

      const { serviceType, industry, tone } = req.body;
      
      if (req.user.role !== 'client') {
        return res.status(403).json({
          success: false,
          message: 'AI suggestions are only available for clients'
        });
      }

      const servicePrompts = {
        social_media: `Generate 5 creative social media post ideas for ${industry || 'a business'}. Include platform-specific suggestions for Instagram, Facebook, and LinkedIn. Make the tone ${tone || 'professional'}.`,
        content_creation: `Suggest 5 blog post topics or content pieces for ${industry || 'a business'} that would engage their audience. Focus on ${tone || 'professional'} tone.`,
        graphic_design: `Provide 5 creative graphic design concepts for ${industry || 'a business'} including color schemes, design styles, and visual elements.`,
        seo: `Suggest 5 SEO content strategies for ${industry || 'a business'} including keyword ideas and content optimization tips.`,
        paid_ads: `Create 5 paid advertising campaign ideas for ${industry || 'a business'} with targeting suggestions and ad copy concepts.`
      };

      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are a digital marketing expert providing specific, actionable suggestions for businesses. Format your response as a numbered list with clear, implementable ideas."
          },
          {
            role: "user",
            content: servicePrompts[serviceType]
          }
        ],
        max_tokens: 600,
        temperature: 0.8
      });

      const suggestions = completion.choices[0].message.content;

      res.json({
        success: true,
        data: {
          suggestions,
          serviceType,
          industry: industry || 'general',
          tone: tone || 'professional',
          timestamp: new Date().toISOString()
        }
      });

    } catch (error) {
      console.error('OpenAI Suggestions Error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to generate suggestions. Please try again.'
      });
    }
  }
);

module.exports = router;
