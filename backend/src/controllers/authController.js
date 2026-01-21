const User = require("../models/User");
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");

exports.register = async (req, res) => {
  try {
    const { name, email, password, phone, role } = req.body;

    //Simple Validation
    if (!name || !email || !password) {
      return res.status(400).json({
        sucess: false,
        message: "Name, email and password are required",
      });
    }

    //Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        sucess: false,
        message: "User already exists",
      });
    }

    //Create new user
    const user = new User({
        name,
        email,
        password,
        phone : phone || undefined,
        role : role || 'customer',
    })

    //save user
    await user.save();

    res.status(201).json({
      sucess: true,
      message: "Registration successful! Please Login",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.log(error)
    res.status(500).json({
      sucess: false,
      message: "Server Error during registration",
      error: error.message,
    });
  }
};
