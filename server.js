var http = require('http');
var fs   = require('fs');
var path = require('path');
var twilio = require('twilio');
var url = require('url');
var sys = require('sys');


//Create new twilio rest api, access it with tokens, and store it.
var client = new twilio.RestClient('ACd245c613abcae75f62434e15433e450e', '4b1a7e2856fa7d9cf2852207e6890065');

//run static file index
http.createServer(function (req, res) {

  //store the path and join the directory name, and requested url. [create a url path]
  var file = path.join(__dirname, req.url);

  //test out the output.
  console.log(req.url.slice)


  if (req.url === '/') {
    
    file += 'index.html';
    
    var stuff = 'new body text'
  
  } else if (req.url == '/sendmessage') {
    
    //store data as empty string.
    var data='';
    
    //request a string in utf8 format.
    req.setEncoding('utf8');

    //on request store the chunk to the data var.
    req.on('data', function(chunk) {
       data += chunk;
    });

    req.on('end', function() {

      // Pass in parameters to the REST API using an object literal notation. The
      // REST client will handle authentication and response serialzation for you.
      console.log(req.body, data);
      client.sms.messages.create({
        to:'+14242304955',
        from:'+16466993812',
        body: data
      }, function(error, message) {
        if (!error) {
          // information about the text message you just sent:
          console.log('Success! The SID for this SMS message is:');
          console.log(message.sid);
          console.log('Message sent on:');
          console.log(message.dateCreated);
        }
        else {
          console.log('error.');
        }
      });
    });
  }

  fs.exists(file, function (exists) {
    if (!exists) {
      res.statusCode = 404;
      return res.end();
    }
    return fs.createReadStream(file).pipe(res);
  });
  
}).listen(8000);
console.log('Server running on 8000');


