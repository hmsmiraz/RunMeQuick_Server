const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const port = process.env.PORT || 5000;
const { exec } = require("child_process");
const bodyParser = require("body-parser");
var compiler = require("compilex");
const { runInNewContext } = require("vm");

// middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

var option = { stats: true };
compiler.init(option);

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.meftkqt.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    // collections
    const userCollection = client.db("RunMeQuickDB").collection("users");

    // users api's
    app.get("/users", async (req, res) => {
      const cursor = userCollection.find();
      const users = await cursor.toArray();
      res.send(users);
    });
    app.post("/users", async (req, res) => {
      const user = req.body;
      const result = await userCollection.insertOne(user);
      res.send(result);
    });

    app.post("/compilecode", function (req, res) {
      const code = req.body.code;
      const input = req.body.input || ""; 
      const lang = req.body.lang; 

      const envData = { OS: "windows" }; 

      if (lang === "Python") {
        compiler.compilePythonWithInput(envData, code, input, function (data) {
          res.send(data);
        });
      } else if (lang === "C++") {
        const options = {
          timeout: 10000,
        };
        const envData = {
          OS: "windows",
          cmd: "g++", 
        };
        
        compiler.compileCPPWithInput(
          envData,
          code,
          input,
          options,
          function (error, data) {
            if (error) {
              console.error(error);
              res.status(500).send('Compilation Error');
            } else {
              res.send(data);
            }
          }
        );
      }
       else if (lang === "JavaScript") {
        try {
          const sandbox = { result: "" };
          runInNewContext(code, sandbox);
          res.send(sandbox.result.toString());
        } catch (error) {
          res.status(500).send(error.message);
        }
      }
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("RunMeQuick Server is Running...");
});

app.listen(port, () => {
  console.log(`RunMeQuick Server is Running on port ${port}`);
});
