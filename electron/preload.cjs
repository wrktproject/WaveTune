// Preload script - runs before web content loads
// You can expose Node.js APIs to the renderer here if needed

const { contextBridge } = require('electron');

// Expose protected methods that allow the renderer process to use
// ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electron', {
  // Add any custom APIs you want to expose to your React app here
  // For now, this can be empty
});

