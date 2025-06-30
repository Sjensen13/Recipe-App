# Messaging Feature Implementation

## Overview

The messaging feature allows users to send and receive private messages with other users in the Recipe Social app. It includes real-time conversation management, unread message tracking, and a modern chat interface.

## Features

### Core Functionality
- **Conversation Management**: Create and manage conversations between users
- **Real-time Messaging**: Send and receive messages in real-time
- **Unread Message Tracking**: Track and display unread message counts
- **Message Status**: Read receipts and message timestamps
- **Message Deletion**: Users can delete their own messages
- **Responsive Design**: Works on both desktop and mobile devices

### User Interface
- **Conversation List**: View all conversations with last message preview
- **Chat Interface**: Modern chat UI with message bubbles
- **Message Input**: Auto-resizing textarea with character limit
- **Navigation Badges**: Unread message count displayed in navigation
- **Profile Integration**: Start conversations directly from user profiles

## Technical Implementation

### Backend (Node.js/Express)

#### Database Schema
```javascript
// conversations table
{
  id: number,
  created_at: timestamp,
  updated_at: timestamp,
  unread_count: number
}

// conversation_participants table
{
  conversation_id: number,
  user_id: number
}

// messages table
{
  id: number,
  conversation_id: number,
  sender_id: number,
  content: string,
  created_at: timestamp,
  read_at: timestamp
}
```

#### API Endpoints
- `GET /api/messages/conversations` - Get all conversations for user
- `GET /api/messages/conversations/:id/messages` - Get messages for conversation
- `POST /api/messages/send` - Send a new message
- `PUT /api/messages/conversations/:id/read` - Mark conversation as read
- `DELETE /api/messages/messages/:id` - Delete a message
- `GET /api/messages/unread-count` - Get unread message count

#### Controllers
- **Messages Controller** (`server/src/controllers/messages/index.js`)
  - Handles all messaging-related operations
  - Manages conversation creation and message sending
  - Implements read status tracking
  - Provides unread count functionality

### Frontend (React)

#### Components
1. **ConversationList** (`client/src/components/messaging/ConversationList.jsx`)
   - Displays all user conversations
   - Shows last message preview and timestamp
   - Handles conversation selection
   - Displays unread message badges

2. **ConversationView** (`client/src/components/messaging/ConversationView.jsx`)
   - Main chat interface
   - Displays messages in chronological order
   - Auto-scrolls to latest messages
   - Integrates message input

3. **Message** (`client/src/components/messaging/Message.jsx`)
   - Individual message component
   - Different styling for sent vs received messages
   - Shows timestamps and read receipts
   - Message deletion functionality

4. **MessageInput** (`client/src/components/messaging/MessageInput.jsx`)
   - Auto-resizing textarea
   - Character limit (1000 characters)
   - Send button with loading state
   - Enter to send, Shift+Enter for new line

5. **StartConversation** (`client/src/components/messaging/StartConversation.jsx`)
   - Component for starting new conversations
   - Integrated into user profiles
   - Handles authentication checks

#### Hooks
- **useUnreadMessages** (`client/src/hooks/useUnreadMessages.js`)
  - Manages unread message count
  - Polls for updates every 30 seconds
  - Provides methods to update count

#### Services
- **Messages API** (`client/src/services/api/messages.js`)
  - Handles all API calls to messaging endpoints
  - Error handling and response formatting

## User Experience

### Starting a Conversation
1. Navigate to any user's profile
2. Click the "Message" button
3. Type your initial message
4. Send to create a new conversation

### Using the Messaging Interface
1. Access messages via the navigation menu
2. View conversation list on the left (desktop) or main area (mobile)
3. Select a conversation to view messages
4. Type and send messages using the input at the bottom
5. Messages are automatically marked as read when viewed

### Navigation Features
- Unread message count displayed as red badge
- Badge shows "9+" for counts over 9
- Real-time updates every 30 seconds

## Security Features

### Authentication
- All messaging endpoints require authentication
- Users can only access their own conversations
- Message deletion restricted to message sender

### Data Validation
- Message content validation (required, max length)
- User ID validation for conversation access
- Input sanitization and length limits

## Performance Optimizations

### Backend
- Efficient database queries with proper indexing
- Pagination support for large message histories
- Optimized conversation listing with last message

### Frontend
- Lazy loading of conversation data
- Efficient re-rendering with React hooks
- Debounced API calls for unread count updates

## Mobile Responsiveness

### Design Considerations
- Responsive layout that adapts to screen size
- Touch-friendly interface elements
- Optimized for mobile keyboard interactions
- Collapsible conversation list on mobile

### Navigation
- Bottom navigation on mobile devices
- Sidebar navigation on desktop
- Consistent badge display across platforms

## Future Enhancements

### Planned Features
- **Real-time Updates**: WebSocket integration for instant message delivery
- **File Sharing**: Support for image and file attachments
- **Message Reactions**: Emoji reactions to messages
- **Group Chats**: Multi-user conversations
- **Message Search**: Search functionality within conversations
- **Push Notifications**: Browser notifications for new messages

### Technical Improvements
- **Caching**: Implement message caching for better performance
- **Offline Support**: Offline message queuing and sync
- **Message Encryption**: End-to-end encryption for privacy
- **Voice Messages**: Audio message support

## Testing

### Manual Testing Checklist
- [ ] Create new conversation from profile
- [ ] Send and receive messages
- [ ] View conversation list
- [ ] Mark messages as read
- [ ] Delete own messages
- [ ] Unread count updates
- [ ] Mobile responsiveness
- [ ] Navigation badges
- [ ] Error handling

### API Testing
- Test all messaging endpoints
- Verify authentication requirements
- Check data validation
- Test error scenarios

## Deployment

### Environment Variables
```bash
# Required for messaging feature
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_supabase_service_key
```

### Database Setup
The messaging feature uses the existing mock database system in development mode. For production, ensure the following tables exist in your Supabase database:

- `conversations`
- `conversation_participants`
- `messages`

## Troubleshooting

### Common Issues
1. **Messages not loading**: Check authentication and API endpoints
2. **Unread count not updating**: Verify polling interval and API responses
3. **Conversation not creating**: Check user IDs and database permissions
4. **Mobile layout issues**: Test responsive breakpoints

### Debug Steps
1. Check browser console for JavaScript errors
2. Verify API responses in Network tab
3. Test authentication state
4. Check database connectivity

## Contributing

When contributing to the messaging feature:

1. Follow existing code patterns and conventions
2. Add appropriate error handling
3. Test on both desktop and mobile
4. Update documentation for new features
5. Ensure backward compatibility

## Support

For issues or questions about the messaging feature:
1. Check this documentation
2. Review the code comments
3. Test with the provided mock data
4. Create an issue with detailed steps to reproduce 