/*jshint node: true */
module.exports = function () {
    // „next” poniżej oznacza kolejną wartswę – tutaj akurat jej nie
    // wykorzystujemy i moglibyśmy pominąć ją w liście parametrów
    return function (req, res, next) {
        switch (req.url) {
        case '/': // obsługa ścieżki „/admin/”
            res.header('Content-Type', 'text/plain; charset=utf-8');
            res.end('Spróbuj /admin/users');
            break;
        case '/users': // obsługa ścieżki „/admin/users/”
            res.header('Content-Type', 'application/json');
            res.json(['Błażej', 'Kasia', 'Tomek']);
            break;
        default:
            res.header('Content-Type', 'application/json');
            res.json({"err": "NIE ma takiej strony!"});
        }
    };
};
