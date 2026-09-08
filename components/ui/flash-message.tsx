"use client";

import { useEffect, useState } from "react";

const FLASH_COOKIE_NAME = "mini_ec_flash";

function readFlashCookie() {
  const cookie = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${FLASH_COOKIE_NAME}=`));

  if (!cookie) {
    return "";
  }

  const value = cookie.split("=").slice(1).join("=");
  return decodeURIComponent(value);
}

function deleteFlashCookie() {
  document.cookie = `${FLASH_COOKIE_NAME}=; path=/; max-age=0; samesite=lax`;
}

export function FlashMessage() {
  const [message, setMessage] = useState("");

  useEffect(() => {
    const timerId = window.setTimeout(() => {
      const flashMessage = readFlashCookie();

      if (flashMessage) {
        setMessage(flashMessage);
        deleteFlashCookie();
      }
    }, 0);

    return () => window.clearTimeout(timerId);
  }, []);

  if (!message) {
    return null;
  }

  return (
    <div className="fixed right-5 top-24 z-50 w-[min(360px,calc(100vw-2.5rem))] rounded-2xl border border-red-200 bg-red-50 p-4 text-red-800 shadow-lg">
      <div className="flex items-start justify-between gap-4">
        <p className="text-sm font-bold">{message}</p>
        <button
          type="button"
          onClick={() => setMessage("")}
          className="rounded-full px-2 text-sm font-bold transition hover:bg-red-100"
          aria-label="メッセージを閉じる"
        >
          ×
        </button>
      </div>
    </div>
  );
}
