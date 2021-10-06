Template.login.events({
  'submit .login': (event) => {
    event.preventDefault();
    const email = $('#login-email').val();
    const pass = $('#login-password').val();
    Meteor.loginWithPassword(email, pass, (err) => {
      if (err) {
        sAlert.error(err.reason, {
          position: 'top',
        })
      } else {
        Router.go('dashboard');
      }
    });
  }
});

Template.login.onRendered(() => {
  Tracker.autorun(() => {
    if (Meteor.user()) {
      // User is already logged in
      Router.go('dashboard');
    }
  });
})