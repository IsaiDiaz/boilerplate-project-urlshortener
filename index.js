require('dotenv').config();
const express = require('express');
const cors = require('cors');
const dns = require('dns');
const app = express();
let bodyParser = require("body-parser");
const mongoose = require("mongoose");
const urlparser = require('url');

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint

mongoose.connect(process.env.MONGO_URI,  { useNewUrlParser: true, useUnifiedTopology: true });

const { Schema } = mongoose;

const urlSchema = new Schema({
  originalUrl: {type: String, required: true}
});

let Url = mongoose.model("Url", urlSchema);

app.use(bodyParser.urlencoded({extended : false}));

//based in https://www.youtube.com/watch?v=LjlmkGSoUJ8
app.post('/api/shorturl', function(req, res) {
 let reqUrl = req.body.url;
 let UrlRegister = dns.lookup(urlparser.parse(reqUrl).hostname, function (error, address){
  if(!address){
    res.json({"error" : "Invalid URL"})
  }else{
    let url = new Url({originalUrl: reqUrl})
    url.save(function(err, data){
      if(err) return console.error(err);
      res.json({"original_url": data.originalUrl, "short_url": data.id})
    });
  }
 });
});

app.get('/api/shorturl/:id', function(req, res){
  Url.findById(req.params.id.toString(), function(err, data){
    if(!data){
      res.json({"error": "Invalid URL"})
    }else{
      res.redirect(data.originalUrl)
    }
  });
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
