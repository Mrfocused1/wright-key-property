const axios = require('axios');
const fs = require('fs');
const path = require('path');

const PEXELS_API_KEY = 'ZC51nu56HbGLf9zJoKOutAmvjep2SDDonUoYkylwkYmqQy2uGD7N3mSF';

// Create assets directory if it doesn't exist
const assetsDir = path.join(__dirname, 'assets');
if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
}

// Define the images we need with specific search queries for UK luxury houses
const imageRequests = [
  { query: 'luxury house london exterior', filename: 'hero-luxury-interior.jpg', size: 'large2x' },
  { query: 'luxury british house interior modern', filename: 'about-modern-interior.jpg', size: 'large2x' },
  { query: 'luxury london apartment interior detail', filename: 'about-detail.jpg', size: 'large' },
  { query: 'luxury house london architecture', filename: 'investment-property.jpg', size: 'large2x' },
  { query: 'modern luxury house exterior uk', filename: 'property-before.jpg', size: 'large' },
  { query: 'luxury townhouse london', filename: 'property-after.jpg', size: 'large' }
];

// Video requests
const videoRequests = [
  { query: 'luxury house interior modern', filename: 'hero-video.mp4' }
];

async function fetchPexelsImage(query, filename, size = 'large2x') {
  try {
    console.log(`Fetching image for: ${query}`);

    const response = await axios.get('https://api.pexels.com/v1/search', {
      headers: {
        Authorization: PEXELS_API_KEY
      },
      params: {
        query: query,
        per_page: 1,
        orientation: 'portrait'
      }
    });

    if (response.data.photos && response.data.photos.length > 0) {
      const photo = response.data.photos[0];
      const imageUrl = photo.src[size] || photo.src.large2x;

      // Download the image
      const imageResponse = await axios.get(imageUrl, { responseType: 'arraybuffer' });
      const imagePath = path.join(assetsDir, filename);
      fs.writeFileSync(imagePath, imageResponse.data);

      console.log(`✓ Downloaded: ${filename}`);
      console.log(`  Photographer: ${photo.photographer}`);
      console.log(`  URL: ${photo.url}\n`);

      return {
        filename,
        photographer: photo.photographer,
        url: photo.url,
        pexelsUrl: imageUrl
      };
    } else {
      console.log(`✗ No photos found for: ${query}\n`);
      return null;
    }
  } catch (error) {
    console.error(`Error fetching image for ${query}:`, error.message);
    return null;
  }
}

async function fetchPexelsVideo(query, filename) {
  try {
    console.log(`Fetching video for: ${query}`);

    const response = await axios.get('https://api.pexels.com/videos/search', {
      headers: {
        Authorization: PEXELS_API_KEY
      },
      params: {
        query: query,
        per_page: 1,
        orientation: 'landscape'
      }
    });

    if (response.data.videos && response.data.videos.length > 0) {
      const video = response.data.videos[0];
      // Get HD video file
      const videoFile = video.video_files.find(f => f.quality === 'hd') || video.video_files[0];

      // Download the video
      const videoResponse = await axios.get(videoFile.link, { responseType: 'arraybuffer' });
      const videoPath = path.join(assetsDir, filename);
      fs.writeFileSync(videoPath, videoResponse.data);

      console.log(`✓ Downloaded: ${filename}`);
      console.log(`  User: ${video.user.name}`);
      console.log(`  URL: ${video.url}\n`);

      return {
        filename,
        user: video.user.name,
        url: video.url,
        pexelsUrl: videoFile.link
      };
    } else {
      console.log(`✗ No videos found for: ${query}\n`);
      return null;
    }
  } catch (error) {
    console.error(`Error fetching video for ${query}:`, error.message);
    return null;
  }
}

async function main() {
  console.log('Starting Pexels API fetch...\n');

  const results = {
    images: [],
    videos: []
  };

  // Fetch images
  for (const request of imageRequests) {
    const result = await fetchPexelsImage(request.query, request.filename, request.size);
    if (result) {
      results.images.push(result);
    }
    // Add delay to respect API rate limits
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  // Fetch videos
  for (const request of videoRequests) {
    const result = await fetchPexelsVideo(request.query, request.filename);
    if (result) {
      results.videos.push(result);
    }
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  // Save results to JSON file for reference
  fs.writeFileSync(
    path.join(__dirname, 'pexels-credits.json'),
    JSON.stringify(results, null, 2)
  );

  console.log('\n✓ All assets downloaded!');
  console.log(`Images: ${results.images.length}`);
  console.log(`Videos: ${results.videos.length}`);
  console.log('\nCredits saved to pexels-credits.json');
}

main().catch(console.error);
