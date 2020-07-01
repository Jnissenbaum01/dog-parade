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
var _extraImages = ["https://upload.wikimedia.org/wikipedia/commons/f/f9/Female_6_month_old_boston_terrier.jpg"];
var _showExtraImages = true;

function setLocals(response){
  response.wikiroot = wikiroot;
  response.locals.randomDogs = _randomDogs;
  response.locals.dogHistory = _dogHistory;
  response.locals.currentDog = _currentDog;
  response.locals.currentDogPhotoURL = _currentDogPhotoURL;
  response.locals.extraImages = _extraImages;
  response.locals.showExtraImages = _showExtraImages;
}

app.get('/', async (req, res) => {
  await swapDog();
  setLocals(res);
  // console.log("extra images"+ _extraImages);
  res.render('dogface')
})


/* POST messages through req.body.postMsg
** 1. REFRESH_DOG <- Refresh the list of random dogs
** 2. SEARCH_DOG <- Set the Main Dog to the selected dog index number in req.body.postArg
** 3. TOGGLE_SHOW_EXTRA_IMAGES
*/
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
  else if (req.body.postMsg == 'TOGGLE_SHOW_EXTRA_IMAGES')
  {
    _showExtraImages = !_showExtraImages;
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

        if (_showExtraImages)
        {
          let extraImagesJSON = await axios.get(`https://en.wikipedia.org/w/api.php?action=parse&page=${dogname}&format=json&prop=images`);
          _extraImages = []
          let LEN = extraImagesJSON.data.parse.images.length;
          for (let i=0; i<LEN; i++)
          {
            let image = extraImagesJSON.data.parse.images[i];

            let ending = image.split('.').pop();
            if (ending=='JPG' | ending=='jpg' | ending=='PNG' | ending=='png')
            {
              let again = await axios.get(`https://en.wikipedia.org/w/api.php?action=query&format=json&prop=imageinfo&titles=File:${image}&iiprop=url`)
              let imgURL = again.data.query.pages['-1'].imageinfo['0'].url;
              if (imgURL != _currentDogPhotoURL)
                _extraImages.push(imgURL);
              //console.log(again.data.query.pages['-1'].imageinfo['0'].url);
            }
            else
            {
            }
          }
        }
        else {

        }


        // console.log(_extraImages);
        //all images
        // console.log("new dog is"+ _currentDog.name);
        //console.log(basicInfo.data);
        // res.json(data)
      }
      catch(e){
        console.log("error in swapDog: "+ e)
      }
    }


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

app.get('/about', (req, res) => {
  setLocals(res);
  res.render('about')
})

app.listen(port, () =>{
  console.log(`Example app listening at http://localhost:${port}`)
})
