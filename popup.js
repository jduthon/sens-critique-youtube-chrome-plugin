const getCurrentTab = () =>
  new Promise(resolve =>
    chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) =>
      resolve(tab)
    )
  );

const onCurrentTabMatches = matchFn =>
  new Promise(resolve =>
    getCurrentTab().then(tab => {
      if (matchFn(tab)) {
        resolve(tab);
      }
    })
  );

const sensCritiqueMatch = ({ url }) => url.includes('senscritique.com');

const onCurrentTabSensCritique = onCurrentTabMatches(sensCritiqueMatch);

const insertInpageScript = () =>
  chrome.tabs.executeScript(null, {
    file: 'inpage.js',
  });

document.addEventListener('DOMContentLoaded', () => {
  onCurrentTabSensCritique.then(insertInpageScript);
});
