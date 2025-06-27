# Supabase Storage Setup Guide

This guide explains how to set up Supabase Storage with proper Row Level Security (RLS) policies to allow authenticated users to upload and manage their files.

## Current Issue

The error you're seeing:
```
GET https://kaagnxjnybbrsgazlltp.supabase.co/storage/v1/bucket/posts 400 (Bad Request)
Bucket error: StorageApiError: Bucket not found
```

This occurs because the `posts` bucket doesn't exist in your Supabase project yet.

## Solution: Create Storage Bucket and Set Up RLS Policies

### Step 1: Create the Storage Bucket

1. **Go to your Supabase dashboard**
   - Navigate to https://supabase.com/dashboard
   - Select your project

2. **Navigate to Storage**
   - Click on **Storage** in the left sidebar
   - You should see an empty storage section

3. **Create a new bucket**
   - Click **Create a new bucket**
   - Fill in the following details:
     - **Name**: `posts` (exactly this name)
     - **Public bucket**: ✅ Check this box (allows public read access)
     - **File size limit**: `50MB` (or your preferred limit)
     - **Allowed MIME types**: Leave empty or add `image/*` for images only

4. **Click Create bucket**

### Step 2: Set Up RLS Policies

After creating the bucket, you need to set up Row Level Security policies. Go to the **SQL Editor** in your Supabase dashboard and run these commands:

```sql
-- Enable RLS on the storage.objects table
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Policy: Allow authenticated users to upload files to their own folder
CREATE POLICY "Users can upload files to their own folder" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'posts' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Policy: Allow users to update their own files
CREATE POLICY "Users can update their own files" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'posts' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Policy: Allow users to delete their own files
CREATE POLICY "Users can delete their own files" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'posts' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Policy: Allow public read access to all files in posts bucket
CREATE POLICY "Public can view posts" ON storage.objects
  FOR SELECT USING (bucket_id = 'posts');

-- Policy: Allow authenticated users to list files in their own folder
CREATE POLICY "Users can list their own files" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'posts' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );
```

### Step 3: Alternative - Simpler Policy (Less Secure, Good for Development)

If you want a simpler setup for development, you can use this less restrictive policy:

```sql
-- WARNING: This is less secure - only use for development
-- Allow all authenticated users to upload to posts bucket
CREATE POLICY "Authenticated users can upload to posts" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'posts' AND 
    auth.role() = 'authenticated'
  );

-- Allow all authenticated users to update files in posts bucket
CREATE POLICY "Authenticated users can update posts" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'posts' AND 
    auth.role() = 'authenticated'
  );

-- Allow all authenticated users to delete files in posts bucket
CREATE POLICY "Authenticated users can delete posts" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'posts' AND 
    auth.role() = 'authenticated'
  );

-- Allow public read access
CREATE POLICY "Public can view posts" ON storage.objects
  FOR SELECT USING (bucket_id = 'posts');
```

## How the File Path Structure Works

The current code uploads files to: `${user.id}/${fileName}`

For example: `746dfeea-ff6e-47ac-b0a9-23cf0345b94d/1750985760594.jpeg`

The RLS policies use `storage.foldername(name)[1]` to extract the user ID from the path and verify that the authenticated user matches the folder name.

## Testing the Setup

### 1. Test File Upload

1. Make sure you're logged in to your app
2. Go to the Create Post page
3. Try uploading an image
4. Check the browser console for success messages

### 2. Verify in Supabase Dashboard

1. Go to **Storage > posts** in your Supabase dashboard
2. You should see a folder with your user ID
3. Inside that folder, you should see your uploaded image

### 3. Test Public Access

1. Copy the public URL from the upload response
2. Open it in an incognito browser window
3. The image should be accessible without authentication

## Troubleshooting

### Common Issues

1. **"Bucket does not exist"**
   - Make sure you created the `posts` bucket in Storage
   - Check the bucket name matches exactly (case-sensitive)

2. **"RLS policy violation"**
   - Verify the RLS policies are created correctly
   - Check that the user is authenticated
   - Ensure the file path structure matches the policy expectations

3. **"File size too large"**
   - Check the bucket's file size limit
   - Consider compressing images before upload

4. **"Invalid file type"**
   - Check the bucket's allowed MIME types
   - Ensure you're uploading the correct file type

### Debug Steps

1. **Check Authentication:**
   ```javascript
   const { data: { user } } = await supabase.auth.getUser();
   console.log('Current user:', user);
   ```

2. **Check Bucket Configuration:**
   ```javascript
   const { data, error } = await supabase.storage.getBucket('posts');
   console.log('Bucket info:', data);
   ```

3. **Test Policy:**
   ```sql
   -- Check if policies exist
   SELECT * FROM pg_policies WHERE tablename = 'objects';
   
   -- Test the folder name function
   SELECT storage.foldername('746dfeea-ff6e-47ac-b0a9-23cf0345b94d/test.jpg');
   ```

## Security Best Practices

1. **Use User-Specific Folders**: Always organize files by user ID to prevent unauthorized access
2. **Validate File Types**: Check file extensions and MIME types on both client and server
3. **Set File Size Limits**: Prevent abuse by limiting upload sizes
4. **Use Secure URLs**: Generate signed URLs for sensitive files
5. **Regular Cleanup**: Implement cleanup for unused files

## Additional Storage Features

### Signed URLs for Private Files

If you need private files, you can generate signed URLs:

```javascript
const { data, error } = await supabase.storage
  .from('posts')
  .createSignedUrl(filePath, 3600); // 1 hour expiry
```

### File Metadata

You can store additional metadata with files:

```javascript
const { data, error } = await supabase.storage
  .from('posts')
  .upload(filePath, file, {
    upsert: true,
    cacheControl: '3600',
    metadata: {
      userId: user.id,
      originalName: file.name,
      uploadedAt: new Date().toISOString()
    }
  });
```

## Environment Variables

Make sure your environment variables are set correctly:

```env
REACT_APP_SUPABASE_URL=your_supabase_project_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
```

The anon key is used for storage operations, so make sure it has the necessary permissions. 