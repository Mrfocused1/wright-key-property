const { list } = require('@vercel/blob');

module.exports = async function handler(request, response) {
  if (request.method !== 'GET') {
    return response.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // List blobs with the intro-video prefix to find the current intro video
    const { blobs } = await list({
      prefix: 'intro-video/',
    });

    if (blobs.length === 0) {
      return response.status(200).json({
        success: true,
        hasVideo: false,
        url: null,
      });
    }

    // Get the most recently uploaded intro video
    const sortedBlobs = blobs.sort((a, b) =>
      new Date(b.uploadedAt) - new Date(a.uploadedAt)
    );
    const latestVideo = sortedBlobs[0];

    return response.status(200).json({
      success: true,
      hasVideo: true,
      url: latestVideo.url,
      pathname: latestVideo.pathname,
      uploadedAt: latestVideo.uploadedAt,
    });
  } catch (error) {
    console.error('Intro video fetch error:', error);
    return response.status(500).json({
      error: error.message,
      hasVideo: false,
    });
  }
};
