"use strict"

const express = require('express')
const layouts = require("express-ejs-layouts")
const app = express()
const port = 3000
const fs = require('fs'); //fs = filesystem.

const wikiroot = 'https://en.wikipedia.org/wiki/';

const dogData = require('./public/JSON/alldogs.json')

app.set("view engine", "ejs");
app.set("port", process.env.PORT || 3000);
app.use(
  express.urlencoded({
    extended: false
  })
);
app.use(express.json());
app.use(layouts);
app.use(express.static("public"));
// app.use(express.static("views"));

function generate ()
{
  var randomDogs = [];

  let L = dogData.length;
  let X = 3+Math.floor(Math.random()*5)
  for (let i=0; i<X; i++)
  {
      let R = Math.floor(Math.random()*L) //pick a random dog
      randomDogs.push({index:R, name:dogData[R], url:wikiroot+dogData[R]})
  }
  return randomDogs;
}

//persistent variables:
var _dogHistory = []; //list of {index, name}
var _randomDogs = generate(); //list of {index, name, url}
var _currentDog = { index:'77', name:'Boston Terrier', url:wikiroot+'Boston Terrier' }; //single object: {index, name, url}

function setLocals(response){
  response.wikiroot = wikiroot;
  response.locals.randomDogs = _randomDogs;
  response.locals.dogHistory = _dogHistory;
  response.locals.currentDog = _currentDog;
}

app.get('/', (req, res) => {
  setLocals(res);
  res.render('dogface')
})


app.post('/', (req, res) =>{
  console.log("MSG: "+ req.body.postMsg)

  if (req.body.postMsg == 'REFRESH_DOG'){
    _randomDogs = generate();
  }
  else if (req.body.postMsg == 'SEARCH_DOG')
  {
      _dogHistory.push({index:req.body.postArg, name:dogData[req.body.postArg]});
      _currentDog = {index:req.body.postArg, name:dogData[req.body.postArg], url:wikiroot+dogData[req.body.postArg]}
      // console.log(_dogHistory);
  }

  setLocals(res);
  res.render('dogface', {})
})

//helper function was used to parse the Wikipedia query
//and get only the dog's names.
//with minor text editing needed afterwards (to remove extra comma, add name for array)
app.get('/fly', (req,res) =>{
  let rawdata = fs.readFileSync('./public/JSON/api-result.json');
  let data = JSON.parse(rawdata);

  var nuevo = '{'
  data.parse.links.forEach((item) => {
    nuevo += `"${item['*']}", `
  });
  nuevo += '}'

  res.send(nuevo)
})



app.get('/flytest', (req,res) =>{
  let L = dogData.length;

  let X = 3+Math.floor(Math.random()*5)

  var randomDogs = `<h1>${X} random dogs</h1>`
  for (let i=0; i<X; i++)
  {
      let R = Math.floor(Math.random()*L)
      randomDogs += `${R}  <a href="${wikiroot+dogData[R]}">${dogData[R]}</a><br>`
  }
  res.send(randomDogs);
})

app.listen(port, () =>{
  console.log(`Example app listening at http://localhost:${port}`)
})
