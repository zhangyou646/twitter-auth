// Copyright 2021 Twitter, Inc.
// SPDX-License-Identifier: Apache-2.0

import { Client, auth } from "twitter-api-sdk";
import express from "express";
import dotenv from "dotenv";

dotenv.config();

const app = express();

const authClient = new auth.OAuth2User({
  client_id: process.env.CLIENT_ID as string,
  client_secret: process.env.CLIENT_SECRET as string,
  callback: "https://twitter-auth-nu.vercel.app/callback",
  // callback: "http://127.0.0.1:3000/callback",
  scopes: ["tweet.read", "users.read", "follows.read", "list.read"],
});

const client = new Client(authClient);

const STATE = "my-state";

app.get("/callback", async function (req, res) {
  try {
    const { code, state } = req.query;
    console.log('code', code)
    if (state !== STATE) return res.status(500).send("State isn't matching");
    await authClient.requestAccessToken(code as string);
    console.log('callback -->token', authClient.token)
    res.redirect("/tweets");
  } catch (error) {
    console.log(error);
  }
});

app.get("/login", async function (req, res) {
  const authUrl = authClient.generateAuthURL({
    state: STATE,
    code_challenge_method: "s256",
  });
  res.redirect(authUrl);
});

app.get("/tweets", async function (req, res) {
  console.log('token 11', authClient.token)
  console.log('version', client.twitterApiOpenApiVersion)
  const me = await client.users.findMyUser()
  console.log('me-->', me)
  const tweets = await client.tweets.findTweetById("20");
  // const follwing = await client.users.usersIdFollowing('youkeou')
  // console.log('follwing', follwing)
  console.log('twitterxxxx', tweets.data)

  const resObj = {
    // follwing: follwing,
    tweets: tweets.data
  }
  res.send(resObj);
});

app.get("/revoke", async function (req, res) {
  try {
    const response = await authClient.revokeAccessToken();
    res.send(response);
  } catch (error) {
    console.log(error);
  }
});



app.listen(3000, () => {
  console.log(`Go here to login: http://127.0.0.1:3000/login`);
});
