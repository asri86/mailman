var http = require("http");
var url = require("url");
var https = require("https");
var FormData = require("form-data");

module.exports = MailGunHandler;

function MailGunHandler(config){
  this.config = config || {};
}



/**
 *  This method sends mail using Mandril Service , in case of error it propogates the information 
 *  back to original caller
 * @input : A json object for all the input fields
 * @passCallback : To notify caller back about success
 * @failCallBack : To notify caller back about failures
 * @httpResponse : http response object for current request in progress
 */

MailGunHandler.prototype.sendMail = function sendMail(input,passCallBack, failCallBack,httpResponse){
	var _self = this;
	var form = new FormData();
    for(var key in input){
	   form.append(key,input[key]);
	}
	
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
  	    	var jsonobj = JSON.parse(body);
  	    	console.log("Status Code = " + res.statusCode);
  	    	console.log("complete response " + JSON.stringify(body));
  	    	if(res.statusCode === 200){//happy case
  	    		passCallBack(jsonobj,httpResponse);
  	    	}else{
  	    		 failCallBack(jsonobj,httpResponse);
  	    	}
  	    });
       }
    });
}


//unused

MailGunHandler.prototype.error = function error(input,response,failCallBack,httpResponse,jsonRequest){
	var _self = this;
    var ec = response.statusCode / 100;
    var errorCode = "";
    console.log("Mailgun error handler " + ec);
	if(ec === 4){
		errorCode = "BADINPUT";
	}else if(ec === 5){
		if(_self.config.def === true ) {//if this service was default handler we can retry
			 	errorCode = "RETRY";
		}else{
			 errorCode = "QUIT";
		}
	}else{ //other status code in default error
		errorCode = "BADINPUT";
	}
	failCallBack(errorCode,input,httpResponse,jsonRequest);
}