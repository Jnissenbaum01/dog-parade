"use strict"

const express = require('express')
const layouts = require('express-ejs-layouts')
const axios = require('axios')
const app = express()
const port = 3000
const fs = require('fs'); //fs = filesystem.

const wikiroot = 'https://en.wikipedia.org/wiki/';

const dogData = require('./public/JSON/alldogs.json')

app.set("view engine", "ejs");
app.set("port", process.env.PORT || 3000);
app.use(
  express.urlencoded({
    extended: true
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
var _currentDogPhotoURL = null;

function setLocals(response){
  response.wikiroot = wikiroot;
  response.locals.randomDogs = _randomDogs;
  response.locals.dogHistory = _dogHistory;
  response.locals.currentDog = _currentDog;
  response.locals.currentDogPhotoURL = _currentDogPhotoURL;
}

app.get('/', async (req, res) => {
  await swapDog();
  setLocals(res);
  res.render('dogface')
})


app.post('/', async (req, res) =>{
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

  await swapDog();
  setLocals(res);
  res.render('dogface', {})
})

  app.get('/swapdog', async (req,res,next)=>{
    await swapDog();
    res.send(`<img src="${_currentDogPhotoURL}">`)
  })

  async function swapDog()
  {
    console.log("swapdog");
      try {
        let dogname = encodeURIComponent(_currentDog.name) //"Slovenský kopov"//"Í"//"Galgo_Español"//Piña//"Boston_Terrier"//"Poodle"//"Pug"//"Albert Einstein"
        let basicInfo = await axios.get(`https://en.wikipedia.org/w/api.php?action=parse&page=${dogname}&format=json&prop`)
        let pageid = basicInfo.data.parse.pageid;



        let result = await axios.get(`https://en.wikipedia.org/w/api.php?action=query&prop=pageimages&format=json&piprop=original&titles=${dogname}`);
        let mainImg = result.data.query.pages[`${pageid}`].original.source;

        _currentDogPhotoURL = mainImg;
        console.log("inside again");
        // console.log("new dog is"+ _currentDog.name);
        console.log(basicInfo.data);
        // res.json(data)
      }
      catch(e){
        console.log("error in swapDog: "+ e)
      }
    }

// async function swapDog()
// {
//   try
//   {
//     // let mainImageURL = await axios.get(`https://en.wikipedia.org/w/api.php?action=query&prop=pageimages&format=json&piprop=original&titles=Poodle`);
//     let mainImageURL = await(`https://covidtracking.com/api/v1/states/ma/current.json`);
//     console.log(mainImageURL);
//   }
//   catch (e)
//   {
//     console.log("error occurred when loading dog data from wikipedia");
//   }
//
// }


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
