Template.navbar.events({
  'click .logout': (event) => {
    event.preventDefault();
    console.log('Logout clicked')
    Meteor.logout(() => {
      Router.go('login');
      sAlert.info("You've been logged out.", {
        position: 'top',
      });
    });

  }
});