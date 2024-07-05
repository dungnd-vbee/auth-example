const jwt = require("jsonwebtoken");
const config = require("../config/auth.config");
const db = require("../models");
const User = db.user;
const Role = db.role;

const { TokenExpiredError } = jwt;

const catchError = (err, res) => {
  if (err instanceof TokenExpiredError) {
    return res
      .status(401)
      .send({ message: "Unauthorized! Access Token was expired!" });
  }

  return res.status(401).send({ message: "Unauthorized!" });
};

const verifyToken = (req, res, next) => {
  let authHeader = req.headers.authorization;

  console.log("authHeader", authHeader);
  if (!authHeader) {
    return res.status(403).send({ message: "No token provided!" });
  }

  let token = authHeader.split(" ")[1]; // Bearer <token>

  console.log("token", token);
  if (!token) {
    return res.status(403).send({ message: "No token provided!" });
  }

  jwt.verify(token, config.secret, (err, decoded) => {
    console.log("decoded", decoded);
    console.log("req.userId", req.userId);
    if (err) {
      console.log("errror", err);
      return catchError(err, res);
    }
    req.userId = decoded.id;
    next();
  });
};

const checkRole = (req, res, next, roleName) => {
  User.findById(req.userId).exec((err, user) => {
    if (err) {
      return res.status(500).send({ message: err });
    }

    Role.find(
      {
        _id: { $in: user.roles },
      },
      (err, roles) => {
        if (err) {
          return res.status(500).send({ message: err });
        }

        for (let i = 0; i < roles.length; i++) {
          if (roles[i].name === roleName) {
            return next();
          }
        }

        return res.status(403).send({ message: `Require ${roleName} Role!` });
      }
    );
  });
};

const isAdmin = (req, res, next) => {
  checkRole(req, res, next, "admin");
};

const isModerator = (req, res, next) => {
  checkRole(req, res, next, "moderator");
};

const authJwt = {
  verifyToken,
  isAdmin,
  isModerator,
};

module.exports = authJwt;
