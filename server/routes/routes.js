const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const router = express.Router();

const diskstorage = multer.diskStorage({
  destination: path.join(__dirname, "../images"),
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const fileUpload = multer({
  storage: diskstorage,
}).single("image");

router.get("/", (req, res) => {
  res.send("Welcome to my image app");
});

router.post("/images/post", fileUpload, (req, res) => {
  req.getConnection((err, conn) => {
    if (err) return res.status(500).send("Server error");

    const type = req.file.mimetype;
    const name = req.file.filename;
    const data = fs.readFileSync(
      path.join(__dirname, "../images/" + req.file.filename)
    );

    conn.query(
      "INSERT INTO image (type, name, data) values (?, ?, ?)",
      [type, name, data],
      (err, rows) => {
        if (err) return res.status(500).send("Server error");

        res.send("image saved!");
      }
    );
  });
});

router.get("/images/get", (req, res) => {
  req.getConnection((err, conn) => {
    if (err) return res.status(500).send("Server error");

    conn.query("SELECT id, name, type FROM image", (err, rows) => {
      if (err) return res.status(500).send("Server error");

      res.json(rows);
    });
  });
});

router.delete("/images/delete/:id", (req, res) => {
  req.getConnection((err, conn) => {
    if (err) return res.status(500).send("Server error");

    conn.query(
      "SELECT name FROM image where id= ? ",
      [req.params.id],
      (err, rows) => {
        if (err) return res.status(500).send("Server error");

        let name = rows[0].name;
        conn.query(
          "DELETE FROM image where id = ?",
          [req.params.id],
          (err, rows) => {
            if (err) return res.status(500).send("Server error");

            fs.unlinkSync(path.join(__dirname, "../images/" + name));

            res.json("image deleted");
          }
        );
      }
    );
  });
});

module.exports = router;
