var AWS = require('aws-sdk');
const express = require('express');
const fileUpload = require('express-fileUpload');
const app = express();
const port = 3000;
app.use(fileUpload());
AWS.config.update({region: 'us-east-1'});


var client = new AWS.Rekognition();
//function to call detect labels and send label details of image 
function labelToImage(image,callBack){
        var params = {
        Image: {
            Bytes: image.data.buffer  
        },
        MaxLabels: 10  // It will return max 10 labels
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
app.post('/label/image', async (req, res) => {
    
    try {
        if(!req.files) {
            res.send({
                status: false,
                message: 'No file uploaded'
            });
        } else {
            
            let uploaded_image = req.files.image;
            //to store images on server for reference
            uploaded_image.mv('./images/' + uploaded_image.name);
            //function call 
            labelToImage(uploaded_image,function(data){
                res.send(data)
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