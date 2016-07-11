/*Voorstelleke

in general:
al GETTERS use GET and return Json

al SETTERS use POST (gewoon een x-www-form-urlencoded ? of voorkeur voor een JSON object?)

Bij user management zou ik ook ineens wel het concept "profielen" zetten.
    Alle user settings hangen dan aan een profiel, niet aan een account.

    Concept:
retreive and update profile settings
(of zit dat allemaal in Cognito ?)

*/

var result;
var endPoint;
var payload;
//GET
endPoint = "/api/settings/{SessionID}";

/*example:*/

result = {
    language: "de",
    helpActive: false
};

//POST
endPoint = "/api/settings/{SessionID}";

"/api/plugins"

//POST
"api/plugins/add"

// add a plugin
//example
payload = {

}

// returns a "succes" boolean and optionally some additional

