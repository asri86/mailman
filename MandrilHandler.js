var http = require("http");
var url = require("url");
var https = require("https");
var FormData = require("form-data");

module.exports = MandrilHandler;

function MandrilHandler(config){
  this.config = config || {};
}


MandrilHandler.prototype.sendMail = function sendMail(input,passCallBack,failCallBack,httpResponse){
	
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
  	    	var jsonobj = JSON.parse(body);
  	    	console.log(" complete response " + JSON.stringify(body));
  	    	console.log("Status code of the message " + response.statusCode);
  	    	if(response.statusCode === 200){//happy case
  	    		passCallBack(jsonobj,httpResponse);
  	    	}else{
  	    		this.error(jsonobj,response,failCallBack);
  	    	}
  	    });
  	 
  });
  
  req.write(dataString);
  req.end();
}


MandrilHandler.prototype.error = function error(input,failCallBack){
   console.log("Mandril Error ");

}
