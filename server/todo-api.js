var express = require("express");
var mongoClient = require("mongodb").MongoClient;
var cors = require("cors");

var app = express(); // Initialize express

// Middleware
app.use(express.static('public')); // Serve static files from 'public' directory
app.use(cors()); // Enable CORS

app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies
app.use(express.json()); // Parse JSON bodies

var conStr = "mongodb://127.0.0.1:27017"; // MongoDB connection string

// Route to get users
app.get("/users", (request, response) => {
    mongoClient.connect(conStr).then(clientObject => {
        var database = clientObject.db("todo-db");
        database.collection("users").find({}).toArray().then(documents => {
            response.send(documents);
            response.end();
        }).catch(error => {
            response.status(500).send("Error fetching users");
        });
    }).catch(error => {
        console.error("MongoDB connection failed:", error);
        response.status(500).send("Internal Server Error");
    });
});

// Route to  register user
app.post("/register-user", (request, response) => {
    var user = {
        UserId: request.body.UserId,
        UserName: request.body.UserName,
        Password: request.body.Password,
        Email: request.body.Email,
        Mobile: request.body.Mobile
    };

    mongoClient.connect(conStr).then(clientObject => {
        var database = clientObject.db("todo-db");
        database.collection("users").insertOne(user).then(() => {
            console.log("New User Added");
            response.status(201).send("User added successfully");
        }).catch(error => {
            console.error("Error adding user:", error);
            response.status(500).send("Error adding user");
        });
    }).catch(error => {
        console.error("MongoDB connection failed:", error);
        response.status(500).send("Internal Server Error");
    });
});

// Route to get appointments by user ID
app.get("/appointments/:userid", (request, response) => {
    mongoClient.connect(conStr).then(clientObject => {
        var database = clientObject.db("todo-db");
        database.collection("appointments").find({ UserId: request.params.userid }).toArray().then(documents => {
            response.send(documents);
            response.end();
        }).catch(error => {
            response.status(500).send("Error fetching appointments");
        });
    }).catch(error => {
        console.error("MongoDB connection failed:", error);
        response.status(500).send("Internal Server Error");
    });
});

// Route to get appointment by task ID
app.get("/get-byid/:id", (request, response) => {
    mongoClient.connect(conStr).then(clientObject => {
        var database = clientObject.db("todo-db");
        database.collection("appointments").find({ Id: parseInt(request.params.id) }).toArray().then(documents => {
            response.send(documents);
            response.end();
        }).catch(error => {
            response.status(500).send("Error fetching task");
        });
    }).catch(error => {
        console.error("MongoDB connection failed:", error);
        response.status(500).send("Internal Server Error");
    });
});

// Route to add a task
app.post("/add-task", (request, response) => {
    var task = {
        Id: parseInt(request.body.Id),
        Title: request.body.Title,
        Date: new Date(request.body.Date),
        Description: request.body.Description,
        UserId: request.body.UserId
    };

    mongoClient.connect(conStr).then(clientObject => {
        var database = clientObject.db("todo-db");
        database.collection("appointments").insertOne(task).then(() => {
            console.log("Task Added");
            response.status(201).send("Task added successfully");
        }).catch(error => {
            response.status(500).send("Error adding task");
        });
    }).catch(error => {
        console.error("MongoDB connection failed:", error);
        response.status(500).send("Internal Server Error");
    });
});

// Route to delete a task by ID
app.delete("/delete-task/:id", (request, response) => {
    var id = parseInt(request.params.id);
    mongoClient.connect(conStr).then(clientObject => {
        var database = clientObject.db("todo-db");
        database.collection("appointments").deleteOne({ Id: id }).then(() => {
            console.log("Task Deleted");
            response.send("Task deleted");
        }).catch(error => {
            response.status(500).send("Error deleting task");
        });
    }).catch(error => {
        console.error("MongoDB connection failed:", error);
        response.status(500).send("Internal Server Error");
    });
});

// Route to update a task by ID
app.put("/update-task/:id", (request, response) => {
    var taskId = parseInt(request.params.id);
    var task = {
        Id: taskId,
        Title: request.body.Title,
        Date: new Date(request.body.Date),
        Description: request.body.Description,
        UserId: request.body.UserId
    };

    mongoClient.connect(conStr).then(clientObject => {
        var database = clientObject.db("todo-db");
        var filter = { Id: taskId };
        database.collection("appointments").updateOne(filter, { $set: task }).then(() => {
            console.log("Updated task");
            response.send("Task updated");
        }).catch(error => {
            console.error("Error updating task:", error);
            response.status(500).send("Error updating task");
        });
    }).catch(error => {
        console.error("MongoDB connection failed:", error);
        response.status(500).send("Internal Server Error");
    });
});

// Start the server
app.listen(3000, () => {
    console.log("Server Started: http://127.0.0.1:3000");
});
