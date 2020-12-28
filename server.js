// const express = require("express");
import express from "express";
import mongoose from "mongoose";
import Messages from "./dbMessages.js";
// const Pusher = require("pusher");
import Pusher from "pusher";
import cors from "cors";

// Config
const app = express();
const port = process.env.PORT || 9000;

const pusher = new Pusher({
  appId: "1123630",
  key: "fa0bfe9bf7555a42ace2",
  secret: "896e43ff5e1814971f09",
  cluster: "ap2",
  useTLS: true,
});

// middleware
app.use(express.json());
// app.use(cors());
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "*");
  next();
});

const connection_url =
  "mongodb+srv://admin:8F4d7hnnZ59LrrUX@cluster0.polkb.mongodb.net/hashtagdb?retryWrites=true&w=majority";
mongoose.connect(connection_url, {
  useCreateIndex: true,
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;

db.once("open", () => {
  console.log("DB Connected");

  const msgCollection = db.collection("messagecontents");
  const changeStream = msgCollection.watch();

  changeStream.on("change", (change) => {
    console.log(change);

    if (change.operationType === "insert") {
      const messageDetails = change.fullDocument;
      pusher.trigger("messages", "inserted", {
        name: messageDetails.name,
        message: messageDetails.message,
        timestamp: messageDetails.timestamp,
        received: messageDetails.received,
      });
    } else {
      console.log("Error in triggering the Pusher");
    }
  });
});

// api routes
app.get("/", (req, res) => res.status(200).send("HOLA"));

app.get("/messages/sync", (req, res) => {
  Messages.find((err, data) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.status(200).send(data);
    }
  });
});

app.post("/messages/new", (req, res) => {
  const dbMessage = req.body;

  Messages.create(dbMessage, (err, data) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.status(201).send(data);
    }
  });
});

app.listen(port, () => console.log(`Listening on localhost at ${port}`));
