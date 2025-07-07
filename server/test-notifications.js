const { getSupabase } = require('./src/services/database');
const { 
  createLikeNotification,
  createCommentNotification,
  createMessageNotification,
  createFollowNotification
} = require('./src/controllers/notifications');

// Test notification creation
async function testNotifications() {
  console.log('Testing notification system...');
  
  try {
    // Test data
    const testUserId = 'test-user-id';
    const testActorId = 'test-actor-id';
    const testActorName = 'Test User';
    const testPostId = 'test-post-id';
    const testPostTitle = 'Test Post';
    const testCommentId = 'test-comment-id';
    const testCommentContent = 'This is a test comment';
    const testMessageId = 'test-message-id';
    const testMessagePreview = 'This is a test message...';
    
    console.log('Creating test notifications...');
    
    // Test like notification
    const likeResult = await createLikeNotification(
      testUserId,
      testActorId,
      testActorName,
      testPostId,
      testPostTitle
    );
    console.log('Like notification result:', likeResult);
    
    // Test comment notification
    const commentResult = await createCommentNotification(
      testUserId,
      testActorId,
      testActorName,
      testPostId,
      testCommentId,
      testCommentContent
    );
    console.log('Comment notification result:', commentResult);
    
    // Test message notification
    const messageResult = await createMessageNotification(
      testUserId,
      testActorId,
      testActorName,
      testMessageId,
      testMessagePreview
    );
    console.log('Message notification result:', messageResult);
    
    // Test follow notification
    const followResult = await createFollowNotification(
      testUserId,
      testActorId,
      testActorName
    );
    console.log('Follow notification result:', followResult);
    
    console.log('All notification tests completed!');
    
  } catch (error) {
    console.error('Error testing notifications:', error);
  }
}

// Run the test
testNotifications(); 