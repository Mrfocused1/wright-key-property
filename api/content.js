const { put, list, del } = require('@vercel/blob');

const CONTENT_PREFIX = 'site-content';

module.exports = async function handler(request, response) {
  // Add cache control headers to prevent caching
  response.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  response.setHeader('Pragma', 'no-cache');
  response.setHeader('Expires', '0');

  console.log('[Content API] Method:', request.method);

  // GET - Load content
  if (request.method === 'GET') {
    try {
      console.log('[Content API GET] Listing blobs with prefix:', CONTENT_PREFIX);
      const { blobs } = await list({ prefix: CONTENT_PREFIX });
      console.log('[Content API GET] Found blobs:', blobs.length);

      if (blobs.length === 0) {
        console.log('[Content API GET] No blobs found, returning null');
        return response.status(200).json({
          success: true,
          content: null,
          debug: { blobCount: 0 }
        });
      }

      // Sort blobs by uploadedAt descending to get the most recent
      const sortedBlobs = blobs.sort((a, b) =>
        new Date(b.uploadedAt) - new Date(a.uploadedAt)
      );

      const contentBlob = sortedBlobs[0];
      console.log('[Content API GET] Using blob:', contentBlob.pathname, 'uploaded:', contentBlob.uploadedAt);

      // Fetch the content from the blob URL with cache-busting
      const blobUrl = contentBlob.url + '?t=' + Date.now();
      console.log('[Content API GET] Fetching from:', blobUrl);

      const contentResponse = await fetch(blobUrl, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache'
        }
      });

      if (!contentResponse.ok) {
        throw new Error(`Blob fetch failed: ${contentResponse.status}`);
      }

      const content = await contentResponse.json();
      console.log('[Content API GET] Content keys:', Object.keys(content));

      return response.status(200).json({
        success: true,
        content: content,
        debug: {
          blobCount: blobs.length,
          blobPath: contentBlob.pathname,
          blobUploadedAt: contentBlob.uploadedAt
        }
      });
    } catch (error) {
      console.error('[Content API GET] Error:', error);
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
      console.log('[Content API POST] Received content keys:', content ? Object.keys(content) : 'null');

      if (!content) {
        console.log('[Content API POST] No content provided');
        return response.status(400).json({
          success: false,
          error: 'No content provided'
        });
      }

      // Save new content with unique filename (addRandomSuffix adds unique ID)
      console.log('[Content API POST] Saving new blob...');
      const blob = await put(CONTENT_PREFIX + '.json', JSON.stringify(content, null, 2), {
        access: 'public',
        contentType: 'application/json',
        addRandomSuffix: true,
        cacheControlMaxAge: 0
      });
      console.log('[Content API POST] Saved blob:', blob.url);

      // Delete old content files (keep only the new one)
      try {
        const { blobs } = await list({ prefix: CONTENT_PREFIX });
        console.log('[Content API POST] Cleaning up old blobs, found:', blobs.length);
        for (const oldBlob of blobs) {
          // Don't delete the blob we just created
          if (oldBlob.url !== blob.url) {
            console.log('[Content API POST] Deleting old blob:', oldBlob.pathname);
            await del(oldBlob.url);
          }
        }
      } catch (e) {
        console.log('[Content API POST] Cleanup warning:', e.message);
      }

      return response.status(200).json({
        success: true,
        url: blob.url,
        debug: {
          savedAt: new Date().toISOString(),
          blobPath: blob.pathname
        }
      });
    } catch (error) {
      console.error('[Content API POST] Error:', error);
      return response.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  return response.status(405).json({ error: 'Method not allowed' });
};
