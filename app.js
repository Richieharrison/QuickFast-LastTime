const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const morgan = require('morgan');
const bodyParser = require('body-parser');

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}))
app.use(cors());
app.options('*', cors());
app.use(morgan('tiny'));

const port = process.env.port || 3000;

mongoose.connect(`mongodb+srv://ngatia:10richharry10@cluster0.6kjpxi7.mongodb.net/?retryWrites=true&w=majority`, {
    useNewUrlParser: true,
    dbName: 'Quickfast',
    useUnifiedTopology: true
}).then(()=>{
    console.log('The database has been connected successfuly')
}).catch((err)=>console.log(err))


const orderSchema = new mongoose.Schema({
    currentLocation: { type: Object, required: true },
    destination: { type: Object, required: true },
    phoneNumber: { type: String, required: true },
    distance: { type: Number, required: true},
    amountPaid: { type: Number, required: true },
    status: {type: String, default: 'pending'}
});

const Order = mongoose.model('Order', orderSchema);

const UserSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: {type: String, required: true},
    nationalId: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    status: {type: String, default: "active"}
});

const User = mongoose.model('User', UserSchema);

app.get('/', (req, res)=>{
    res.status(200).send('Welcome here')
})

app.post('/register/user', async(req, res)=>{
    const usedId = await User.find({nationalId: req.body.nationalId})
    if(usedId.length === 0){
        const newUser = new User({
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            nationalId: req.body.nationalId,
            phoneNumber: req.body.phoneNumber
        })
        
        await newUser.save()
        .then(result => {res.status(200).send({success: true, result: result});})
        .catch(error => {res.status(500).send({err: error});});
    }else{
        res.status(409).send({success: false, message: "The user with that id has already been registered. Do you mean to change"})
    }
})

app.post('/order', async(req, res)=>{
    const order = new Order({
        currentLocation: req.body.currentLocation,
        destination: req.body.destination,
        phoneNumber: req.body.phoneNumber,
        distance: req.body.distance,
        amountPaid: Math.floor((req.body.distance) * 1.50)
    })

    await order.save()
    .then(result => {res.status(200).send({success: true, result: result});})
    .catch(error => {res.status(500).send({err: error});});
})

app.post('/login', async(req, res)=>{
    try{
        const user = await User.findOne({phoneNumber: req.body.phoneNumber})

        if(!user)
        return res.status(404).send({success: false, message: "No such user exists"})

        return res.status(200).send({success: true, user: user})
    }catch{
        (err)=> res.status(500).send({err: err})
    }
})

app.put('/modify-order/:id', async(req, res)=>{
    try{
        const order = await Order.findByIdAndUpdate(
            req.params.id,
            {
                status: "transformed",
                user: req.body.userId
            },
            {
                new: true
            }
        )
        if(!order)
        return res.status(404).send({success: false, message: "Order modification is not successful"})

        return res.status(200).send({success: true, order: order})
    }catch{(err)=>{
        return res.status(500).send({message: "Internal Server error", err: err.message})
    }}
})

app.get('/order', async(req, res)=>{
    try{
        const orderNumber = await Order.find({phoneNumber: req.body.phoneNumber})

        if(!orderNumber)
        return res.status(404).send({success: false, message: "No orders made"})

        return res.status(200).json({success: true, orders: orderNumber})
    }catch{
        (err)=>{res.status(500).send({err: err})}
    }
})


app.get('/all-orders', async(req, res)=>{
    try{
        const orders = await Order.find()

        if(!orders)
        return res.status(404).send("You don't have any orders")

        return res.status(200).send(orders)
    }catch{
        (err) => console.log(err)
    }
})

app.get('/all-users', async(req, res)=>{
    try{
        const orders = await User.find()

        if(!orders)
        return res.status(404).send("You don't have any orders")

        return res.status(200).json({orders: orders})
    }catch{
        (err) => console.log(err)
    }
})


app.get('/cors', (req, res)=>{
    res.send('Cors has been enabled')
})


app.listen(port, ()=>{
    console.log(`The server is listening in ${port}`)
})

