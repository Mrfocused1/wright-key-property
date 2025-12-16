const { put } = require('@vercel/blob');

module.exports = async function handler(request, response) {
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // For Vercel, we need to handle the file from the request body
    const chunks = [];
    for await (const chunk of request) {
      chunks.push(chunk);
    }
    const buffer = Buffer.concat(chunks);

    // Parse multipart form data manually or use a simpler approach
    const contentType = request.headers['content-type'] || '';

    if (!contentType.includes('multipart/form-data')) {
      return response.status(400).json({ error: 'Content-Type must be multipart/form-data' });
    }

    // Extract boundary
    const boundary = contentType.split('boundary=')[1];
    if (!boundary) {
      return response.status(400).json({ error: 'No boundary found' });
    }

    // Simple multipart parser
    const parts = buffer.toString('binary').split('--' + boundary);
    let file = null;
    let filename = 'upload';
    let isIntroVideo = false;
    let fileContentType = 'application/octet-stream';

    for (const part of parts) {
      if (part.includes('Content-Disposition')) {
        const nameMatch = part.match(/name="([^"]+)"/);
        const filenameMatch = part.match(/filename="([^"]+)"/);

        if (nameMatch) {
          const fieldName = nameMatch[1];

          if (filenameMatch) {
            // This is a file field
            filename = filenameMatch[1];
            const contentTypeMatch = part.match(/Content-Type:\s*([^\r\n]+)/);
            if (contentTypeMatch) {
              fileContentType = contentTypeMatch[1].trim();
            }
            // Get file content (after double newline)
            const contentStart = part.indexOf('\r\n\r\n') + 4;
            const contentEnd = part.lastIndexOf('\r\n');
            if (contentStart > 3 && contentEnd > contentStart) {
              file = Buffer.from(part.slice(contentStart, contentEnd), 'binary');
            }
          } else {
            // This is a regular field
            const valueStart = part.indexOf('\r\n\r\n') + 4;
            const valueEnd = part.lastIndexOf('\r\n');
            if (valueStart > 3 && valueEnd > valueStart) {
              const value = part.slice(valueStart, valueEnd).trim();
              if (fieldName === 'filename') {
                filename = value;
              } else if (fieldName === 'isIntroVideo') {
                isIntroVideo = value === 'true';
              }
            }
          }
        }
      }
    }

    if (!file) {
      return response.status(400).json({ error: 'No file provided' });
    }

    // Create a path prefix for organization
    const prefix = isIntroVideo ? 'intro-video/' : 'uploads/';
    const pathname = `${prefix}${filename}`;

    const blob = await put(pathname, file, {
      access: 'public',
      contentType: fileContentType,
      addRandomSuffix: !isIntroVideo,
    });

    return response.status(200).json({
      success: true,
      url: blob.url,
      pathname: blob.pathname,
      downloadUrl: blob.downloadUrl,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return response.status(500).json({ error: error.message });
  }
};

module.exports.config = {
  api: {
    bodyParser: false,
  },
};
