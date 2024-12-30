const express = require('express')
const app = express()
const jwt = require("jsonwebtoken")
const users = []
const JWT_SECRET = "USER_APP";
const cors = require("cors")

app.use(cors())
app.use(express.json())

app.post('/signup', function (req, res) {
    const username = req.body.username;
    const password = req.body.password;
    users.push({ username, password, todos: [] })
    res.send({alert: "You are signed up"})
})
app.post('/signin', function (req, res) {
    const username = req.body.username;
    const password = req.body.password;

    const user = users.find(user => user.username === username && user.password === password);//arrow function
    if (user) {
        const token = jwt.sign({
            username: user.username
        }, JWT_SECRET);

        user.token = token;
        res.send({
            token
        })
        console.log(users);
    } else {
        res.status(403).send({
            alert: "Invalid username or password"
        })
    }
})

function auth(req, res, next) {
    const token = req.headers.authorization;
    if (token) {
        jwt.verify(token, JWT_SECRET, (err, data) => {
            if(err) {
                res.status(401).send({
                    alert : "Unauthorized"
                })
            }
            else{
                req.user = data;
                next();
            }
        })
    }
    else{
        res.status(401).send({
            alert : "Unauthorized"
        })
    }
}

//get todo
app.get("/todos", auth, function (req, res) {
    const username = req.user.username;
    const user = users.find(user => user.username === username );
    res.send(user.todos);
});

//add todo
app.post("/todos",auth, function (req, res) {
    const username = req.user.username;
    const user = users.find(user=>user.username === username);
    const todo = req.body.todo;
    user.todos.push(todo);
    res.send({alert : "Todo added"});
})

//delete todo
app.delete("/todos/:index", auth, function (req,res){
    const username = req.user.username;
    const user = users.find(user => user.username===username);
    const index = parseInt(req.params.index, 10);
    if(index >= 0 && index < user.todos.length){
        user.todos.splice(index, 1);
        res.send({alert : "Deleted"});
    }
    else {
        res.status(400).send({
            alert: "Wrong index"
        })
    }
})

app.get("/me", auth, function (req, res) {
    const user = req.user;
    res.send({
        username: user.username
    })
})

app.listen(3000)