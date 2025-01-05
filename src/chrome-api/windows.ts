export class Windows {
  static async createBasicWindow(urls?: string[]) {
    return await chrome.windows.create({
      url: urls,
      focused: true,
      state: "fullscreen",
    });
  }

  static get currentWindowId() {
    return chrome.windows.WINDOW_ID_CURRENT;
  }

  static getWindowById(windowId: number, { includeTabInfo = false }) {
    return chrome.windows.get(windowId, {
      populate: includeTabInfo,
    });
  }

  static getCurrent() {
    return chrome.windows.getCurrent();
  }

  static getLastFocused() {
    return chrome.windows.getLastFocused();
  }

  static focusWindow(windowId: number) {
    return chrome.windows.update(windowId, {
      focused: true,
    });
  }

  static drawAttention(windowId: number) {
    return chrome.windows.update(windowId, {
      drawAttention: true,
    });
  }

  static async close(windowId: number) {
    return await chrome.windows.remove(windowId);
  }

  static async getAllWindows({ includeTabInfo = false }) {
    return await chrome.windows.getAll({
      populate: includeTabInfo,
    });
  }

  static Events = {
    onCreated: (callback: (window: chrome.windows.Window) => void) => {
      chrome.windows.onCreated.addListener(callback);
    },
    onRemoved: (callback: (windowId: number) => void) => {
      chrome.windows.onRemoved.addListener(callback);
    },
    onFocusChanged: (
      callback: (windowId: number, noWindowsFocused: boolean) => void
    ) => {
      chrome.windows.onFocusChanged.addListener((windowId) => {
        if (windowId === chrome.windows.WINDOW_ID_NONE) {
          callback(windowId, true);
        } else {
          callback(windowId, false);
        }
      });
    },
  };
}

export class WindowModel {
  constructor(public window: chrome.windows.Window) {}

  close() {
    return Windows.close(this.window.id);
  }

  focus() {
    return Windows.focusWindow(this.window.id);
  }

  drawAttention() {
    return Windows.drawAttention(this.window.id);
  }
}
