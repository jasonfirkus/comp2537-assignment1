import express from "express";
import { readFileSync } from "fs";
import { createServer } from "livereload";
import connectLiveReload from "connect-livereload";
import Joi from "joi";

const app = express();
const PORT = 3000;

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

app.post("/signup", (req, res) => {
  const { error: validationError, value: validatedBody } = signupSchema.validate(req.body, {
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
});

app.use((req, res, next) => {
  res.status(404).send(readFileSync("./public/html/404.html", "utf8"));
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
