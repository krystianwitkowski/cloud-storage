const express = require("express");
const Router = express.Router();
const mimeTypes = require('../utilities/mime-types.js');

const { MongoClient } = require('mongodb');

const uri = `mongodb+srv://${process.env.DB_NAME}:${process.env.DB_PASSWORD}@cluster0.ex8xh.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

const connect = client.connect()

Router.route("/")
.post(async (req, res) => {
    try {
        const db = client.db("cloud-drive-db");

        const users = await db.collection('users');

        const user = await users.findOne({ id: req.decoded.id })
        
        const file = {
            id: user.files.length > 0 ? user.files.length : 0,
            file: JSON.stringify(req.files.file),
            base64: Buffer.from(req.files.file.data).toString('base64'),
            icons: mimeTypes.find(type => type.mimetype === req.files.file.mimetype),
            trash: false,
            starred: false
        }

        const updated = await users.updateOne({ id: req.decoded.id }, {
            $set: {
                files: [...user.files, file]
            }
        })
        
        res.status(201).json(file);
    } catch {
        res.status(500).json({
            error: {
                type: '/errors/server',
                title: 'Something went wrong',
                status: 500,
                detail: 'The server did not respond. Try again'
            }
        })
    }
})
.get(async(req, res) => {
    try {
        const db = client.db("cloud-drive-db");

        const users = await db.collection('users');

        const user = await users.findOne({ id: req.decoded.id })

        if(req.query.id === 'last'){
            res.status(200).json(user.files.filter((file, i, arr) => i === arr.length - 1))
        } 

        else {
            res.status(200).json(user.files)
        }

    } catch {
        res.status(500).json({
            error: {
                type: '/errors/server',
                title: 'Something went wrong',
                status: 500,
                detail: 'The server did not respond. Try again'
            }
        })
    }
})
.put(async (req, res) => {
    try {
        const db = client.db("cloud-drive-db");

        const users = await db.collection('users');
        
        const user = await users.findOne({ id: req.decoded.id })

        if(req.query.trash){

            const setAction = user.files.map(file => file.id === JSON.parse(req.query.id) ? { ...file, trash: JSON.parse(req.query.trash) } : { ...file })

            const updated = await users.findOneAndUpdate({ id: req.decoded.id }, {
                $set: {
                    files: setAction
                }
            }, {
                returnOriginal: false
            })

            res.status(200).json(updated.value.files.find(file => file.id === JSON.parse(req.query.id)))

        }

        if(req.query.starred){
            const setAction = user.files.map(file => file.id === JSON.parse(req.query.id) ? { ...file, starred: JSON.parse(req.query.starred) } : { ...file })
            
            const updated = await users.findOneAndUpdate({ id: req.decoded.id }, {
                $set: {
                    files: setAction
                }
            }, {
                returnOriginal: false
            })

            res.status(200).json(updated.value.files.find(file => file.id === JSON.parse(req.query.id)))
        }

    } catch {
        res.status(500).json({
            error: {
                type: '/errors/server',
                title: 'Something went wrong',
                status: 500,
                detail: 'The server did not respond. Try again'
            }
        })
    }
})
.delete(async (req, res) => {
    try {
        const db = client.db("cloud-drive-db");

        const users = await db.collection('users');
        
        const user = await users.findOne({ id: req.decoded.id })

        if(req.query.id){
            const ids = JSON.parse(req.query.id);

            const setAction = user.files.filter(file => ids.every(id => id !== file.id))
            
            const updated = await users.findOneAndUpdate({ id: req.decoded.id }, {
                $set: {
                    files: setAction
                }
            }, {
                returnOriginal: true
            })

            res.status(200).json(updated.value.files.filter(file => ids.includes(file.id)))
        }

    } catch {
        res.status(500).json({
            error: {
                type: '/errors/server',
                title: 'Something went wrong',
                status: 500,
                detail: 'The server did not respond. Try again'
            }
        })
    }
})
module.exports = Router;