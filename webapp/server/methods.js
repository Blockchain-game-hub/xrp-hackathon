import {
  Meteor
} from 'meteor/meteor';

import AESHelper from '/imports/server/AESHelper';
import XRPHelper from '/imports/server/XRPHelper';

Meteor.startup(() => {
  // Generate new faucet server address if current hardcoded address is empty
  const {
    ADDRESS: address
  } = Meteor.settings.XRP;
  
  if (XRPHelper.getBalanceFromAddress(address).error) {
    console.log('Generating new server faucet address')
    const newWalletDetails = XRPHelper.generateNewAccount()?.result?.account;

    Meteor.settings.XRP.ADDRESS = newWalletDetails.xAddress;
    Meteor.settings.XRP.SECRET = newWalletDetails.secret;
    console.log(Meteor.settings.XRP);
  }

  /* Debugging functionality */
  // console.log(XRPHelper.fetchAddressInfo(Meteor.settings.XRP.ADDRESS));
  // const newAddress = XRPHelper.generateNewAccount();
  // console.log(newAddress);
  // console.log(XRPHelper.getTransaction('db63db2afb4db4321ca35e9cac7953d30d80e33aabd928924a450039907cb955'))
  // console.log(XRPHelper.getBalanceFromAddress(Meteor.settings.XRP.ADDRESS));
  // console.log(XRPHelper.transfer({
  //   amount: '10',
  //   toAddress: newAddress,
  //   senderAddress: Meteor.settings.XRP.ADDRESS,
  //   senderPrivateKey: Meteor.settings.XRP.SECRET,
  //   memos: [{
  //     data: 'Test memo', 
  //   }]
  // }))
});

const getFileContents = (txId) => {
  const encodedFileContent = XRPHelper.getTransaction(txId)?.result?.specification?.memos?.[0]?.data;
  const fileContents = decodeURIComponent(encodedFileContent);
  console.log('Retrieved filecontents', fileContents);
  return fileContents;
}

Meteor.users.after.insert(function (_, doc) {
  // On user creation, create them a wallet
  Meteor.call('user/generateWalletDetails', doc._id)
});

Meteor.methods({
  'crypto/getFileContents': (txId) => {
    return getFileContents(txId);
  },

  'legacy/recover': (legacyId) => {
    const legacy = TrustedUsers.findOne(legacyId);
    const user = Meteor.user();
    if (!legacy || !user) throw new Meteor.Error(404, 'Unable to update this legacy.');
    const owner = Meteor.users.findOne(legacy.owner);

    if (!legacy.distributionComplete) {
      // Update estateup so we don't double distrib
      TrustedUsers.update(legacyId, {
        $set: {
          distributionComplete: true,
          distributionAt: new Date(),
        },
      });
    }

    const fileContents = getFileContents(legacy.legacyTxId);
    console.log('beginning recovery')
    console.log(fileContents)
    const jsonShamir = JSON.parse(fileContents);
    const activatedPieces = [];
    const reconstructed = [];
    jsonShamir.forEach((shamirPiece) => {
      const shamirId = Object.keys(shamirPiece)[0];

      const findUser = Meteor.users.findOne(shamirId);
      const encryptedPiece = (Object.values(shamirPiece)[0]).toString();
      const decryptedPiece = AESHelper.decrypt(encryptedPiece.toString(), findUser.profile.wallet.secret).toString();
      reconstructed.push(decryptedPiece);
      if (legacy.activation.includes(shamirId)) {
        activatedPieces.push(decryptedPiece);
      }

    });
    if (activatedPieces.length !== 2) {
      throw new Meteor.Error(403, 'You are not allowed to view this');
    }

    const req = HTTP.post(`${Meteor.settings.SHAMIR_API}/recover`, {
      headers: {
        'Content-Type': 'application/json',
      },
      data: {
        indexes: activatedPieces,
        wholeShamir: reconstructed
      }
    });

    if (req.statusCode !== 200) {
      throw new Meteor.Error(400, 'Unable to resolve legacy');
    }
    return JSON.parse(req.content).success;
  },

  'user/generateWalletDetails': (userId) => {
    const newWalletDetails = XRPHelper.generateNewAccount()?.result?.account;
    console.log(`Generating wallet for ${userId}`);
    console.log(newWalletDetails)
    Meteor.users.update(userId, {
      $set: {
        'profile.wallet': newWalletDetails,
        'profile.hasWallet': true,
      },
    });
  },

  'crypto/getBalance': () => {
    const user = Meteor.user();
    if (!user) throw new Meteor.Error(404, 'User not found');
    if (user.profile.wallet) {
      const {
        xAddress: address,
      } = user.profile.wallet;
      console.log('attempting to pull balance for ' + address);
      const bal = XRPHelper.getBalanceFromAddress(address)?.result?.find((results) => results.currency === 'XRP').value;
      return Number(bal);
    }
    return 0;
  },

  'user/getEmailByUserId': (userId) => {
    return Meteor.users.findOne(userId).emails[0].address;
  },


  'user/addTrustedEmails': (emails) => {
    const user = Meteor.user();
    if (!user) throw new Meteor.Error(404, 'User not found.');
    console.log(emails);
    emails.forEach((email) => {
      const userExists = Meteor.users.findOne({
        'emails.address': email,
      });
      if (!userExists) {
        console.log(`${email} doesn't exist`);
        throw new Meteor.Error(403, `All four beneficiaries must signup to EstateUp. ${email} has not signed up yet.`);
      }
    });
    console.log('All emails exist');
    const trustedUserData = {
      owner: user._id,
      emails,
    };

    return TrustedUsers.insert(trustedUserData);
  },

  'user/saveNewLegacy': (legacy) => {
    const user = Meteor.user();
    if (!user) throw new Meteor.Error(404, 'User not found');
    const req = HTTP.post(
      `${Meteor.settings.SHAMIR_API}/split`, {
        headers: {
          'Content-Type': 'application/json',
        },
        data: {
          textInput: legacy,
        },
      },
    );
    if (req.statusCode !== 200) {
      throw new Meteor.Error(404, 'Unable to Shamir split legacy');
    }
    const response = JSON.parse(req.content);
    const {
      success
    } = response;

    const trusted = TrustedUsers.findOne({
      owner: user._id
    });
    if (!trusted) throw new Meteor.Error(404, 'You must appoint 4 trusted members');

    // We store encrypted whole content so owner can edit/view
    const encLegacy = AESHelper.encrypt(legacy.toString(), user.profile.wallet.secret);
    TrustedUsers.update(trusted._id, {
      $set: {
        legacy: encLegacy,
        lastModified: new Date(),
      }
    });


    // Let's split up each of the shards between each four members using Shamirs
    let finalPost = [];
    trusted.emails.forEach((trustedUserEmail, index) => {
      console.log(`CURRENT PIECE: ${trustedUserEmail}-${success[index]}`);
      const findUser = Meteor.users.findOne({
        'emails.address': trustedUserEmail,
      });
      const cipherPiece = AESHelper.encrypt(success[index].toString(), findUser.profile.wallet.secret);

      finalPost.push({
        [findUser._id]: cipherPiece.toString('base64'),
      });
    });

    const saved = Async.runSync(function (done) {
      Meteor.call('crypto/createNewFile', JSON.stringify(finalPost), (_, res) => {
        if (res) {
          TrustedUsers.update(trusted._id, {
            $set: {
              legacyTxId: res,
            }
          });
          done(null, res);
        }
      });
    });
    return saved;
  },

  'crypto/getLegacy': () => {
    const user = Meteor.user();
    if (!user) throw new Meteor.Error(404, 'User not found');
    const legacy = TrustedUsers.findOne({
      owner: user._id,
    });
    if (!legacy) throw new Meteor.Error(404, 'Can\'t find your legacy');
    if (!legacy.legacy) {
      throw new Meteor.Error(404, 'Legacy has not been set yet');
    }

    const decrypted = AESHelper.decrypt(legacy.legacy, user.profile.wallet.secret).toString();
    return decrypted;
  },

  'crypto/createNewFile': (textInput) => {
    const user = Meteor.user();
    if (!user) throw new Meteor.Error(404, 'User not found');

    // Create new TX, use plaintext as message
    const tx = XRPHelper.transfer({
      amount: '10',
      toAddress: user.profile.wallet.xAddress,
      senderAddress: Meteor.settings.XRP.ADDRESS,
      senderPrivateKey: Meteor.settings.XRP.SECRET,
      memos: [{
        data: encodeURIComponent(textInput),
      }]
    }).result.id;

    return tx;
  },

  'legacy/optinRecovery': (legacyId) => {
    const legacy = TrustedUsers.findOne(legacyId);
    const user = Meteor.user();
    if (!legacy || !user) throw new Meteor.Error(404, 'Unable to update this legacy.');
    if (!legacy.activation) {
      return TrustedUsers.update(legacyId, {
        $addToSet: {
          activation: user._id,
        },
        $set: {
          lastModified: new Date(),
        },
      });
    } else if (legacy.activation && legacy.activation.length === 1) {
      const currentActivators = legacy.activation;
      currentActivators.push(user._id);
      const recoveryTxId = Async.runSync(function (done) {
        Meteor.call('crypto/createNewFile', JSON.stringify({
          legacyId: legacy.legacyTxId,
          recoveredAt: new Date(),
          recoveredBy: currentActivators
        }), (_, res) => {
          if (res) done(null, res);
        });

      }).result;
      return TrustedUsers.update(legacyId, {
        $addToSet: {
          activation: user._id,
        },
        $set: {
          recoveryTxId,
          lastModified: new Date(),
          hasRecovered: true,
        },
      });
    } else {
      throw new Meteor.Error(403, 'You are unable to recover this legacy.');
    }
  },
})