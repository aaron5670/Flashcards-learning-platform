# Dutch learning platform with flashcards
A school project builded with React & Node.js.

## 🇳🇱 Everything from here is in Dutch
### Leden

- Aaron van den Berg
- Niels Bogers
- Jesse Koerhuis
- Joris Nijkamp
- Gino Verwijs

### Product Owner

Fritz van Deventer

### Coach

Lars Tijsma

### Skills 
Helen Visser

# Installatie & Deployment

### Vereisten
Zorg dat de laatste versies van [NodeJS](https://nodejs.org/) en [MongoDB](https://www.mongodb.com/) beschikbaar en gestart zijn op de deployment server.

### Stap 1 - De repository clonen
Clone de [master](https://github.com/HANICA-DWA/sep2019-project-kiwi/tree/master) branch van de [Apprend-repository](https://github.com/HANICA-DWA/sep2019-project-kiwi/tree/master).

### Stap 2 - Installeren packages client
Er zijn eigenlijk twee applicaties aanwezig in deze repository, een client en een server applicatie. Hiervoor moeten aparte packages worden geïnstalleerd. 
Voer de volgende commando's uit in de **apprend\Clients\apprend-web** folder:
```
> npm i
```

### Stap 3 - Installeren packages server
Voer de volgende commando's uit in de **apprend\Server** folder:
```
> npm i
```

### Stap 4 - Opzetten algemene configuraties op de server
Voeg het bestand **apprend\Server\config.js** toe. Deze moet de onderstaande code bevatten. Voer hier zelf jouw database-gegevens in of laat deze file met rust wanneer je het lokaal gaat installeren.
```js
// De gebruikersnaam voor database-toegang.
const USERNAME = '';

// Het wachtwoord voor database-toegang.
const PASSWORD = '';

// De URL van de database server.
const HOST = 'localhost';

// De poort waar de database op draait. Voor MongoDB is dit standaard '27017'
const PORT = '27017';

// De naam van de database die gebruikt gaat worden.
const DB = 'apprend';

// Er kan eventueel ingesteld worden waar de wachtwoorden mee gesalt worden. Dit moet een getal zijn en is standaard 10.
const PASSWORD_SALT = 10;

module.exports = {USERNAME, PASSWORD, HOST, PORT, DB, PASSWORD_SALT};
```

### Stap 5 (optioneel) - Verwisselen van database-connecties 
In **apprend\Server\app.js** en **apprend\Server\seed.js** staan twee regels (regel 55, 56) code voor een verbinding met de database. 
De eerste regel wordt gebruikt voor lokale ontwikkeling. De tweede regel code moet gebruikt worden voor op de deployment server.
**Als je lokaal test hoef je niets aan te passen!**
```js
// Local
mongoose.connect(`mongodb://${srvConfig.USERNAME}:${srvConfig.PASSWORD}@${srvConfig.HOST}:${srvConfig.PORT}/${srvConfig.DB}`, {

// Deployment server
// mongoose.connect(`mongodb+srv://${srvConfig.USERNAME}:${srvConfig.PASSWORD}@${srvConfig.HOST}/${srvConfig.DB}?retryWrites=true&w=majority`, {
```

### Stap 6 - Opzetten Redux-configuraties op de server
Vervang de API_URL-variabele met de huidige server-URL in **apprend\Clients\apprend-web\src\redux\urls.js**.
Dit is de URL die gebruikt wordt door de client-applicatie om de server-API te bereiken.

### Stap 7 - Opstarten van de server
Voer de volgende commando's uit in **apprend\Server** om de server te starten:
```
> node app.js
```

### Stap 8 - Opstarten van de client
Voer de volgende commando's uit in **apprend\Clients\apprend-web** om de client-applicatie te starten:
```
> npm start
```

### Stap 9 (optioneel) - Seed file runnen
De seed file bevat testgegevens voor de database en de applicatie. Het bevat een aantal gebruikers met decks en daarin flashcards.

Om de seed file te runnen moet je het script **apprend\Server\seed.js** uitvoeren. Dit zorgt er voor dat testgegevens in de database komen te staan. Als het goed is heb je de database-verbinding correct ingesteld bij bovenstaande stap 5.

Na het uitvoeren van dit script moet de database er ongeveer uitzien als onderstaande figuur.

![Screenshot database seed file](https://github.com/aaron5670/Flashcards-learning-platform/blob/development/Documentatie/Screenshot%20database.svg)

### Eindresultaat
Als alles is uitgevoerd hoort de applicatie er als onderstaande figuur uit te zien. Let op dat de teksten kunnen verschillen op basis van de gegevens in de database!

![Screenshot client eindresultaat](https://github.com/aaron5670/Flashcards-learning-platform/blob/development/Documentatie/Screenshot%20client.svg)


### Eventueel uitvoeren automatische tests
De applicatie bevat 3 soorten automatische tests: Unit Tests, API-tests & End-to-end Tests. Deze tests bevinden zich in **apprend/Clients/apprend-web/src/\_\_tests\_\_**.
Om alle testen uit te voeren kun je het onderstaande commando uitvoeren:
```
> npm test
```

**Specifieke tests uitvoeren**

Voor Unit Tests:
```
> npm run unit
```

Voor API-tests:
```
> npm run api
```

Voor End-to-end Tests:
```
> npm run e2e
```

De testresultaten zullen weergeven worden in de console waar deze zijn uitgevoerd.
