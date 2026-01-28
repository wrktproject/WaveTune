import { app, BrowserWindow } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';

// Recreate __dirname in ES module scope
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 720,
    minWidth: 800,
    minHeight: 600,
    backgroundColor: '#050816',
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  // Load the app
  if (process.env.ELECTRON_START_URL) {
    // Development: load from Vite dev server
    win.loadURL(process.env.ELECTRON_START_URL);
    win.webContents.openDevTools(); // Remove this in production
  } else {
    // Production: load built files from dist
    // Use path.resolve to get absolute path, loadFile handles asar correctly
    const indexPath = path.resolve(__dirname, '..', 'dist', 'index.html');
    console.log('Loading index.html from:', indexPath);
    win.loadFile(indexPath).catch(err => {
      console.error('Failed to load index.html:', err);
    });
  }

  // Open DevTools only when explicitly requested
  if (process.env.ELECTRON_DEVTOOLS === '1') {
    win.webContents.openDevTools();
  }

  // Log any load failures
  win.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL) => {
    console.error('Failed to load URL in Electron window:', {
      errorCode,
      errorDescription,
      validatedURL,
    });
  });

  // Window event handlers
  win.on('closed', () => {
    // window will be garbage-collected; no manual cleanup needed
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
