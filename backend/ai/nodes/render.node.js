import 'dotenv/config';

export async function renderNode(state) {
  const {
    script,
    scraped,
    stockImages = [],
    aspectRatio = '9:16'
  } = state;

  const apiKey = process.env.JSON2VIDEO_API_KEY;

  // Brand color from scraper — passed into Layout 2's solid block
  const brandColor = scraped?.brandColor || '#111111';

  // --------------------------------------------------
  // 1. Check API key
  // --------------------------------------------------

  if (!apiKey || apiKey === 'your_json2video_api_key_here') {
    console.warn(
      '[Render Node] JSON2VIDEO_API_KEY missing or not set.'
    );

    return {
      videoUrl: 'https://cdn.json2video.com/mock-video-url.mp4',
      error: null
    };
  }

  // --------------------------------------------------
  // 2. Validate script
  // --------------------------------------------------

  if (
    !script ||
    !Array.isArray(script.scenes) ||
    script.scenes.length !== 3
  ) {
    console.error(
      '[Render Node] Invalid script. Expected exactly 3 scenes.'
    );

    return {
      videoUrl: null,
      error: 'Invalid script. Expected exactly 3 scenes.'
    };
  }

  // --------------------------------------------------
  // 3. Build the image array (same order as Draft Node)
  // --------------------------------------------------

  const allImages = [
    ...new Set([
      ...(scraped?.images ?? []),
      ...stockImages
    ])
  ];

  console.log(`[Render Node] ${allImages.length} images available, brandColor: ${brandColor}`);
  console.log(`[Render Node] Rendering ${script.scenes.length} scenes`);

  // --------------------------------------------------
  // 4. Build deterministic scenes using hardcoded templates
  //    Scene 0 → Layout 1 (full-bleed)  — hero/hook
  //    Scene 1 → Layout 2 (split)       — benefit (uses brandColor)
  //    Scene 2 → Layout 3 (cta-close)   — call to action
  // --------------------------------------------------

  const { TEMPLATES } = await import('../lib/templates/index.js');

  const j2vScenes = script.scenes.map((scene, index) => {

    const imageUrl =
      allImages[scene.imageIndex] ||
      allImages[index % allImages.length] ||
      allImages[0] ||
      null;

    if (!imageUrl) {
      throw new Error(`Scene ${index + 1}: No valid image URL available`);
    }

    console.log(`[Render Node] Scene ${index + 1} → imageIndex: ${scene.imageIndex} → ${imageUrl}`);

    if (index === 0) return TEMPLATES['full-bleed'](scene, imageUrl);
    if (index === 1) return TEMPLATES['split'](scene, imageUrl, brandColor);
    return TEMPLATES['cta-close'](scene, imageUrl);
  });

  // --------------------------------------------------
  // 5. Final JSON2Video movie payload
  //    Resolution is always 1080x1920 (9:16 vertical)
  //    quality: "high" renders at full resolution
  // --------------------------------------------------

  const payload = {
    resolution: '1080x1920',
    quality: 'high',
    scenes: j2vScenes
  };

  console.log('[Render Node] Final JSON2Video payload:');
  console.log(JSON.stringify(payload, null, 2));

  // --------------------------------------------------
  // 6. Submit movie
  // --------------------------------------------------

  let videoUrl = null;
  let error = null;

  try {

    console.log(
      '[Render Node] Submitting project to JSON2Video...'
    );

    const submitRes = await fetch(
      'https://api.json2video.com/v2/movies',
      {
        method: 'POST',

        headers: {
          'x-api-key': apiKey,
          'Content-Type': 'application/json'
        },

        body: JSON.stringify(payload)
      }
    );

    const submitData =
      await submitRes.json();

    console.log(
      '[Render Node] Submit response:',
      JSON.stringify(
        submitData,
        null,
        2
      )
    );

    if (
      !submitRes.ok ||
      !submitData.success
    ) {
      throw new Error(
        `JSON2Video API Error: ${
          submitData.message ||
          submitData.error ||
          submitRes.statusText
        }`
      );
    }

    const projectId =
      submitData.project;

    console.log(
      `[Render Node] Project created: ${projectId}. Polling for completion...`
    );

    // --------------------------------------------------
    // 7. Poll for render completion
    // --------------------------------------------------

    const maxRetries = 36;

    for (
      let retries = 0;
      retries < maxRetries;
      retries++
    ) {

      await new Promise(
        resolve =>
          setTimeout(resolve, 5000)
      );

      const pollRes = await fetch(
        `https://api.json2video.com/v2/movies?project=${projectId}`,
        {
          method: 'GET',

          headers: {
            'x-api-key': apiKey
          }
        }
      );

      const pollData =
        await pollRes.json();

      console.log(
        '[Render Node] Poll response:',
        JSON.stringify(
          pollData,
          null,
          2
        )
      );

      const movie =
        pollData.movie;

      const status =
        movie?.status;

      console.log(
        `[Render Node] Polling... Status: ${status}`
      );

      // ----------------------------------------------
      // SUCCESS
      // ----------------------------------------------

      if (status === 'done') {

        videoUrl =
          movie?.url;

        if (!videoUrl) {
          throw new Error(
            'JSON2Video finished rendering but returned no video URL.'
          );
        }

        console.log(
          `[Render Node] ✓ Video rendered successfully: ${videoUrl}`
        );

        break;
      }

      // ----------------------------------------------
      // ERROR
      // ----------------------------------------------

      if (status === 'error') {

        const serverError =
          movie?.message ||
          movie?.error ||
          pollData?.message ||
          pollData?.error ||
          'JSON2Video rendering failed.';

        throw new Error(
          serverError
        );
      }
    }

    // --------------------------------------------------
    // 8. Timeout
    // --------------------------------------------------

    if (!videoUrl) {

      throw new Error(
        'Rendering timed out after 3 minutes.'
      );
    }

  } catch (err) {

    console.error(
      '[Render Node] Failed:',
      err.message
    );

    error =
      err.message;
  }

  // --------------------------------------------------
  // 9. Return LangGraph state
  // --------------------------------------------------

  return {
    videoUrl,
    error
  };
}