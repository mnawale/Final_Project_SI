var AWS = require('aws-sdk');
const express = require('express');
const fileUpload = require('express-fileUpload');
const app = express();
const port = 3000;
app.use(fileUpload());
AWS.config.update({region: 'us-east-1'});


const bucket = 'objectlabels' // the bucketname without s3://
const photo  = 'images-2.jpeg' // the name of file

 const config = new AWS.Config({
 accessKeyId: "AKIA3EECFIJFXA6O2TVO",
 secretAccessKey: "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",
 //region: "us-east-2"
}) 
var client = new AWS.Rekognition();
function labelToImage(image){
        var params = {
        Image: {
            Bytes: image.data.buffer
        },
        MaxLabels: 10
    }

    client.detectLabels(params, function(err, response) {
        if (err) {
            console.log(err, err.stack); // an error occurred
        } else {
            console.log(response)
    
        } // if
    });
}



app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.post('/label', async (req, res) => {
    
    try {
        if(!req.files) {
            res.send({
                status: false,
                message: 'No file uploaded'
            });
        } else {
            
            let uploaded_image = req.files.image;
            uploaded_image.mv('./images/' + uploaded_image.name);
            labelToImage(uploaded_image)
            

            //send response
            res.send({
                status: true,
                message: 'File is uploaded',
                data: {
                    name: uploaded_image.name,
                    mimetype: uploaded_image.mimetype,
                    size: uploaded_image.size
                }
            });
        }
    } catch (err) {
        res.status(500).send(err);
    }
});
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});