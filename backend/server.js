const express = require('express')

const app = express()
app.use(express.json())
app.use(express.static('../frontend'))

const account = [{
    username: 'ava',
    email: 'ava@gmail.com',
    password: 'ava123'
}]


app.post('/api/signup', (req, res) => {
    console.log(req.body)
    let a = req.body

    
    res.json(a)
})

app.listen(3000, () => {
    console.log('listen on port 3000')
})