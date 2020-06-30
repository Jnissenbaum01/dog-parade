"use strict"

const express = require('express')
const layouts = require("express-ejs-layouts")
const app = express()
const port = 3000
const fs = require('fs'); //fs = filesystem.



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


app.get('/', (req, res) => {
  //res.send('Hello World!')
  //res.render('dogface',  {layout:false}) //render without layout
  res.render('dogface')
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

let dogData = require('./public/JSON/alldogs.json')
app.get('/flytest', (req,res) =>{
  let L = dogData.length;

  let X = 3+Math.floor(Math.random()*5)

  var randomDogs = `<h1>${X} random dogs</h1>`
  for (let i=0; i<X; i++)
  {
      let R = Math.floor(Math.random()*L)
      randomDogs += `${R}  ${dogData[R]}<br>`
  }
  res.send(randomDogs);
})

app.listen(port, () =>{
  console.log(`Example app listening at http://localhost:${port}`)
})
