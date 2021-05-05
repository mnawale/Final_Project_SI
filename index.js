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
var params = {
  Image: {
    S3Object: {
      Bucket: bucket,
      Name: photo
    },
  },
  MaxLabels: 10
}
client.detectLabels(params, function(err, response) {
  if (err) {
    console.log(err, err.stack); // an error occurred
  } else {
    console.log(`Detected labels for: ${photo}`)
    response.Labels.forEach(label => {
      console.log(`Label:      ${label.Name}`)
      console.log(`Confidence: ${label.Confidence}`)
      console.log("Instances:")
      label.Instances.forEach(instance => {
        let box = instance.BoundingBox
        console.log("  Bounding box:")
        console.log(`    Top:        ${box.Top}`)
        console.log(`    Left:       ${box.Left}`)
        console.log(`    Width:      ${box.Width}`)
        console.log(`    Height:     ${box.Height}`)
        console.log(`  Confidence: ${instance.Confidence}`)
      })
      console.log("Parents:")
      label.Parents.forEach(parent => {
        console.log(`  ${parent.Name}`)
      })
      console.log("------------")
      console.log("")
    }) // for response.labels
  } // if
});
app.use(express.static('public'))
app.post('/upload',function(req,res){
  console.log('File Uploading')
  if (!req.files)
  return res.static(400).send("File is not uploaded");

  const sampleFile=req.files.sampleFile;

  sampleFile.mv('/somewhere/file.jpg', function(err){
    if (err)
      return res.status(500).send(err);
    res.send('File is uploaded')  
  });
});
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});