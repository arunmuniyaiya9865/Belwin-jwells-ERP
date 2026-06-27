const ApiError = require('../utils/ApiError');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res, next) => {
    const { username, password } = req.body;

    try {
        const user = await User.findOne({ username }).populate('employeeId');

        if (user && (await bcrypt.compare(password, user.password))) {
            res.json({
                _id: user._id,
                username: user.username,
                role: user.role,
                employee: user.employeeId,
                token: generateToken(user._id),
            });
        } else {
            next(new ApiError(401, 'Invalid username or password' ));
        }
    } catch (error) {
        next(new ApiError(500, 'Server error' ));
    }
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Private/Admin
const registerUser = async (req, res, next) => {
    const { username, password, role, employeeId } = req.body;

    try {
        const userExists = await User.findOne({ username });

        if (userExists) {
            return next(new ApiError(400, 'User already exists' ));
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await User.create({
            username,
            password: hashedPassword,
            role,
            employeeId
        });

        if (user) {
            res.status(201).json({
                _id: user._id,
                username: user.username,
                role: user.role,
                token: generateToken(user._id),
            });
        } else {
            next(new ApiError(400, 'Invalid user data' ));
        }
    } catch (error) {
        next(new ApiError(500, 'Server error' ));
    }
};

module.exports = { loginUser, registerUser };
