const versesInfoCache = {};

const cacheValidityDate = new Date().toISOString().split("T")[0];

function cacheVerses(ref, verses) {
  ref = ref.split("/bible/")[1];
  versesInfoCache[ref] = verses;
  //console.warn("cache", ref, versesInfoCache);
  localStorage.setItem(
    `project-ref-${ref}`,
    JSON.stringify({
      expire: cacheValidityDate,
      verses
    })
  );
}

function getCacheVerses(ref) {
  ref = ref.split("/bible/")[1];
  let verses = versesInfoCache[ref];
  if (!verses) {
    let storageValue = localStorage.getItem(`project-ref-${ref}`);
    if (storageValue) {
      storageValue = JSON.parse(storageValue);
      //console.warn("try localstorage", storageValue);
      if (storageValue.expire === cacheValidityDate) {
        verses = storageValue.verses;
      }
    }
  }
  //console.warn("get cache", ref, verses);
  return verses;
}

const autoSelectVerseKey = "autoSelectVerse";

/**
 * store match - since openChapter could reload page
 *  and we need to keep track of the verse to select after reload
 * @param {*} match
 */
function setAutoSelectVerse(match) {
  localStorage.setItem(autoSelectVerseKey, JSON.stringify(match));
}

function getAutoSelectVerse() {
  const match = localStorage.getItem(autoSelectVerseKey);
  localStorage.removeItem(autoSelectVerseKey);
  return JSON.parse(match);
}
