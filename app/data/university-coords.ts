// Lat/lng coordinates for each university, keyed by university id
export const universityCoords: Record<string, [number, number]> = {
  "maastricht":     [50.8514,  5.6910],
  "amsterdam":      [52.3555,  4.9526],
  "erasmus":        [51.9171,  4.4843],
  "groningen":      [53.2194,  6.5665],
  "tu-delft":       [51.9995,  4.3741],
  "leiden":         [52.1601,  4.4970],
  "lmu-munich":     [48.1505, 11.5802],
  "tu-munich":      [48.1474, 11.5680],
  "humboldt-berlin":[52.5182, 13.3930],
  "barcelona":      [41.3888,  2.1141],
  "complutense":    [40.4516, -3.7282],
  "ie-university":  [40.4168, -3.7038],
  "sciences-po":    [48.8536,  2.3270],
  "sorbonne":       [48.8484,  2.3437],
  "lyon":           [45.7640,  4.8357],
  "bocconi":        [45.4467,  9.1918],
  "bologna":        [44.4949, 11.3426],
  "polimi":         [45.4789,  9.2283],
  "lisbon":         [38.7223, -9.1393],
  "porto":          [41.1579, -8.6291],
  "eth-zurich":     [47.3769,  8.5476],
  "ku-leuven":      [50.8796,  4.7009],
  "vienna":         [48.2100, 16.3565],
  "copenhagen":     [55.6862, 12.5697],
  "dtu":            [55.7860, 12.5234],
  "aarhus":         [56.1629, 10.2039],
  "kth":            [59.3498, 18.0717],
  "lund":           [55.7112, 13.2010],
  "stockholm":      [59.3591, 18.0578],
  "uppsala":        [59.8526, 17.6389],

  // ── Aggiunte il 2026-11-03 ───────────────────────────────────────────────
  // 57 atenei erano in catalogo ma senza coordinate, quindi invisibili sulla
  // mappa (UniversityMap filtra via chi non è in questa mappa, in silenzio).
  // Geocodificati con Nominatim/OpenStreetMap: 48 per nome dell'ateneo, 9 per
  // città (segnati sotto). Tutti verificati dentro il bounding box del proprio
  // paese. NB: aggiungendo un ateneo in universities.ts va aggiunto anche qui.

  // Austria
  "tu-wien":             [48.2084, 16.3725],   // coord. della città

  // Belgium
  "ghent":               [51.0078, 3.7109],

  // Czech Republic
  "charles-prague":      [50.0889, 14.4163],

  // Estonia
  "tartu":               [58.3810, 26.7196],

  // Finland
  "aalto":               [60.1861, 24.8281],
  "helsinki":            [60.1728, 24.9486],

  // France
  "ecole-polytechnique": [48.7128, 2.2107],

  // Germany
  "bochum":              [51.4442, 7.2610],
  "bonn":                [50.7338, 7.1022],
  "cologne":             [50.9280, 6.9281],
  "fau-erlangen":        [49.6015, 11.0177],
  "freiburg":            [48.0070, 7.8373],
  "fu-berlin":           [52.4529, 13.2907],
  "goettingen":          [51.5328, 9.9352],   // coord. della città
  "hamburg":             [53.5909, 9.9754],
  "heidelberg":          [49.4186, 8.6692],
  "kit-karlsruhe":       [49.0069, 8.4034],   // coord. della città
  "leipzig":             [51.3274, 12.3909],
  "mainz":               [49.9920, 8.2371],
  "muenster":            [51.9673, 7.5992],
  "rwth-aachen":         [50.7792, 6.0689],
  "tu-berlin":           [52.5110, 13.3270],
  "tu-dresden":          [51.0283, 13.7360],
  "tuebingen":           [48.5341, 9.0712],
  "wuerzburg":           [49.7876, 9.9338],

  // Hungary
  "semmelweis":          [47.4837, 19.0819],

  // Ireland
  "trinity-dublin":      [53.3437, -6.2544],
  "ucd":                 [53.3068, -6.2246],

  // Italy
  "padua":               [45.4066, 11.8774],
  "sapienza":            [41.8933, 12.4829],   // coord. della città

  // Luxembourg
  "luxembourg":          [49.5036, 5.9487],

  // Netherlands
  "tilburg":             [51.5631, 5.0436],
  "tue":                 [51.4486, 5.4501],   // coord. della città
  "twente":              [52.2433, 6.8509],
  "utrecht":             [52.0942, 5.1212],
  "wageningen":          [51.9854, 5.6632],

  // Spain
  "pompeu-fabra":        [41.3893, 2.1911],
  "uab":                 [41.5016, 2.1063],
  "uc3m":                [40.3151, -3.7249],

  // Switzerland
  "basel":               [47.5613, 7.5753],
  "bern":                [46.9509, 7.4387],
  "epfl":                [46.5218, 6.6327],   // coord. della città
  "geneva":              [46.1927, 6.1489],
  "unil":                [46.5226, 6.5809],
  "uzh":                 [47.3744, 8.5410],   // coord. della città

  // United Kingdom
  "bristol":             [51.4906, -2.6305],
  "cambridge":           [52.1902, 0.1223],
  "durham":              [54.7672, -1.5722],
  "edinburgh":           [55.9441, -3.1884],
  "glasgow":             [55.8727, -4.2920],
  "imperial":            [51.4990, -0.1756],
  "kings-college-london":[51.5031, -0.0900],
  "lse":                 [51.5074, -0.1278],   // coord. della città
  "manchester":          [53.4660, -2.2331],
  "oxford":              [51.7525, -1.2143],
  "ucl":                 [51.5074, -0.1278],   // coord. della città
  "warwick":             [52.3813, -1.5640],
};
