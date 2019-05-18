const fetchQueryListener = ({ url }, sendResponse) =>
  fetch(url)
    .then(r => r.json())
    .then(sendResponse);

chrome.runtime.onMessage.addListener(({ type, ...rest }, _, sendResponse) => {
  if (type === 'fetch') {
    fetchQueryListener({ ...rest }, sendResponse);
    return true;
  }
});
