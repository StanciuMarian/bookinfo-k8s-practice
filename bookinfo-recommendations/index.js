const express = require('express')
const app = express()

app.get('/recommendations-app/kill', (req, res) => {
    process.exit(1);
})

app.get('/recommendations-app/health', (req, res) => {
    res.statusCode = 200;
    res.send('i am up and running correctly');
})

app.get('/recommendations-app/:genre', (req, res) => {
    console.log(`Recommending a book for ${req.headers.host}`);
    const genre = req.params.genre
    const recommendations = getRecommendations(genre)
    res.json(recommendations)
})

function getRecommendations(genre) {
    if(genre === "programming") {
        return programmingBooks
    }
    if (genre === "cooking") {
        return cookingBooks
    }
    return [...programmingBooks, ...cookingBooks]
}

const programmingBooks = ["The Pragmatic Programmer", "Clean Code", "Introduction to Algorithms and Data Structures"];
const cookingBooks = ["The Joy of Cooking", "The Defined Dish", "Mastering the art of french cooking"] 

app.listen(process.env.PORT || 3000, () => console.log(`Hello! My name is ${process.env.LIBRARIAN_NAME}`))
