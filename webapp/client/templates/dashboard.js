const getWalletBalance = () => {
  Meteor.call('crypto/getBalance', (_, res) => {
    if (res) Session.set('currentWalletBalance', res);
  });
};

Template.dashboard.helpers({
  getExistingTokenAmount: (email) => {
    const legacy = TrustedUsers.findOne({
      owner: Meteor.userId(),
      distribution: {
        $exists: true
      }
    });
    if (legacy && legacy.distribution) {
      const existingBenef = legacy.distribution.find((dist) => dist.beneficiary === email);
      if (existingBenef) {
        return existingBenef.amount
      };
    }
  },

  isRecoveryUser: () => {
    const user = Meteor.user();
    if (user) {
      const findLegacy = TrustedUsers.findOne({
        emails: user.emails[0].address,
      });
      return findLegacy;
    }
  },
  getEmail: () => {
    if (Meteor.user()) return Meteor.user().emails[0].address;
  },
  user: () => Meteor.user(),

  hasReferrals: () => TrustedUsers.find({
    owner: Meteor.user()._id
  }).count() > 0,
  legacy: () => {
    const user = Meteor.user();
    const findLegacy = TrustedUsers.findOne({
      owner: user._id,
    });
    return findLegacy;
  },
  getExistingLegacy: () => {
    const legacy = TrustedUsers.find({
      owner: Meteor.user()._id
    });
    if (!legacy) return false;
    Meteor.call('crypto/getLegacy', (err, result) => {
      if (result) {
        $('#digital-legacy').val(result);
      }
    });
  },
});

Template.dashboard.events({
  'submit .trusted-members': (event) => {
    event.preventDefault();
    const email1 = $('#email1').val();
    const email2 = $('#email2').val();
    const email3 = $('#email3').val();
    const email4 = $('#email4').val();

    const emails = [
      email1,
      email2,
      email3,
      email4,
    ];

    Meteor.call('user/addTrustedEmails', emails, (err, result) => {
      if (err) {
        sAlert.error(err.reason, {
          position: 'top',
        });
      }
      if (result) {
        sAlert.success('Trusted members have been saved.', {
          position: 'top',
        });
      }
    });
  },

  'submit .legacy': (event) => {
    event.preventDefault();
    const legacy = $('#digital-legacy').val();
    $('#digital-legacy').attr('disabled', true);

    Meteor.call('user/saveNewLegacy', legacy, (err) => {
      $('#digital-legacy').attr('disabled', false);
      if (err) {
        sAlert.error(err.reason, {
          position: 'top',
        });
      } else {
        sAlert.success('Successfully saved', {
          position: 'top',
        })
      }

    });
  },
})

Template.dashboard.onCreated(() => {
  Session.set('currentWalletBalance', '0');
  getWalletBalance();
})

Template.dashboard.onRendered(() => {
  Tracker.autorun(() => {
    if (!Meteor.user()) {
      Router.go('/');
    }
  });
});