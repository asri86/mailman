mailman
=======

###Install

 
1 - Additional Modules 

 form-data   => npm install form-data
 merge  => npm install merge
 stdio => npm install stdio
 
2 - Check out project from github

git clone https://github.com/axs9078/mailman.git

This will create a local repository 



###USE
cd mailman

node HttpService.js -K YOURKEY -S SERVICEPROVIDER [mandril or mailgun]


curl -v -X POST localhost:8888/email -d '{ 
 "to": "amit.vers@gmail.com", 
 "to_name": "Ms. Fake",
 "from": "noreply@uber.com", "from_name" : "Uber", 
 "subject": "A Message from Uber", "body": "<h1>Your Bill</h1><p>$10</p>" 
}' -H "Content-Type:application/json"





#I just started using Node.js for this project so I tried to keep myself away from using any modules.
I used form-data that was required to post a form to MailGun api. 

#


 


