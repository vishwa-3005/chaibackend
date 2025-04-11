require("dotenv").config();

const express = require("express");
const app = express();

//const port = 4000;
const port = process.env.PORT;
const user = {
  login: "vishwa-3005",
  id: 190909789,
  node_id: "U_kgDOC2ENXQ",
  avatar_url: "https://avatars.githubusercontent.com/u/190909789?v=4",
  gravatar_id: "",
  url: "https://api.github.com/users/vishwa-3005",
  html_url: "https://github.com/vishwa-3005",
  followers_url: "https://api.github.com/users/vishwa-3005/followers",
  following_url:
    "https://api.github.com/users/vishwa-3005/following{/other_user}",
  gists_url: "https://api.github.com/users/vishwa-3005/gists{/gist_id}",
  starred_url:
    "https://api.github.com/users/vishwa-3005/starred{/owner}{/repo}",
  subscriptions_url: "https://api.github.com/users/vishwa-3005/subscriptions",
  organizations_url: "https://api.github.com/users/vishwa-3005/orgs",
  repos_url: "https://api.github.com/users/vishwa-3005/repos",
  events_url: "https://api.github.com/users/vishwa-3005/events{/privacy}",
  received_events_url:
    "https://api.github.com/users/vishwa-3005/received_events",
  type: "User",
  user_view_type: "public",
  site_admin: false,
  name: "vishwadeep sankpal",
  company: null,
  blog: "",
  location: null,
  email: null,
  hireable: null,
  bio: "computer science student",
  twitter_username: null,
  public_repos: 3,
  public_gists: 0,
  followers: 1,
  following: 5,
  created_at: "2024-12-07T04:14:41Z",
  updated_at: "2025-03-20T18:08:57Z",
};

app.get("/", (req, res) => {
  res.send("Hello, you are on home page.");
});

app.get("/about", (req, res) => {
  res.send("about us page");
});

app.get("/youtube", (req, res) => {
  res.send("subscribe to my channel");
});

app.get("/login", (req, res) => {
  res.send("<h1>you are logged in<h1>");
});

app.get("/github", (req, res) => {
  res.json(user);
});

app.listen(port, () => {
  console.log(`example app listening on port ${port}`);
});
