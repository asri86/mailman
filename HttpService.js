var http = require("http");
var url = require("url");
var https = require("https");
var FormData = require("form-data");
var stdio = require('stdio');
var MandrilHandler = require("./MandrilHandler");
var MailGunHandler = require("./MailGunHandler");


var mailHandlers = {
	defaultHandler :null, 
	mailgun : null,
	mandril : null,
	defServiceName : ""
}


//ERROCODE to unify the logic for error handling for both the email services
var errorCodes = {
	inputError : "BADINPUT",
	serverError : "RETRY"
}


function onRequest(request, response) {
  var pathname = url.parse(request.url).pathname;
  if("/email" == pathname){
  	emailHandler(request,response);	   
  }else{
    console.log("Not ready yet !!");
  }
}

function sendSuccessSignal(input,response){
	response.writeHead(200, {"Content-Type" : "text/plain"});
  	response.write(JSON.stringify(input));
  	response.end();
}


/**
*This function does the error handling on the basis of errorCode. In case of BADINPUT 
* notification is sent back to caller. If the error code is retry then , it tries making one
* more attempt for sending email using another service. 
*/ 
function handleFailure(error,response){
	response.writeHead(400, {"Content-Type" : "text/plain"});
  	response.write(JSON.stringify(error));
  	response.end();
}


function emailHandler(request,response){
	var body = "";
	if(request.method == 'POST'){
		request.on("data", function(chunk){
			body+=chunk.toString();
			request.content+=chunk.toString();
		});
		
		request.on("end", function(){
		    var jsonobj = JSON.parse(body);
		    inputValidator(jsonobj,mailHandlers.defaultHandler,response);
		});
		
	}else{
		console.log("We are not yet ready to do GET style requests !! ");
	}
}

//TODO better input validator , like check email format etc...
function inputValidator(input,handler,httpResponse){
	var errorMessage = {};
   var count = 6;
	var requiredParam = ["to","to_name","from","from_name","subject","body"];
	requiredParam.forEach(function(key){
		if(input[key] != null && (input[key]).toString().length > 0){
		    count--;
		}else{
			errorMessage[key + "_errorMessage" ] =  " has unexpected value = " + input[key];
		}
	});
	if(count !=0){
		handleFailure(errorCodes.inputError, errorMessage, httpResponse);
	}else{
		handler.sendMail(input,sendSuccessSignal,handleFailure,httpResponse)
	}
}


function start(){
	//parse all input options
	var options = stdio.getopt({
        "key": {key: "K", args: 1, description: "Your private key to make API calls mandril key,mailgun key", mandatory:true},
        "service": {key:"S" , args: 1, description: "Mail Service provider mailgun,mandrill", mandatory:true}
	});
	
	
	//set the default mail service 
	if(options.service === "mandril"){
		var mandrilConfig = {key : options.key,
						  handlerName : "mandril",
						  def : true};
		mailHandlers.mandril = new MandrilHandler(mandrilConfig);
	}else if(options.service === "mailgun"){
		var mandrilConfig = {key : options.key,
						  handlerName : "mailgun",
						  def : true};
		mailHandlers.mailgun = new MailGunHandler(mailgunConfig);
	}else{
		console.log("MailService providers must match mailgun or mandril");
	}
	//set the deault handler
	mailHandlers.defaultHandler = mailHandlers.mandril || mailHandlers.mailgun;
	
	
	http.createServer(onRequest).listen(8888);
	console.log("Server started !!!");
}

//start the server
start();

