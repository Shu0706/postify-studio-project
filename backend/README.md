# Postify Studio Backend

A comprehensive Node.js backend for a multi-role SaaS platform with role-based access control for Admin, Client, and Employee users.

## Features

- **JWT Authentication** with refresh tokens
- **Role-based Access Control** (Admin, Client, Employee)
- **File Upload** with Multer (local storage + Cloudinary support)
- **Real-time Chat** with Socket.IO
- **Email Notifications** with Nodemailer
- **MongoDB** with Mongoose ODM
- **Input Validation** with express-validator
- **Security** with Helmet, CORS, and rate limiting
- **Error Handling** with centralized error middleware
- **Logging** with Morgan

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcryptjs
- **File Upload**: Multer + Cloudinary
- **Real-time**: Socket.IO
- **Email**: Nodemailer
- **Validation**: express-validator
- **Security**: Helmet, CORS, express-rate-limit
- **Logging**: Morgan
- **Environment**: dotenv

## Project Structure

```
backend/
├── config/
│   ├── database.js          # MongoDB connection
│   └── cloudinary.js        # Cloudinary configuration
├── controllers/
│   ├── authController.js    # Authentication logic
│   ├── adminController.js   # Admin functionality
│   ├── clientController.js  # Client functionality
│   ├── employeeController.js # Employee functionality
│   ├── serviceController.js # Service management
│   ├── uploadController.js  # File upload handling
│   └── messageController.js # Chat functionality
├── middlewares/
│   ├── auth.js             # JWT auth & role-based access
│   ├── errorHandler.js     # Centralized error handling
│   └── validation.js       # Input validation schemas
├── models/
│   ├── User.js             # User base model
│   ├── Employee.js         # Employee profile
│   ├── Admin.js            # Admin profile
│   ├── Service.js          # Service offerings
│   ├── ServiceRequest.js   # Client service requests
│   ├── Assignment.js       # Task assignments
│   ├── Submission.js       # Work submissions
│   ├── Notification.js     # System notifications
│   ├── Message.js          # Chat messages
│   ├── File.js             # File metadata
│   ├── AnalyticsData.js    # Analytics tracking
│   └── index.js            # Model exports
├── routes/
│   ├── authRoutes.js       # Authentication endpoints
│   ├── adminRoutes.js      # Admin endpoints
│   ├── clientRoutes.js     # Client endpoints
│   ├── employeeRoutes.js   # Employee endpoints
│   ├── serviceRoutes.js    # Service endpoints
│   ├── uploadRoutes.js     # File upload endpoints
│   └── messageRoutes.js    # Chat endpoints
├── utils/
│   ├── helpers.js          # Utility functions
│   ├── mailer.js           # Email utilities
│   └── fileUpload.js       # File upload utilities
├── uploads/                # Local file storage
├── .env.example           # Environment variables template
├── .env                   # Environment variables
├── package.json           # Dependencies and scripts
└── server.js              # Application entry point
```

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Copy environment variables:
   ```bash
   cp .env.example .env
   ```

4. Update `.env` with your configuration:
   ```env
   NODE_ENV=development
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/postify-studio
   JWT_SECRET=your-super-secret-jwt-key
   JWT_REFRESH_SECRET=your-super-secret-refresh-key
   JWT_EXPIRE=7d
   JWT_REFRESH_EXPIRE=30d
   FRONTEND_URL=http://localhost:3000
   
   # Email Configuration
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password
   EMAIL_FROM=noreply@postifystudio.com
   
   # Cloudinary (Optional)
   CLOUDINARY_CLOUD_NAME=your-cloud-name
   CLOUDINARY_API_KEY=your-api-key
   CLOUDINARY_API_SECRET=your-api-secret
   ```

5. Start the server:
   ```bash
   # Development
   npm run dev
   
   # Production
   npm start
   ```

## API Endpoints

### Authentication (`/api/auth`)
- `POST /signup` - User registration
- `POST /login` - User login
- `POST /refresh` - Refresh access token
- `POST /logout` - User logout
- `GET /profile` - Get user profile
- `PUT /profile` - Update user profile
- `PUT /change-password` - Change password
- `POST /create-employee` - Create employee (Admin only)

### Admin (`/api/admin`)
- `GET /dashboard` - Admin dashboard data
- `GET /employees` - List employees
- `GET /employees/:id` - Get employee details
- `PUT /employees/:id` - Update employee
- `DELETE /employees/:id` - Deactivate employee
- `GET /clients` - List clients
- `GET /clients/:id` - Get client details
- `POST /assignments` - Assign task to employee
- `GET /assignments` - List assignments
- `PUT /assignments/:id` - Update assignment
- `GET /submissions` - List submissions
- `PUT /submissions/:id/review` - Review submission
- `GET /analytics` - Get analytics data
- `GET /notifications` - Get notifications
- `PUT /notifications/:id/read` - Mark notification as read
- `POST /notifications/bulk` - Send bulk notification

### Client (`/api/client`)
- `GET /dashboard` - Client dashboard
- `POST /service-requests` - Create service request
- `GET /service-requests` - List service requests
- `GET /service-requests/:id` - Get service request details
- `PUT /service-requests/:id` - Update service request
- `DELETE /service-requests/:id` - Cancel service request
- `GET /projects` - Compact list of service requests (projects) for client dashboard/projects page
- `GET /notifications` - Get notifications
- `PUT /notifications/:id/read` - Mark notification as read
- `GET /downloads` - Get downloadable files
- `GET /chat/conversations` - Get chat conversations
- `GET /chat/messages/:conversationId` - Get chat messages

### Employee (`/api/employee`)
- `GET /dashboard` - Employee dashboard
- `GET /tasks` - List assigned tasks
- `GET /tasks/:id` - Get task details
- `POST /submissions` - Submit work
- `GET /submissions` - List submissions
- `GET /submissions/:id` - Get submission details
- `PUT /submissions/:id` - Update submission
- `GET /profile` - Get profile
- `PUT /profile` - Update profile
- `GET /notifications` - Get notifications
- `PUT /notifications/:id/read` - Mark notification as read
- `GET /performance` - Get performance metrics
- `GET /chat/conversations` - Get chat conversations
- `GET /chat/messages/:conversationId` - Get chat messages

### Services (`/api/services`)
- `GET /` - List all services
- `GET /categories` - Get service categories
- `GET /featured` - Get featured services
- `GET /popular` - Get popular services
- `GET /:id` - Get service by ID
- `POST /` - Create service (Admin only)
- `PUT /:id` - Update service (Admin only)
- `DELETE /:id` - Delete service (Admin only)

### File Upload (`/api/upload`)
- `POST /single` - Upload single file
- `POST /multiple` - Upload multiple files
- `GET /my-files` - Get user's files
- `GET /:id` - Get file by ID
- `DELETE /:id` - Delete file
- `GET /admin/stats` - Get file statistics (Admin only)
- `GET /serve/:filename` - Serve static file

### Messages (`/api/messages`)
- `GET /conversations` - Get conversations
- `GET /conversation/:otherUserId` - Get messages with user
- `POST /send` - Send message
- `PUT /:messageId/read` - Mark message as read
- `PUT /conversation/:otherUserId/read` - Mark conversation as read
- `GET /unread-count` - Get unread message count
- `GET /search` - Search messages
- `DELETE /:messageId` - Delete message
- `GET /admin/stats` - Get chat statistics (Admin only)

## Database Models

### User
Base user model with authentication and profile information.

### Employee
Employee-specific data including department, skills, and performance metrics.

### Admin
Admin-specific data including permissions and department.

### Service
Service offerings with pricing, features, and delivery information.

### ServiceRequest
Client requests for services with status tracking.

### Assignment
Task assignments from admin to employees.

### Submission
Employee work submissions with review status.

### Notification
System notifications for all user types.

### Message
Chat messages between users.

### File
File metadata for uploads with access control.

### AnalyticsData
Analytics and reporting data.

## Authentication & Authorization

### JWT Tokens
- **Access Token**: Short-lived (7 days default)
- **Refresh Token**: Long-lived (30 days default)
- Automatic token refresh on expired access tokens

### Role-Based Access Control
- **Admin**: Full system access
- **Client**: Access to services, requests, and communication
- **Employee**: Access to assigned tasks and submissions

### Permissions
Fine-grained permissions within roles for specific actions.

## File Upload

### Local Storage
Files stored in `/uploads` directory with metadata in database.

### Cloudinary Integration
Optional cloud storage with automatic fallback to local storage.

### File Types
Support for images, documents, audio, and video files with type validation.

## Real-time Features

### Socket.IO
- Real-time chat messaging
- Live notifications
- Status updates

### Events
- `new-service-request` - A new client service request (admin room + fallback legacy name still optionally emitted elsewhere)
- `new-notification` - A new notification for an admin (personal room)
- `new-message-notification` - A chat message summary for recipient
- `receive-message` - Full chat message inside a conversation room
- `user-online` / `user-offline` - Presence updates
- `user-typing` / `user-stopped-typing` - Typing indicators

Legacy (still may appear in older code / transitional listeners): `newServiceRequest`, `adminNotification`.

## Error Handling

### Centralized Error Middleware
- Consistent error responses
- Logging for debugging
- Environment-specific error details

### Validation Errors
- Input validation with express-validator
- Detailed error messages
- Field-specific error reporting

## Security

### Security Measures
- **Helmet**: Security headers
- **CORS**: Cross-origin resource sharing
- **Rate Limiting**: Request limiting per IP
- **Input Validation**: All inputs validated
- **Password Hashing**: bcrypt with salt rounds
- **JWT Security**: Secure token generation and validation

## Email System

### Nodemailer Integration
- Welcome emails
- Task assignment notifications
- Submission review notifications
- Password reset emails

### Email Templates
- HTML templates for better presentation
- Dynamic content insertion
- Responsive design

## Environment Variables

### Required Variables
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/postify-studio
JWT_SECRET=your-jwt-secret
JWT_REFRESH_SECRET=your-refresh-secret
FRONTEND_URL=http://localhost:3000
```

### Optional Variables
```env
# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-password
EMAIL_FROM=noreply@postifystudio.com

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

## Development

### Scripts
```bash
npm start          # Start production server
npm run dev        # Start development server with nodemon
npm test           # Run tests (if configured)
```

### Code Structure
- **Controllers**: Business logic and request handling
- **Middlewares**: Authentication, validation, error handling
- **Models**: Database schemas and methods
- **Routes**: API endpoint definitions
- **Utils**: Helper functions and utilities

## Deployment

### Production Setup
1. Set `NODE_ENV=production`
2. Use production MongoDB instance
3. Configure proper CORS origins
4. Set up environment variables
5. Use process manager (PM2)
6. Configure reverse proxy (Nginx)

### Docker Support
The application is Docker-ready with proper environment configuration.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License.

## Support

For support, please contact the development team or create an issue in the repository.
