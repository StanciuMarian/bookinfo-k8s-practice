const express = require('express')
const app = express()
const mongoose = require('mongoose')

mongoose.connect(process.env.DATABASE_URL, { useNewUrlParser: true })
const db = mongoose.connection
db.on('error', (error) => console.error("prost"))
db.once('open', () => console.log('connected to database'))

app.use(express.json())

const bookRoute = require('./routes/bookRoute')
app.use('/details-app/books', bookRoute)

app.listen(process.env.PORT || 3000, () => console.log(`Server listening on ${process.env.PORT || 3000}`))