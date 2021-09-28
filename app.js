var express = require("express");
var bodyParser = require("body-parser");
const mongoose = require('mongoose');
const url = require('url');


mongoose.connect('mongodb://localhost:27017/FoodData');
var db = mongoose.connection;
db.on('error', console.log.bind(console, "connection error"));
db.once('open', function (callback) {
    console.log("connection succeeded");
})

var app = express();
// set the view engine to ejs
app.set('view engine', 'ejs');
app.use(express.static(__dirname));


app.use(bodyParser.json());
app.use(express.static('public'));
app.use(bodyParser.urlencoded({
    extended: true
}));

var old_data;
var new_data;
app.post('/AddItem', function (req, res) {

    var name = req.body.itemname;
    var price = req.body.price;

    var menuData = [{
        "name": name,
        "price": price,
    }];

    db.collection('foodDetail').insertMany(menuData, function (err, collection) {
        if (err) throw err;
        console.log("Record inserted Successfully");
    });

    db.collection('foodDetail').find().toArray(function (err, dataObj) {
        console.log("Sending data to html page")
        return res.render('foodlist.ejs', { data: dataObj });
    })
})

app.get('/AddItem', function (req, res) {
    return res.render('AddItem.ejs');
});

app.get('/delete/:name', function (req, res) {
    var deleteCriteria = { name: req.params.name }
    db.collection('foodDetail').deleteOne(deleteCriteria, function (err, data) {
        if (err) throw err;
        console.log("Food Item deleted successfully")
    });

    db.collection('foodDetail').find().toArray(function (err, dataObj) {
        console.log("Sending data to html page")
        res.redirect('..');
    })
})

app.get('/UpdateItem/:name', function (req, res) {

    db.collection('foodDetail').findOne({ name: req.params.name }, function (err, dataObj) {
        console.log("Sending edited data to html page")
        console.log(dataObj);

        this.old_data = {
            name: req.params.name
        }

        return res.render('UpdateItem.ejs', { data: dataObj });
    })
})

app.post("/UpdateItem", function (req, res) {
    console.log(this.old_data)

    new_data = {

        name: req.body.itemname,
        price: req.body.price
    }

    console.log(new_data);

    db.collection('foodDetail').updateOne({ name: this.old_data.name }, {
        $set: {
            name: req.body.itemname,
            price: req.body.price
        }
    }, function (err, dataObj) {
        console.log("Updating the data")
    })

    db.collection('foodDetail').find().toArray(function (err, dataObj1) {
        console.log("Sending updated data to html page")
        res.redirect('..');

    })
})

app.get('/', function (req, res) {

    db.collection('foodDetail').find().toArray(function (err, dataObj) {
        console.log("Sending data to html page")
        return res.render('foodlist.ejs', { data: dataObj });
    })
})

app.listen(3000);
console.log('Server is listening on port 3000');
