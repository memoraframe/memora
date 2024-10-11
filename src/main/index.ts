import { app, shell, BrowserWindow, ipcMain, protocol, nativeImage } from 'electron'
import path, { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import fs from 'fs';
import { fileURLToPath, format } from 'url';
import Store from 'electron-store';
import MemoraConfig, { Transformation } from '../types/MemoraConfig'
import cron from 'node-cron'
import { HeadBucketCommand } from '@aws-sdk/client-s3';
import { scheduler, thumbnailDirectory } from './scheduler';
import { createWebdavClient } from './client/createWebdavClient';
import { createS3Client } from './client/createS3Client';
import { isMediaFile } from './isMedia';

const store = new Store();

var isDev = process.env.APP_DEV ? (process.env.APP_DEV.trim() == "true") : false;
function createWindow(): void {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    show: false,
    autoHideMenuBar: true,
    fullscreen: !isDev,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      webSecurity: false,
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // IPC test
  ipcMain.on('ping', () => console.log('pong'))


  // Set up the cron job
  cron.schedule('0 * * * *', () => {
    scheduler(store.get('config') as MemoraConfig)
  });

  const config = store.get('config') as MemoraConfig;
  // After Start up 
  setTimeout(() => {
    scheduler(config);
  }, 20000);


  createWindow()
  
  const { protocol } = require('electron');
  const fs = require('fs');
  const { fileURLToPath } = require('url');
  
  protocol.handle("thum", async (request) => {
    const fileUrl = request.url.replace("thum://", "file://");
    const filePath = fileURLToPath(fileUrl); 

    try {
      const imageBuffer = fs.readFileSync(filePath);
      
      return new Response(imageBuffer);
    } catch (error) {
      return new Response("Image not found", { status: 404 });
    }
  });
  
  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.

// Broken on RPI os
// ipcMain.handle('dialog:openDirectory', async () => {
//   return await dialog.showOpenDialog({
//     properties: ['openDirectory']
//   }).then(result => {
//     console.log(result);
//     return result.filePaths
//   }).catch(err => {
//     console.error(err)
//     return [];
//   });
// });


// IPC Handler to set image directory
ipcMain.handle('setConfig', async (_event, config: MemoraConfig) => {
    store.set('config', config);
});

const defaultConfig: MemoraConfig = {
  slideTimeout: 10,
  mediaDirectory: app.getPath('pictures'),
  s3Config: {
    s3AccessKeyId: "",
    s3Bucket: "",
    s3Enabled: false,
    s3Endpoint: "",
    s3ForcePathStyle: false,
    s3Region: "",
    s3SecretAccessKey: "",
    s3SubDirectory: ""
  },
  webdavConfig: {
    webdavEnabled: false,
    webdavEndpoint: "",
    webdavPassword: "",
    webdavSubDirectory: "",
    webdavUsername: "",
  },
  showProgressBar: false,
  transformation: Transformation.SLIDEX
};

ipcMain.handle('getConfig', async (_event) => {
  const storedConfig = store.get('config', {}) as Partial<MemoraConfig>;
  const config: MemoraConfig = {
    ...defaultConfig,
    ...storedConfig,
    s3Config: {
      ...defaultConfig.s3Config,
      ...(storedConfig.s3Config || {})
    },
    webdavConfig: {
      ...defaultConfig.webdavConfig,
      ...(storedConfig.webdavConfig || {})
    }
  };

  return config;
});

// IPC Handler to get image paths
ipcMain.handle('getImages', async () => {
  const config = store.get('config',
    {
      mediaDirectory: app.getPath('pictures')
    }
  ) as MemoraConfig;

    const result = fs.readdirSync(config.mediaDirectory, {
      recursive: true,
      encoding: 'utf8',
    })
    .filter(f => isMediaFile(f))
    .filter(f => !f.startsWith(thumbnailDirectory))
    .map(file => format({
        protocol: 'file',
        slashes: true,
        pathname: path.join(config.mediaDirectory, file),
    }));

    return result;
});

ipcMain.handle('connection:test:s3', async (_event, config) => {
  if (!config || !config.s3Config) {
    return { statusCode: 400, message: "S3 Connection Test Failed: Missing or invalid config" };
  }

  const s3Client = createS3Client(config);
  const command = new HeadBucketCommand({ Bucket: config.s3Config.s3Bucket });

  try {
    const result = await s3Client.send(command);
    return { statusCode: result.$metadata.httpStatusCode, message: "S3 bucket check succeeded" };
  } catch (error) {
    console.error("Failed to check the S3 bucket:", error);

    // Type guard to check if error has the $metadata property
    if (error instanceof Error && '$metadata' in error) {
      const metadata = (error as any).$metadata;
      return { statusCode: metadata?.httpStatusCode || 500, message: error.message};
    }

    return { statusCode: 500, message: "Failed to check the S3 bucket" };
  }
});

ipcMain.handle('connection:test:webdav', async (_event, config) => {
  if (!config || !config.webdavConfig) {
    return { statusCode: 400, message: "WebDAV Connection Test Failed: Missing or invalid config" };
  }

  const client = createWebdavClient(config);

  try {
    // Test if the connection works by trying to access the root directory
    await client.getDirectoryContents('/');
    return { statusCode: 200, message: "WebDAV Connection Test Successful" };
  } catch (error) {
    console.log(error);
    return { statusCode: 500, message: `WebDAV Connection Test Failed: ${error}` };
  }
});