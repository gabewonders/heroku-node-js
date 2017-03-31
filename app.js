var express = require('express')
var app = express()
var bodyParser = require('body-parser')
var docusign = require('./docusign')

app.set('port', (process.env.PORT || 5000));

app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())

app.get('/', function (req, res) {
  res.send('Hello World!')
})
  
app.post('/docusign', function(req, res) {
  console.log('Request Body: ', req.body)

  var ds = new Docusign(req.body.demo, req.body.username, req.body.password, req.body.integratorKey);
  ds.sendTemplate(req.body)

  response.send('Attempted to send to docusign. See logs for more details.')
})

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'))
})

/*app.listen(3000, function () {
  console.log('Example app listening on port 3000!')
})
*/