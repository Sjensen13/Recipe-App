# Cloudinary Setup Guide

## Issues You're Experiencing

1. **401 Unauthorized Error**: Server authentication middleware was not properly configured
2. **Cloudinary API Key Error**: Missing Cloudinary credentials in environment variables

## ✅ Issue 1 Fixed: Authentication

The server authentication middleware has been updated to properly verify Supabase tokens. The 401 errors should now be resolved.

## 🔧 Issue 2: Cloudinary Setup

### Step 1: Get Cloudinary Credentials

1. **Sign up/Login to Cloudinary:**
   - Go to [Cloudinary Console](https://cloudinary.com/console)
   - Create a free account or sign in

2. **Get Your Cloud Name:**
   - In your dashboard, you'll see your Cloud Name (e.g., `myapp123`)
   - Copy this value

3. **Create Upload Preset:**
   - Go to **Settings** → **Upload**
   - Scroll down to **Upload presets**
   - Click **Add upload preset**
   - Set the following:
     - **Preset name**: `recipe-app-uploads` (or any name you prefer)
     - **Signing Mode**: `Unsigned` (for client-side uploads)
     - **Folder**: `recipe-app` (optional, for organization)
   - Click **Save**

### Step 2: Update Environment Variables

Edit your `client/.env` file and replace the placeholder values:

```bash
# Replace these lines in client/.env:
REACT_APP_CLOUDINARY_CLOUD_NAME=your_actual_cloud_name
REACT_APP_CLOUDINARY_UPLOAD_PRESET=your_actual_preset_name
```

**Example:**
```bash
REACT_APP_CLOUDINARY_CLOUD_NAME=myapp123
REACT_APP_CLOUDINARY_UPLOAD_PRESET=recipe-app-uploads
```

### Step 3: Restart Your Development Server

After updating the environment variables:

```bash
# Stop your React development server (Ctrl+C)
# Then restart it:
npm start
```

## 🔍 Testing the Fix

1. **Test Authentication:**
   - Make sure you're logged in to the app
   - Try creating a post with an image
   - Check browser console for any 401 errors

2. **Test Cloudinary Upload:**
   - Go to the Create Post page
   - Select an image file
   - The upload should now work without the "Unknown API key" error

## 🚨 Troubleshooting

### If you still get 401 errors:
1. Check that you're logged in
2. Check browser console for authentication errors
3. Verify the API client is sending the authorization header

### If you still get Cloudinary errors:
1. Double-check your Cloudinary credentials
2. Make sure the upload preset is set to "Unsigned"
3. Verify the environment variables are loaded (check browser console)
4. Restart your development server after changing .env

### Environment Variables Not Loading?
If your environment variables aren't being picked up:

1. **For Create React App:**
   - Environment variables must start with `REACT_APP_`
   - You must restart the development server after changing .env

2. **Check if variables are loaded:**
   - Open browser console
   - Type: `console.log(process.env.REACT_APP_CLOUDINARY_CLOUD_NAME)`
   - Should show your cloud name (not undefined)

## 📝 Additional Notes

- **Free Tier Limits**: Cloudinary free tier includes 25GB storage and 25GB bandwidth per month
- **Security**: The upload preset is set to "Unsigned" for client-side uploads, which is safe for public uploads
- **Organization**: Images will be organized in folders like `recipe-app/posts/{userId}/` for better management

## 🎉 Success!

Once both issues are resolved, you should be able to:
- Upload images to Cloudinary without errors
- Make authenticated API calls without 401 errors
- See uploaded images in your Cloudinary dashboard 