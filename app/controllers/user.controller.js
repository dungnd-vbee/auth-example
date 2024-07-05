const db = require("../models");
const { user: User } = db;

exports.allAccess = (req, res) => {
  res.status(200).send("Public Content.");
};

exports.getUSer = (req, res) => {
  User.findById(req.userId).exec((err, user) => {
    if (err) {
      res.status(500).send({ message: err });
      return;
    }
    res.status(200).send(user);
  });
};

exports.adminBoard = (req, res) => {
  res.status(200).send("Admin Content.");
};

exports.moderatorBoard = (req, res) => {
  res.status(200).send("Moderator Content.");
};
