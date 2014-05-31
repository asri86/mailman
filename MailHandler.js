var http = require("http");
var url = require("url");
var https = require("https");
var FormData = require("form-data");

module.exports = MailHandler;

function MailHandler(config,callback){
  this.config = config || {};
}


MailHandler.prototype.mailUsingMandril = function mailUsingMandril(input,callback){
	
 var data = {
    "key": this.config.key,
    "message": {
        "html": "<p>Example HTML content</p>",
        "text": input["body"],
        "subject": input["subject"],
        "from_email": input["from"],
        "from_name": input["from_name"],
        "to": [
            {
                "email": input["to"],
                "name": input["to_name"],
                "type": "to"
            }
        ]
       }
	}
	
	var dataString = JSON.stringify(data);
	
	header = {
				"Content-Type":"application/json",
  				"Content-Length":dataString.length
  			  };

  	var options = {
  		host: "mandrillapp.com",
  		port: 443,
  		path: "/api/1.0/messages/send.json",
  		method: "POST",
  		headers: header
  	};
  
  var req = https.request(options,function(response){
  	    var body = "";
  	    response.on("data",function(chunk){
  	    	body+=chunk.toString();
  	    });
  	    
  	    response.on("end",function(){
  	    	console.log(" complete response " + JSON.stringify(body));
  	    });
  	 
  });
  
   req.write(dataString);
   req.end();
}

MailHandler.prototype.mailUsingMailGun = function mailUsingMailGun(input,callback){
	var form = new FormData();
    for(var key in input){
	   form.append(key,input[key]);
	}
	
	form.append("o:tracking-clicks","htmlonly");
	form.append("CNAME","http://bin.mailgun.net/4f66d299");
	
	var options = {
  	host: "api.mailgun.net",
  	port: 443,
  	protocol : "https:",
  	path: "/v2/sandboxb1d2f138f95d472a9931f9ee8af8f36c.mailgun.org/messages",
  	method: "POST",
  	auth :this.config.key
    };
    
    form.submit(options,function(err,res){
       if(res){
       	var body = "";
  	    res.on("data",function(chunk){
  	    	body+=chunk.toString();
  	    });
  	    
  	    res.on("end",function(){
  	    	console.log("Status Code = " + res.statusCode);
  	    	console.log("complete response " + JSON.stringify(body));
  	    });
       }
       if(err){
       	   console.log("Error Happened");
       }
    });
}