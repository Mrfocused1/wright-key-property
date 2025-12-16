const { put, list, del } = require('@vercel/blob');

const CONTENT_PREFIX = 'site-content';

module.exports = async function handler(request, response) {
  // Add cache control headers to prevent caching
  response.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  response.setHeader('Pragma', 'no-cache');
  response.setHeader('Expires', '0');

  // GET - Load content
  if (request.method === 'GET') {
    try {
      const { blobs } = await list({ prefix: CONTENT_PREFIX });

      if (blobs.length === 0) {
        return response.status(200).json({
          success: true,
          content: null
        });
      }

      // Sort blobs by uploadedAt descending to get the most recent
      const sortedBlobs = blobs.sort((a, b) =>
        new Date(b.uploadedAt) - new Date(a.uploadedAt)
      );

      const contentBlob = sortedBlobs[0];

      // Fetch the content from the blob URL with cache-busting
      const blobUrl = contentBlob.url + '?t=' + Date.now();
      const contentResponse = await fetch(blobUrl, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache'
        }
      });
      const content = await contentResponse.json();

      return response.status(200).json({
        success: true,
        content: content
      });
    } catch (error) {
      console.error('Load content error:', error);
      return response.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // POST - Save content
  if (request.method === 'POST') {
    try {
      const content = request.body;

      if (!content) {
        return response.status(400).json({
          success: false,
          error: 'No content provided'
        });
      }

      // Save new content with unique filename (addRandomSuffix adds unique ID)
      const blob = await put(CONTENT_PREFIX + '.json', JSON.stringify(content, null, 2), {
        access: 'public',
        contentType: 'application/json',
        addRandomSuffix: true,
        cacheControlMaxAge: 0
      });

      // Delete old content files (keep only the new one)
      try {
        const { blobs } = await list({ prefix: CONTENT_PREFIX });
        for (const oldBlob of blobs) {
          // Don't delete the blob we just created
          if (oldBlob.url !== blob.url) {
            await del(oldBlob.url);
          }
        }
      } catch (e) {
        // Ignore errors when deleting old files
        console.log('Cleanup warning:', e.message);
      }

      return response.status(200).json({
        success: true,
        url: blob.url
      });
    } catch (error) {
      console.error('Save content error:', error);
      return response.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  return response.status(405).json({ error: 'Method not allowed' });
};
