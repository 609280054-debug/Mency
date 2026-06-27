const { contextBridge } = require("electron");

contextBridge.exposeInMainWorld("tuningAdvisor", {
  backendUrl: "http://127.0.0.1:8765"
});
