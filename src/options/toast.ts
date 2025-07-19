import Toaster from "../utils/web-components/Toaster";

const toaster = document.querySelector("toaster-element") as Toaster;

export const toast = {
  success: (message: string) => {
    toaster.success(message);
  },
  danger: (message: string) => {
    toaster.danger(message);
  },
};
