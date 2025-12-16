import { del } from '@vercel/blob';

export default async function handler(request, response) {
  // Handle CORS
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'DELETE, OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (request.method === 'OPTIONS') {
    return response.status(200).end();
  }

  if (request.method !== 'DELETE') {
    return response.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { url } = request.query;

    if (!url) {
      return response.status(400).json({ error: 'URL is required' });
    }

    await del(url);

    return response.status(200).json({
      success: true,
      message: 'File deleted successfully',
    });
  } catch (error) {
    console.error('Delete error:', error);
    return response.status(500).json({
      error: 'Failed to delete file',
      details: error.message
    });
  }
}
