var express = require('express')
var app = express()
var bodyParser = require('body-parser')
var docusign = require('./docusign')

app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())

app.get('/', function (req, res) {
  res.send('Hello World!')
})
  
app.post('/docusign', function(req, res) {
  console.log('Request Body: ', req.body)

  ds = new docusign()
  ds.sendTemplate(req.body)
})

app.listen(3000, function () {
  console.log('Example app listening on port 3000!')
})
