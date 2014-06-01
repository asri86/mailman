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
	mandril : null
}

//use errorCodes to take right action
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


function sendFailureSignal(response){
	response.writeHead(400, {"Content-Type" : "text/plain"});
  	response.write("Input parameter is Missing");
  	response.end();
}

function sendSuccessSignal(input,response){
	response.writeHead(200, {"Content-Type" : "text/plain"});
  	response.write(JSON.stringify(input));
  	response.end();
}

function handleFailure(errorCode,errorMessage,response){
	if(errorCode === "BADINPUT"){
		response.writeHead(400, {"Content-Type" : "text/plain"});
  	    response.write(JSON.stringify(errorMessage));
  	}else if(errorCode === "RETRY"){ //either a timeout or server error
		//auto recovery check which service has been tried and try each service provider once 
		//if both fails then quit 
		
	}else{//default case
	}
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
        "key": {key: "K", args: 1, description: "Your private key to make API calls", mandatory:true},
        "service": {key:"S" , args: 1, description: "Mail Service provider mailgun,mandrill"}
	});
	//assuming key is valid 
	var config = {key : options.key};
	
	if(options.service === "mandril"){
		mailHandlers.mandril = new MandrilHandler(config);
	}else if(options.service === "mailgun"){
		mailHandlers.mailgun = new MailGunHandler(config);
	}else{
		console.log("MailService providers must match mailgun or mandril");
	}
	
	mailHandlers.defaultHandler = mailHandlers.mandril || mailHandlers.mailgun;
	
	http.createServer(onRequest).listen(8888);
	console.log("Server has started");
}

//start the server
start();

