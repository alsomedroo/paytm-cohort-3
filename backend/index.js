const express = require("express")
const router = express.Router()
const rootRouter = require("./routes/index")
const cors = require("cors")



const app = express()
app.use(cors())
app.use(express.json())

app.use("/api/v1",rootRouter)

module.exports = router

app.listen(3000);
