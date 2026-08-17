[out:json][timeout:120];
(
  way["name"~"^(Ayer Rajah Expressway|Bukit Timah Expressway|Central Expressway|East Coast Parkway|Kallang-Paya Lebar Expressway|Kranji Expressway|Marina Coastal Expressway|Pan-Island Expressway|Seletar Expressway|Tampines Expressway)$"](1.20,103.59,1.48,104.05);
  way["name"~"^(Airport Boulevard|Alexandra Road|Bukit Timah Road|Changi Coast Road|Clementi Road|Commonwealth Avenue|Dunearn Road|Holland Road|Jalan Bukit Merah|Jurong Town Hall Road|Lim Chu Kang Road|Mandai Road|Mountbatten Road|New Upper Changi Road|Nicoll Highway|Orchard Road|Pasir Panjang Road|Paya Lebar Road|Pioneer Road|Sembawang Road|Serangoon Road|Tampines Road|Tanah Merah Coast Road|Thomson Road|Upper Bukit Timah Road|Upper Paya Lebar Road|Upper Serangoon Road|Upper Thomson Road|West Coast Highway|Woodlands Road|Yio Chu Kang Road)$"](1.20,103.59,1.48,104.05);
);
out geom tags;
