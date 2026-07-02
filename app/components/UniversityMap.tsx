"use client";

import type { University } from "../data/universities";
import { universityCoords } from "../data/university-coords";

type Props = {
  universities: University[];
};

export default function UniversityMap({ universities }: Props) {
  const mapUniversities = universities
    .filter((u) => universityCoords[u.id])
    .map((u) => ({
      id: u.id,
      name: u.name,
      city: u.city,
      country: u.country,
      flag: u.flag,
      tuition: u.tuition,
      strengths: u.strengths.slice(0, 3),
      lat: universityCoords[u.id][0],
      lng: universityCoords[u.id][1],
    }));

  const htmlContent = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body { width: 100%; height: 100%; background: #0a0a0a; }
    #map { width: 100%; height: 100%; }

    .uni-popup { font-family: Arial, sans-serif; min-width: 210px; }
    .uni-popup-name { font-size: 13px; font-weight: 700; color: #111; margin-bottom: 2px; }
    .uni-popup-city { font-size: 11px; color: #777; margin-bottom: 6px; }
    .uni-popup-tuition { font-size: 12px; font-weight: 600; color: #7C3AED; margin-bottom: 8px; }
    .uni-popup-tags { display: flex; flex-wrap: wrap; gap: 4px; }
    .uni-popup-tag {
      font-size: 10px; background: #F3F0FF; color: #7C3AED;
      padding: 2px 7px; border-radius: 4px; font-weight: 500;
    }

    .leaflet-popup-content-wrapper {
      border-radius: 14px;
      box-shadow: 0 12px 40px rgba(0,0,0,0.18);
      border: none;
    }
    .leaflet-popup-tip-container { display: none; }
    .leaflet-popup-content { margin: 14px 16px; }

    /* hide leaflet attribution on dark bg */
    .leaflet-control-attribution { background: rgba(0,0,0,0.5) !important; color: #555 !important; }
    .leaflet-control-attribution a { color: #888 !important; }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    const unis = ${JSON.stringify(mapUniversities)};

    const map = L.map('map', {
      center: [51.5, 10],
      zoom: 4,
      zoomControl: true,
      scrollWheelZoom: true,
    });

    // Dark tile from CartoDB — fits the site's dark theme
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://openstreetmap.org">OSM</a> &copy; <a href="https://carto.com">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 19,
    }).addTo(map);

    const pinIcon = L.divIcon({
      className: '',
      html: '<div style="width:14px;height:14px;background:#7C3AED;border:2.5px solid #fff;border-radius:50%;box-shadow:0 0 0 3px rgba(124,58,237,0.35),0 2px 8px rgba(0,0,0,0.5);cursor:pointer;transition:transform .15s;"></div>',
      iconSize: [14, 14],
      iconAnchor: [7, 7],
      popupAnchor: [0, -12],
    });

    unis.forEach(u => {
      const tags = u.strengths.map(s =>
        '<span class="uni-popup-tag">' + s + '</span>'
      ).join('');

      const content =
        '<div class="uni-popup">' +
          '<div class="uni-popup-name">' + u.flag + ' ' + u.name + '</div>' +
          '<div class="uni-popup-city">' + u.city + ' · ' + u.country + '</div>' +
          '<div class="uni-popup-tuition">💶 ' + u.tuition + '</div>' +
          '<div class="uni-popup-tags">' + tags + '</div>' +
        '</div>';

      L.marker([u.lat, u.lng], { icon: pinIcon })
        .bindPopup(content, { maxWidth: 260 })
        .addTo(map);
    });
  </script>
</body>
</html>`;

  return (
    <iframe
      srcDoc={htmlContent}
      style={{
        width: "100%",
        height: "calc(100vh - 200px)",
        minHeight: 520,
        border: "none",
        borderRadius: 16,
        display: "block",
      }}
      title="University Map"
      sandbox="allow-scripts"
    />
  );
}
