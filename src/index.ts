import express, { Request, Response } from "express";
import bcrypt from "bcrypt";
import { config } from "dotenv";
import jwt from "jsonwebtoken";
import cors from "cors";
import bodyParser from "body-parser";
import { User, Link } from "./data";

const app = express();
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());
config();

function generateToken(dx: string) {
  return jwt.sign({ dx }, `${process.env.ACCESS_TOKEN_SECRET}`);
}

app.post("/auth/signin", async (req: Request, res: Response) => {
  const { username, password } = req.body;
  const user = User.find((e) => e.userName == username);
  if (!user) {
    res.json({ success: false, msg: "User not found" });
  } else if ((await bcrypt.compare(password, user.passWord)) && !user.locked) {
    const token = generateToken(user.userName);
    res.json({ success: true, token });
  } else if (user.locked) {
    res.json({ success: false, msg: "User locked" });
  } else {
    user.attempt++;
    if (user.attempt > parseInt(`${process.env.ATTEMPT}`)) {
      user.locked = true;
      res.json({ success: false, msg: "User Locked" });
    } else {
      res.json({ success: false, msg: "Invalid credentials" });
    }
  }
});
app.post("/auth/signup", async (req: Request, res: Response) => {
  const { username, password } = req.body;
  const user = User.find((e) => e.userName == username);
  if (user) {
    res.json({ success: false, msg: "User already exist" });
  } else if (password.length < 6) {
    res.json({
      success: false,
      msg: "Password should be minimum 5 characters",
    });
  } else {
    const hashpassword = await bcrypt.hash(password, 10);
    const ux = {
      userName: username,
      passWord: hashpassword,
      attempt: 1,
      locked: false,
    };
    User.push(ux);
    const token = generateToken(username);
    res.json({ success: true, token });
  }
});
app.post("/auth/link", async (req: Request, res: Response) => {
  const dx = await bcrypt.hash(req.body.username, 10);
  const time = new Date();
  const date: any = new Date(
    time.getTime() + parseInt(`${process.env.VALIDITY}`)
  );
  const sample = { userName: req.body.username, link: dx, validUpto: date };
  const link = Link.push(sample);
  res.json({ link });
});
app.get("/auth/validate", (req: Request, res: Response) => {
  const link = Link.find((e) => e.link == req.body.link);
  if (!link) {
    res.json({ success: false, msg: "access denied" });
  } else {
    for (let i = Link.length - 1; i >= 0; i--) {
      if (Link[i].link === req.body.link) {
        Link.splice(i, 1);
        break;
      }
    }
    const date: any = new Date();
    if (date > link.validUpto) {
      res.json({ success: false, msg: "Link expired" });
    } else {
      const token = generateToken(link.userName);
      res.json({ success: true, token });
    }
  }
});

app.listen(5000, () => {
  console.log("Server listening on port 5000");
});
