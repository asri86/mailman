var http = require("http");
var url = require("url");
var https = require("https");
var FormData = require("form-data");
var stdio = require('stdio');
var MailHandler = require("./MailHandler");


var globalSetting = 
{
	key : "",
	service : "",
	def : "mailgun"
};


function onRequest(request, response) {
  var pathname = url.parse(request.url).pathname;
  if("/email" == pathname){
  	var mailHandler = new MailHandler(globalSetting);
    emailHandler(mailHandler,request,response);	   
  }else{
    console.log("Not ready yet !!");
  }
}


function sendFailureSignal(response){
	response.writeHead(400, {"Content-Type" : "text/plain"});
  	response.write("Input parameter is Missing");
  	response.end();
}

function sendSuccessSignal(response){
	response.writeHead(200, {"Content-Type" : "text/plain"});
  	response.write("Mail Sent");
  	response.end();
}


function emailHandler(mailHandler,request,response){
	var _response = response;
    var body = "";
	if(request.method == 'POST'){
		request.on("data", function(chunk){
			body+=chunk.toString();
			request.content+=chunk.toString();
		});
		
		request.on("end", function(){
		    var jsonobj = JSON.parse(body);
		     var check = inputValidator(jsonobj,_response);
		     if(check){
		     	mailHandler.mailUsingMandril(jsonobj,body);
		     	sendSuccessSignal(response);
		     }else{
		     	sendFailureSignal(response);
		     }
		});
		
	}else{
		console.log('We are not yet ready to do GET style requests !! ');
	}
}

//TODO better input validator , like check email format etc...
function inputValidator(input,response){
   var count = 6;
	var requiredParam = ["to","to_name","from","from_name","subject","body"];
	requiredParam.forEach(function(key){
		if(input[key] != null && (input[key]).toString().length > 0){
		    count--;
		}
	});
	if(count !=0){
		return false;
	}
	return true;
}


function start(){
	//parse all input options
	var options = stdio.getopt({
        "key": {key: "K", args: 1, description: "Your private key to make API calls", mandatory:true},
        "service": {key:"S" , args: 1, description: "Mail Service provider mailgun,mandrill"}
	});
	
	globalSetting.key = options.key;
	globalSetting.service = options.service;
	
	http.createServer(onRequest).listen(8888);
	console.log("Server has started");
}

//start the server
start();

