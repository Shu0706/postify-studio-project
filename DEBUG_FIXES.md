# Quick Debug Fixes for 400 Error

## Error: Invalid Service ID
**Problem**: `serviceData.serviceId` is not a valid MongoDB ObjectId
**Check**: URL parameter format
**Fix**: Ensure you're navigating to `/apply-service/[valid-mongo-id]`

## Error: Title validation failed
**Problem**: `projectName` is too short (< 5 chars)
**Fix**: Add minimum length validation in frontend form

## Error: Description validation failed  
**Problem**: `description` is too short (< 20 chars)
**Fix**: Add minimum length validation in frontend form

## Error: Timeline validation failed
**Problem**: Delivery date is before start date
**Fix**: Check date comparison logic

## Error: Budget validation failed
**Problem**: Budget amount is not numeric
**Fix**: Ensure `parseFloat()` conversion works properly

## Error: Authentication failed
**Problem**: No valid JWT token
**Fix**: Check if user is logged in and token exists

## Error: CORS issues
**Problem**: Frontend/backend on different origins
**Fix**: Already configured in server.js for localhost:5173

## Error: Body parsing failed
**Problem**: Request body not parsed as JSON
**Fix**: Already configured with express.json() middleware
