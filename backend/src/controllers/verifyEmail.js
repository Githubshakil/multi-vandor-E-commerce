const User = require("../models/User");
const VerificationToken = require("../models/verificationToken");

exports.verifyEmail = async (req, res) => {
  const { token, email } = req.query;

  try {
    const verificationToken = await VerificationToken.findOne({ token });
    if (!verificationToken) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired verification token",
      });
    }

    const user = await User.findById(verificationToken.userId);
    if (!user || user.email !== email) {
      return res.status(400).json({
        success: false,
        message: "Invalid verification link",
      });
    }

    user.isEmailVerified = true;
    await user.save();

    await VerificationToken.deleteOne({ _id: verificationToken._id });

    //fronend Redirect URL

    res.redirect(
      `${process.env.FRONTEND_URL}/verify-success?email=${user.email}`,
    );
  } catch (error) {
    console.error("Error verifying email:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
