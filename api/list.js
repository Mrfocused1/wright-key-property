const { list } = require('@vercel/blob');

module.exports = async function handler(request, response) {
  if (request.method !== 'GET') {
    return response.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const prefix = request.query.prefix || '';

    const { blobs } = await list({
      prefix: prefix,
    });

    return response.status(200).json({
      success: true,
      blobs: blobs.map(blob => ({
        url: blob.url,
        pathname: blob.pathname,
        size: blob.size,
        uploadedAt: blob.uploadedAt,
        downloadUrl: blob.downloadUrl,
      })),
    });
  } catch (error) {
    console.error('List error:', error);
    return response.status(500).json({ error: error.message });
  }
};
