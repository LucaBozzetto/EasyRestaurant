db = db.getSiblingDB('easyrestaurant');

// Users
db.users.insert({
	"admin": false,
    "hired": {
        "$date": "2019-06-06T19:48:43.716Z"
    },
    "username": "johndoe",
    "salt": "a49823465eea43d94fef80d0a71a1c66",
    "hash": "311b84c02a08b6120c857446d409b13bc90c953aff75d32b8d83d1e228cf19d1aafb4c35347f93f32edb59f2d56e4d230778923a1763cb53f0713ec7f6db6813",
    "name": "John",
    "surname": "Doe",
    "role": "waiter",
    "wage": 1200
});
db.users.insert({
    "admin": false,
    "hired": {
        "$date": "2019-07-23T14:31:05.048Z"
    },
    "username": "gram",
    "salt": "cd4956a0a64603a4c6128ca34d2cee24",
    "hash": "73ef42373fc3762b18cde8541da7c4d46ba835d4f80f4af4cf03638c5d62ecc6dd19779e72956622e353be2d505328e72c54dfbe6730aa5b8b3e842e62669726",
    "name": "Gordon",
    "surname": "Ramsey",
    "role": "cook",
    "wage": 1200
});
db.users.insert({
    "admin": true,
    "hired": {
        "$date": "2019-07-27T13:54:47.407Z"
    },
    "username": "admin",
    "salt": "386856eb8c7c01585703b9ff5de7d9f6",
    "hash": "1192889f4a338d6ec940b1eb03f61904ea4e260a1ddada2be89cb874f447922098308862d3fa4da3edacc5f68831fe5face528bcaf5926ea546e6405c0ac2011",
    "name": "Paperon",
    "surname": "De Paperoni",
    "role": "cashier",
    "wage": 1200
});
db.users.insert({
   "admin": false,
    "hired": {
        "$date": "2019-08-12T12:26:45.075Z"
    },
    "username": "gton",
    "salt": "1728b49e2666a8635fb5838daef305d3",
    "hash": "da70d6b7b1beed69deb5d6d81ecaca9e849d85a1c3d821319a91e32867e8189734a700c7017241c53bee5b58376c96938dbca8164c660cffff0aaa533bdfc618",
    "name": "Gin",
    "surname": "Tonic",
    "role": "bar",
    "wage": 1200
});

// Tables
db.tables.insert({
	"free": true,
    "orders": [],
    "tableNumber": 1,
    "seats": 6,
    "customers": 0,
    "occupiedAt": null,
    "waiter": null
});
db.tables.insert({
	"free": true,
    "orders": [],
    "tableNumber": 2,
    "seats": 4,
    "customers": 0,
    "occupiedAt": null,
    "waiter": null
});
db.tables.insert({
	"free": true,
    "orders": [],
    "tableNumber": 3,
    "seats": 12,
    "customers": 0,
    "occupiedAt": null,
    "waiter": null
});
db.tables.insert({
	"free": true,
    "orders": [],
    "tableNumber": 4,
    "seats": 2,
    "customers": 0,
    "occupiedAt": null,
    "waiter": null
});
db.tables.insert({
	"free": true,
    "orders": [],
    "tableNumber": 5,
    "seats": 6,
    "customers": 0,
    "occupiedAt": null,
    "waiter": null
});

// Identity counters
db.identitycounters.insert({
    "groupingField": "",
    "count": 5,
    "model": "Table",
    "field": "tableNumber"
});

// Items
db.items.insert({
    "price": 5,
    "name": "Pizza Margherita",
    "type": "food",
    "tag": "pizza",
    "timeRequired": 7
});
db.items.insert({
    "price": 8,
    "name": "Pizza Salami",
    "type": "food",
    "tag": "pizza",
    "timeRequired": 9
});
db.items.insert({
    "price": 6,
    "name": "Guacamole",
    "type": "food",
    "tag": "starter",
    "timeRequired": 6
});
db.items.insert({
    "price": 10,
    "name": "Cheese straws",
    "type": "food",
    "tag": "starter",
    "timeRequired": 30
});
db.items.insert({
    "price": 13,
    "name": "Sausage and mushrooms pasta",
    "type": "food",
    "tag": "main course",
    "timeRequired": 17
});
db.items.insert({
    "price": 12,
    "name": "Pesto pasta",
    "type": "food",
    "tag": "main course",
    "timeRequired": 15
});
db.items.insert({
    "price": 16,
    "name": "Prawn and courgette risotto",
    "type": "food",
    "tag": "main course",
    "timeRequired": 24
});
db.items.insert({
    "price": 2,
    "name": "San Pellegrino 0,75",
    "type": "beverage",
});
db.items.insert({
    "price": 2.5,
    "name": "Coke 0,5",
    "type": "beverage",
});
db.items.insert({
    "price": 2.5,
    "name": "Fanta 0,5",
    "type": "beverage",
});
db.items.insert({
    "price": 2.5,
    "name": "Blonde Beer 0,33",
    "type": "beverage",
});
db.items.insert({
    "price": 4,
    "name": "Blonde Beer 0,5",
    "type": "beverage",
});
db.items.insert({
    "price": 1.5,
    "name": "Pepperoni",
    "type": "extra",
});
db.items.insert({
    "price": 2,
    "name": "Ham",
    "type": "extra",
});
db.items.insert({
    "price": 2,
    "name": "mushrooms",
    "type": "extra",
});
db.items.insert({
    "price": 3,
    "name": "Cheese",
    "type": "extra",
});


