# Create Post Function - Mobile App

## Overview
The mobile app includes a complete create post functionality that allows users to create posts with text content, images, and hashtags.

## Features

### 1. Text Content
- **Title**: Required field for post title (max 100 characters)
- **Content**: Required field for post content (max 1000 characters)
- **Hashtag Support**: Automatically extracts hashtags from content using `#hashtag` format

### 2. Image Upload
- **Camera**: Take photos directly with device camera
- **Gallery**: Select images from device photo library
- **Image Processing**: Images are automatically compressed and optimized
- **Cloudinary Integration**: Images are uploaded to Cloudinary before post creation

### 3. User Interface
- **Clean Design**: Modern, intuitive interface
- **Real-time Validation**: Submit button is disabled until required fields are filled
- **Character Counter**: Shows remaining characters for content
- **Image Preview**: Shows selected image with remove option
- **Loading States**: Shows "Posting..." during submission

## Technical Implementation

### File Structure
```
mobile-app/src/screens/post/CreatePostScreen.js
```

### Key Components

#### 1. State Management
```javascript
const [title, setTitle] = useState('');
const [content, setContent] = useState('');
const [image, setImage] = useState(null);
const [isSubmitting, setIsSubmitting] = useState(false);
```

#### 2. Image Handling
- Uses `expo-image-picker` for camera and gallery access
- Supports image editing with aspect ratio 4:3
- Automatic quality optimization (0.8)
- File size validation (5MB limit)

#### 3. API Integration
- **Image Upload**: First uploads image to `/api/upload/image` endpoint
- **Post Creation**: Then creates post with image URL at `/api/posts` endpoint
- **Error Handling**: Comprehensive error handling with user-friendly messages

#### 4. Hashtag Extraction
```javascript
const extractHashtags = (content) => {
  const hashtagRegex = /#(\w+)/g;
  const matches = content.match(hashtagRegex);
  return matches ? matches.map(tag => tag.slice(1)) : [];
};
```

## API Endpoints

### 1. Upload Image
```
POST /api/upload/image
Content-Type: multipart/form-data

Body:
- image: File
- type: "post"
```

### 2. Create Post
```
POST /api/posts
Content-Type: application/json

Body:
{
  "title": "Post Title",
  "content": "Post content with #hashtags",
  "image_url": "https://cloudinary.com/image.jpg",
  "hashtags": ["hashtag1", "hashtag2"]
}
```

## Navigation Integration

The create post screen is integrated into the bottom tab navigator:

```javascript
// App.js
<Tab.Screen name="Create" component={CreatePostScreen} />
```

## Dependencies

### Required Packages
- `expo-image-picker`: For camera and gallery access
- `@expo/vector-icons`: For UI icons
- `react-native-safe-area-context`: For safe area handling
- `axios`: For API requests

### Installation
```bash
npm install expo-image-picker @expo/vector-icons react-native-safe-area-context axios
```

## Usage Flow

1. **User taps "Create" tab** → Opens CreatePostScreen
2. **User enters title and content** → Real-time validation
3. **User optionally adds image** → Camera or gallery selection
4. **User taps "Post"** → Image upload (if selected) → Post creation
5. **Success** → Returns to previous screen with success message

## Error Handling

- **Network Errors**: User-friendly error messages
- **Validation Errors**: Clear feedback for required fields
- **Image Upload Errors**: Separate error handling for upload failures
- **Permission Errors**: Camera permission requests with explanations

## Security Features

- **Authentication**: All requests include JWT token
- **File Validation**: Image type and size validation
- **Input Sanitization**: Content length limits and validation

## Future Enhancements

- **Draft Saving**: Auto-save drafts
- **Rich Text**: Support for bold, italic, etc.
- **Multiple Images**: Support for multiple image uploads
- **Location Tagging**: Add location to posts
- **Scheduled Posts**: Schedule posts for later publication 