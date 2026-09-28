const jwt = require("jsonwebtoken");

function generateToken(user) {
    const secret = process.env.JWT_SECRET;

    if (!secret || secret === "your_secret_key") {
        throw new Error("JWT_SECRET is missing. Set it in server/.env");
    }

    return jwt.sign(
        {
            id: user._id.toString(),
            role: user.role,
        },
        secret,
        { expiresIn: "7d" }
    );
}

module.exports = generateToken;
