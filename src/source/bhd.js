import { CURRENT_SITE_INFO, CURRENT_SITE_NAME, TORRENT_INFO } from '../const';
import { formatTorrentTitle, getAreaCode, getInfoFromMediaInfo, getInfoFromBDInfo, getSize, getFilterBBCode, getTagsFromSubtitle, getPreciseCategory } from '../common';

export default async () => {
  TORRENT_INFO.sourceSite = CURRENT_SITE_NAME;
  TORRENT_INFO.sourceSiteType = CURRENT_SITE_INFO.siteType;
  const { Category, Name, Source, Type, Size } = getBasicInfo();
  TORRENT_INFO.size = getSize(Size);
  TORRENT_INFO.title = formatTorrentTitle(Name);
  const tags = getTagsFromSubtitle(TORRENT_INFO.title);
  const TMDBYear = $('.movie-heading a:last').text();
  const movieName = $('.movie-heading a:first').text();
  if (!TMDBYear) {
    const matchYear = TORRENT_INFO.title.match(/\s([12][90]\d{2})/);
    TORRENT_INFO.year = matchYear ? matchYear[0] : '';
  } else {
    TORRENT_INFO.year = TMDBYear;
  }

  const descriptionDom = $('.panel-heading:contains(Description)').next('.panel-body').find('.forced-nfo');
  const descriptionBBCode = getFilterBBCode(descriptionDom[0]);
  const { category: movieCat, countries, imdbUrl } = getMovieDetails();
  TORRENT_INFO.movieName = movieName;
  let category = Category.toLowerCase().replace(/s/, '');
  category = movieCat === 'Animation' ? 'cartoon' : category;
  TORRENT_INFO.category = getPreciseCategory(TORRENT_INFO, category);
  TORRENT_INFO.source = getSource(Source, Type);
  TORRENT_INFO.area = getAreaCode(countries);
  TORRENT_INFO.videoType = getVideoType(Type);
  const isBluray = TORRENT_INFO.videoType.match(/bluray/i);
  const mediaInfo = $('#stats-full code').text();
  TORRENT_INFO.mediaInfo = mediaInfo;
  TORRENT_INFO.description = `${descriptionBBCode}\n[quote]${mediaInfo}[/quote]`;
  const getInfoFunc = isBluray ? getInfoFromBDInfo : getInfoFromMediaInfo;
  const { videoCodec, audioCodec, resolution, mediaTags } = getInfoFunc(mediaInfo);
  TORRENT_INFO.videoCodec = videoCodec;
  TORRENT_INFO.audioCodec = audioCodec;
  TORRENT_INFO.resolution = resolution;
  TORRENT_INFO.tags = { ...tags, ...mediaTags };
  TORRENT_INFO.imdbUrl = imdbUrl;
  TORRENT_INFO.screenshots = getImages();
  return TORRENT_INFO;
};
const getBasicInfo = () => {
  const basicInfo = {};
  $('.dotborder').each((index, element) => {
    const key = $(element).find('td:first').text();
    const value = $(element).find('td:last').text();
    basicInfo[key] = value.replace(/\n/g, '').trim();
  });
  console.log(basicInfo);
  return basicInfo;
};
const getMovieDetails = () => {
  const infoList = $('.movie-details a');
  const movieDetail = {};
  infoList.each((index, element) => {
    const urlParams = $(element).attr('href').replace(/.+\?/g, '').split('=');
    if (urlParams.length > 1) {
      let key = decodeURI(urlParams[0]);
      const value = urlParams[1];
      if (key === 'g[]') {
        key = 'category';
      }
      movieDetail[key] = value;
    } else if (urlParams?.[0].match(/tt\d+/)) {
      movieDetail.imdbUrl = urlParams[0];
    }
  });
  return movieDetail;
};
// 获取截图
const getImages = () => {
  const screenshots = TORRENT_INFO.description.match(/\[url=.+?\]\[img\].+?\[\/img\]\[\/url]/g) ?? [];
  return screenshots;
};
const getSource = (source, resolution) => {
  if (resolution.match(/BD100|BD66/i)) {
    return 'uhdbluray';
  }
  if (source.match(/Blu-ray/i) && resolution.match(/UHD/i)) {
    return 'uhdbluray';
  }
  if (source.match(/WEB|WEB-DL/i)) {
    return 'web';
  }
  return source.replace(/-/g, '').toLowerCase();
};
const getVideoType = (type) => {
  type = type.replace(/\s/g, '');
  if (type.match(/Remux/i)) {
    return 'remux';
  } else if (type.match(/BD50|BD25/i)) {
    return 'bluray';
  } else if (type.match(/UHD50|UHD66|UHD100/i)) {
    return 'uhdbluray';
  } else if (type.match(/DVD5|DVD9/i)) {
    return 'dvd';
  } else if (type.match(/\d{3,4}p/i)) {
    return 'encode';
  }
  return type;
};
