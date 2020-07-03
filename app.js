"use strict"

const express = require('express')
const layouts = require('express-ejs-layouts')
const axios = require('axios')
const app = express()
// const port = 3000
const fs = require('fs'); //fs = filesystem.

const wikiroot = 'https://en.wikipedia.org/wiki/';

const dogData = require('./public/JSON/alldogs.json')

const session = require('express-session');
app.use(session({
  secret: 'goats-is-my s e c r e t',
}))


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
// const DEFAULT_dogHistory = [{index:'77',name:'Boston Terrier'}]; //list of {index, name}
// var _randomDogs = generate(); //list of {index, name, url}
// var _currentDog = { index:'77', name:'Boston Terrier', url:wikiroot+'Boston Terrier' }; //single object: {index, name, url}
// var _currentDogPhotoURL = null;
// var _extraImages = ["https://upload.wikimedia.org/wikipedia/commons/f/f9/Female_6_month_old_boston_terrier.jpg"];
// var _showExtraImages = true;

function _ResetHistory(req){
  req.session.dogHistory = [{index:'77',name:'Boston Terrier'}];
  req.session.randomDogs = generate();
  req.session.currentDog = { index:'77', name:'Boston Terrier', url:wikiroot+'Boston Terrier' };
  req.session.currentDogPhotoURL = null;
  req.session.extraImages = ["https://upload.wikimedia.org/wikipedia/commons/f/f9/Female_6_month_old_boston_terrier.jpg"];
  req.session.showExtraImages = true;
}

//makes sure all values of session have been initialized
function initSess(sess){
  sess.dogHistory = sess.dogHistory || [{index:'77',name:'Boston Terrier'}];
  sess.randomDogs = sess.randomDogs || generate();
  sess.currentDog = sess.currentDog || { index:'77', name:'Boston Terrier', url:wikiroot+'Boston Terrier' };
  sess.currentDogPhotoURL = sess.currentDogPhotoURL || "https://upload.wikimedia.org/wikipedia/commons/d/d7/Boston-terrier-carlos-de.JPG";
  sess.extraImages = sess.extraImages || ["https://upload.wikimedia.org/wikipedia/commons/f/f9/Female_6_month_old_boston_terrier.jpg"];
  if (sess.showExtraImages == undefined){sess.showExtraImages = true}



  return sess;
}

function setLocals(req, res){
  var sess = initSess(req.session);

  res.wikiroot = wikiroot;

  res.locals.extraImages = sess.extraImages;
  res.locals.dogHistory = sess.dogHistory;
  res.locals.randomDogs = sess.randomDogs;
  res.locals.currentDog = sess.currentDog;
  res.locals.currentDogPhotoURL = sess.currentDogPhotoURL;
  res.locals.showExtraImages = sess.showExtraImages;

  return res;
}

app.get('/', async (req, res) => {
  var sess = initSess(req.session);
  // console.log(">>"+ sess.currentDog + ".." + sess.currentDogPhotoURL);
  await swapDog(sess);
  setLocals(req, res);
  console.log(">>"+ sess.currentDog + ".." + sess.currentDogPhotoURL);
  res.render('dogface')
})


/* POST messages through req.body.postMsg
** 1. REFRESH_DOG <- Refresh the list of random dogs
** 2. SEARCH_DOG <- Set the Main Dog to the selected dog index number in req.body.postArg
** 3. TOGGLE_SHOW_EXTRA_IMAGES
** 4. RESET
*/
app.post('/', async (req, res) =>{
  var sess = initSess(req.session)
  console.log("MSG: "+ req.body.postMsg)

  if (req.body.postMsg == 'REFRESH_DOG'){
    //_randomDogs = generate();
    sess.randomDogs = generate();
  }
  else if (req.body.postMsg == 'SEARCH_DOG')
  {
    sess.dogHistory.push({index:req.body.postArg, name:dogData[req.body.postArg]})
    sess.currentDog = {index:req.body.postArg, name:dogData[req.body.postArg], url:wikiroot+dogData[req.body.postArg]}
  }
  else if (req.body.postMsg == 'TOGGLE_SHOW_EXTRA_IMAGES')
  {
    sess.showExtraImages = !sess.showExtraImages;
  }
  else if (req.body.postMsg == 'RESET')
  {
    sess.dogHistory = [{index:sess.currentDog.index, name:sess.currentDog.name}];//_ResetHistory(req)
  }

  sess = await swapDog(sess);
  setLocals(req, res);
  res.render('dogface', {})
})

  app.get('/swapdog', async (req,res,next)=>{
    sess = await swapDog(sess);
    res.send(`<img src="${sess.currentDogPhotoURL}">`)
  })

  async function swapDog(sess)
  {
    console.log("swapdog");
      try {
        let dogname = encodeURIComponent(sess.currentDog.name) //"Slovenský kopov"//"Í"//"Galgo_Español"//Piña//"Boston_Terrier"//"Poodle"//"Pug"//"Albert Einstein"
        let basicInfo = await axios.get(`https://en.wikipedia.org/w/api.php?action=parse&page=${dogname}&format=json&prop`)
        let pageid = basicInfo.data.parse.pageid;

        let result = await axios.get(`https://en.wikipedia.org/w/api.php?action=query&prop=pageimages&format=json&piprop=original&titles=${dogname}`);
        let mainImg = result.data.query.pages[`${pageid}`].original.source;
        sess.currentDogPhotoURL = mainImg;

        if (sess.showExtraImages)
        {
          let extraImagesJSON = await axios.get(`https://en.wikipedia.org/w/api.php?action=parse&page=${dogname}&format=json&prop=images`);
          sess.extraImages = []
          let LEN = extraImagesJSON.data.parse.images.length;
          for (let i=0; i<LEN; i++)
          {
            let image = extraImagesJSON.data.parse.images[i];

            let ending = image.split('.').pop();
            if (ending=='JPG' | ending=='jpg' | ending=='PNG' | ending=='png')
            {
              let again = await axios.get(`https://en.wikipedia.org/w/api.php?action=query&format=json&prop=imageinfo&titles=File:${image}&iiprop=url`)
              let imgURL = again.data.query.pages['-1'].imageinfo['0'].url;
              if (imgURL != sess.currentDogPhotoURL)
                sess.extraImages.push(imgURL);
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
  setLocals(req, res);
  res.render('about')
})

app.post('/newDogs', async (req, res) =>{
  res.json(generate())
})


// app.listen(port, () =>{
//   console.log(`Example app listening at http://localhost:${port}`)
// })


module.exports = app;
