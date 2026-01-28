# WaveTune Electron App

Your WaveTune app is now set up to run as a Windows desktop application!

## Development Mode

Run the app in Electron during development:

```bash
npm run dev:electron
```

This will:
- Start the Vite dev server on port 3000
- Launch Electron window with live reload
- Open DevTools for debugging

## Build Windows .exe

Create a Windows installer:

```bash
npm run build:electron
```

This will:
1. Build your React app with Vite
2. Package it into a Windows installer
3. Output to `release/` folder

You'll find:
- `WaveTune Setup x.x.x.exe` - The installer
- After installing, find WaveTune in your Start menu

## Icon

For a better icon, convert `public/wave.png` to `.ico` format and place it in a `build/` folder:
- Use online converters like cloudconvert.com or favicon.io
- Save as `build/icon.ico`
- The next build will use this icon

## Notes

- The app is completely private - only you can use it
- It still connects to Supabase for auth/data over the internet
- Your YouTube ambient sounds work the same way
- All your user data (streak, favorites) stays with your account
