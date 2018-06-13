const express = require('express');
const ejs = require('ejs');
const paypal = require('paypal-rest-sdk');
const create_payment_json = require('./data/data.json');

paypal.configure({
    'mode': 'sandbox', // sandbox or live
    'client_id': '<YOUR_CLIENT_ID>',
    'client_secret': '<YOUR_CLIENT_SECRET>'
});

const app = express();

app.set('view engine', 'ejs');

app.get('/', (req, res) => res.render('index'));

app.post('/pay', (req, res) => {
    paypal.payment.create(create_payment_json, (err, payment) => {
        if(err) {
            throw err
        } else {
            for(let i = 0; i < payment.links.length; i++) {
                if(payment.links[i].rel === 'approval_url') {
                    res.redirect(payment.links[i].href);
                }
            }
        }
    });
});

app.get('/success', (req, res) => {
    const payerId = req.query.PayerID;
    const paymentId = req.query.paymentId;
    console.log(payerId);

    const execute_payment_json = {
        'payer_id': payerId,
        'transactions': [{
            'amount': {
                'currency': 'USD',
                'total': '28.48'
            }
        }]
    };

    paypal.payment.execute(paymentId, execute_payment_json, (err, payment) => {
        if(err) {
            console.log(err.response);
            throw err;
        } else {
            res.json(payment);
        }
    });
});

app.get('/cancle', (req, res) => res.send('Cancled'))

app.listen(3000, () => console.log('Server started and running on port 3000'));