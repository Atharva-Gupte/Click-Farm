const express = require("express");
// const bcrypt = require("bcrypt");
const path = require("path");
const exp = require("constants");
const mysql2 = require("mysql2");
const bodyParser = require("body-parser");
const urlencodedparser = bodyParser.urlencoded({ extended: false })

let connection = mysql2.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'serviceb4self',
    database: 'miniproject'
});
connection.connect((error) => {
    if (error) throw error
    else {
        console.log("connected to DB");
    }
});

let staticPath = path.join(__dirname, "HTML");

const app = express();

app.use(express.static(staticPath));
app.use(express.json());
app.use("/CSS", express.static("CSS"));
app.use("/images", express.static("images"));

// PUG STUFF
app.set('view engine', 'pug');  // set template engine as pug
app.set('views', path.join(__dirname, 'views')); // set the views directory

app.get("/", (req, res) => {
    res.sendFile(path.join(staticPath, "index.html"));
});

app.get("/signup", (req, res) => {
    res.sendFile(path.join(staticPath, "signup.html"));
});

app.get("/buynow", (req, res) => {
    res.sendFile(path.join(staticPath, "buynow.html"));
});

app.get("/farmers", (req, res) => {
    connection.query("select price.fid,f_name,village,price.p_id,price.p_price from farmers inner join price on  farmers.fid = price.fid where  p_id=1;", (error, rows, fields) => {
        if (error) throw error
        res.render('farmers.pug', { title: 'Farmer Details', items: rows })
        console.log(rows)

        // connection.query("select fid,f_name,village from farmers", (error, rows, fields) => {
        //     if (error) throw error
        //     res.render('farmers.pug', { title: 'User Details', items: rows })
        //     console.log(rows)
    });
});

app.post("/payment", urlencodedparser, (req, res) => {
    console.log(req.body);
    const fid=req.body.ID;
    const PID=req.body.PID;
    // const fid=req.body.ID;

    var sql2= "select p_price from price where fid='"+fid+"' and p_id='"+PID+"' ";
    var sql = "insert into orders values(null, '" + req.body.name2 + "', '" + req.body.phone + "', '" + req.body.address + "', '" + req.body.username + "', null, null, '"+sql2+"')";
    connection.query(sql, (err, results, fields) => {
        if (err) {
            console.log("failed", err);
            res.sendStatus(500);
            return;
        }
        console.log("Inserted");
        res.end();
    })
});

app.post("/signup", (req, res) => {
    let { name, email, password } = req.body;

    if (name.length < 3) {
        return res.json({ 'alert': 'name must be more than 3 letters' });
    }
    else if (!email.length) {
        return res.json({ 'alert': 'Enter Your Email' });
    }
    else if (password.length < 5) {
        return res.json({ 'alert': 'Password must me more than 5 letters' });
    }
    console.log(req.body);
    var sql = "insert into login values('" + req.body.name + "', '" + req.body.email + "', '" + req.body.password + "')";

    connection.query(sql, (error) => {
        if (error) throw error
    });
    // connection.end();   
});

app.use("/404", (req, res) => {
    res.sendFile(path.join(staticPath, "404.html"));
});

app.use((req, res) => {
    res.redirect('/404');
});


app.listen(3000, () => {
    console.log("Listening on Port 3000....");
});
