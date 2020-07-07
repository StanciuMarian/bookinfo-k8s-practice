const express = require('express')
const router = express.Router()
const Book = require("../models/book");
const handledForErrors = require("../config/error-handler")

// Getting all books
router.get('/', handledForErrors(async (req, res) => {
    const books = await Book.find()
    return res.json(books)
}))

// Creating one book
router.post('/', handledForErrors(async (req, res) => {
    let book = new Book(req.body)
    const newBook = await book.save()
    return res.status(201).json(newBook)
}))

// Getting one book
router.get('/:id', handledForErrors(async (req, res) => {
    return await getBook(req, res)
}))

async function getBook(req, res, next) {
    book = await Book.findById(req.params.id)
    if (book == null) {
        return res.status(404).json({ message: 'No book with that id' })
    }
    return res.json(book)
}

module.exports = router