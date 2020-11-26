const express = require("express"),
    app = express(),
    mongoose = require("mongoose"),
    cors = require("cors");

require("dotenv").config();

const PORT = process.env.PORT || 50

app.use(express.json())
app.use(cors());

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
  useUnifiedTopology: true,
});
const connection = mongoose.connection;
connection.once("open", () => {
  console.log("MongoDB database connection established successfully");
});

//setup routes
app.use("/users", require("./routes/user"));
app.use("/todos", require("./routes/todo"));

app.listen(PORT, () => {
    console.log(`App listening on port ${PORT}`);
});