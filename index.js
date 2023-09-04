require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const { MongoClient, ServerApiVersion } = require('mongodb');
const dns = require('dns')
const urlparser = require('url')

const uri = 'mongodb+srv://user-Rishav:Rishabh123@cluster0.qvro74m.mongodb.net/?retryWrites=true&w=majority';




const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});
async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    console.log("Working !")
  }
}

const db = client.db("urlshortner")
const urls = db.collection("urls")

run().catch(console.dir);
// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json())
app.use(express.urlencoded({extended: true}))

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.post('/api/shorturl', function(req, res) {
  
  console.log(req.body)
  const url = req.body.url
  const dnslookup = dns.lookup(urlparser.parse(url).hostname, async (err, address) => {
    if (!address){
      res.json({error: "Invalid URL"})
    } else {

      const urlCount = await urls.countDocuments({})
      const urlDoc = {
        url,
        short_url: urlCount
      }

      const result = await urls.insertOne(urlDoc)
      console.log(result);
      res.json({ original_url: url, short_url: urlCount })
      
    }
  })
});

app.get("/api/shorturl/:short_url", async (req, res) => {
  const shorturl = req.params.short_url
  const urlDoc = await urls.findOne({ short_url: +shorturl })
  res.redirect(urlDoc.url)
})

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});