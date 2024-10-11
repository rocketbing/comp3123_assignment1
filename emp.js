const express = require('express');
const mongoose = require('mongoose');
const { body, check, query, validationResult } = require("express-validator");
const router = express.Router();


const jwt = require('jsonwebtoken');

const { Employee } = require("./models");

router.use(express.json())

function verify(req, res) {
  let tokenHeaderKey = process.env.TOKEN_HEADER_KEY;
  let jwtSecretKey = process.env.JWT_SECRET_KEY;

  try {
    const token = req.header(tokenHeaderKey);
    const verified = jwt.verify(token, jwtSecretKey);
    if (verified) {
      return "ok";
    } else {
      // Access Denied
      return error.message;
    }
  } catch (error) {
    // Access Denied
    return error.message;
  }
}


// Define routes
router.get('/employees',
  async (req, res) => {
    const error = verify(req, res)
    if (error != "ok") {
      return res.status(401).json({ status: false, message: error });
    }

    //let all_employees = await Employee.find().select("-__v -created_at -updated_at")
    let all_employees = await Employee.aggregate([
      {
        "$project": {
          "_id": 0,
          "employee_id": "$_id",
          "first_name": "$first_name",
          "last_name": "$last_name",
          "email": "$email",
          "position": "$position",
          "salary": "$salary",
          "date_of_joining": "$date_of_joining",
          "department": "$department",
        }
      }
    ])
    return res.status(200).json(all_employees)
  });


router.post('/employees',
  [
    [
      body("first_name").notEmpty(),
      body("last_name").notEmpty(),
      body("email").isEmail(),
      body("position").notEmpty(),
      body("salary").isNumeric(),
      check("date_of_joining").isISO8601().toDate(),
      body("department").notEmpty(),
    ],
  ],
  async (req, res) => {
    const error = verify(req, res)
    if (error != "ok") {
      return res.status(401).json({ status: false, message: error });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ status: false,  message: "Invalid input.",  errors: errors.array() } );
    }

    const data = req.body;
    console.log(data);

    //check uniqueness of email
    const found_employee = await Employee.find({ email: data.email })
    if (found_employee.length > 0) {
      return res.status(201).json({ status: false, message: "The email already exists." })
    }

    const employee = new Employee(data)
    await employee.save()
    return res.status(201).json({ status: true, message: "Employee created successfully.", employee_id: employee._id })
  });

router.get('/employees/:eid',
  [
    [
   
    ],
  ],
  async (req, res) => {
    const error = verify(req, res)
    if (error != "ok") {
      return res.status(401).json({ status: false, message: error });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ status: false,  message: "Invalid input.",  errors: errors.array() } );
    }

    const eid = req.params.eid;
    if (eid.length != 24){
      return res.status(200).json({ status: false, message: `The eid ${eid} doesn't exist.` })
    }

    //let found_employee = await Employee.find({ _id: eid }).select("-__v -created_at -updated_at")
    let found_employee = await Employee.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(eid) } },
      {
        "$project": {
          "_id": 0, 
          "employee_id": "$_id", 
          "first_name": "$first_name",
          "last_name": "$last_name",
          "email": "$email",
          "position": "$position",
          "salary": "$salary",
          "date_of_joining": "$date_of_joining",
          "department": "$department",
        }
      }
    ])

    if (found_employee.length == 0) {
      return res.status(200).json({ status: false, message: `The eid ${eid} doesn't exist.` })
    }

    return res.status(200).json(found_employee[0]);
  });

router.put('/employees/:eid',
  [
    
  ],
  async (req, res) => {
    const error = verify(req, res)
    if (error != "ok") {
      return res.status(401).json({ status: false, message: error });
    }
 
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ status: false,  message: "Invalid input.",  errors: errors.array() } );
    }

    const eid = req.params.eid;
    if (eid.length != 24){
      return res.status(200).json({ status: false, message: `The eid ${eid} doesn't exist.` })
    } 

    const data = req.body
    console.log(data)
    let result = await Employee.updateOne({ _id: eid }, data)
    console.log(result)
    if (!result.acknowledged || result.acknowledged && result.matchedCount == 0) {
      return res.status(200).json({ status: false, message: `The eid ${eid} doesn't exist.` })
    }

    return res.status(200).json({ status: true, message: "Employee details updated successfully." });
  });
 
router.delete('/employees',
  [
    query("eid").exists()
  ],
  async (req, res) => {
    const error = verify(req, res)
    if (error != "ok") {
      return res.status(401).json({ status: false, message: error });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ status: false,  message: "Invalid input.",  errors: errors.array() } );
    }

    const eid = req.query['eid']

    let result = await Employee.deleteOne({ _id: eid })

    if (!result.acknowledged || result.acknowledged && result.deletedCount == 0) {
      return res.status(200).json({ status: false, message: `The eid ${eid} doesn't exist.` }).send()
    }

    return res.status(204).json({ status: true, message: "Employee deleted successfully." });
  });

module.exports = router;
