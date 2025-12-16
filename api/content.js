const { put, list, del } = require('@vercel/blob');

const CONTENT_PREFIX = 'site-content';

module.exports = async function handler(request, response) {
  // Add cache control headers to prevent caching
  response.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  response.setHeader('Pragma', 'no-cache');
  response.setHeader('Expires', '0');

  // Check for blob token
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return response.status(500).json({
      success: false,
      error: 'Server configuration error: Blob storage token not configured'
    });
  }

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
        headers: { 'Cache-Control': 'no-cache' }
      });

      if (!contentResponse.ok) {
        throw new Error(`Blob fetch failed: ${contentResponse.status}`);
      }

      const content = await contentResponse.json();

      return response.status(200).json({
        success: true,
        content: content
      });
    } catch (error) {
      console.error('Content API GET error:', error.message);
      return response.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // POST - Save content
  if (request.method === 'POST') {
    try {
      // Handle body parsing
      let content = request.body;

      if (typeof content === 'string') {
        content = JSON.parse(content);
      }

      // If body is still not an object, try reading from stream
      if (!content || typeof content !== 'object') {
        const chunks = [];
        for await (const chunk of request) {
          chunks.push(chunk);
        }
        const bodyString = Buffer.concat(chunks).toString('utf8');
        content = JSON.parse(bodyString);
      }

      if (!content || typeof content !== 'object') {
        return response.status(400).json({
          success: false,
          error: 'No content provided or invalid format'
        });
      }

      // Save new content with unique filename
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
          if (oldBlob.url !== blob.url) {
            await del(oldBlob.url);
          }
        }
      } catch (e) {
        // Cleanup warning - non-critical
      }

      return response.status(200).json({
        success: true,
        url: blob.url
      });
    } catch (error) {
      console.error('Content API POST error:', error.message);
      return response.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  return response.status(405).json({ error: 'Method not allowed' });
};
