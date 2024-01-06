const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const port = process.env.PORT || 5000;
const { exec } = require("child_process");

// middleware
app.use(cors());
app.use(express.json());

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

    // for C++

    app.post("/execute-code", async (req, res) => {
      const { code, runtime } = req.body;
      console.log({ code, runtime });

      // Validate code (you can implement your own validation logic)
      if (!isValidCode(code)) {
        return res.status(400).json({ error: "Invalid code" });
      }

      // Execute code based on the selected runtime
      switch (runtime) {
        case "python":
          // Execute Python code using Python interpreter
          // ...
          break;
        case "javascript":
          // Execute JavaScript code using Node.js
          // ...
          break;
        case "go":
          // Execute Go code using Go runtime
          // ...
          break;
        case "cpp":
          // Execute C++ code using g++
          const fs = require("fs");

          // Function to execute C++ code
          function executeCppCode(code) {
            // Create a temporary file to store the C++ code
            fs.writeFileSync("temp.cpp", code);

            return new Promise((resolve, reject) => {
              // Compile the C++ code using g++
              exec(
                "g++ temp.cpp -o temp",
                (compileErr, compileStdout, compileStderr) => {
                  if (compileErr) {
                    reject(`Compilation error: ${compileStderr}`);
                    return;
                  }

                  // Execute the compiled code
                  exec("./temp", (runErr, runStdout, runStderr) => {
                    if (runErr) {
                      reject(`Execution error: ${runStderr}`);
                      return;
                    }

                    // Return the output of the executed code
                    resolve(runStdout);
                  });
                }
              );
            });
          }

          // Example usage:
          const cppCode = code; // Assuming 'code' contains the C++ code received from the frontend

          executeCppCode(cppCode)
            .then((output) => {
              res.status(200).json({ result: output });
            })
            .catch((error) => {
              res.status(500).json({ error });
            });
          break;
        default:
          return res.status(400).json({ error: "Invalid runtime choice" });
      }

      // Return the result of code execution
      return res.status(200).json({ result });
    });

    function isValidCode(code) {
      // Implement your code validation logic here
      // Ensure the code is complete and valid for execution
      // Return true/false based on validation
    }

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
