import { put } from '@vercel/blob';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(request) {
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
      return new Response(JSON.stringify({ error: 'No file provided' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const filename = formData.get('filename') || file.name;
    const isIntroVideo = formData.get('isIntroVideo') === 'true';

    // Create a path prefix for organization
    const prefix = isIntroVideo ? 'intro-video/' : 'uploads/';
    const pathname = `${prefix}${filename}`;

    const blob = await put(pathname, file, {
      access: 'public',
      addRandomSuffix: !isIntroVideo, // Don't add random suffix for intro video so we can find it easily
    });

    return new Response(JSON.stringify({
      success: true,
      url: blob.url,
      pathname: blob.pathname,
      downloadUrl: blob.downloadUrl,
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Upload error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
