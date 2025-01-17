import {
  CURRENT_SITE_INFO, CURRENT_SITE_NAME,
} from '../const';
import { getUrlParam } from '../common';
const filterBluTorrent = (imdb = '', name = '') => {
  if (imdb) {
    $('#imdb').val(imdb);
  } else if (name) {
    $('#search').val(name);
  }
  const token = $('meta[name="csrf_token"]').attr('content');
  GM_xmlhttpRequest({
    method: 'GET',
    url: `${CURRENT_SITE_INFO.url}/torrents/filter?search=${name}&imdb=${imdb}&_token=${token}&sorting=size&direction=desc`,
    onload (res) {
      $('#facetedSearch').html(res.responseText);
    },
  });
};
// 某些站点需要将IMDB填入检索表单
const fillSearchImdb = () => {
  const imdbParam = getUrlParam('imdb');
  const nameParam = getUrlParam('name');
  const searchType = getUrlParam('search_area');
  if (imdbParam || nameParam) {
    if (CURRENT_SITE_INFO.siteType === 'UNIT3D') {
      filterBluTorrent(imdbParam, nameParam);
    } else if (CURRENT_SITE_NAME === 'Bdc') {
      $('#tsstac').val(imdbParam);
      $('#search_type').val(searchType);
    } else if (CURRENT_SITE_NAME === 'HDAI') {
      $('input[name="keyword"]').val(imdbParam || nameParam);
      $('select[name="keyword_area"]').val(searchType);
    }
  }
};
export {
  fillSearchImdb,
};
