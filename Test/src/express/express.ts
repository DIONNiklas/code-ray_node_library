const expressServer = require('express')
const DynamoDBTable = require('./DynamoDB');
const expressApp = expressServer()
const expressPort = 3000

expressApp.get('/', (req, res) => {
    const dynamoDB = new DynamoDBTable();
    const result = dynamoDB.getItem();

    res.send(result.Items[3]);
})

expressApp.listen(expressPort, () => {
    console.log(`Example app listening at http://localhost:${expressPort}`)
});