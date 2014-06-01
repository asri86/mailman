var http = require("http");
var url = require("url");
var https = require("https");
var FormData = require("form-data");

module.exports = MailGunHandler;

function MailGunHandler(config){
  this.config = config || {};
}


MailGunHandler.prototype.sendMail = function sendMail(input,passCallBack, failCallBack,httpResponse){
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