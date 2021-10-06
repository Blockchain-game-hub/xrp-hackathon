const getWalletBalance = () => {
  Meteor.call('crypto/getBalance', (_, res) => {
    if (res) Session.set('currentWalletBalance', res);
  });
};

Template.walletCard.helpers({
  formattedAddress: (rawAddress) => {
    return rawAddress.split('-').join('');
  },

  user: () => Meteor.user(),
  getWalletBalance: () => {
    return Session.get('currentWalletBalance');
  },
  getCowTokenBalance: () => {
    return Session.get('currentTokenBalance') || 0;
  },
});

Template.walletCard.events({
  'click .refresh-balance': (event) => {
    event.preventDefault();
    getWalletBalance();
    sAlert.info('Refreshing wallet balance...', {
      position: 'top',
    });
  },
});

Template.walletCard.onRendered(() => {
  getWalletBalance();
})