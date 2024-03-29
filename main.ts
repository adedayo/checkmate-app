import { spawn } from 'child_process';
import { app, BrowserWindow, ipcMain, screen, dialog, autoUpdater } from 'electron';
import * as path from 'path';
import * as url from 'url';
import { platform } from 'os';

import * as fs from 'fs';

let win: BrowserWindow = null;
const args = process.argv.slice(1);
const serve = args.some(val => val === '--serve');
let cmExec = 'checkmate';
let os = '';
switch (platform()) {
  case 'darwin':
    os = 'darwin';
    break;
  case 'win32':
    os = 'windows';
    cmExec += '.exe';
    break;
  default:
    os = 'linux';
    break;
}

let appPath = path.join(path.dirname(app.getAppPath()), cmExec);
if (serve) {
  appPath = path.join(path.dirname(app.getAppPath()), 'checkmate-app', 'checkmate-binary', os, cmExec);
}
// console.log('Remote path (exe):', appPath, 'Env: ', process.env.NODE_ENV);


const apiPort = 17283;
const cmArgs = [`api`, `--bind-localhost`, `--port`, `${apiPort}`,
  `--serve-git-service`];

const checkMateAPI = spawn(appPath, cmArgs, { stdio: ['inherit' , 'inherit', 'inherit'] });


ipcMain.handle('api-config', (_event, ..._args) => apiPort);



ipcMain.handle('get-codebase', (_event): Promise<string[]> => dialog.showOpenDialog(win, {
  title: 'CheckMate: Open Code Directory',
  message: 'CheckMate: Open Code Directory',
  properties: ['openFile', 'openDirectory', 'showHiddenFiles', 'treatPackageAsDirectory']
}).then(
  x => {
    if (!x.canceled) {
      return x.filePaths;
    }
    return [];
  }
).catch(reason => {
  console.log(`Unable to load directory: ${reason}`);
  return [];
}));


ipcMain.handle('save-report', (_event, file): Promise<string> => dialog.showSaveDialog(win, {
  title: 'CheckMate: Save Scan Report',
  message: 'CheckMate: Save Scan Report',
  defaultPath: file as string,
  properties: ['showOverwriteConfirmation', 'createDirectory', 'showHiddenFiles', 'treatPackageAsDirectory']
}).then(
  x => {
    if (!x.canceled) {
      const srcFile = file as string;
      if (x.filePath !== srcFile) {
        //only copy file if the destination path is different
        fs.copyFile(srcFile, x.filePath, () => { });
      }
      return x.filePath;
    }
    return '';
  }
).catch(reason => {
  console.log(`Unable to load directory: ${reason}`);
  return '';
}));


ipcMain.handle('save-policy', (_event, file, policy): Promise<string> => dialog.showSaveDialog(win, {
  title: 'CheckMate: Save Policy',
  message: 'CheckMate: Save Policy',
  defaultPath: file as string,
  properties: ['showOverwriteConfirmation', 'createDirectory', 'showHiddenFiles', 'treatPackageAsDirectory']
}).then(
  x => {
    if (!x.canceled) {
      const pol = policy as string;
      fs.writeFile(x.filePath, pol, () => { });
      return x.filePath;
    }
    return '';
  }
).catch(reason => {
  console.log(`Unable to load directory: ${reason}`);
  return '';
}));


// eslint-disable-next-line prefer-arrow/prefer-arrow-functions
function createWindow(): BrowserWindow {

  const electronScreen = screen;
  const size = electronScreen.getPrimaryDisplay().workAreaSize;

  const heightRatio = 0.8;
  const widthRatio = 0.75;
  const x = size.width * (1 - widthRatio) / 2;
  const y = size.height * (1 - heightRatio) / 2;
  // Create the browser window.
  win = new BrowserWindow({
    x,
    y,
    width: size.width * widthRatio,
    height: size.height * heightRatio,
    minWidth: 500,
    minHeight: 500,
    webPreferences: {
      nodeIntegration: true,
      devTools: (serve) ? true : false,
      allowRunningInsecureContent: false,
      contextIsolation: false,  // false if you want to run 2e2 test with Spectron
      // enableRemoteModule: true // true if you want to run 2e2 test  with Spectron or use remote module in renderer context (ie. Angular)
    },
  });

  if (serve) {
    require('electron-reload')(__dirname, {
      electron: require(`${__dirname}/node_modules/electron`)
    });
    win.loadURL('http://localhost:4200');

  } else {
    const indexFile = url.format(url.pathToFileURL(path.join(__dirname, 'dist/checkmate-app/index.html')));
    win.loadURL(indexFile);
  }

  // Emitted when the window is closed.
  win.on('closed', () => {
    // Dereference the window object, usually you would store window
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    win = null;
  });

  return win;
}

try {
  // This method will be called when Electron has finished
  // initialization and is ready to create browser windows.
  // Some APIs can only be used after this event occurs.
  // Added 400 ms to fix the black background issue while using transparent window.
  // More detail at https://github.com/electron/electron/issues/15947
  app.on('ready', () => {
    setTimeout(createWindow, 400);
    //TODO: implement auto-update
  });

  // Quit when all windows are closed.
  app.on('window-all-closed', () => {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });

  app.on('before-quit', () => {
    checkMateAPI.kill();
  });

  app.on('activate', () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (win === null) {
      createWindow();
    }
  });

} catch (e) {
  // Catch Error
  // throw e;
}
