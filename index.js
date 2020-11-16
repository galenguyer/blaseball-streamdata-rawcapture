var EventSource = require('eventsource')
var express = require('express');
var app = express();
const assert = require('assert');
 
const { MongoClient } = require("mongodb");

async function run(data) {
  const client = new MongoClient(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  await client.connect();
  const dbName = "blaseball";
  const collectionName = "streamData";
  const database = client.db(dbName);
  const collection = database.collection(collectionName);
  const dataWithId = {
      _id: (new Date()*1),
      value: data.value
  }
  try {
    const insertManyResult = await collection.insertOne(dataWithId);
    console.log(`${insertManyResult.insertedCount} documents successfully inserted with id ${dataWithId._id}.`);
  } catch (err) {
    console.error(`Something went wrong trying to insert the new documents: ${err}`);
  }
  try {
    const allDocs = await collection.find({}).toArray();
    console.log(`${allDocs.length} total documents`);
  } catch (err) {
    console.error(`Something went wrong trying to query the db: ${err}\n`);
  }
  await client.close();
}


latest = null

const evtSource = new EventSource("https://www.blaseball.com/events/streamData");

evtSource.onmessage = function(event) {
    data = JSON.parse(event.data);
    //console.log(data);
    if (latest == null) {
        latest = data;
    }
    if (data.value.games != null) {
        latest.value.games = data.value.games;
    }
    if (data.value.leagues != null) {
        latest.value.leagues = data.value.leagues;
    }
    if (data.value.temporal != null) {
        latest.value.temporal = data.value.temporal;
    }
    if (data.value.fights != null) {
        latest.value.fights = data.value.fights;
    }
    run(latest).catch(console.dir);
}

app.get("/api/v2/streamData/latest", function(req, res) {
    res.json(latest)
})

var server = app.listen(8081, function () {
    var host = server.address().address
    var port = server.address().port
    console.log("app listening at http://%s:%s", host, port)
 })
