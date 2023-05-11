require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const { Item, List } = require("./Models");
const _ = require("lodash");

const dbPassword = process.env.DB_PASSWORD;
const app = express();

// const run = async () => {
//   try {
//     const connection = await mongoose.connect(
//       "mongodb://127.0.0.1:27017/todolistDB"
//     );
//     if (connection) {
//       console.log("connected to todolistDB");
//     }
//   } catch (e) {
//     console.log(e);
//   }
// };
// run();

const connection = mongoose.connect(
  `mongodb+srv://admin-silver:${dbPassword}@cluster0.am2adgk.mongodb.net/todolistDB`
);
if (connection) {
  console.log("connected to todolistDB");
}

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(`${__dirname}`));

const item1 = {
  name: "Welcome to your todolist!",
};

const item2 = {
  name: "Hit the + button to add a new item.",
};

const item3 = {
  name: "<-- Hit this to delete an item.",
};

const defaultItems = [item1, item2, item3];

app.get("/", async (req, res) => {
  try {
    const foundItems = await Item.find({});
    if (foundItems.length === 0) {
      await Item.insertMany(defaultItems);
      console.log("Successfully inserted items");
      res.redirect("/");
    } else {
      res.render("list", {
        listTitle: "Today",
        newListItems: foundItems,
      });
    }
  } catch (err) {
    console.log(err);
  }
});

app.get("/:customListName", async (req, res) => {
  const customListName = _.capitalize(req.params.customListName);

  try {
    const foundList = await List.findOne({ name: customListName });
    if (!foundList) {
      const list = new List({
        name: customListName,
        items: defaultItems,
      });
      await list.save();
      res.redirect(`/${customListName}`);
    } else {
      res.render("list", {
        listTitle: customListName,
        newListItems: foundList.items,
      });
    }
  } catch (err) {
    console.log(err);
  }
});

app.post("/", async (req, res) => {
  const newItem = new Item({
    name: req.body.newItem,
  });
  const listTitle = req.body.listNI;

  try {
    if (listTitle === "Today") {
      await newItem.save();
      res.redirect("/");
    } else {
      const foundList = await List.findOne({ name: listTitle });
      if (foundList) {
        foundList.items.push(newItem);
        await foundList.save();
        res.redirect(`/${listTitle}`);
      } else {
        console.log("no foundList");
      }
    }
  } catch (err) {
    console.log(err);
  }
});

app.post("/delete", async (req, res) => {
  const checkBoxId = req.body.checkbox;
  const listTitle = req.body.listCB;

  try {
    if (listTitle === "Today") {
      await Item.findByIdAndRemove(checkBoxId);
      console.log("Successfully deleted by ID in Main Page");
      res.redirect("/");
    } else {
      const foundList = await List.findOneAndUpdate(
        { name: listTitle },
        { $pull: { items: { _id: checkBoxId } } }
      );
      res.redirect(`/${listTitle}`);
      if (foundList) {
        console.log(`Successfully deleted by ID in ${listTitle} Page`);
      } else {
        console.log("no foundList wrt the ID provided");
      }
    }
  } catch (err) {
    console.log(err);
  }
});

app.listen(process.env.PORT || 3000, () => {
  console.log("Server started.");
});
