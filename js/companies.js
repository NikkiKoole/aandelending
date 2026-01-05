const Companies = {
  ASML: {
    name: "ASML Holding",
    logo: "images/logos/asml.svg",
    country: "Nederland",
    founded: 1984,
    sector: "Technologie",
    description: `ASML maakt de machines waarmee computerchips worden gemaakt. Zonder ASML's machines kunnen bedrijven zoals Apple en Samsung geen chips maken voor telefoons en computers.

ASML is het enige bedrijf ter wereld dat de nieuwste chipmachines kan maken. Deze machines kosten meer dan 150 miljoen euro per stuk! Ze gebruiken speciaal licht om hele kleine schakelingen op chips te "tekenen" - zo klein dat je ze niet met je ogen kunt zien. ASML is een van de waardevolste bedrijven van Europa.`,
  },
  SHEL: {
    name: "Shell",
    logo: "images/logos/shell.svg",
    country: "Nederland/UK",
    founded: 1907,
    sector: "Energie",
    description: `Shell is een van de grootste energiebedrijven ter wereld. Je kent ze waarschijnlijk van de benzinestations met het gele schelp-logo waar je ouders tanken.

Shell zoekt naar olie en gas diep onder de grond en in de zee, haalt het naar boven, en maakt er benzine en diesel van. Ze hebben meer dan 46.000 tankstations over de hele wereld! Tegenwoordig investeren ze ook steeds meer in schone energie zoals windmolens en zonnepanelen.`,
  },
  ING: {
    name: "ING Groep",
    logo: "images/logos/ing.svg",
    country: "Nederland",
    founded: 1991,
    sector: "Financieel",
    description: `ING is de grootste bank van Nederland. Misschien hebben jouw ouders wel een oranje betaalpas van ING, of gebruiken ze de ING-app om geld over te maken.

Bij een bank kun je geld sparen, geld lenen (bijvoorbeeld voor een huis), en betalen in winkels. ING heeft meer dan 9 miljoen klanten in Nederland en werkt in meer dan 40 landen. De naam ING staat voor "Internationale Nederlanden Groep".`,
  },
  PHG: {
    name: "Philips",
    logo: "images/logos/philips.svg",
    country: "Nederland",
    founded: 1891,
    sector: "Gezondheidszorg",
    description: `Philips is een Nederlands bedrijf dat vroeger lampen, tv's en radio's maakte. Nu maken ze vooral apparaten voor ziekenhuizen en gezondheid, zoals MRI-scanners en apparaten om je hartslag te meten.

Philips werd meer dan 130 jaar geleden opgericht in Eindhoven en begon met het maken van gloeilampen. Je kent misschien nog wel Philips-producten zoals elektrische tandenborstels of scheerapparaten. Het bedrijf heeft de cd en de dvd mee uitgevonden!`,
  },
  UL: {
    name: "Unilever",
    logo: "images/logos/unilever.svg",
    country: "Nederland/UK",
    founded: 1929,
    sector: "Consumentengoederen",
    description: `Unilever maakt heel veel producten die je thuis in de kast hebt staan! Denk aan Dove zeep, Axe deodorant, Lipton thee, Magnum ijsjes, Knorr soep en Robijn wasmiddel.

Het bedrijf verkoopt elke dag producten aan meer dan 3 miljard mensen - bijna de helft van de wereldbevolking! Unilever is half Nederlands en half Brits, en heeft meer dan 400 verschillende merken. Grote kans dat je vandaag al iets van Unilever hebt gebruikt.`,
  },
  NVO: {
    name: "Novo Nordisk",
    logo: "images/logos/novo-nordisk.svg",
    country: "Denemarken",
    founded: 1923,
    sector: "Gezondheidszorg",
    description: `Novo Nordisk is een Deens bedrijf dat medicijnen maakt, vooral voor mensen met diabetes. Diabetes is een ziekte waarbij je lichaam moeite heeft met suiker verwerken.

Ze maken insuline - een medicijn dat miljoenen mensen elke dag nodig hebben om gezond te blijven. Novo Nordisk maakt ook Ozempic en Wegovy, medicijnen die mensen helpen met afvallen. Door deze medicijnen is Novo Nordisk nu het meest waardevolle bedrijf van Europa geworden!`,
  },
  AAPL: {
    name: "Apple",
    logo: "images/logos/apple.svg",
    country: "Verenigde Staten",
    founded: 1976,
    sector: "Technologie",
    description: `Apple maakt de iPhone, iPad, Mac computers en Apple Watch. Je kent vast wel iemand met een iPhone of AirPods! Apple staat bekend om mooie, makkelijk te gebruiken producten.

Steve Jobs richtte Apple op in een garage. Nu is het een van de meest waardevolle bedrijven ter wereld - soms zelfs HET waardevolste! Apple heeft ook diensten zoals de App Store, Apple Music en iCloud. Meer dan een miljard mensen gebruiken een Apple-apparaat.`,
  },
  MSFT: {
    name: "Microsoft",
    logo: "images/logos/microsoft.svg",
    country: "Verenigde Staten",
    founded: 1975,
    sector: "Technologie",
    description: `Microsoft maakt Windows - het programma dat op de meeste computers draait. Ze maken ook Xbox spelcomputers, Office (Word, Excel, PowerPoint) en de zoekmachine Bing.

Bill Gates richtte Microsoft op toen hij nog maar 19 was! Nu is Microsoft een van de grootste techbedrijven ter wereld. Ze zijn ook eigenaar van LinkedIn, GitHub en Minecraft. Hun nieuwste grote project is kunstmatige intelligentie (AI) met hun Copilot assistenten.`,
  },
  TSLA: {
    name: "Tesla",
    logo: "images/logos/tesla.svg",
    country: "Verenigde Staten",
    founded: 2003,
    sector: "Auto's",
    description: `Tesla maakt elektrische auto's die je niet hoeft te tanken - je laadt ze op zoals je telefoon! De auto's kunnen zelfs een beetje zelf rijden. Bekende modellen zijn de Model 3, Model Y en de snelle Roadster.

Elon Musk is de baas van Tesla en een van de rijkste mensen ter wereld. Tesla maakt ook grote batterijen om zonne-energie op te slaan en zonnepanelen voor op je dak. De naam Tesla komt van Nikola Tesla, een beroemde uitvinder.`,
  },
  AMZN: {
    name: "Amazon",
    logo: "images/logos/amazon.svg",
    country: "Verenigde Staten",
    founded: 1994,
    sector: "Webwinkels",
    description: `Amazon begon als online boekwinkel, maar nu kun je er bijna alles kopen! In veel landen bezorgen ze pakketjes binnen één dag. Jeff Bezos begon Amazon in zijn garage.

Maar Amazon is veel meer dan een webwinkel. Ze hebben Amazon Prime Video (films en series), Alexa (de slimme speaker), en AWS - computers die andere bedrijven huren. Meer dan de helft van alle websites draait op Amazon's computers! Ook Kindle e-readers zijn van Amazon.`,
  },
  NVDA: {
    name: "Nvidia",
    logo: "images/logos/nvidia.svg",
    country: "Verenigde Staten",
    founded: 1993,
    sector: "Technologie",
    description: `Nvidia maakt grafische kaarten - de onderdelen in computers die zorgen voor mooie beelden in games. Gamers over de hele wereld gebruiken Nvidia GeForce kaarten om te gamen.

Maar nu is Nvidia nog veel belangrijker geworden! Hun chips zijn perfect voor kunstmatige intelligentie (AI) zoals ChatGPT. Bijna alle AI-bedrijven gebruiken Nvidia-chips. Daardoor is Nvidia een van de waardevolste bedrijven ter wereld geworden - soms zelfs waardevoller dan Apple!`,
  },
  GOOGL: {
    name: "Alphabet (Google)",
    logo: "images/logos/google.svg",
    country: "Verenigde Staten",
    founded: 1998,
    sector: "Technologie",
    description: `Google is de zoekmachine die bijna iedereen gebruikt om dingen op internet te zoeken. "Even googelen" is zelfs een werkwoord geworden! Alphabet is de naam van het moederbedrijf.

Google heeft ook YouTube (video's kijken), Gmail (e-mail), Google Maps (navigatie), Android (voor telefoons) en Chrome (de browser). Twee studenten, Larry Page en Sergey Brin, begonnen Google op hun studentenkamer. Nu werken er meer dan 180.000 mensen.`,
  },
  META: {
    name: "Meta",
    logo: "images/logos/meta.svg",
    country: "Verenigde Staten",
    founded: 2004,
    sector: "Technologie",
    description: `Meta is het bedrijf achter Facebook, Instagram en WhatsApp - apps die miljarden mensen gebruiken om met vrienden te praten en foto's te delen. Mark Zuckerberg richtte Facebook op toen hij 19 was.

De naam Meta komt van "metaverse" - een virtuele wereld waar je met een VR-bril in kunt. Meta maakt ook Quest VR-brillen. Elke dag gebruiken meer dan 3 miljard mensen een app van Meta. Dat is bijna de helft van alle mensen op aarde!`,
  },
  NFLX: {
    name: "Netflix",
    logo: "images/logos/netflix.svg",
    country: "Verenigde Staten",
    founded: 1997,
    sector: "Entertainment",
    description: `Netflix is een streamingdienst waar je films en series kunt kijken wanneer je wilt. Je kent vast wel Netflix Originals zoals Stranger Things, Wednesday of Squid Game!

Netflix begon met het versturen van dvd's per post. Nu hebben ze meer dan 280 miljoen abonnees wereldwijd die series en films streamen. Ze geven elk jaar miljarden uit aan het maken van nieuwe content. Netflix heeft de manier waarop we tv kijken compleet veranderd.`,
  },
  DIS: {
    name: "Disney",
    logo: "images/logos/disney.svg",
    country: "Verenigde Staten",
    founded: 1923,
    sector: "Entertainment",
    description: `Disney is het grootste entertainmentbedrijf ter wereld! Ze maken films (Disney, Pixar, Marvel, Star Wars), hebben pretparken (Disneyland, Disney World) en streamingdienst Disney+.

Walt Disney begon met het tekenen van tekenfilms, waaronder Mickey Mouse. Nu bezit Disney ook ESPN (sport), National Geographic, en 20th Century Studios. De Disney-parken trekken meer dan 150 miljoen bezoekers per jaar!`,
  },
  SBUX: {
    name: "Starbucks",
    logo: "images/logos/starbucks.svg",
    country: "Verenigde Staten",
    founded: 1971,
    sector: "Eten & Drinken",
    description: `Starbucks is de grootste koffieketen ter wereld. Je kent vast wel hun groene logo met de zeemeermin! Ze hebben meer dan 35.000 winkels in 80 landen.

Starbucks verkoopt niet alleen koffie, maar ook thee, frappuccino's en snacks. Ze waren een van de eerste die "to go" koffie populair maakten. De naam komt van een personage uit het boek Moby Dick. Elke week komen meer dan 100 miljoen klanten bij Starbucks!`,
  },
  NKE: {
    name: "Nike",
    logo: "images/logos/nike.svg",
    country: "Verenigde Staten",
    founded: 1964,
    sector: "Kleding & Sport",
    description: `Nike is het grootste sportmerk ter wereld. Hun "swoosh" logo en slogan "Just Do It" zijn overal bekend. Ze maken schoenen, kleding en sportspullen.

Nike is vernoemd naar de Griekse godin van de overwinning. Beroemde sporters zoals Michael Jordan, LeBron James en Cristiano Ronaldo hebben Nike-deals. Air Jordan sneakers zijn super populair! Nike sponsort ook veel voetbalclubs en olympische atleten.`,
  },
  MCD: {
    name: "McDonald's",
    logo: "images/logos/mcdonalds.svg",
    country: "Verenigde Staten",
    founded: 1940,
    sector: "Eten & Drinken",
    description: `McDonald's is de grootste fastfoodketen ter wereld met de beroemde gouden bogen. Ze verkopen hamburgers, frietjes, McNuggets en McFlurry's in meer dan 100 landen.

Elke dag eten 69 miljoen mensen bij McDonald's - dat is bijna evenveel als alle mensen in Frankrijk! De Big Mac en Happy Meal zijn over de hele wereld bekend. McDonald's was een van de eerste restaurants met een drive-through waar je vanuit de auto kunt bestellen.`,
  },
  KO: {
    name: "Coca-Cola",
    logo: "images/logos/coca-cola.svg",
    country: "Verenigde Staten",
    founded: 1886,
    sector: "Eten & Drinken",
    description: `Coca-Cola maakt 's werelds bekendste frisdrank. Het rode logo en de speciale flessensvorm ken je vast wel! Elke dag worden er 2 miljard Coca-Cola drankjes gedronken.

Het geheime recept van Coca-Cola wordt al meer dan 130 jaar bewaard in een kluis! Het bedrijf maakt ook Fanta, Sprite en Minute Maid. De kerstman in zijn rode pak werd populair door Coca-Cola reclames. Coca-Cola is een van de meest waardevolle merken ter wereld.`,
  },
  PEP: {
    name: "PepsiCo",
    logo: "images/logos/pepsi.svg",
    country: "Verenigde Staten",
    founded: 1965,
    sector: "Eten & Drinken",
    description: `PepsiCo maakt Pepsi cola, maar ook heel veel snacks die je kent! Lay's chips, Doritos, Cheetos en Quaker havermout zijn allemaal van PepsiCo.

Pepsi en Coca-Cola zijn al meer dan 100 jaar concurrenten - dit heet de "Cola Wars"! PepsiCo heeft ook Tropicana sinaasappelsap, 7UP en Gatorade sportdrank. Het bedrijf verkoopt producten in meer dan 200 landen.`,
  },
  SPOT: {
    name: "Spotify",
    logo: "images/logos/spotify.svg",
    country: "Zweden",
    founded: 2006,
    sector: "Entertainment",
    description: `Spotify is de populairste muziek-streaming app ter wereld. Je kunt er miljoenen liedjes en podcasts op luisteren. Het groene logo met geluidsgolven ken je vast!

Spotify komt uit Zweden en heeft nu meer dan 600 miljoen gebruikers. Artiesten worden betaald per keer dat hun liedje wordt afgespeeld. Spotify heeft ook podcasts populair gemaakt. Je kunt gratis luisteren met reclames, of betalen voor Premium zonder reclames.`,
  },
  RBLX: {
    name: "Roblox",
    logo: "images/logos/roblox.svg",
    country: "Verenigde Staten",
    founded: 2004,
    sector: "Gaming",
    description: `Roblox is een online platform waar je games kunt spelen én zelf kunt maken! Er zijn miljoenen verschillende spelletjes gemaakt door gebruikers. Je speelt met een blokkerig poppetje dat je kunt aankleden.

Meer dan 70 miljoen mensen spelen elke dag Roblox - vooral kinderen en tieners. Je kunt Robux kopen om speciale items te krijgen. Sommige mensen verdienen echt geld door Roblox-games te maken! Adopt Me en Brookhaven zijn super populaire Roblox-games.`,
  },
  EA: {
    name: "Electronic Arts",
    logo: "images/logos/ea.svg",
    country: "Verenigde Staten",
    founded: 1982,
    sector: "Gaming",
    description: `EA maakt populaire videogames zoals EA Sports FC (voorheen FIFA), Madden NFL, The Sims en Battlefield. Ze zijn een van de grootste gamebedrijven ter wereld.

EA Sports FC is het populairste voetbalspel ter wereld! Miljoenen mensen spelen Ultimate Team om hun droomelftal te bouwen. EA maakt games voor PlayStation, Xbox, PC en mobiel. Ze bezitten ook Apex Legends en Need for Speed.`,
  },
  SONY: {
    name: "Sony",
    logo: "images/logos/sony.svg",
    country: "Japan",
    founded: 1946,
    sector: "Gaming",
    description: `Sony maakt de PlayStation - een van de populairste spelcomputers! De PS5 is de nieuwste versie. Sony maakt ook TV's, camera's, koptelefoons en muziek.

Sony komt uit Japan en maakt ook films via Sony Pictures (Spider-Man!). Ze bezitten platenmaatschappijen met artiesten zoals Beyoncé en Harry Styles. De eerste PlayStation kwam uit in 1994 en sindsdien zijn er meer dan 500 miljoen PlayStations verkocht!`,
  },
  NTDOY: {
    name: "Nintendo",
    logo: "images/logos/nintendo.svg",
    country: "Japan",
    founded: 1889,
    sector: "Gaming",
    description: `Nintendo maakt de Switch spelcomputer en beroemde games met Mario, Zelda, Pokemon en Donkey Kong! Mario is een van de bekendste personages ter wereld.

Nintendo bestaat al meer dan 130 jaar - ze begonnen met speelkaarten! De Game Boy, Wii en DS waren allemaal enorm populair. Pokemon is het succesvolste mediamerk ooit. Nintendo staat bekend om leuke, kleurrijke games die voor alle leeftijden zijn.`,
  },
  UBER: {
    name: "Uber",
    logo: "images/logos/uber.svg",
    country: "Verenigde Staten",
    founded: 2009,
    sector: "Transport",
    description: `Uber is een app waarmee je een taxi kunt bestellen. Je ziet precies waar de auto is en betaalt via de app. Uber Eats bezorgt ook eten van restaurants.

Uber heeft de taxi-industrie compleet veranderd! Nu kan iedereen met een auto Uber-chauffeur worden. De app werkt in meer dan 70 landen. Je kunt ook fietsen en scooters huren via Uber. Elke dag maken 28 miljoen mensen een Uber-ritje.`,
  },
  ABNB: {
    name: "Airbnb",
    logo: "images/logos/airbnb.svg",
    country: "Verenigde Staten",
    founded: 2008,
    sector: "Transport",
    description: `Airbnb is een website waar mensen hun huis of kamer kunnen verhuren aan reizigers. In plaats van een hotel kun je in een echt huis of appartement slapen.

De naam komt van "Air Bed and Breakfast" - de oprichters verhuurden luchtbedden in hun woonkamer! Nu staan er meer dan 7 miljoen accommodaties op Airbnb, van boomhutten tot kastelen. Je kunt ook "Ervaringen" boeken, zoals kooklessen of rondleidingen van locals.`,
  },
  WBD: {
    name: "Warner Bros Discovery",
    logo: "images/logos/warnerbros.svg",
    country: "Verenigde Staten",
    founded: 2022,
    sector: "Entertainment",
    description: `Warner Bros Discovery is een groot mediabedrijf dat films, series en nieuws maakt. Ze hebben HBO Max (met Game of Thrones en Harry Potter), CNN nieuws, en maken beroemde films.

Warner Bros bestaat al sinds 1923 en heeft iconische films gemaakt zoals Batman, Superman en The Matrix. Ze hebben ook Looney Tunes met Bugs Bunny! In 2022 fuseerden ze met Discovery (bekend van dierenprogramma's).`,
  },
  PSKY: {
    name: "Paramount Skydance",
    logo: "images/logos/paramount.svg",
    country: "Verenigde Staten",
    founded: 1912,
    sector: "Entertainment",
    description: `Paramount Skydance is een groot mediabedrijf, bekend van het logo met de berg en de sterren. Ze maken films en hebben streamingdienst Paramount+.

Paramount heeft beroemde films gemaakt zoals Top Gun, Transformers, Mission: Impossible en SpongeBob SquarePants! Ze bezitten ook MTV, Nickelodeon en Comedy Central. In 2025 fuseerden ze met Skydance Media.`,
  },
  ADDYY: {
    name: "Adidas",
    logo: "images/logos/adidas.svg",
    country: "Duitsland",
    founded: 1949,
    sector: "Kleding & Sport",
    description: `Adidas is een van de grootste sportmerken ter wereld, bekend van de drie strepen. Ze maken sportschoenen, kleding en sportspullen, en zijn de grote concurrent van Nike.

Adidas werd opgericht in Duitsland door Adi Dassler (Adi-Das). Zijn broer Rudolf begon Puma! Adidas sponsort veel voetbalclubs en heeft samenwerkingen met artiesten. Superstar en Stan Smith sneakers zijn klassiekers.`,
  },
  MBGYY: {
    name: "Mercedes-Benz",
    logo: "images/logos/mercedes.svg",
    country: "Duitsland",
    founded: 1926,
    sector: "Auto's",
    description: `Mercedes-Benz maakt luxe auto's en is een van de bekendste automerken ter wereld. De ster met drie punten is overal herkenbaar. Ze komen uit Duitsland.

Mercedes-Benz is vernoemd naar Mercedes Jellinek, de dochter van een zakenman. Het merk staat voor luxe en kwaliteit. Ze maken nu ook elektrische auto's (EQ-serie) en hebben een succesvol Formule 1 team met Lewis Hamilton!`,
  },

  RACE: {
    name: "Ferrari",
    logo: "images/logos/ferrari.svg",
    country: "Italië",
    founded: 1939,
    sector: "Auto's",
    description: `Ferrari maakt de beroemdste sportwagens ter wereld. De rode kleur en het steigerend paard zijn iconisch. Ferrari's zijn heel duur en exclusief - ze maken er maar een paar duizend per jaar.

Enzo Ferrari richtte het bedrijf op en begon met racen. Ferrari is het succesvolste team in de Formule 1 ooit! Een nieuwe Ferrari kost vaak meer dan €200.000, en sommige oude modellen zijn miljoenen waard.`,
  },
  PYPL: {
    name: "PayPal",
    logo: "images/logos/paypal.svg",
    country: "Verenigde Staten",
    founded: 1998,
    sector: "Financieel",
    description: `PayPal is een online betaaldienst waarmee je veilig kunt betalen op internet zonder je bankgegevens te delen. Je kunt ook geld sturen naar vrienden.

PayPal was een van de eerste bedrijven voor online betalen. Elon Musk was een van de oprichters! Later kocht eBay het, maar nu is het weer zelfstandig. Meer dan 400 miljoen mensen gebruiken PayPal wereldwijd.`,
  },
  XOM: {
    name: "Exxon Mobil",
    logo: "images/logos/exxon.svg",
    country: "Verenigde Staten",
    founded: 1999,
    sector: "Energie",
    description: `Exxon Mobil is het grootste olie- en gasbedrijf van Amerika. Ze zoeken naar olie, halen het naar boven, en maken er benzine en andere producten van.

Het bedrijf ontstond uit Standard Oil, het beroemde oliebedrijf van John D. Rockefeller. Exxon en Mobil waren apart, maar fuseerden in 1999. Je kent misschien Esso tankstations - dat is van Exxon (S-O van Standard Oil)!`,
  },
  BP: {
    name: "BP",
    logo: "images/logos/bp.svg",
    country: "Verenigd Koninkrijk",
    founded: 1909,
    sector: "Energie",
    description: `BP (vroeger British Petroleum) is een van de grootste olie- en gasbedrijven ter wereld. Het groene logo met de zonnebloemachtige vorm ken je misschien van tankstations.

BP komt uit het Verenigd Koninkrijk en werkt in meer dan 70 landen. Ze investeren steeds meer in schone energie zoals wind en zon. BP wil in 2050 klimaatneutraal zijn.`,
  },
};

// Sector order for sorting
const SectorOrder = [
  "Technologie",
  "Gaming",
  "Entertainment",
  "Eten & Drinken",
  "Consumentengoederen",
  "Kleding & Sport",
  "Transport",
  "Auto's",
  "Webwinkels",
  "Financieel",
  "Gezondheidszorg",
  "Energie",
];

// Get company info by symbol
function getCompanyInfo(symbol) {
  return Companies[symbol] || null;
}

// Get sector order index
function getSectorOrder(sector) {
  const index = SectorOrder.indexOf(sector);
  return index === -1 ? 999 : index;
}
