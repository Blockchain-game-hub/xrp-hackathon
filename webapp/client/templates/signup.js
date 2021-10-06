Template.signup.events({
  'submit .signup': (event) => {
    event.preventDefault();
    const email = $('#email').val();
    const password = $('#password').val();

    let signupData = {
      email,
      password,
      profile: {
        lastModified: new Date(),
        createdAt: new Date(),
      },
    };

    console.log('Creating account...');
    $('.create-btn').prop('disabled', true);
    Accounts.createUser(signupData, (err) => {
      $('.create-btn').prop('disabled', false);
      console.log('User creation process');
      if (err) {
        console.log('Error');
        console.log(err.reason);
        sAlert.error(err.reason, {
          position: 'top',
        })
      } else {
        // User created successfully
        console.log('Created');
        sAlert.success('Account created!', {
          position: 'top',
        });
      }
    });
  },

});

Template.signup.onRendered(() => {
  Tracker.autorun(() => {
    if (Meteor.user()) {
      // User is already logged in
      Router.go('dashboard');
    }
  });
});