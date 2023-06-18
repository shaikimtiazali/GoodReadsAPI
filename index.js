const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const cors = require("cors");

const PORT = 3306 || process.env.PORT;
const app = express();
app.use(express.json());
app.use(cors());

const dbPath = path.join(__dirname, "goodreads.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(PORT, () => {
      console.log(`server running at http://localhost:${PORT}/books/`);
    });
  } catch (e) {
    console.log(`DB Error ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

//Get Books API
app.get("/books/", async (req, res) => {
  const getBooksQuery = `SELECT * FROM book ORDER BY book_id;`;
  const booksArray = await db.all(getBooksQuery);
  res.send(booksArray);
});

//Get Specific Books API
app.get("/books/", async (req, res) => {
  const {search_q="",order_by="book_id",order="ASC",limit=5,offset=2} = req.query;
  const getBooksQuery = `SELECT * FROM book WHERE title LIKE '%${search_q}%' ORDER BY ${order_by} ${order} LIMIT ${limit} OFFSET ${offset};`;
  const booksArray = await db.all(getBooksQuery);
  res.send(booksArray);
});

//Get Book API
app.get("/books/:book_Id", async (req, res) => {
  const { book_Id } = req.params;
  const getBookQuery = `SELECT * FROM book WHERE book_id = ${book_Id};`;
  const book = await db.get(getBookQuery);
  res.send(book);
});

//Add Book API
app.post("/books/", async(req, res) => {
  const bookDetails = req.body;
  const {
    title,
    authorId,
    rating,
    ratingCount,
    reviewCount,
    description,
    pages,
    dateOfPublication,
    editionLanguage,
    price,
    onlineStores,
  } = bookDetails;
    const addBookQuery = `
    INSERT INTO
      book (title,author_id,rating,rating_count,review_count,description,pages,date_of_publication,edition_language,price,online_stores)
    VALUES
      (
        '${title}',
         ${authorId},
         ${rating},
         ${ratingCount},
         ${reviewCount},
        '${description}',
         ${pages},
        '${dateOfPublication}',
        '${editionLanguage}',
         ${price},
        '${onlineStores}'
      );`;
    const dbResponse = await db.run(addBookQuery);   
    const bookId = dbResponse.lastID;
    res.send({bookId:bookId});
  
});

//Update Book API
app.put("/books/:bookId", async(req, res) => {
    const {bookId} = req.params;
    const bookDetails= req.body;
    const {
        title,
        authorId,
        rating,
        ratingCount,
        reviewCount,
        description,
        pages,
        dateOfPublication,
        editionLanguage,
        price,
        onlineStores,
    } = bookDetails;

    const updateBookQuery = `
    UPDATE
      book
    SET
      title='${title}',
      author_id=${authorId},
      rating=${rating},
      rating_count=${ratingCount},
      review_count=${reviewCount},
      description='${description}',
      pages=${pages},
      date_of_publication='${dateOfPublication}',
      edition_language='${editionLanguage}',
      price= ${price},
      online_stores='${onlineStores}'
    WHERE
      book_id = ${bookId};`; 
      
    await db.run(updateBookQuery);
    res.send("Book Updated Successfully");
});

//Delete Book API
app.delete('/books/:bookId', async (req,res) => {
    const {bookId} = req.params;
    const deleteBookQuery = `DELETE FROM book WHERE book_id = ${bookId};`;
    await db.run(deleteBookQuery);
    res.send("Book Deleted Succesefully");
});

//Get Author Books API 
app.get('/authors/:authorId/books', async(req, res) => {
    const {authorId} = req.params;
    const getAuthorBooksQuery = `SELECT * FROM book WHERE author_id=${authorId};`;
    const authorArray = await db.all(getAuthorBooksQuery);
    res.send(authorArray);
});