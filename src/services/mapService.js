export const precacheMapTiles = async (bounds, minZoom, maxZoom) => {
  const tileUrls = [];
  
  for (let z = minZoom; z <= maxZoom; z++) {
    const minX = Math.floor((bounds.west + 180) / 360 * Math.pow(2, z));
    const maxX = Math.floor((bounds.east + 180) / 360 * Math.pow(2, z));
    const minY = Math.floor((1 - Math.log(Math.tan(bounds.north * Math.PI / 180) + 1 / Math.cos(bounds.north * Math.PI / 180)) / Math.PI) / 2 * Math.pow(2, z));
    const maxY = Math.floor((1 - Math.log(Math.tan(bounds.south * Math.PI / 180) + 1 / Math.cos(bounds.south * Math.PI / 180)) / Math.PI) / 2 * Math.pow(2, z));

    for (let x = minX; x <= maxX; x++) {
      for (let y = minY; y <= maxY; y++) {
        const url = `https://a.tile.openstreetmap.org/${z}/${x}/${y}.png`;
        tileUrls.push(url);
      }
    }
  }

  const cache = await caches.open('map-tiles');
  await Promise.all(tileUrls.map(url => cache.add(url)));
}; 