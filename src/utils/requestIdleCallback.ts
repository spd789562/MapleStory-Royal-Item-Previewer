/* polyfill from https://developer.chrome.com/blog/using-requestidlecallback */
function requestIdleCallbackPolyfill(callback: IdleRequestCallback, options?: IdleRequestOptions) {
  const start = Date.now();
  return setTimeout(() => {
    callback({
      didTimeout: false,
      timeRemaining() {
        return Math.max(0, 50 - (Date.now() - start));
      },
    });
  }, 1);
}

function cancelIdleCallbackPolyfill(id: number) {
  clearTimeout(id);
}

export const requestIdleCallback =
  typeof window !== 'undefined' && window.requestIdleCallback
    ? window.requestIdleCallback
    : requestIdleCallbackPolyfill;
export const cancelIdleCallback =
  typeof window !== 'undefined' && window.cancelIdleCallback ? window.cancelIdleCallback : cancelIdleCallbackPolyfill;

export function asyncRequestIdleCallback<T = any>(
  callback: () => Promise<T>,
  options?: IdleRequestOptions,
): Promise<T> {
  return new Promise((resolve) => {
    requestIdleCallback(async () => {
      resolve(await callback());
    }, options);
  });
}
