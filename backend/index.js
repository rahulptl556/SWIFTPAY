const express = require("express");
const cors = require('cors');

const PORT = process.env.PORT || 3000; 

const rootRouter = require('./routes/index.js')

const app = express();
app.use(express.json());
app.use(cors())

app.use('/api/v1', rootRouter);

app.listen(PORT, (res)=>{
    console.log('Listening on ')
})



