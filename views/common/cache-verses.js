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
