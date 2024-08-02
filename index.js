const { faker } = require('@faker-js/faker');
const mysql = require('mysql2');
const express = require("express");
const app = express();
const {v4: uuidv4} = require("uuid");
//for method-override
const methodOverride = require("method-override");
app.use(methodOverride("_method"));
app.use(express.urlencoded({extended: true})); //to parse data
//for using ejs
const path = require("path");
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/views"));


const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    database: 'delta_app',
    password: '@HelloWorld'
  });

let getRandomUser = () => {
  return [
    faker.string.uuid(),
    faker.internet.userName(),
    faker.internet.email(),
    faker.internet.password(),
  ];
};

//Used faker to insert data in database, now we do not need it anymore!
// let q = `INSERT INTO user (id, username, email, password) VALUES ?`;

// let data = [];
// for(let i = 1; i <=100; i++){
//   data.push(getRandomUser());
// }

// try{
//   connection.query(q, [data], (err, result) => {
//       if(err) throw err;
//       console.log(result);
//   });
// }catch(err){
//   console.log(err);
// }

//Home route
app.get("/", (req, res) => {
  let q = `SELECT count(*) FROM USER`;
  try{
    connection.query(q, (err, result) => {
      if(err) throw err;
      let count = result[0]["count(*)"]; //result: [{'count(*)' : 100}]
      res.render("home.ejs", {count});
    });
  }catch(err){
    console.log(err);
    res.send("Some error in Database");
  }
});

//Show route
app.get("/user", (req, res) => {
  let q = `SELECT * FROM USER`;
  try{
    connection.query(q, (err, result) => {
      if(err) throw err;
      res.render("showusers.ejs", {result});
    });
  }catch(err){
    console.log(err);
    res.send("Some error in Database");
  }
});

//edit route
app.get("/user/:id/edit", (req, res) => {
  let {id} = req.params;
  let q = `SELECT * FROM user WHERE id='${id}'`;
  try{
    connection.query(q, (err, result) => {
      if(err) throw err;
      let user = result[0];
      res.render("edit.ejs", {user});
    });
  }catch(err){
    console.log(err);
    res.send("Some error in Database");
  }
});
  
//Update route - actual update in database
app.patch("/user/:id", (req, res) => {
  let {id} = req.params;
  let {password: formPass, username: newUsername} = req.body;
  let q = `SELECT * FROM user WHERE id='${id}'`;
  try{
    connection.query(q, (err, result) => {
      if(err) throw err;
      let user = result[0];
      if(formPass != user.password){
        res.send("WRONG password");
      }else{
        let q2 = `UPDATE user SET username='${newUsername}' WHERE id='${id}'`;
        connection.query(q2, (err, result) => {
          if(err) throw err;
          //res.send(result);
          res.redirect("/user");
        });
      }
    });
  }catch(err){
    console.log(err);
    res.send("Some error in Database");
  }
});

//get request to display form to add a new user
app.get("/user/new", (req, res) => {
  res.render("new.ejs");
});

app.post("/user/new", (req, res) =>{
  let {email, username, password} = req.body;
  let id = uuidv4();
  let q = `INSERT INTO user (id, email, username, password) VALUES ('${id}', '${email}', '${username}', '${password}')`;
  try{
    connection.query(q, (err, result) => {
      if(err) throw err;
      console.log("Added new user");
      res.redirect("/user");
    });
  }catch(err){
    res.send("Some error occured");
  }
});

//delete a user
app.get("/user/:id/delete", (req, res) => {
  let {id} = req.params;
  let q = `SELECT * FROM user WHERE id='${id}'`;
  try{
    connection.query(q, (err, result) => {
      if(err) throw err;
      let user = result[0];
      res.render("delete.ejs", {user});
    });
  }catch(err){
    console.log(err);
    res.send("Some error in Database");
  }
});

app.delete("/user/:id", (req, res) => {
  let { id } = req.params;
  let { password } = req.body;
  let q = `SELECT * FROM user WHERE id='${id}'`;

  try {
    connection.query(q, (err, result) => {
      if (err) throw err;
      let user = result[0];

      if (user.password != password) {
        res.send("WRONG Password entered!");
      } else {
        let q2 = `DELETE FROM user WHERE id='${id}'`; //Query to Delete
        connection.query(q2, (err, result) => {
          if (err) throw err;
          else {
            console.log(result);
            console.log("deleted!");
            res.redirect("/user");
          }
        });
      }
    });
  } catch (err) {
    res.send("some error with DB");
  }
});

app.listen(8080, () => {
  console.log("Server is listening to port 8080");
});

