import express from "express";
import { readFileSync } from "fs";
import { createServer } from "livereload";
import connectLiveReload from "connect-livereload";
import Joi from "joi";
import bcrypt from "bcrypt";
import "dotenv/config";
import MongoStore from "connect-mongo";
import { MongoClient } from "mongodb";
import session from "express-session";

const app = express();
const PORT = 3000;
const HOUR_IN_SECONDS = 60 * 60;

const client = new MongoClient(process.env.MONGODB_URI);
const db = (await client.connect()).db("users");
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      client,
      dbName: "users",
      collectionName: "users",
      ttl: HOUR_IN_SECONDS,
    }),
    cookie: { maxAge: 1000 * HOUR_IN_SECONDS },
  })
);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use("/styles", express.static("./public/styles"));

const liveReloadServer = createServer();
liveReloadServer.watch("./public/");
app.use(connectLiveReload());

const signupSchema = Joi.object({
  name: Joi.string().alphanum().max(20).required(),
  email: Joi.string().email().max(30).required(),
  password: Joi.string().max(20).required(),
});

app.get("/", (req, res) => {
  res.send(readFileSync("./public/html/home.html", "utf8"));
});

app.get("/signup", (req, res) => {
  res.send(readFileSync("./public/html/signup.html", "utf8"));
});

app.get("/login", (req, res) => {
  res.send(readFileSync("./public/html/login.html", "utf8"));
});

app.post("/signup", async (req, res) => {
  try {
    const {
      error: validationError,
      value: { name, email, password },
    } = signupSchema.validate(req.body, {
      stripUnknown: true,
    });

    if (validationError) {
      return res
        .status(400)
        .send(
          readFileSync("./public/html/signup-error.html", "utf8").replace(
            "<!-- FIELD -->",
            validationError.details[0].context.key
          )
        );
    }

    const { insertedId } = await db.collection("users").insertOne({
      name,
      email,
      password: await bcrypt.hash(password, 10),
    });

    req.session.userId = insertedId; //start session
    req.session.save();
    console.log("Inserted user with id: ", insertedId);
    res.redirect("/members");
  } catch (error) {
    console.log("Error inserting user", error);
    res.status(500).json({ message: "Error inserting user", error });
  }
});

app.use((req, res, next) => {
  res.status(404).send(readFileSync("./public/html/doesnotexist.html", "utf8"));
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
