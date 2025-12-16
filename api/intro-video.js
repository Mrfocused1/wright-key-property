import { list } from '@vercel/blob';

export default async function handler(request, response) {
  // Handle CORS
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (request.method === 'OPTIONS') {
    return response.status(200).end();
  }

  if (request.method !== 'GET') {
    return response.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Look for a file named "intro-video.*" in the blob storage
    const { blobs } = await list({ prefix: 'intro-video' });

    if (blobs.length === 0) {
      return response.status(200).json({
        success: true,
        hasIntroVideo: false,
        url: null,
      });
    }

    // Return the most recently uploaded intro video
    const introVideo = blobs.sort((a, b) =>
      new Date(b.uploadedAt) - new Date(a.uploadedAt)
    )[0];

    return response.status(200).json({
      success: true,
      hasIntroVideo: true,
      url: introVideo.url,
      pathname: introVideo.pathname,
      uploadedAt: introVideo.uploadedAt,
    });
  } catch (error) {
    console.error('Intro video fetch error:', error);
    return response.status(500).json({
      error: 'Failed to fetch intro video',
      details: error.message
    });
  }
}
