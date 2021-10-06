const updateLegacyEmail = () => {
  const user = Meteor.user();
  if (user && user.emails && user.emails[0] && user.emails[0].address) {
    const findLegacy = TrustedUsers.findOne({
      emails: user.emails[0].address,
    });
    if (findLegacy) {
      Meteor.call('user/getEmailByUserId', findLegacy.owner, (_, res) => {
        if (res) {
          Session.set('legacyOwnerEmail', res);
        }
      });
    }
  }
};

const getLegacy = () => {
  const user = Meteor.user();
  if (user && user.emails && user.emails[0] && user.emails[0].address) {
    return TrustedUsers.findOne({
      emails: user.emails[0].address,
    });
  }
};

Template.recovery.helpers({
  getAmountDistributed: () => {
    const user = Meteor.user();
    const legacy = getLegacy();
    return (legacy.distributionComplete && legacy.distribution.find((benef) => benef.beneficiary === user.emails[0].address).amount) || false;
  },
  legacy: () => {
    return getLegacy();
  },
  begunLegacyActivation: () => {
    const legacy = getLegacy();
    const user = Meteor.user();
    return legacy && legacy.activation && user && legacy.activation.includes(user._id);
  },
  getEmail: () => {
    const user = Meteor.user();
    return (user && user.emails && user.emails[0] &&
      user.emails[0].address)
  },
  user: () => Meteor.user(),
  getLegacyOwnerEmail: () => {
    updateLegacyEmail();
    return Session.get('legacyOwnerEmail');
  },
  viewRecoveryData: () => {
    return Session.get('recoveryData');
  },
  recoverLegacy: () => {
    const legacy = getLegacy();
    if (legacy) {
      Meteor.call('legacy/recover', legacy._id, (err, res) => {
        if (res) Session.set('recoveredLegacy', res);
      });
    }
    return Session.get('recoveredLegacy')
  },
});

Template.recovery.events({
  'click .view-recovery-data': (event) => {
    event.preventDefault();
    const legacy = getLegacy();
    if (Session.get('recoveryData')) {
      Session.set('recoveryData', null);
    } else {
      Meteor.call('crypto/getFileContents', legacy.recoveryTxId, (_, res) => {
        if (res) {
          Session.set('recoveryData', res);
        }
      })
    }
  },

  'click .begin-recovery': (event) => {
    event.preventDefault();
    console.log('begun recov 1')
    const legacy = getLegacy();
    console.log('begun recov 2')
    Meteor.call('legacy/optinRecovery', legacy._id, (err, res) => {
      if (err) {
        console.log(err);
      } else {
        console.log('got res')
        console.log(res)
        sAlert.success('Legacy recovery begun...', {
          position: 'top',
        })
      }
    });
  },
})

Template.recovery.onCreated(() => {
  delete Session.keys.recoveryData;
  Session.set('recoveredLegacy', null);
});