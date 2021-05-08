var AWS = require('aws-sdk');
const express = require('express');
const fileUpload = require('express-fileUpload');
var bodyParser = require("body-parser");
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const {body, validationResult} = require('express-validator');
const cors = require('cors');
const app = express();
const port = 3000;

app.use(fileUpload());
//
app.use(cors());


const options = {
    swaggerDefinition: {
        students: {
            title: 'AWS Rekognition image labeling',
            version: '2.1.1',
            description: 'Student information '
        },
        host:'localhost:3000',
        basePath: '/',
    },
    apis: ['./index.js'],
};
const specs = swaggerJsdoc(options);
app.use('/docs',swaggerUi.serve,swaggerUi.setup(specs));
app.use(cors());
AWS.config.update({region: 'us-east-1'});


var client = new AWS.Rekognition();
//function to call detect labels and send label details of image 
function labelToImage(image,labelCount,callBack){
        console.log(labelCount);
        
        var params = {
        Image: {
            Bytes: image.data.buffer  
        },
        MaxLabels: labelCount  // It will return max 10 labels
        }

    client.detectLabels(params, function(err, response) {
        if (err) {
            console.log(err, err.stack); // an error occurred
        } else {
            console.log(response)
            callBack(response)
        } // if
    });
}



app.get('/', (req, res) => {
  res.send('Hello World!')
})
//This post method uploads image file and provide object labels 
/**
* @swagger
* /label/image:
*   post:
*     operationId: upload
*     summary: AWS Rekognition
*     consumes: 
*       - multipart/form-data
*     parameters:
*       - name: image
*         in: formData
*         type: file

*         description: Upload image for labelling
*       - name: label
*         in: formData
*         type: integer
*         format: "int64" 
*         default: 10
*         required: true
*         description: Count for Maximum labels want to identify         
*     responses:
*        200:
*         description: Object labels identified in the uploaded image
*        500:
*         description: File is not uploaded
*         schema: 
*         type: string
*/
app.post('/label/image', async (req, res) => {
    
    try {
        if(!req.files) {
            res.send({
                status: false,
                message: 'No file uploaded'
            });
        } else {
            
            let uploaded_image = req.files.image;
            let labelCount= req.body.label;
           
            uploaded_image.mv('./images/' + uploaded_image.name);
            //function call 
            labelToImage(uploaded_image,labelCount,function(data){
                res.status(200).json(data)
            })
                 
        }
    } catch (err) {
        res.status(500).send(err);
    }
});
//Application is running on port 3000
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});