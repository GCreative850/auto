# ZZTV Auto Sports

Phone-first web app for the ZZTV kids sports automation project.

## What works now

- Opens as a real website when hosted
- START ZZTV button runs real JavaScript
- Generates a kid-friendly sports content package
- Creates YouTube title, description, tags, and script
- Creates TikTok caption, hashtags, and clip plan
- Saves the latest package locally in the browser
- Copies the generated package
- Keeps real uploading disabled until backend OAuth/API keys are connected

## Important

Do not put YouTube, TikTok, or AI API keys directly in this front-end app. Browser apps expose keys. Real upload automation needs a backend.

## Phone use

Use GitHub Pages, Netlify, Vercel, or another static host. Do not open the file from iPhone Files preview.

Recommended GitHub Pages URL after Pages is enabled:

https://gcreative850.github.io/auto/

## Next backend phase

To turn this into a real auto-upload system, add:

1. Backend server for private API keys
2. YouTube OAuth upload route
3. TikTok publishing/draft route depending on account eligibility
4. Video renderer service
5. Cloud storage for generated assets
6. Scheduler/queue worker
7. Audit logs and retry logic
