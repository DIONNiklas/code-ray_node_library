const express = require('express')
const app = express()
const port = 3000
const Internet = "Hallo Welt";


const doSomething = (): any => {
    return {
        username: Math.random()
    }
}

app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.get("/impressum", (req, res) => {
    const result = doSomething();

    res.send('<h1>Hier steht ein Impressum</h1>' + result);
})

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
});