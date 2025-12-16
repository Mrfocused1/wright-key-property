import { list } from '@vercel/blob';

export default async function handler(request) {
  if (request.method !== 'GET') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    // List blobs with the intro-video prefix to find the current intro video
    const { blobs } = await list({
      prefix: 'intro-video/',
    });

    if (blobs.length === 0) {
      return new Response(JSON.stringify({
        success: true,
        hasVideo: false,
        url: null,
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Get the most recently uploaded intro video
    const sortedBlobs = blobs.sort((a, b) =>
      new Date(b.uploadedAt) - new Date(a.uploadedAt)
    );
    const latestVideo = sortedBlobs[0];

    return new Response(JSON.stringify({
      success: true,
      hasVideo: true,
      url: latestVideo.url,
      pathname: latestVideo.pathname,
      uploadedAt: latestVideo.uploadedAt,
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Intro video fetch error:', error);
    return new Response(JSON.stringify({
      error: error.message,
      hasVideo: false,
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
