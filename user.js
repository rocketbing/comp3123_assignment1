const express = require('express');
const { body, validationResult } = require("express-validator");
const router = express.Router();
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

const { User } = require("./models");

router.use(express.json())

// Define routes
router.get('/users', async (req, res) => {
  const all_users = await User.find()
  return res.json(all_users)
});

router.post(
  '/signup',
  [
    [
      body("username").notEmpty(),
      body("email").isEmail(),
      body("password").notEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ status: false,  message: "Invalid input.",  errors: errors.array() } );
    }

    const data = req.body;
    console.log(data);

    //get user posted data
    const username = data.username
    const email = data.email
    const password = crypto.createHash('md5').update(data.password).digest('hex')

    //check uniqueness of username
    const found_users1 = await User.find({ username: username })
    if (found_users1.length > 0) {
      return res.status(201).json({ status: false, message: "The username already exists." })
    }

    //check uniqueness of email
    const found_users2 = await User.find({ email: email })
    if (found_users2.length > 0) {
      return res.status(201).json({ status: false, message: "The email already exists." })
    }

    const user = new User({ username: username, email: email, password: password })
    await user.save()
    return res.status(201).json({ status: true, message: "User created successfully.", user_id: user._id })
  }
);

router.post('/login',
  [
    [
      body("password").notEmpty()
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ status: false,  message: "Invalid input.",  errors: errors.array() } );
    }

    const data = req.body;
    console.log(data);

    //get user posted data
    const username = data.username
    const email = data.email
    const password = crypto.createHash('md5').update(data.password).digest('hex')

    // check if either username or email is provided
    if ((typeof username === 'undefined') && (typeof email === 'undefined')) {
      return res.status(200).json({ status: false, message: "No username or email provided." })
    }

    // check if both username and email is provided
    if (!(typeof username === 'undefined') && !(typeof email === 'undefined')) {
      return res.status(200).json({ status: false, message: "Both username or email provided." })
    }

    //find user
    const found_users = await User.find({ "$or": [{ username: username }, { email: email }] })
    if (found_users.length == 0) {
      if (!(typeof username === 'undefined')) {
        return res.status(200).json({ status: false, message: "The username doesn't exist." })
      } else {
        return res.status(200).json({ status: false, message: "The email doesn't exist." })
      }
    }

    const user = found_users[0]
    if (user.password == password) {
      let jwtSecretKey = process.env.JWT_SECRET_KEY;
      let signData = {
        time: new Date(),
        user_id: user._id
      }
      let token = jwt.sign(signData, jwtSecretKey);
      return res.status(200).json({ status: true, message: "Login successfully.", user_id: user._id, jwt_token: token })
    } else {
      return res.status(200).json({ status: false, message: "Wrong password." })
    }
  }
);

module.exports = router;
