const express = require('express')
let cors = require('cors')
const app = express();
app.use(express.json());
app.use(express.urlencoded({extended:false}));
app.use(cors());

const db = require("./database.js");
const{ check , validationResult } = require('express-validator');
const isImageUrl = require('is-image-url');
const port = process.env.PORT || 8081;

const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUI = require('swagger-ui-express');

//swagger
const swaggerOptions = {
  swaggerDefinition: {
    openapi: "3.0.0",
    info: {
      title: "Xmeme API",
      description:"This API contains a list of memes.",
      version: '1.0.0',
    },
    contact: {
        name: "Shlok Kyal",
        email: "shlok.kyal@gmail.com",
    },
  },
  apis: ["app.js"],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/swagger-ui', swaggerUI.serve, swaggerUI.setup(swaggerDocs));

//Swagger Schemmas
/**
 * @swagger
 * components:
 *   schemas:
 *      Meme:
 *          type: object
 *          required: 
 *              - name
 *              - url
 *              - caption
 *          properties:
 *              id: 
 *                 type: integer
 *                 description: The auto-incremented id for books
 *              name:
 *                  type: string
 *                  description: The name of the author
 *              url:
 *                  type: string
 *                  description: The URL of the meme
 *              caption:
 *                  type: string 
 *                  description: The Caption for meme
 *          example:
 *              name: Shlok
 *              url: https://api.memegen.link/images/buzz/memes/memes_everywhere.png
 *              caption: Meme is Everywhere!!
 * 
 *      Meme_Update:
 *          type: object
 *          required: 
 *              - url
 *              - caption
 *          properties:
 *              id: 
 *                 type: integer
 *                 description: The auto-incremented id for books
 *              url:
 *                  type: string
 *                  description: The URL of the meme
 *              caption:
 *                  type: string 
 *                  description: The Caption for meme
 *          example:
 *              url: https://api.memegen.link/images/buzz/memes/memes_everywhere.png
 *              caption: Meme is Everywhere!!
 *      
 * 
 *      Meme_Posted:
 *          type: object
 *          required:
 *              - id
 *          properties:
 *              id: 
 *                 type: integer
 *                 description: The Id of created Meme.
 * 
 *      Error_Message:
 *          type: object
 *          required:
 *              - errors
 *          properties:
 *              errors:
 *                  type: object
 *                  required:
 *                      - msg
 *                  properties:
 *                      value:
 *                          type: string
 *                      msg:
 *                          type: string
 *                      param:
 *                          type: string
 *                      location:
 *                          type: string
 */


/** 
 * @swagger
 * tags:
 *   name: Xmeme
 *   description: API to manage your memes.
 */

//Swagger Get Request
/** 
*  @swagger
*  /memes/:
*     get:
*       summary: Lists all the Memes
*       tags: [Xmeme]
*       responses:
*         "200":
*           description: The list of all memes. 
*           content:
*               application/json:
*                   schema:
*                       $ref: '#/components/schemas/Meme'
*         "503":
*           description: Error Loading Database
*           content:
*               application/json:
*                   schema:
*                       $ref: '#/components/schemas/Error_Message'
*/

//get request
app.get("/memes",(req,res)=>{
    const sql = "SELECT * FROM USERS ORDER BY id DESC LIMIT 100";

    db.all(sql, [], (err, rows) => {
        if (err) {
            console.error(err.message);
            res.status(503).json({"errors":[{"msg":"Problem With Database","param":"databse"}]});
        }
        res.setHeader('Content-Type', 'application/json');
        res.status(200).json(rows);
    });
});

//Swagger Get _id
/**
 * @swagger
 * /memes/{id}:
 *     get:
 *        summary: Meme at given id
 *        tags: [Xmeme]
 *        parameters:
 *             - in: path
 *               name: id
 *               schema:
 *                   type: integer
 *               required: true
 *               description: The Meme id
 * 
 * 
 *        responses:
 *               "200":
 *                   description: The desired Meme
 *                   content:
 *                      application/json:
 *                          schema:
 *                              $ref: '#/components/schemas/Meme'
 *               "404":
 *                   description: Meme not found
 *               "503":
 *                   description: Problem With Database.
 *                   content:
 *                      application/json:
 *                          schema:
 *                              $ref: '#/components/schemas/Error_Message'
 *        
 *               
 */

//get request specific id
app.get("/memes/:id", (req, res) => {
    const id = req.params.id;
    const sql = "SELECT * FROM USERS WHERE id = ?";
    db.get(sql, id, (err, row) => {
      if (err){
        console.error(err.message);
        res.status(503).json({"errors":[{"msg":"Problem With Database","param":"databse"}]});
      }
      if(row==undefined)
      res.status(404).send();
      else{
        res.setHeader('Content-Type', 'application/json');
        res.status(200).json(row);
      }
    });
  });


//Swagger Post  
/**
 * @swagger 
 * /memes/:
 *    post:
 *         summary: Creates a new meme
 *         tags: [Xmeme]
 *         requestBody:
 *            required: true
 *            content:
 *                  application/json:
 *                      schema:
 *                          $ref: '#/components/schemas/Meme'
 *         responses:
 *            "201":
 *               description: The Meme is Created.
 *               content:
 *                  application/json:
 *                      schema:
 *                          $ref: '#/components/schemas/Meme_Posted'
 * 
 *            "400":
 *               description: Either a field is empty or Meme Url is invalid.
 *               content:
 *                  application/json:
 *                      schema:
 *                          $ref: '#/components/schemas/Error_Message'
 *            "409":
 *               description: Post Already Exists
 *               content:
 *                  application/json:
 *                      schema:
 *                          $ref: '#/components/schemas/Error_Message'             
 *            "503":
 *               description: Problem with Database
 *               content:
 *                  application/json:
 *                      schema:
 *                          $ref: '#/components/schemas/Error_Message'
 */

//post request
app.post("/memes",[
    check('name').notEmpty().withMessage("Name Cannot be Empty") ,
    check('caption').notEmpty().withMessage("Caption Cannot be Empty"),
    check('url').notEmpty().withMessage("Meme Url Cannot be Empty").isURL().withMessage("Enter Valid Meme Url"),
],(req,res)=>{
    //check if empty or url is valid
    const error = validationResult(req);
    if(!error.isEmpty()){
        return res.status(400).json(error);
    }

    const { name , url , caption } = req.body;

    //check if url is image
    if(!isImageUrl(url)){
        return res.status(400).json({"errors":[{"msg":"Image Url is Invalid","param":"url"}]});
    }

    //check for duplicate entry
    const sql_dup = `SELECT * FROM users WHERE name='${name}' AND caption='${caption}' AND url='${url}';`
    db.get(sql_dup,(err,row)=>{
        if(err){
            console.error(err.message);
            res.status(503).json({"errors":[{"msg":"Problem With Database","param":"databse"}]});
        }
        if(row==undefined){
            const sql_insert =`INSERT INTO users (name, url, caption) VALUES ('${name}','${url}','${caption}');`
            db.run(sql_insert, err => {
                if (err) {
                    console.error(err.message);
                    res.status(503).json({"errors":[{"msg":"Problem With Database","param":"databse"}]});
                }
                console.log("Successful creation of User");
            });

            //get the id of last element
            const sql = "SELECT * FROM USERS ORDER BY id DESC LIMIT ?";
            db.get(sql, 1, (err, row) => {
                if (err){
                    console.error(err.message);
                    res.status(503).json({"errors":[{"msg":"Problem With Database","param":"databse"}]});
                }
                const a= row.id;
                res.setHeader('Content-Type', 'application/json');
                res.status(201).json({ "id" : a });
            });
        }
        else{
            res.status(409).json({"errors":[{"msg":"Post Already Exists"}]});
        }
    });

    
    
});


//Swagger Patch
/**
 * @swagger
 * /memes/{id} :
 *     patch:
 *          summary: Edit a Meme
 *          tags: [Xmeme]
 *          parameters:
 *             - in: path
 *               name: id
 *               schema: 
 *                  type: integer
 *               required: true
 *               description: The Meme Id
 *          requestBody:
 *               required: true
 *               content:
 *                  application/json:
 *                      schema:
 *                          $ref: '#/components/schemas/Meme_Update'
 *          responses:
 *               "200":
 *                  description: Meme Updated Successfully
 *               "404":
 *                  description: id is invalid
 *               "400":
 *                  description: Either a field is empty or Meme Url is invalid.
 *                  content:
 *                      application/json:
 *                          schema:
 *                              $ref: '#/components/schemas/Error_Message'
 *               "503":
 *                  description: Either a field is empty or Meme Url is invalid.
 *                  content:
 *                      application/json:
 *                          schema:
 *                              $ref: '#/components/schemas/Error_Message'
 * 
 *     
 */

//patch request
app.patch("/memes/:id",[
    check('url').notEmpty().withMessage("ImageUrl Cannot be Empty").isURL().withMessage("Enter Valid Url"),
    check('caption').notEmpty().withMessage("Caption Cannot be Empty"),
],(req,res)=>{

    //check if empty or url is valid
    const error = validationResult(req);
    if(!error.isEmpty()){
        return res.status(400).json(error);
    }

    const id=req.params.id;
    const { url , caption } = req.body;

    //check if url is of a Image
    if(!isImageUrl(url)){
        return res.status(400).json({"errors":[{"msg":"Meme Url is Invalid","param":"url"}]});
    }

    const sql = "SELECT * FROM USERS WHERE id = ?";
    db.get(sql, id, (err, row) => {
        if (err){
            console.error(err.message);
            res.status(503).json({"errors":[{"msg":"Problem With Database","param":"databse"}]});
        }
        if(row==undefined){
            res.status(404).send();
        }
        else{
            const sql_update =`UPDATE USERS SET url='${url}' , caption='${caption}' WHERE id='${id}';`;
             db.run(sql_update,err=>{
                if (err) {
                    console.error(err.message);
                    res.status(503).json({"errors":[{"msg":"Problem With Database","param":"databse"}]});
                }
                console.log("Successful Updated");
            });
            res.status(200).send();
        }
    });
});

//for all other pages
app.all("*", (request, response) => {
    response.status(404).send()
})

//listening port
app.listen(port, () => {
    console.log(`Nodejs server started on port ${port}`)
});