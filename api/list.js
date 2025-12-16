import { list } from '@vercel/blob';

export default async function handler(request, response) {
  // Handle CORS
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (request.method === 'OPTIONS') {
    return response.status(200).end();
  }

  if (request.method !== 'GET') {
    return response.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { blobs } = await list();

    // Format the response with useful metadata
    const files = blobs.map(blob => ({
      url: blob.url,
      pathname: blob.pathname,
      size: blob.size,
      uploadedAt: blob.uploadedAt,
      contentType: blob.contentType || inferContentType(blob.pathname),
    }));

    return response.status(200).json({
      success: true,
      files: files,
    });
  } catch (error) {
    console.error('List error:', error);
    return response.status(500).json({
      error: 'Failed to list files',
      details: error.message
    });
  }
}

function inferContentType(pathname) {
  const ext = pathname.split('.').pop().toLowerCase();
  const types = {
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png',
    'gif': 'image/gif',
    'webp': 'image/webp',
    'mp4': 'video/mp4',
    'webm': 'video/webm',
    'mov': 'video/quicktime',
  };
  return types[ext] || 'application/octet-stream';
}
