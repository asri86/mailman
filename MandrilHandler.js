var http = require("http");
var url = require("url");
var https = require("https");
var FormData = require("form-data");
var merge = require("merge");

module.exports = MandrilHandler;

function MandrilHandler(config){
  this.config = config || {};
}


/**
 *  This method sends mail using Mandril Service , in case of error it throws the information 
 *  back to original caller
 * @input : A json object for all the input fields
 * @passCallback : To notify caller back about success
 * @failCallBack : To notify caller back about failures
 * @httpResponse : http response object for current request in progress
 */

MandrilHandler.prototype.sendMail = function sendMail(input,passCallBack,failCallBack,httpResponse){
  var _self = this;
	
 var data = {
    "key": this.config.key,
    "message": {
        "text": input["text"],
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
  	    		failCallBack(jsonobj,httpResponse);
  	    	}
  	    });
  });
  
  req.write(dataString);
  req.end();
}



/** Inspect error message from service and unify them based on codes and message. I have broadly divided into 
* 4XX and 5XX error cases and some service specific error cases
*   http://www.w3.org/Protocols/rfc2616/rfc2616-sec10.html
*   4XX clientError 5XX serverError
*   assign a errorCode based on httpStatus codes
*/

MandrilHandler.prototype.error = function error(input,response,failCallBack,httpResponse,jsonRequest){
	var _self = this;
    var ec = response.statusCode / 100;
    var errorCode = "";
	if(ec === 4){
		errorCode = "BADINPUT";
	}else if(ec === 5){
		if(input.name === "ValidationError" || input.name === "Invalid_Key"){//specific error cases from mandril that may indicate input is corrupt
			errorCode = "RETRY";
		}else{
			if(_self.config.def === true ){ //if this service was default handler we can retry
			 	errorCode = "RETRY";
			 }else{
			 	errorCode = "QUIT";
			 }
		}
	}else{ //other status code in default error
		errorCode = "BADINPUT";
	}
	
	failCallBack(errorCode,input,httpResponse,jsonRequest);
}
