"use strict"

const express = require('express')
const layouts = require("express-ejs-layouts")
const app = express()
const port = 3000


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

app.listen(port, () =>{
  console.log(`Example app listening at http://localhost:${port}`)
})
