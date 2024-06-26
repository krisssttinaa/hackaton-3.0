const ApiClient = require('./api/apiClient');
const Web3 = require('web3');
const express = require('express');
const app = express();
const mysql2 = require('mysql2');
const cors = require('cors');
const { User } = require('./user/User');  // Adjust the path as necessary
const BlockchainInterface = require('./transactions/blockchainInterface');
const blockchainInterface = new BlockchainInterface('https://mainnet.infura.io/v3/7f7336b604014a63a4fe74c89f2d8cd5');

const web3 = new Web3 (new Web3.providers.HttpProvider('https://mainnet.infura.io/v3/7f7336b604014a63a4fe74c89f2d8cd5'));
const jwt = require('jsonwebtoken');
const walletAddress = '0x123abc456def'; // Assume this is the user's wallet address
const toAddress = '0x456abc123def'; // Assume this is the recipient's wallet address
// const PaymentProcessor = require('./PaymentProcessor');

const PaymentProcessor = require('./services/paymentProcessor');


async function createUserByEmail(connection, email, wallet) {
    return new Promise((resolve, reject) => {
        const query = 'SELECT * FROM users WHERE email = ?';
        connection.query(query, [email], (error, results) => {
            if (error) {
                reject(error);
            } else if (results.length > 0) {
                const user = new User(results[0].username, results[0].email, results[0].password, wallet);
                console.log('User found:', user);
                return resolve(user);
            } else {
                return resolve(null);
            }
        });
    });
}
// const exchangeService = require('./services/exchangeService');
// const exchangeService = new ExchangeService();
// const PaymentProcessor = require('./services/paymentProcessor');
// const paymentProcessor = new PaymentProcessor(blockchainInterface, exchangeService);

require('dotenv').config(); // Make sure this is at the top of your main file
const SECRET_KEY = process.env.JWT_SECRET_KEY;



// const paymentProcessor = new PaymentProcessor(blockchainInterface, exchangeService);

const connection = mysql2.createConnection({ // RETRIEVE YOUR DATABASE CREDENTIALS
    host: '88.200.64.122',
    user: 'hackaton',
    password: 'pepe',
    database: 'hackaton'
});const crypto = 'etherium';
const fiat = 'eur';
connection.connect(err => {
    if (err) throw err;
    console.log("Connected to the database successfully!");
});

app.use(express.json()); // Middleware to parse JSON bodies

// Middleware to attach db connection to the request
app.use((req, res, next) => {
    req.db = connection;
    next();
  });
  app.use(cors()); 

  

  app.get('/verify-wallet/:email', async (req, res) => {
    try {
        const email = req.params.email;
        const user = await User.findByEmail(connection, email);
        if (!user) {
            console.log('User not found');
            return res.status(404).send({ error: "User not found" });
        }

        const walletAddress = "0x123abc456def"; // Assume this is the user's wallet address
        if (!walletAddress) {
            console.error("Wallet address is undefined for user:", user);
            return res.status(400).send({ error: "Wallet address not found for user." });
        }

         else {
            console.log('Checking wallet balance...' + walletAddress)
            // CLAUSE: Not a valid Ethereum address SO we manually set the balance to 0 or smt else to test the code
        const balance =  1 //await web3.eth.getBalance(walletAddress);

        if (web3.utils.toBN(balance).isZero()) {
            console.log('This wallet has no balance');
            res.send({ status: 'inactive', message: "This wallet has no balance" });
        } else {
            console.log('This wallet is active with a balance');
            res.send({ status: 'active', message: "This wallet is active with a balance" });

        }
    }
    } catch (error) {
        console.error(error);
        res.status(500).send({ error: "Server error" });
    }
});

async function convertEurosToEthereum(euros) {
    const rate = await apiClient; // This function is defined in the previous step
    const eth = euros / rate;
    return eth;
}

app.post('/initiate-payment', async (req, res) => {
    const { email, toAddress, amount } = req.body;
    
    // console.log(email + ' ' +  toAddress+ ' ' + amount + ' '+walletAddress + crypto + fiat)
    try {
        // Fetch user by email to get the wallet address
        const user = await createUserByEmail(connection, email, walletAddress);
        if (!user ) {
            return res.status(404).send({ error: "User or wallet not found" });
        }

        // if it's a valid user, we can proceed with the payment
        console.log('Sending payment price: ' + amount + '€ to ' + toAddress + ' from ' + user.walletAddress );
        
        // Check the wallet balance or other conditions if necessary
        // const balance = await web3.eth.getBalance(user.walletAddress);
        // if (web3.utils.toBN(balance).isZero()) {
        //     return res.status(400).send({ error: "Insufficient wallet balance" });
        // }
        // const paymentProcessor = new PaymentProcessor(blockchainInterface, user);
        // const convertedAmount = await convertEurosToEthereum(amount);

        // Process the payment
        // const paymentResult = await paymentProcessor.processPayment(user.walletAddress, toAddress, convertedAmount);
        // if (paymentResult.success) {
        //     res.status(200).json({
        //         message: 'Transaction successful',
        //         details: paymentResult
        //     });
        // } else {
        //     res.status(400).send({ error: 'Transaction failed' });
        // }
        // send a response to the client to whether it succeeded ( true ) or not ( false )
        res.status(200).send({ success: true });
    } catch (error) {
        console.error('Error initiating payment:', error);
        res.status(500).send({ success: false });
    }
});

// Test Web3 functionality
console.log(web3.version);

web3.eth.net.isListening()
    .then(() => console.log('Successfully connected to the Ethereum network'))
    .catch(e => console.error('Something went wrong connecting to the Ethereum network:', e));


const PORT = process.env.PORT || 6500;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

app.use('/api', require('./routes/userRoute'));

console.log(User); // Check what is imported
User.findByEmail(connection, 'hackaton@gmail.com').then(user => {
    console.log(user);
}).catch(err => {
    console.error(err);
});

// Signing a JWT
const user = { id: 1, username: 'testuser' };
const secretKey = 'your_secret_key';

const token = jwt.sign(user, secretKey, { expiresIn: '1h' });

console.log(token);

// Verifying a JWT
jwt.verify(token, secretKey, (err, decoded) => {
  if (err) {
    console.error('JWT verification failed:', err);
  } else {
    console.log('Decoded JWT:', decoded);
  }
});


// Example usage: Process a payment
// (async () => {
//     try {
//         const fromAddress = '0x123...'; // Customer's address
//         const toAddress = '0xabc...'; // Merchant's address
//         const amount = 1; // Amount in Ether
//         const crypto = 'ETH';
//         const fiat = 'USD';

//         const result = await paymentProcessor.processPayment(fromAddress, toAddress, amount, crypto, fiat);
//         console.log("Payment processed:", result);
//     } catch (error) {
//         console.error("Error processing payment:", error);
//     }
// })();
/*app.post('/submit-transaction', async (req, res) => {
    try {
      const { signedTransaction, crypto, fiat } = req.body;
      const result = await paymentProcessor.processPayment(signedTransaction, crypto, fiat);
      res.send({
        message: 'Transaction processed successfully',
        data: result
      });
    } catch (error) {
      console.error('Error processing transaction:', error);
      res.status(500).send({
        message: 'Failed to process the transaction',
        error: error.toString()
      });
    }
  });
  */


