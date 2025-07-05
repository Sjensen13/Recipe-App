console.log('GOOGLE_APPLICATION_CREDENTIALS:', process.env.GOOGLE_APPLICATION_CREDENTIALS);
const fs = require('fs');
try {
  const creds = fs.readFileSync(process.env.GOOGLE_APPLICATION_CREDENTIALS, 'utf8');
  console.log('First 200 chars of credentials file:', creds.slice(0, 200));
} catch (e) {
  console.error('Could not read credentials file:', e.message);
}
const axios = require('axios');

console.log('Using Roboflow for ingredient detection');

// Commented out: async function detectIngredientsFromImage(imageUrl) {
//   const apiKey = process.env.ROBOFLOW_API_KEY;
//   const model = process.env.ROBOFLOW_MODEL;
//   const version = process.env.ROBOFLOW_VERSION;

//   if (!apiKey || !model || !version) {
//     throw new Error('Roboflow API key, model, or version not set in environment variables');
//   }

//   const endpoint = `https://detect.roboflow.com/${model}/${version}?api_key=${apiKey}&image=${encodeURIComponent(imageUrl)}`;

//   try {
//     const response = await axios.get(endpoint);
//     // Parse response to extract ingredient/food names
//     const ingredients = response.data.predictions.map(pred => pred.class);
//     return Array.from(new Set(ingredients));
//   } catch (error) {
//     console.error('Roboflow ingredient detection error:', error.response?.data || error.message);
//     throw new Error('Failed to detect ingredients from image');
//   }
// }

/**
 * Get detailed information about detected objects in an image
 * @param {string} imageUrl - URL of the image to analyze
 * @returns {Promise<Object>} Detailed analysis results
 */
const analyzeImage = async (imageUrl) => {
  try {
    const [result] = await client.annotateImage({
      image: { source: { imageUri: imageUrl } },
      features: [
        { type: 'LABEL_DETECTION' },
        { type: 'TEXT_DETECTION' },
        { type: 'OBJECT_LOCALIZATION' },
        { type: 'SAFE_SEARCH_DETECTION' }
      ]
    });

    return {
      labels: result.labelAnnotations || [],
      text: result.textAnnotations || [],
      objects: result.localizedObjectAnnotations || [],
      safeSearch: result.safeSearchAnnotation || {}
    };
  } catch (error) {
    console.error('Error analyzing image:', error);
    throw new Error(`Failed to analyze image: ${error.message}`);
  }
};

module.exports = {
  // detectIngredientsFromImage
}; 