import {
  RippleAPI
} from 'ripple-lib';

const fetchAddressInfo = (myAddress) => {
  const api = new RippleAPI({
    server: 'wss://s.altnet.rippletest.net:51233',
  });
  return Async.runSync((done) => {
    api.connect().then(() => {
      return api.getAccountInfo(myAddress);
    }).then(info => {
      return api.disconnect() && done(null, info);
    }).catch((err) => {
      done(err);
    });
  })
};

const generateNewAccount = () => {
  const api = new RippleAPI({
    server: 'wss://s.altnet.rippletest.net:51233',
  });
  return Async.runSync((done) => {
    api.connect().then(() => {
      return api.generateFaucetWallet()
      // return api.generateXAddress({
      //   test: true,
      // });
    }).then(info => {
      return api.disconnect() && done(null, info);
    }).catch((err) => {
      done(err);
    });
  });
};

const getTransaction = (txId) => {
  const api = new RippleAPI({
    server: 'wss://s.altnet.rippletest.net:51233',
  });
  return Async.runSync((done) => {
    api.connect().then(() => {
      return api.getTransaction(txId.toUpperCase());
    }).then(info => {
      return api.disconnect() && done(null, info);
    }).catch((err) => {
      done(err);
    });
  });
};

const getBalanceFromAddress = (address) => {
  const api = new RippleAPI({
    server: 'wss://s.altnet.rippletest.net:51233',
  });
  return Async.runSync((done) => {
    api.connect().then(() => {
      return api.getBalances(address);
    }).then(info => {
      return api.disconnect() && done(null, info);
    }).catch((err) => {
      done(err);
    });
  });
};

const transfer = ({
  currency = 'XRP',
  amount,
  toAddress,
  senderAddress,
  senderPrivateKey,
  memos = [],
}) => {

  const payment = {
    source: {
      address: senderAddress,
      maxAmount: {
        currency,
        value: amount,
      }
    },
    destination: {
      address: toAddress,
      amount: {
        currency,
        value: amount,
      }
    },
    memos,
  }

  console.debug(payment);

  const api = new RippleAPI({
    server: 'wss://s.altnet.rippletest.net:51233',
  });
  return Async.runSync((done) => {
    api.connect().then(() => {
      return api.preparePayment(senderAddress, payment);
    }).then(prepared => {
      const {
        signedTransaction,
        id,
      } = api.sign(prepared.txJSON, senderPrivateKey);
      return {
        id,
        tx: api.submit(signedTransaction),
      }
    }).then(info => {
      return api.disconnect() && done(null, info);
    }).catch((err) => {
      done(err);
    });
  });
};

export {
  fetchAddressInfo,
  generateNewAccount,
  getTransaction,
  getBalanceFromAddress,
  transfer,
}