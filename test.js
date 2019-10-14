const Mijia = require('./index');

const mijia = new Mijia({
    userId: ``,
    ssecurity: ``,
    serviceToken: ``,
    userAgent: ``,
});

mijia.fetch('/homeroom/gethome', {
    limit: 300
}).then(res => {
    console.log(res.result)
})