const express = require('express')
const app = express()

app.use(express.json())

app.get('/test', (req, res) => {
  res.json({ messaggio: 'funziona!' })
})

app.listen(3000, () => {
  console.log('Server avviato sulla porta 3000')
})