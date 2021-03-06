const router = require("express").Router();
const e = require("express");
const User = require("../models/userModel"),
    auth = require("../middleware/auth"),
    jwt = require("jsonwebtoken"),
    bcrypt = require("bcryptjs");

router.post('/register', async (req, res) => {
    try {
        let { email, password, passwordCheck, displayName } = req.body;

        //validate
        if (!email || !password || !passwordCheck)
            return res.status(400).send({msg: "Not all fields have been entered."});

        if (password.length < 5) 
            return res
                .status(400)
                .json({msg: "Password needs to be at least 5 characters long."})

        if (password !== passwordCheck)
            return res
                .status(400)
                .json({msg: "Enter the same password twice for verification. "})

        const existingUser = await User.findOne({email: email})
        if (existingUser)
            return res
                .status(400)
                .json({msg: "An account with this email already exist"})

        if (!displayName) displayName = email;

        const salt = await bcrypt.genSalt();
        const passwordHash = await bcrypt.hash(password, salt)
        
        const newUser = new User({
            email,
            password: passwordHash,
            displayName
        });

        const savedUser = await newUser.save();

        res.status(201).send(savedUser)

    } catch (err) {
        console.log(err)
        res.status(500).json({err: err.message})
    }
});

router.post('/login', async (req, res) => {
    try{

        const { email, password } = req.body;

        //validate 
        if (!email || !password)
            return res.status(400).json({msg: "Not all fields have been entered! "})

        const user = await User.findOne({email: email})
        if (!user) 
            return res
                .status(400)
                .json({msg: "No account with this email has been registered."})

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) 
            return res
                .status(400)
                .json({msg: "Invalid Credentials"})

        const token = jwt.sign({id: user._id}, process.env.JWT_SECRET)
        res.status(200).send({
            token,
            user: {
                id: user._id,
                displayName: user.displayName,
                // email: user.email,
            }
        })

    } catch (err) {
        res.status(500).json({error: err.message})
    }
});

router.delete('/delete', auth, async (req, res) => {
    try {

        const deletedUser = await User.findByIdAndDelete(req.user)
        res.json(deletedUser)

    } catch (err) {
        res.status(500).json({error: err.message})
    }
});

router.post('/tokenIsValid', async (req, res) => {
    try {

        const token = req.header("x-auth-token");
        if (!token) return res.json(false);

        const verified = jwt.verify(token, process.env.JWT_SECRET)
        if (!verified) return res.json(false);

        const user = await User.findById(verified.id);
        if (!user) return res.json(false);

        return res.json(true)

    } catch (err){
        res.status(500).send({error: err.message})
    }
});

router.get("/", auth, async (req, res) => {
    const user = await User.findById(req.user)
    res.json({
        displayName: user.displayName,
        id: user._id,
    })
});

module.exports = router;