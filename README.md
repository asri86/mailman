mailman
=======

###Install

 
1 - Additional Modules 

 form-data   => npm install form-data
 merge  => npm install merge
 stdio => npm install stdio
 html-to-text => convert html to text
 
2 - Check out project from github

git clone https://github.com/axs9078/mailman.git

This will create a local repository 



###USE
cd mailman

node HttpService.js -K YOURKEY -S SERVICEPROVIDER [mandril or mailgun]



##use curl to post data to your http service

curl -v -X POST localhost:8888/email -d '{ 
 "to": "test@gmail.com", 
 "to_name": "Ms. Fake",
 "from": "noreply@uber.com", "from_name" : "Uber", 
 "subject": "A Message from Uber", "body": "\<h1\>Your Bill\</h1\> \<p\>$10\</p\>" 
}' -H "Content-Type:application/json"




 


