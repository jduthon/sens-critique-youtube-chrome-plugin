const API_KEY = 'YOUR_API_KEY_HERE';

const albumsHTML = [...document.getElementsByClassName('elco-collection-item')];

const getTitle = html => html.querySelector('.elco-title > a').textContent;

const getArtist = html => html.querySelector('.elco-baseline-a').textContent;

const convertToObject = albumHTML => ({
  title: getTitle(albumHTML).replace('(EP)', ''),
  artist: getArtist(albumHTML),
});

const getYoutubeQuery = ({ title, artist }) =>
  `${title}+-+${artist}+full+album`;

const youtubeQueryUrl = 'https://www.youtube.com/results?search_query=';

const createYoutubeLink = album =>
  `${youtubeQueryUrl}${getYoutubeQuery(album)}`;

const albums = albumsHTML.map(convertToObject);

const addLinkToItem = (link, albumHTML) => {
  const linkParent = albumHTML.querySelector('.elco-collection-rating');
  const linkHTML = `
  <a href="${link}" target="_blank" rel="noopener noreferrer" style="display: block;">
    play
  </a>`;
};

const addNodeToItem = (node, albumHTML) => {
  const nodeParent = albumHTML.querySelector('.elco-collection-rating');
  nodeParent.appendChild(node);
};

const createYoutubeSearch = album => () =>
  youtubeSearch(getYoutubeQuery(album));

const addYoutubeSearchButton = (album, albumHTML) => {
  const button = document.createElement('button');
  button.style = 'display: block';
  button.addEventListener('click', () =>
    youtubeSearchAndEmbed(album, albumHTML)
  );
  button.innerHTML = 'search youtube';
  addNodeToItem(button, albumHTML, album);
};

const youtubeApiBaseUrl = 'https://www.googleapis.com/youtube/v3';
const youtubeApiSearchUrl = `${youtubeApiBaseUrl}/search`;

const buildGetParams = (url, params) => {
  const paramsString = Object.keys(params).reduce(
    (acc, key) => `${acc}${acc.length ? '&' : ''}${key}=${params[key]}`,
    ''
  );
  return url + '?' + paramsString;
};

const get = (url, params) =>
  fetch(buildGetParams(url, params)).then(result => result.json());

const transformYoutubeItem = ({ id, ...rest }) => {
  const newProps = {};
  if (id.kind === 'youtube#video') {
    newProps.type = 'video';
    newProps.id = id.videoId;
  }
  if (id.kind === 'youtube#playlist') {
    newProps.type = 'playlist';
    newProps.id = id.playlistId;
  }
  return {
    ...rest,
    ...newProps,
  };
};

const normalizeString = s => s.toLowerCase().replace(/[\(\),\-'\?"]/g, '');

const stringContains = (a, b) =>
  normalizeString(a).includes(normalizeString(b));

const albumMatches = album => name => {
  return ['title', 'artist'].reduce((bool, prop) => {
    return bool && stringContains(name, album[prop]);
  }, true);
};

const youtubeSearch = q =>
  get(youtubeApiSearchUrl, { q, key: API_KEY, part: 'snippet' });

const youtubeSearchAndEmbed = (album, node) =>
  youtubeSearch(getYoutubeQuery(album))
    .then(({ items }) => {
      const matches = items.filter(({ snippet: { title } }) =>
        albumMatches(album)(title)
      );
      if (matches.length) {
        return transformYoutubeItem(matches[0]);
      }
      return {};
    })
    .then(({ type, id }) => {
      const iframe = document.createElement('iframe');
      let src = 'https://www.youtube.com/embed/';
      if (type === 'playlist') {
        src += '?listType=playlist&list=';
      }
      iframe.src = `${src}${id}`;
      iframe.width = 250;
      iframe.height = 250;
      iframe.style = 'display: block;';
      iframe.frameborder = 0;
      node.appendChild(iframe);
    });

albumsHTML.forEach((html, i) => {
  addYoutubeSearchButton(albums[i], html);
});
