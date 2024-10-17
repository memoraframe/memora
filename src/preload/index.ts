import { electronAPI } from '@electron-toolkit/preload'
import { contextBridge, ipcRenderer } from 'electron';
import MemoraConfig from '../types/MemoraConfig';
import 'electron-log/preload'

// Custom APIs for renderer
const api = {
  getConfig: () => ipcRenderer.invoke('getConfig'),
  setConfig: (config: MemoraConfig) => ipcRenderer.invoke('setConfig', config),
  getImages: () => ipcRenderer.invoke('getImages'),
  connectionTestS3: (config: MemoraConfig) => ipcRenderer.invoke('connection:test:s3', config),
  connectionTestWebdav: (config: MemoraConfig) => ipcRenderer.invoke('connection:test:webdav', config),
  openDirectory: () => ipcRenderer.invoke('dialog:openDirectory'),
  onSyncError: (callback) => ipcRenderer.on('sync:error', (_event, error) => callback(error)),
  onSyncStart: (callback) => ipcRenderer.on('sync:start', (_event) => callback()),
  onSyncStop: (callback) => ipcRenderer.on('sync:stop', (_event) => callback()),
  onSyncDownloadStart: (callback) => ipcRenderer.on('sync:download:start', (_event, src) => callback(src)),
  onSyncDownloadStop: (callback) => ipcRenderer.on('sync:download:stop', (_event, src) => callback(src))
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
    contextBridge.exposeInMainWorld('env', {
      isDev: process.env.APP_DEV ? (process.env.APP_DEV.trim() == "true") : false
    })
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}

