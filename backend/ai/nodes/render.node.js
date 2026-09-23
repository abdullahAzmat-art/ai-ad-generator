import 'dotenv/config';

// Map aspect ratio to JSON2Video's resolution format
function getResolution(aspectRatio) {
  if (aspectRatio === '16:9') return 'landscape';
  if (aspectRatio === '1:1') return 'square';
  return 'vertical'; // default 9:16
}

export async function renderNode(state) {
  const { script, scraped, stockImages = [], aspectRatio = '9:16' } = state;
  const apiKey = process.env.JSON2VIDEO_API_KEY;

  if (!apiKey || apiKey === 'your_json2video_api_key_here') {
    console.warn('[Render Node] JSON2VIDEO_API_KEY missing or not set — skipping actual render.');
    // For development, return a mock video URL instead of crashing if key isn't set
    return { 
      videoUrl: 'https://cdn.json2video.com/mock-video-url.mp4', 
      error: null 
    };
  }

  if (!script || !script.scenes || script.scenes.length === 0) {
    console.error('[Render Node] No script available to render.');
    return { error: 'No script available to render', videoUrl: null };
  }

  // Combine images to match the exact same array draftNode used for imageIndex
  const allImages = [...new Set([...(scraped?.images ?? []), ...stockImages])];

  // 1. Map our script schema to JSON2Video Elements
  const j2vScenes = script.scenes.map((scene) => {
    const imageUrl = allImages[scene.imageIndex] || allImages[0] || '';
    
    return {
      duration: scene.durationSec || 4,
      background_color: scene.bgFrom, // Using the gradient start as a solid bg color fallback
      elements: [
        // Background Image (dimmed for text readability)
        {
          type: "image",
          src: imageUrl,
          style: "width: 100%; height: 100%; object-fit: cover; opacity: 0.6;"
        },
        // Headline
        {
          type: "text",
          text: scene.headline,
          style: `color: ${scene.textColor}; font-size: 80px; font-weight: bold; text-align: center; margin: 15% 10%;`
        },
        // Body / Subheadline
        {
          type: "text",
          text: scene.body,
          style: `color: ${scene.textColor}; font-size: 40px; text-align: center; margin-top: 55%; padding: 0 10%;`
        },
        // CTA Button
        {
          type: "text",
          text: scene.cta,
          style: `color: ${scene.ctaText}; background-color: ${scene.ctaBg}; font-size: 45px; font-weight: bold; padding: 20px 40px; border-radius: 20px; align: center; vertical-align: bottom; margin-bottom: 25%;`
        },
        // Voiceover (TTS)
        {
          type: "tts",
          text: scene.voiceover,
          voice: "en-US-JennyNeural" // Good default voice
        }
      ]
    };
  });

  const payload = {
    resolution: getResolution(aspectRatio),
    quality: "high",
    scenes: j2vScenes
  };

  let error = null;
  let videoUrl = null;

  try {
    console.log('[Render Node] Submitting project to JSON2Video...');
    
    // 2. Submit to JSON2Video API
    const submitRes = await fetch('https://api.json2video.com/v2/movies', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const submitData = await submitRes.json();
    if (!submitRes.ok || !submitData.success) {
      throw new Error(`JSON2Video API Error: ${submitData.message || submitRes.statusText}`);
    }

    const projectId = submitData.project;
    console.log(`[Render Node] Project created: ${projectId}. Polling for completion...`);

    // 3. Poll for completion (Wait up to 3 minutes)
    const maxRetries = 36; // 36 * 5s = 180s
    let retries = 0;
    
    while (retries < maxRetries) {
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      const pollRes = await fetch(`https://api.json2video.com/v2/movies?project=${projectId}`, {
        headers: { 'x-api-key': apiKey }
      });
      
      const pollData = await pollRes.json();
      // The API returns the movie object inside the response
      const status = pollData.movie?.status;
      
      console.log(`[Render Node] Polling... Status: ${status}`);
      
      if (status === 'done') {
        videoUrl = pollData.movie?.url;
        console.log(`[Render Node] ✓ Video rendered successfully: ${videoUrl}`);
        break;
      } else if (status === 'error') {
        throw new Error('JSON2Video rendering failed on their servers.');
      }
      
      retries++;
    }

    if (!videoUrl) {
      throw new Error('Rendering timed out after 3 minutes.');
    }

  } catch (err) {
    console.error('[Render Node] Failed:', err.message);
    error = err.message;
  }

  return { videoUrl, error };
}
