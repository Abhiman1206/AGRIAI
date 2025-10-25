<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1iahLGXOg1vicysM8LdtzuqJBmbhyfqCB

## Run Locally

**Prerequisites:**  Node.js

1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Deploy to Vercel

1. Push your code to a GitHub repository
2. Go to [Vercel](https://vercel.com/) and create a new project
3. Import your repository
4. Configure the project settings:
   - Framework Preset: Vite
   - Root Directory: Leave empty (or set to the folder containing your package.json)
   - Build Command: `npm run build`
   - Output Directory: `dist`
5. Add environment variables in the Vercel dashboard:
   - `GEMINI_API_KEY` with your actual Gemini API key
6. Deploy!

## Troubleshooting Vercel Deployment Issues

If your app looks different on Vercel than on localhost or if the login is disturbed, try these fixes:

1. **Check Environment Variables**: Make sure `GEMINI_API_KEY` is set in Vercel environment variables
2. **CDN Issues**: The app now uses standard CDNs instead of custom AI Studio CDN
3. **Routing Issues**: The app uses HashRouter which works well on Vercel
4. **Base Path**: The vite.config.ts now properly handles Vercel deployments

The app is configured to work with Vercel's automatic deployments. The vercel.json file handles routing and security headers.