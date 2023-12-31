const express = require("express");
const sendEmail = require("../utils");
const fs = require("fs");
const path = require("path");
const middleware = require("../middleware");
const itemsRouter = express.Router();

const pool = require("../server/db");
const templatePath = path.join(__dirname, "../emailTemplate/index.html");
const template = fs.readFileSync(templatePath, "utf-8");
const isPositionWithinBounds = require("../util/inbound");
//Add a item
itemsRouter.post("/", async (req, res) => {
  try {
    const {
      name,
      description,
      type,
      islost,
      location,
      date,
      itemdate,
      email,
      image,
      isresolved,
      ishelped,
    } = req.body;

    if (!isPositionWithinBounds(location[0], location[1])) {
      res.json("ITEM OUT OF BOUNDS (UCI ONLY)");
    }

    const item = await pool.query(
      "INSERT INTO items (name, description, type, islost, location, date, itemdate, email, image, isresolved, ishelped) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *",
      [
        name,
        description,
        type,
        islost,
        location,
        date,
        itemdate,
        email,
        image,
        isresolved,
        ishelped,
      ]
    );

    const nearbyItems = await pool.query(
      "SELECT DISTINCT email FROM leaderboard WHERE email!=$1",
      [email]
    );

    res.json(item.rows[0]); // send the response immediately after adding the item
    let contentString = "";

    // COMMENT OUT FOR TESTING PURPOSES
    // function sendDelayedEmail(index) {
    //   if (index >= nearbyItems.rows.length) return;

    //   let email = nearbyItems.rows[index].email;
    //   contentString += `A new item, ${name}, is added to ZotnFound!`;

    //   const dynamicContent = {
    //     content: contentString,
    //     image: image,
    //     url: `https://zotnfound.com/${item.rows[0].id}`,
    //   };

    //   const customizedTemplate = template
    //     .replace("{{content}}", dynamicContent.content)
    //     .replace("{{image}}", dynamicContent.image)
    //     .replace("{{url}}", dynamicContent.url);

    //   sendEmail(email, "A nearby item was added.", customizedTemplate);

    //   contentString = "";
    //   console.log("sent " + email);
    //   setTimeout(() => sendDelayedEmail(index + 1), 500);
    // }

    // sendDelayedEmail(0);
  } catch (error) {
    console.error(error);
  }
});

//Get all items
itemsRouter.get("/", async (req, res) => {
  try {
    const allItems = await pool.query("SELECT * FROM items");
    res.json(allItems.rows);
  } catch (error) {
    console.error(error);
  }
});

// itemsRouter.get("/testemail", async (req, res) => {
//   contentString = `A new added item, is near your items!`;

//   const dynamicContent = {
//     content: contentString,
//     image:
//       "https://i.insider.com/61d5c65a5a119b00184b1e1a?width=1136&format=jpeg",
//     url: `https://zotnfound.com/2`,
//   };

//   const customizedTemplate = template
//     .replace("{{content}}", dynamicContent.content)
//     .replace("{{image}}", dynamicContent.image)
//     .replace("{{url}}", dynamicContent.url);

//   email = [
//     "nguyenisabillionaire@gmail.com",
//     "dangnwin@gmail.com",
//     "nwinsquared@gmail.com",
//     "stevenzhouni@gmail.com",
//     "sophiahuynh124@gmail.com",
//   ];
//   await sendEmail(email, "A nearby item was added!", customizedTemplate);

//   contentString = "";
//   res.json("nice");
// });

//Get a item
itemsRouter.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const item = await pool.query("SELECT * FROM items WHERE id=$1", [id]);
    res.json(item.rows[0]);
  } catch (error) {
    console.error(error);
  }
});

// Retrieve Items by Category
itemsRouter.get("/category/:category", async (req, res) => {
  try {
    const { category } = req.params;
    const items = await pool.query("SELECT * FROM items WHERE type=$1", [
      category,
    ]);
    res.json(items.rows);
  } catch (error) {
    console.error(error);
  }
});

//Update a item resolve and helpfulness
itemsRouter.put("/:id", middleware.decodeToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { ishelped } = req.body;

    const item = await pool.query(
      "UPDATE items SET isresolved=$1, ishelped=$2 WHERE id=$3 RETURNING *",
      [true, ishelped, id]
    );

    res.json(item.rows[0]);
  } catch (error) {
    console.error(error);
  }
});

//Delete a item
itemsRouter.delete("/:id", middleware.decodeToken, async (req, res) => {
  try {
    const { id } = req.params;
    const deletedItem = await pool.query(
      "DELETE FROM items WHERE id=$1 RETURNING *",
      [id]
    );
    res.json(deletedItem.rows[0]);
  } catch (error) {
    console.error(error);
  }
});

module.exports = itemsRouter;
