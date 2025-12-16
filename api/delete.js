const { del } = require('@vercel/blob');

module.exports = async function handler(request, response) {
  if (request.method !== 'DELETE') {
    return response.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { url } = request.body;

    if (!url) {
      return response.status(400).json({ error: 'No URL provided' });
    }

    await del(url);

    return response.status(200).json({
      success: true,
      message: 'File deleted successfully',
    });
  } catch (error) {
    console.error('Delete error:', error);
    return response.status(500).json({ error: error.message });
  }
};
