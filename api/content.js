const { put, list, del } = require('@vercel/blob');

const CONTENT_FILE = 'site-content.json';

module.exports = async function handler(request, response) {
  // GET - Load content
  if (request.method === 'GET') {
    try {
      const { blobs } = await list({ prefix: CONTENT_FILE });

      if (blobs.length === 0) {
        return response.status(200).json({
          success: true,
          content: null
        });
      }

      // Fetch the content from the blob URL
      const contentBlob = blobs[0];
      const contentResponse = await fetch(contentBlob.url);
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

      // Delete existing content file if it exists
      try {
        const { blobs } = await list({ prefix: CONTENT_FILE });
        for (const blob of blobs) {
          await del(blob.url);
        }
      } catch (e) {
        // Ignore errors when deleting
      }

      // Save new content
      const blob = await put(CONTENT_FILE, JSON.stringify(content, null, 2), {
        access: 'public',
        contentType: 'application/json',
        addRandomSuffix: false
      });

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
