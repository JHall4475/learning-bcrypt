const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const massive = require('massive');
const bcrypt = require('bcrypt-nodejs');
const session = require('express-session');
const app = express();

massive('postgres://lterafkrggrvlz:9f8e45e116193e4a8b9b35ef7b8bccfd97f578be0e493fc0e1f8b4a6161ce9a3@ec2-50-16-196-57.compute-1.amazonaws.com:5432/d1ie5otd71r03i?ssl=true')
    .then((dbInstance) => {
        app.set('db', dbInstance)
        console.log('db connected')
    })

const checkForAuth = (req, res, next) => {
    if(req.session.user){
        next()
    } else {
        res.send(`You don't have permission or you are not login`)
    }
}

app.use(cors());
app.use(bodyParser.json());
app.use(session({
    secret: "jasdkfjalksdjflkasdf",
    resave: true,
    saveUninitialized: false,
}))




app.post('/signup', (req, res) => {
    const db = req.app.get('db');
    bcrypt.hash(req.body.password, null, null, (err, hash) => {
        if(err){
            return res.send('something went wrong during hashing')
        }
        db.create_user([req.body.email, hash])
        .then(() => {
            res.status(200).send("Create user successful")
        })
        .catch((err) => {
            res.status(500).send(err)
        })
    })
})

app.post('/login', (req, res) => {
    const db = req.app.get('db')
    db.search_user([req.body.email])
        .then(user => {
            bcrypt.compare(req.body.password, user[0].password, function(err, isCorrectPassword) {
                if(err){
                    return res.send(err)
                }
                if(isCorrectPassword){
                    req.session.user = user[0]
                    res.send('Login Successfully')
                }else{
                    res.send('Email or password is wrong')
                }
            });
        })
        .catch((err) => {
            res.status(500).send(err)
        })
})

app.get('/me', checkForAuth, (req, res) => {
    res.send(req.session.user)
})

app.get('/logout', (req, res) => {
    delete req.session.user
    res.send('logout successfully')
})

app.listen(8080, () => {
    console.log('server is listening on 8080')
})