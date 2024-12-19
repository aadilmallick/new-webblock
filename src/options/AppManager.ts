import {
  BlockScheduler,
  BlockSite,
  FocusGroup,
  focusModeStorage,
  StorageHandler,
} from "../background/controllers/storage";
import { createReactiveProxyMultipleProps } from "../utils/assorted-vanillajs/Proxies";
import { DateModel, DOM, html } from "../utils/Dom";
import Toaster from "../utils/web-components/Toaster";
import { Switch } from "./Switch";
import { URLMatcherModel } from "./URLMatcherModel";

Toaster.registerSelf();

const externalLinkHTML = (color: string = "#000000") => {
  return html`
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24px"
      height="24px"
      viewBox="0 0 24 24"
      fill="none"
      id="external-link-svg"
    >
      <g id="Interface / External_Link">
        <path
          id="Vector"
          d="M10.0002 5H8.2002C7.08009 5 6.51962 5 6.0918 5.21799C5.71547 5.40973 5.40973 5.71547 5.21799 6.0918C5 6.51962 5 7.08009 5 8.2002V15.8002C5 16.9203 5 17.4801 5.21799 17.9079C5.40973 18.2842 5.71547 18.5905 6.0918 18.7822C6.5192 19 7.07899 19 8.19691 19H15.8031C16.921 19 17.48 19 17.9074 18.7822C18.2837 18.5905 18.5905 18.2839 18.7822 17.9076C19 17.4802 19 16.921 19 15.8031V14M20 9V4M20 4H15M20 4L13 11"
          stroke="${color}"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </g>
    </svg>
  `;
};

function createSelector(containerElement: HTMLElement, className: string) {
  const element = (containerElement || document).querySelector(className);
  if (!element) throw new Error(`Element with class ${className} not found`);
  return ((_class: keyof HTMLElementTagNameMap) => {
    const query = element.querySelector(_class);
    if (!query)
      throw new Error(
        `Parent ${className}: Element with selector ${_class} not found`
      );
    return query;
  }) as InstanceType<typeof HTMLElement>["querySelector"];
}

function createSelectorAll(
  containerElement: HTMLElement,
  parentClassName: string,
  className: string
) {
  const element = (containerElement || document).querySelector(parentClassName);
  if (!element) throw new Error(`Element with class ${className} not found`);
  return ((_class: keyof HTMLElementTagNameMap) => {
    const query = element.querySelectorAll(_class);
    if (!query)
      throw new Error(
        `Parent ${className}: Element with selector ${_class} not found`
      );
    return query;
  }) as InstanceType<typeof HTMLElement>["querySelectorAll"];
}

export class AppManager {
  private permanentSchedule = html`
    <div class="permanent-schedule">
      <button class="bg-green-500 text-white px-4 py-2 rounded-lg">
        Add Permanent Block
      </button>
      <ul class="permanent-schedule-list"></ul>
      <dialog class="p-4 rounded">
        <h3 class="text-lg mb-4">Add permanent block website</h3>
        <form class="space-y-2">
          <div>
            <label for="url" class="block text-sm text-gray-400">URL</label>
            <input
              type="url"
              name="url"
              id="url"
              class="p-1 border w-full"
              autofocus
            />
          </div>
          <button
            type="submit"
            class="bg-black text-white px-3 py-2 rounded w-full"
          >
            Add
          </button>
        </form>
      </dialog>
    </div>
  `;

  private schedule = html`
    <div class="schedule">
      <button class="bg-green-500 text-white px-4 py-2 rounded-lg">
        Add Schedule Block
      </button>
      <ul class="schedule-list"></ul>

      <dialog class="p-4 rounded">
        <h3>Add Schedule Block Site</h3>
        <form class="space-y-2">
          <div class="form-control">
            <label for="url" class="block text-sm">URL</label>
            <input type="url" name="url" id="url" class="p-1 border w-full" />
          </div>
          <div class="flex flex-col space-y-2">
            <div class="flex gap-x-4 items-center">
              <label for="startTime">Start Time</label>
              <input
                type="time"
                name="startTime"
                id="startTime"
                class="p-1 border flex-1 block"
              />
            </div>
            <div class="flex gap-x-4 items-center">
              <label for="endTime">End Time</label>
              <input
                type="time"
                name="endTime"
                id="endTime"
                class="p-1 border flex-1 block"
              />
            </div>
          </div>
          <button
            type="submit"
            class="bg-black text-white px-3 py-2 rounded w-full"
          >
            Add
          </button>
        </form>
      </dialog>
    </div>
  `;

  private focusGroup = html`
    <div class="focusgroup">
      <button class="bg-green-500 text-white px-4 py-2 rounded-lg">
        Add Focus Group
      </button>
      <div class="focus-group-list mt-2 space-y-4"></div>
      <dialog id="add-focus-group">
        <h3>Add focus group</h3>
        <form>
          <div class="form-control">
            <label for="name">Name</label>
            <input
              type="text"
              name="name"
              id="name"
              class="p-1 border"
              required
            />
          </div>
          <button
            type="submit"
            class="bg-black text-white px-3 py-2 rounded w-full"
          >
            Add
          </button>
        </form>
      </dialog>
      <dialog id="add-focus-link" class="p-4 rounded">
        <h3 class="text-lg font-bold">
          Add link to <span id="group-name-placeholder"></span>
        </h3>
        <form class="space-y-2">
          <div class="form-control">
            <label for="url" class="block text-sm">URL</label>
            <input
              type="url"
              name="url"
              id="url"
              class="p-1 border w-full"
              required
            />
          </div>
          <div>
            <select
              name="matchoptions"
              id="matchoptions"
              required
              className="border border-gray-300 rounded-md w-full p-1"
            >
              <option value="match-domain" selected>Match Domain</option>
              <option value="match-path">Match Path</option>
              <option value="match-exact">Match Exact</option>
              <option value="match-query">Match Query</option>
            </select>
          </div>
          <button
            type="submit"
            class="bg-black text-white px-3 py-2 rounded w-full"
          >
            Add
          </button>
        </form>
      </dialog>
    </div>
  `;

  private appString = html`
    <main class="app-container">
      <h1 class="text-2xl mb-4">Options</h1>
      <div class="grid lg:grid-cols-3 gap-4 md:grid-cols-1">
        ${this.permanentSchedule} ${this.schedule} ${this.focusGroup}
      </div>
      <toaster-element data-position="top-right"></toaster-element>
    </main>
  `;

  private abortControllers = {
    permanentScheduleController: new AbortController(),
    scheduleController: new AbortController(),
    focusGroupController: new AbortController(),
  };

  App: HTMLElement;
  private $permSchedule: InstanceType<typeof HTMLElement>["querySelector"];
  private $schedule: InstanceType<typeof HTMLElement>["querySelector"];
  private $focusGroup: InstanceType<typeof HTMLElement>["querySelector"];
  private $$focusGroup: ReturnType<typeof createSelectorAll>;
  private $: (
    string: string
  ) => InstanceType<typeof HTMLElement>["querySelector"];
  private $$: (string: string) => ReturnType<typeof createSelectorAll>;
  toaster: Toaster;
  constructor() {
    this.App = DOM.createDomElement(this.appString);
    this.$ = createSelector.bind(null, this.App);
    this.$$ = createSelectorAll.bind(null, this.App);
    this.$permSchedule = this.$(".permanent-schedule");
    this.$schedule = this.$(".schedule");
    this.$focusGroup = this.$(".focusgroup");
    this.$$focusGroup = this.$$(".focusgroup");
    this.toaster = this.App.querySelector("toaster-element") as Toaster;
    this.populateData();
  }

  appProxy = createReactiveProxyMultipleProps(
    {
      permanentBlocks: [] as BlockSite[],
      scheduledBlocks: [] as BlockSite[],
      focusGroups: [] as FocusGroup[],
    },
    (state, propertyChanged, newValue) => {
      if (propertyChanged === "permanentBlocks") {
        const list = this.$permSchedule("ul");
        list.innerHTML = "";
        const listElements = newValue.map((blocksite) => {
          const listElement = html`<li class="url-item">
            ${blocksite.url}<button
              class="trashcan"
              data-site="${blocksite.url}"
            >
              🗑️
            </button>
          </li>`;
          return DOM.createDomElement(listElement);
        });
        DOM.addElementsToContainer(list, listElements);
      }
      if (propertyChanged === "scheduledBlocks") {
        const list = this.$schedule("ul");
        list.innerHTML = "";
        const listElements = newValue.map((blocksite) => {
          const listElement = html`<li class="url-item">
            ${blocksite.url}<button
              class="trashcan"
              data-site="${blocksite.url}"
            >
              🗑️
            </button>
          </li>`;
          return DOM.createDomElement(listElement);
        });
        DOM.addElementsToContainer(list, listElements);
      }
      if (propertyChanged === "focusGroups") {
        this.abortControllers.focusGroupController.abort();
        this.abortControllers.focusGroupController = new AbortController();
        console.log("newvalue", newValue);

        const focusGroupList = this.$focusGroup(
          ".focus-group-list"
        ) as HTMLElement;
        focusGroupList.innerHTML = "";
        const focusGroupElements = (newValue as FocusGroup[]).map(
          (focusGroup) => {
            const listElements = focusGroup.links.map((link) => {
              return html` <li class="url-item">
                ${link}
                <button
                  class="trashcan"
                  data-site="${link}"
                  data-focus-group-name="${focusGroup.name}"
                >
                  🗑️
                </button>
              </li>`;
            });
            const singleFocusGroup = html`<div class="focus-group-container">
              <div
                class="focus-group-header flex items-center justify-between border-b-2 pb-2 mb-2 border-gray-200"
              >
                <div class="flex items-center">
                  <span>${focusGroup.name}</span>
                  <div class="relative">
                    <button
                      class="open-focus-group absolute top-0 left-0 w-full h-full z-20"
                      data-focus-group-name="${focusGroup.name}"
                      title="open external links"
                    ></button>
                    ${externalLinkHTML()}
                  </div>
                </div>
                <div class="focus-group-actions flex items-center space-x-2">
                  <button
                    class="rounded-full bg-red-500 text-white w-8 h-8 p-1 font-bold shadow-lg delete-focus-group flex items-center justify-center hover:bg-red-700 transition-colors text-xl"
                    data-focus-group-name="${focusGroup.name}"
                    title="delete focus group"
                  >
                    x
                  </button>
                  <button
                    class="rounded-full bg-green-500 text-white w-8 h-8 p-1 font-bold shadow-lg add-focus-group-link flex items-center justify-center hover:bg-green-700 transition-colors text-xl"
                    data-focus-group-name="${focusGroup.name}"
                    title="add link to focus group"
                  >
                    +
                  </button>
                </div>
              </div>
              <ul class="focus-group">
                ${listElements.join("")}
              </ul>
            </div>`;
            const element = DOM.createDomElement(
              singleFocusGroup
            ) as HTMLElement;

            // add switch element, with event listener.
            const switchElement = new Switch(focusGroup.isFocusing);
            switchElement.onCheckedChange(async (checked) => {
              const newFocusGroups = await StorageHandler.setFocus(
                focusGroup.name,
                checked
              );
              document.startViewTransition(() => {
                this.appProxy.focusGroups = newFocusGroups;
              });
            }, this.abortControllers.focusGroupController.signal);
            switchElement.content.title = "Toggle focus mode";
            element
              .querySelector(".focus-group-actions")
              .insertAdjacentElement("afterbegin", switchElement.content);
            return element;
          }
        );
        DOM.addElementsToContainer(focusGroupList, focusGroupElements);
      }
    }
  );

  addEventListeners({
    onFocusGroupAdd,
    onPermScheduleAdd,
    onScheduleAdd,
  }: {
    onPermScheduleAdd: (url: string) => Promise<void>;
    onScheduleAdd: (
      url: string,
      startTime: string,
      endTime: string
    ) => Promise<void>;
    onFocusGroupAdd: (groupName: string) => Promise<void>;
  }) {
    // permanent schedule
    const dialogPerm = this.$permSchedule("dialog");
    console.log(dialogPerm);
    dialogPerm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const url = (
        dialogPerm.querySelector("input[type='url']") as HTMLInputElement
      ).value;
      if (!url) {
        this.toaster.danger("URL is required");
        return;
      }
      try {
        await onPermScheduleAdd(url);
        this.toaster.success("URL added to permanent schedule");
      } catch (e) {
        console.error(e);
        this.toaster.danger(e.message);
      } finally {
        dialogPerm.close();
      }
    });

    // schedule
    const dialogSchedule = this.$schedule("dialog");
    dialogSchedule
      .querySelector("form")
      .addEventListener("submit", async (e) => {
        e.preventDefault();
        const url = (dialogSchedule.querySelector("#url") as HTMLInputElement)
          .value;
        const startTime = (
          dialogSchedule.querySelector("#startTime") as HTMLInputElement
        ).value;
        const endTime = (
          dialogSchedule.querySelector("#endTime") as HTMLInputElement
        ).value;
        await onScheduleAdd(url, startTime, endTime);
        dialogSchedule.close();
      });

    // region focus group listener

    // for adding focus group
    const dialogFocusGroup = this.$focusGroup(
      "#add-focus-group"
    ) as HTMLDialogElement;
    dialogFocusGroup
      .querySelector("form")
      .addEventListener("submit", async (e) => {
        e.preventDefault();
        const groupName = (
          dialogFocusGroup.querySelector("#name") as HTMLInputElement
        ).value;
        if (!groupName) {
          this.toaster.danger("Group name is required");
          console.error(`Group name is required ${groupName}`);
          dialogFocusGroup.close();
          return;
        }
        await onFocusGroupAdd(groupName);
        dialogFocusGroup.close();
      });

    // for adding focus group link
    const addFocusLinkDialog = this.$focusGroup(
      "#add-focus-link"
    ) as HTMLDialogElement;
    addFocusLinkDialog
      .querySelector("form")
      .addEventListener("submit", async (e) => {
        e.preventDefault();
        const groupName = addFocusLinkDialog.getAttribute(
          "data-focus-group-name"
        );
        console.log("group name", groupName);
        if (!groupName) {
          this.toaster.danger("Focus group name not found");
          console.error(groupName);
          return;
        }
        const url = (
          addFocusLinkDialog.querySelector("#url") as HTMLInputElement
        ).value;
        const matchOptionValue = (
          addFocusLinkDialog.querySelector("#matchoptions") as HTMLSelectElement
        ).value;
        if (!url || !matchOptionValue) {
          this.toaster.danger("URL is required");
          addFocusLinkDialog.close();
          return;
        }
        if (url.startsWith("chrome://")) {
          this.toaster.danger("Cannot add chrome:// URLs");
          addFocusLinkDialog.close();
          return;
        }
        const urlPattern = URLMatcherModel.generateUrlPattern(url, {
          matchDomain: matchOptionValue === "match-domain",
          matchPath: matchOptionValue === "match-path",
          matchExact: matchOptionValue === "match-exact",
          matchQuery: matchOptionValue === "match-query",
        });
        console.log(urlPattern);
        const newFocusGroups = await StorageHandler.addLinkToFocusGroup(
          groupName,
          urlPattern
        );
        this.appProxy.focusGroups = newFocusGroups;
        addFocusLinkDialog.close();
      });

    this.$permSchedule("button").addEventListener("click", async () => {
      dialogPerm.showModal();
    });

    this.$schedule("button").addEventListener("click", async () => {
      dialogSchedule.showModal();
    });

    this.$focusGroup("button").addEventListener("click", async () => {
      dialogFocusGroup.showModal();
    });

    // region list deletions
    const permBlockedList = this.$permSchedule("ul");
    permBlockedList.addEventListener("click", async (e) => {
      if (
        e.target instanceof HTMLButtonElement &&
        e.target.matches(".trashcan")
      ) {
        const site = e.target.getAttribute("data-site");
        console.log(site);
        if (!site) return;
        const confirm = window.confirm(
          "Are you sure you want to remove this site from the permanent block list?"
        );
        if (!confirm) return;
        await StorageHandler.removeBlockSite(site);
        this.appProxy.permanentBlocks = this.appProxy.permanentBlocks.filter(
          (blocksite) => blocksite.url !== site
        );
        this.toaster.success("Site removed from permanent block list");
      }
    });

    const scheduleBlockedList = this.$schedule("ul");
    scheduleBlockedList.addEventListener("click", async (e) => {
      if (
        e.target instanceof HTMLButtonElement &&
        e.target.matches(".trashcan")
      ) {
        const site = e.target.getAttribute("data-site");
        console.log(site);
        if (!site) return;
        const confirm = window.confirm(
          "Are you sure you want to remove this site from the scheduled block list?"
        );
        if (!confirm) return;
        await StorageHandler.removeBlockSite(site);
        this.appProxy.scheduledBlocks = this.appProxy.scheduledBlocks.filter(
          (blocksite) => blocksite.url !== site
        );
        this.toaster.success("Site removed from scheduled block list");
      }
    });

    const focusGroupList = this.$focusGroup(".focus-group-list");
    focusGroupList.addEventListener("click", async (e) => {
      // 1. handle deleting individual links from focus group
      if (
        e.target instanceof HTMLButtonElement &&
        e.target.matches(".trashcan")
      ) {
        const site = e.target.getAttribute("data-site");
        const focusGroupName = e.target.getAttribute("data-focus-group-name");
        if (!site || !focusGroupName) {
          console.group("err");
          console.log(site, focusGroupName);
          console.error("Site or focus group name not found");
          console.groupEnd();
          this.toaster.danger("Site or focus group name not found");
          return;
        }
        const confirm = window.confirm(
          "Are you sure you want to remove this site from the focus group?"
        );
        if (!confirm) return;
        const newFocusGroups = await StorageHandler.removeLinkFromFocusGroup(
          focusGroupName,
          site
        );
        this.appProxy.focusGroups = newFocusGroups;
        this.toaster.success("Site removed from focus group");
      }

      // 2. handle opening focus group link add dialog
      if (
        e.target instanceof HTMLButtonElement &&
        e.target.matches(".add-focus-group-link")
      ) {
        const focusGroupName = e.target.getAttribute("data-focus-group-name");
        addFocusLinkDialog.setAttribute(
          "data-focus-group-name",
          focusGroupName
        );
        const placeholderElement = addFocusLinkDialog.querySelector(
          "#group-name-placeholder"
        ) as HTMLElement;
        placeholderElement.textContent = focusGroupName;
        addFocusLinkDialog.showModal();
      }

      // 3. handle deleting focus group
      if (
        e.target instanceof HTMLButtonElement &&
        e.target.matches(".delete-focus-group")
      ) {
        const focusGroupName = e.target.getAttribute("data-focus-group-name");
        if (!focusGroupName) return;
        const confirm = window.confirm(
          "Are you sure you want to delete this focus group?"
        );
        if (!confirm) return;
        const newFocusGroups = await StorageHandler.removeFocusGroup(
          focusGroupName
        );
        this.appProxy.focusGroups = newFocusGroups;
        this.toaster.success("Focus group removed");
      }

      // 4. handle opening focus group
      if (
        e.target instanceof HTMLButtonElement &&
        e.target.matches(".open-focus-group")
      ) {
        const focusGroupName = e.target.getAttribute("data-focus-group-name");
        if (!focusGroupName) return;
        const focusGroup = this.appProxy.focusGroups.find(
          (group) => group.name === focusGroupName
        );
        if (!focusGroup) {
          this.toaster.danger("Focus group not found");
          return;
        }
        const focusGroupLinks = focusGroup.links.map((link) =>
          URLMatcherModel.getURLFromPattern(link)
        );
        focusGroupLinks.forEach((link) => {
          chrome.tabs.create({ url: link });
        });
      }
    });
  }

  async populateData() {
    const permanentBlockedSites =
      await StorageHandler.getPermanentlyBlockedSites();
    this.appProxy.permanentBlocks = permanentBlockedSites;
    const scheduledBlockedSites = await StorageHandler.getScheduledBlockSites();
    this.appProxy.scheduledBlocks = scheduledBlockedSites;
    const focusGroups = await focusModeStorage.get("focusGroups");
    this.appProxy.focusGroups = focusGroups;
  }
}
