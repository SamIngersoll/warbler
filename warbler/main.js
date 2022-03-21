const electron = require('electron');

electron.app.on("window-all-closed", () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== "darwin") {
    electron.app.quit();
  }
});

electron.app.on("ready", function() {
  const window = new electron.BrowserWindow({
    width: 1280,
    height: 720,
    titleBarStyle: "hidden",
    webPreferences: {
      experimentalFeatures: true,
      nodeIntegration: true
    } 
  });
  window.loadURL("file://" + __dirname + "/index.html");

  window.openDevTools();

});


