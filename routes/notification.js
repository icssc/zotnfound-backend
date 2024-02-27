const express = require("express");
const webpush = require("web-push");
const path = require("path");
const cors = require("cors");

const notificationRouter = express();
notificationRouter.use(cors());
notificationRouter.use(express.static(path.join(__dirname, "client")));
notificationRouter.use(express.json());

const publicVapidKey = process.env.PUBLIC_VAPID_KEY;

const privateVapidKey = process.env.PRIVATE_VAPID_KEY;

webpush.setVapidDetails(
  "mailto:test@test.com",
  publicVapidKey,
  privateVapidKey
);

notificationRouter.post("/", (req, res) => {
  console.log("Pushing Notifications to User");
  const subscription = req.body;
  res.status(201).json({});
  const payload = JSON.stringify({
    title: "TEST NOTIFICATION",
    body: "HEHEHEHEHEHEH",
  });
  console.log(subscription);
  webpush.sendNotification(subscription, payload).catch(console.log);
});

notificationRouter.get("/test", (req, res) => {
  console.log("Testing Routing!");
  res.status(201).json({ message: "Routing is working!" });
});

module.exports = notificationRouter;
