var http = require("http");
var fs = require('fs');
var sql = require('mssql');
//var sys = require ('sys'),
var sys = require('util');
url = require('url'),
qs = require('querystring');


//params of DB
var dbConfig = {
    server:'mycontactserver.database.windows.net',
    database:'MyContact',
    user:"maayan",
    password:"Mash1234",
    port:1433,
     options: {
            encrypt: true
        }
};


http.createServer(function (request, response) {
   
   //add a new phone number and search
   if(request.method=='POST')
   {	
	  var body='';
 	  var params='';
          request.on('data', function (data) 
	  {
              body +=data;
          });
          request.on('end',function()
	  {
               params =  qs.parse(body);  
          });

	  //add a new phone number
	  if (request.url=="/service/addPhone")
          {
		// connect to DB
		sql.connect(dbConfig, function (err) 
		{
    		if (err) console.log(err);
    			
			// create Request object
   			var request = new sql.Request();

			// query insert a new number to DB 
    			request.query("insert into users values ('"+params.name+"','"+params.phone+"')" , function (err,recordset) 
			{ 
				if(err){ 
					console.log("ERROR");  
					response.writeHead(200, {"Content-Type": "text/plain"});
        				response.end("The name is already exsits"); 
					sql.close();
					return;
				}
				else{   			
					console.log("1 record inserted");
					response.writeHead(200, {"Content-Type": "text/plain"});
        				response.end("The phone number was registered successfully");
					sql.close();
					return;
				}				
    			});
		});	
	}
	//search a phone number
	else if (request.url=="/service/searchPhone")
	{
		// connect to databas
		sql.close();
		sql.connect(dbConfig, function (err) 
		{
    			if (err) console.log(err);
    			
			// create Request object
   			var request = new sql.Request();

			// query select to the database 
	                var query = "select name from users where name like '"+params.name+"%'" ;
               
    			request.query(query , function (err,recordsets)   
			{ 
				if(err)
				{ 
					console.log("ERROR");  
					response.writeHead(200, {"Content-Type": "text/plain"});
        				response.end(""); 
					sql.close();
					return;
				}
				else
				{   			
					response.writeHead(200, {"Content-Type": "text/plain"});
					response.end(JSON.stringify(recordsets.recordset));
					sql.close();
					
					return;
				}				
    			});
		});

	}

  // fetch phone number by name
  else if (request.url=="/service/getPhoneNumber")
  {
    // connect to databas
    sql.close();
    sql.connect(dbConfig, function (err) 
    {
          if (err) console.log(err);
          
      // create Request object
        var request = new sql.Request();

      // query select to the database 
                  var query = "select phone from users where name like '"+params.name+"%'" ;
               
          request.query(query , function (err,recordsets)   
      { 
        if(err)
        { 
          console.log("ERROR");  
          response.writeHead(200, {"Content-Type": "text/plain"});
                response.end(""); 
          sql.close();
          return;
        }
        else
        {         
          response.writeHead(200, {"Content-Type": "text/plain"});
          response.end(JSON.stringify(recordsets.recordset));
          sql.close();
          
          return;
        }       
          });
    });

  }

	return;	
  }

  var filename = request.url.substring(1);
  //defult is home
  if (filename=="")
	filename="Home.html";
 
  fs.exists(filename, function(exists) 
  {
    //the file does not exist
    if(!exists) 
    {
      response.writeHead(404, {"Content-Type": "text/plain"});
      response.write("404 Not Found\n");
      response.end();
      return;
    }

    if (fs.statSync(filename).isDirectory()) filename += '/index.html';

    fs.readFile(filename, "binary", function(err, file) 
    {
      if(err) 
      { 
        response.writeHead(500, {"Content-Type": "text/plain"});
        response.write(err + "\n");
        response.end();
        return;
      }
      response.writeHead(200);
      response.write(file, "binary");
      response.end();
    });
 });

}).listen(1337);

console.log('Server is running..');
