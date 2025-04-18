const express = require('express');
const  { authMiddleware } = require("../middleware");
const router = express.Router();
const zod = require("zod");
const { User } = require("../db");
const { Account } = require("../db");
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../config");





const signupBody = zod.object({
    username: zod.string().email(),
	firstName: zod.string(),
	lastName: zod.string(),
	password: zod.string()
})
router.post("/signup", async (req, res) => {
    const { success } = signupBody.safeParse(req.body)
    if (!success) {
        return res.status(411).json({
            message: "Email already taken / Incorrect inputs"
        });
    }

    const existingUser = await User.findOne({ username: req.body.username });

    if (existingUser) {
        return res.status(411).json({
            message: "Email already taken / Incorrect inputs"
        });
    }

    try {
        const user = await User.create({
            username: req.body.username,
            password: req.body.password,
            firstName: req.body.firstName,
            lastName: req.body.lastName,
        });

        const userId = user._id;

        
        
        await Account.create({
            userId,
            balance: Math.floor(1 + Math.random() * 10000)
        });
        

        const token = jwt.sign({ userId }, JWT_SECRET);

        res.json({
            message: "User created successfully",
            token: token
        });

    } catch (err) {
        console.error("Error creating user or account:", err);
        res.status(500).json({
            message: "Something went wrong"
        });
    }
});






const signinBody = zod.object({
    username: zod.string().email(),
	password: zod.string()
})
router.post("/signin", async (req, res) => {
    const { success } = signinBody.safeParse(req.body)
    if (!success) {
        return res.status(411).json({
            message: "Email already taken / Incorrect inputs"
        })
    }

    const user = await User.findOne({
        username: req.body.username,
        password: req.body.password
    });

    if (user) {
        const token = jwt.sign({
            userId: user._id
        }, JWT_SECRET);
  
        res.json({
            token: token
        })
        return;
    }

    
    res.status(411).json({
        message: "Error while logging in"
    })
})







const updateBody = zod.object({
	password: zod.string().optional(),
    firstName: zod.string().optional(),
    lastName: zod.string().optional(),
})
router.put("/", authMiddleware, async (req, res) => {
    const { success } = updateBody.safeParse(req.body)
    if (!success) {
        res.status(411).json({
            message: "Error while updating information"
        })
    }

		await User.updateOne({ _id: req.userId }, req.body);
	
    res.json({
        message: "Updated successfully"
    })
})





router.get("/bulk", async (req, res) => {
    const filter = req.query.filter || "";

    const users = await User.find({
        $or: [{
            firstName: {
                "$regex": filter
            }
        }, {
            lastName: {
                "$regex": filter
            }
        }]
    })

    res.json({
        user: users.map(user => ({
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            _id: user._id
        }))
    })
})

module.exports = router;