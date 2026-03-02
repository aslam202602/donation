const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('dbApi', {
    query: (sql, params) => ipcRenderer.invoke('db-query', sql, params),
    execute: (sql, params) => ipcRenderer.invoke('db-execute', sql, params)
});
