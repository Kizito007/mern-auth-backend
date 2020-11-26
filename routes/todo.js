const router = require("express").Router(),
    Todo = require("../models/todoModel"),
    auth = require("../middleware/auth");

//
router.post('/', auth, async (req, res) => {
    try {
        const {title} = req.body;
        
        //validation
        if (!title)
            return res
                .status(400)
                .json({msg: "Please add a Title."})

        const newTodo = Todo ({
            title,
            userId: req.user
        })
        const savedTodo = await newTodo.save();
        res.json(savedTodo)
    } catch (err){
        res.status(500).send({error: err.message})
    }
});

router.get('/all', auth, async (req, res) => {
    const todos = await Todo.find({ userId: req.user });
    res.json(todos)
});
router.delete('/:id', auth, async (req, res) => {
    const todo = await Todo.findOne({ userId: req.user, _id: req.params.id });
    if (!todo) 
        return res.status(400).json({ msg: "No todo with this ID found that belongs to current user." })

    const deletedTodo = await Todo.findByIdAndDelete(req.params.id);
    res.json(deletedTodo)
});

module.exports = router ;