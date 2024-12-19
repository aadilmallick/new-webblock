import {
  BlockScheduler,
  BlockSite,
  FocusGroup,
  focusModeStorage,
  StorageHandler,
} from "../background/controllers/storage";
import "../index.css";
import { DateModel, DOM, html } from "../utils/Dom";
import { AppManager } from "./AppManager";
import "./options.css";

const appManager = new AppManager();

document.body.appendChild(appManager.App);

appManager.addEventListeners({
  onFocusGroupAdd: async (groupName) => {
    const newFocusGroups = await StorageHandler.addFocusGroup(
      groupName || `Focus Group ${appManager.appProxy.focusGroups.length + 1}`
    );
    appManager.appProxy.focusGroups = newFocusGroups;
  },
  onPermScheduleAdd: async (url) => {
    const urlToAdd = new URL(url).origin;
    if (!BlockScheduler.isValidUrl(urlToAdd)) {
      throw new Error("Invalid URL");
    }
    const newBlockSites = await StorageHandler.addPermanentBlockSite(urlToAdd);
    appManager.appProxy.permanentBlocks = newBlockSites;
  },
  onScheduleAdd: async (url, startTime, endTime) => {
    const startDate = DateModel.convertTimeToDate(startTime);
    const endDate = DateModel.convertTimeToDate(endTime);
    if (startDate > endDate) {
      throw new Error("Start time cannot be greater than end time");
    }
    const urlToAdd = new URL(url).origin;
    if (!BlockScheduler.isValidUrl(urlToAdd)) {
      throw new Error("Invalid URL");
    }
    const scheduledBlockSites = await StorageHandler.addScheduledBlockSite(
      urlToAdd,
      startDate,
      endDate
    );
    appManager.appProxy.scheduledBlocks = scheduledBlockSites;
  },
});
