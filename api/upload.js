import { put } from '@vercel/blob';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(request, response) {
  // Handle CORS
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (request.method === 'OPTIONS') {
    return response.status(200).end();
  }

  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const filename = request.query.filename;

    if (!filename) {
      return response.status(400).json({ error: 'Filename is required' });
    }

    // Upload to Vercel Blob
    const blob = await put(filename, request, {
      access: 'public',
    });

    return response.status(200).json({
      success: true,
      url: blob.url,
      pathname: blob.pathname,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return response.status(500).json({
      error: 'Upload failed',
      details: error.message
    });
  }
}
