const User = require("../models/User");
const VerificationToken = require("../models/verificationToken");
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");
const nodemailer = require("nodemailer");
const { v4: uuidv4 } = require("uuid");

//Register Controller
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
      phone: phone || undefined,
      role: role || "customer",
    });

    //save user
    await user.save();

    //create verification token
    const token = uuidv4();
    await new VerificationToken({ userId: user._id, token }).save();

    //send verification email
    const transporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const verificationUrl = `${process.env.APP_URL}/api/v1/auth/verify-email?token=${token}&email=${user.email}`;

    const mailOption = {
      from: `"Multivendor E-commerce", <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: "Email Verification - Multivendor E-commerce",
      html: `<p>Hi ${user.name},</p>
        <p>Thank you for registering on our platform. Please click the link below to verify your email address:</p>
        <a href="${verificationUrl}">Verify Email</a>
        <p>This link will expire in 24 hours.</p>
        <p>If you did not request this, please ignore this email.</p>
        <p>Best regards,<br/>Multivendor E-commerce Team</p>
        `,
    };
    try {
      await transporter.sendMail(mailOption);
      console.log("Email Send");
    } catch (error) {
      console.error("Error sending email:", error);
    }

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
    console.log(error);
    res.status(500).json({
      sucess: false,
      message: "Server Error during registration",
      error: error.message,
    });
  }
};

//Login Controller
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    //Find user and select password
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    //Generate JWT Token
    const accessToken = jwt.sign(
      { id: user._id, role: user.role, email: user.email },
      process.env.JWT_ACCESS_SECRET,
      { expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN },
    );

    const refreshToken = jwt.sign(
      { id: user._id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN },
    );

    //save refresh token to user

    user.refreshTokens.push({
      token: refreshToken,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    await user.save();

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/",
    });

    res.status(200).json({
      success: true,
      message: "Login successful",
      accessToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
