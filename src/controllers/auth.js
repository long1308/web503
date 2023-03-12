import User from "../models/user";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { object, string, ref } from "yup";

const signupSchema = object().shape({
    name: string(),
    email: string().email().required("Bắt buộc phải có email"),
    password: string().min(6).required("Bắt buộc phải có mật khảu"),
    confirmPassword: string()
        .oneOf([ref("password"), null], "Mật khẩu không khớp")
        .required(),
});

// define validation schema using yup
const signInSchema = object().shape({
    email: string().email().required(),
    password: string().required(),
});
export const signup = async (req, res) => {
    try {
        const { name, email, password, confirmPassword } = req.body;

        await signupSchema.validate({
            name,
            email,
            password,
            confirmPassword,
        });

        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(400).json({
                message: "Email đã tồn tại",
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = new User({
            name,
            email,
            password: hashedPassword,
        });

        const savedUser = await user.save();

        const token = jwt.sign({ _id: savedUser._id }, "123456");

        return res.status(201).json({
            message: "Đăng ký thành công",
            token,
            user: {
                _id: savedUser._id,
                name: savedUser.name,
                email: savedUser.email,
            },
        });
    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
};

export const signin = async (req, res) => {
    try {
        const { email, password } = req.body;

        // validate the input data against the schema
        await signInSchema.validate({ email, password });

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "Tài khoản không tồn tại" });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({ message: "Mật khẩu không khớp" });
        }

        const token = jwt.sign({ _id: user._id }, "123456");

        user.password = undefined;

        res.status(200).json({
            data: user,
            accessToken: token,
        });
    } catch (error) {
        if (error.name === "ValidationError") {
            return res.status(400).json({ message: error.errors[0] });
        }
        res.status(500).json({ message: "Internal Server Error" });
    }
};