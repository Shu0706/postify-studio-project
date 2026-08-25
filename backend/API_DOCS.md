# Postify Studio API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication

All protected endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## Response Format

All API responses follow this structure:
```json
{
  "success": true|false,
  "message": "Response message",
  "data": {...}, // Response data (if any)
  "error": {...} // Error details (if any)
}
```

## Endpoints Overview

### Authentication Endpoints

#### POST /auth/signup
Register a new user (client).
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "Password123",
  "phone": "+1234567890",
  "company": "Company Name"
}
```

#### POST /auth/login
Login user.
```json
{
  "email": "john@example.com",
  "password": "Password123"
}
```

#### POST /auth/refresh
Refresh access token.
```json
{
  "refreshToken": "your-refresh-token"
}
```

#### POST /auth/logout
Logout user (requires authentication).

#### GET /auth/profile
Get user profile (requires authentication).

#### PUT /auth/profile
Update user profile (requires authentication).
```json
{
  "firstName": "John",
  "lastName": "Doe Updated",
  "phone": "+1234567890",
  "company": "New Company"
}
```

#### PUT /auth/change-password
Change user password (requires authentication).
```json
{
  "currentPassword": "oldPassword",
  "newPassword": "newPassword123"
}
```

#### POST /auth/create-employee
Create employee account (Admin only).
```json
{
  "firstName": "Jane",
  "lastName": "Smith",
  "email": "jane@example.com",
  "password": "Password123",
  "department": "Development",
  "position": "Senior Developer",
  "skills": ["JavaScript", "Node.js", "React"],
  "hourlyRate": 50
}
```

### Admin Endpoints (Require Admin Role)

#### GET /admin/dashboard
Get admin dashboard data.

#### GET /admin/employees
List all employees.
Query parameters:
- `page` (default: 1)
- `limit` (default: 10)
- `search` (search by name/email)
- `department` (filter by department)
- `status` (active/inactive)
- `sortBy` (default: createdAt)
- `sortOrder` (asc/desc)

#### GET /admin/employees/:id
Get employee details by ID.

#### PUT /admin/employees/:id
Update employee information.
```json
{
  "name": "Updated Name",
  "department": "New Department",
  "position": "New Position",
  "skills": ["Updated", "Skills"],
  "hourlyRate": 60,
  "isActive": true
}
```

#### DELETE /admin/employees/:id
Deactivate employee.

#### GET /admin/clients
List all clients.
Query parameters: Similar to employees endpoint.

#### GET /admin/clients/:id
Get client details by ID.

#### POST /admin/assignments
Assign task to employee.
```json
{
  "serviceRequestId": "service-request-id",
  "employeeId": "employee-id",
  "priority": "high",
  "deadline": "2024-01-31T23:59:59.000Z",
  "instructions": "Detailed instructions for the task"
}
```

#### GET /admin/assignments
List all assignments.
Query parameters:
- `status` (assigned/in_progress/completed)
- `employeeId`
- `priority` (low/medium/high/urgent)

#### PUT /admin/assignments/:id
Update assignment.

#### GET /admin/submissions
List all submissions.
Query parameters:
- `status` (pending/approved/rejected/needs_revision)
- `employeeId`

#### PUT /admin/submissions/:id/review
Review submission.
```json
{
  "status": "approved",
  "feedback": "Great work!",
  "rating": 5
}
```

#### GET /admin/analytics
Get analytics data.
Query parameters:
- `period` (7d/30d/90d)
- `startDate`
- `endDate`

#### GET /admin/notifications
Get admin notifications.

#### PUT /admin/notifications/:id/read
Mark notification as read.

#### POST /admin/notifications/bulk
Send bulk notification.
```json
{
  "title": "System Maintenance",
  "message": "System will be down for maintenance",
  "type": "announcement",
  "recipients": {
    "type": "all" // or "role" or "specific"
  },
  "sendEmail": true
}
```

### Client Endpoints (Require Client Role)

#### GET /client/dashboard
Get client dashboard data.

#### POST /client/service-requests
Create service request.
```json
{
  "serviceId": "service-id",
  "title": "Custom Website Development",
  "description": "Need a custom website for my business",
  "requirements": "Responsive design, contact form, SEO optimized",
  "budget": 2000,
  "deadline": "2024-02-15T23:59:59.000Z",
  "priority": "high"
}
```

#### GET /client/service-requests
List client's service requests.

#### GET /client/service-requests/:id
Get service request details.

#### PUT /client/service-requests/:id
Update service request.

#### DELETE /client/service-requests/:id
Cancel service request.

#### GET /client/notifications
Get client notifications.

#### PUT /client/notifications/:id/read
Mark notification as read.

#### GET /client/downloads
Get downloadable files.

#### GET /client/chat/conversations
Get chat conversations.

#### GET /client/chat/messages/:conversationId
Get chat messages.

### Employee Endpoints (Require Employee Role)

#### GET /employee/dashboard
Get employee dashboard data.

#### GET /employee/tasks
List assigned tasks.

#### GET /employee/tasks/:id
Get task details.

#### POST /employee/submissions
Submit work.
```json
{
  "assignmentId": "assignment-id",
  "description": "Work completed as requested",
  "deliverables": ["file-id-1", "file-id-2"],
  "notes": "Additional notes about the submission"
}
```

#### GET /employee/submissions
List employee submissions.

#### GET /employee/submissions/:id
Get submission details.

#### PUT /employee/submissions/:id
Update submission.

#### GET /employee/profile
Get employee profile.

#### PUT /employee/profile
Update employee profile.

#### GET /employee/notifications
Get employee notifications.

#### PUT /employee/notifications/:id/read
Mark notification as read.

#### GET /employee/performance
Get performance metrics.

#### GET /employee/chat/conversations
Get chat conversations.

#### GET /employee/chat/messages/:conversationId
Get chat messages.

### Service Endpoints (Public/Protected)

#### GET /services
List all services (public).
Query parameters:
- `page`
- `limit`
- `category`
- `search`
- `sortBy`
- `sortOrder`

#### GET /services/categories
Get service categories (public).

#### GET /services/featured
Get featured services (public).

#### GET /services/popular
Get popular services (public).

#### GET /services/:id
Get service by ID (public).

#### POST /services
Create service (Admin only).
```json
{
  "name": "Website Development",
  "description": "Custom website development service",
  "category": "Web Development",
  "price": 1500,
  "currency": "USD",
  "deliveryTime": 14,
  "deliveryTimeUnit": "days",
  "features": ["Responsive Design", "SEO Optimized", "Admin Panel"],
  "tags": ["website", "development", "custom"],
  "requirements": "Provide brand guidelines and content",
  "isFeatured": true
}
```

#### PUT /services/:id
Update service (Admin only).

#### DELETE /services/:id
Delete service (Admin only).

### Upload Endpoints (Require Authentication)

#### POST /upload/single
Upload single file.
Form data:
- `file` (file)
- `purpose` (string, optional)
- `relatedId` (string, optional)
- `relatedModel` (string, optional)

#### POST /upload/multiple
Upload multiple files.
Form data:
- `files` (files array)
- `purpose` (string, optional)
- `relatedId` (string, optional)
- `relatedModel` (string, optional)

#### GET /upload/my-files
Get user's uploaded files.

#### GET /upload/:id
Get file by ID.

#### DELETE /upload/:id
Delete file.

#### GET /upload/admin/stats
Get file statistics (Admin only).

#### GET /upload/serve/:filename
Serve static file.

### Message Endpoints (Require Authentication)

#### GET /messages/conversations
Get user's conversations.

#### GET /messages/conversation/:otherUserId
Get messages with specific user.

#### POST /messages/send
Send message.
```json
{
  "receiverId": "user-id",
  "content": "Hello, how are you?",
  "messageType": "text"
}
```

#### PUT /messages/:messageId/read
Mark message as read.

#### PUT /messages/conversation/:otherUserId/read
Mark entire conversation as read.

#### GET /messages/unread-count
Get unread message count.

#### GET /messages/search
Search messages.
Query parameters:
- `query` (search term)
- `otherUserId` (optional, search in specific conversation)

#### DELETE /messages/:messageId
Delete message.

#### GET /messages/admin/stats
Get chat statistics (Admin only).

## Error Codes

- `400` - Bad Request (validation errors)
- `401` - Unauthorized (invalid/missing token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `409` - Conflict (duplicate resource)
- `422` - Unprocessable Entity (validation failed)
- `429` - Too Many Requests (rate limit exceeded)
- `500` - Internal Server Error

## Rate Limiting

- 100 requests per 15 minutes per IP address
- Higher limits for authenticated users

## File Upload Limits

- Maximum file size: 10MB
- Supported formats: Images (jpg, png, gif), Documents (pdf, doc, docx), Archives (zip, rar)
- Multiple files: Maximum 5 files per request

## Pagination

List endpoints support pagination:
```json
{
  "data": [...],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalItems": 50,
    "itemsPerPage": 10
  }
}
```

## WebSocket Events

### Client to Server
- `join` - Join user room
- `sendMessage` - Send chat message
- `typing` - Typing indicator

### Server to Client
- `newMessage` - New message received
- `notification` - New notification
- `statusUpdate` - Status change
- `userOnline` - User came online
- `userOffline` - User went offline
