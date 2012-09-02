var User, Entry;

User = ko.resource('/users');

Entry = ko.resource('/entries', {
  created_at: '',
  activity: '',
  set: '',
  rep: '',
  note: '',
  value: '',
  author: ''
});

ko.app(function() {
  var app, current_user;

  app = this;

  app.map('#/(calendar/*)', function(context) {
    if(app.session('current_user') === undefined) {
      app.redirect('#/login');
    } else {
      if(current_user === undefined) {
        current_user = new User({ _id: app.session('current_user') });

        current_user.fetch(function(user) {
          console.log('User', user);

          if(user) {
            app.redirect(app.path);
          } else {
            context.flash = ko.observable('Ops! There was an error during your login, please try again.');
            app.session('current_user', null);
            app.redirect('#/login');
          }
        });

        app.render('loading');
      } else {
        return true;
      }
    }
  });

  app.map('#/', function(context) {
    var calendarSize = ($('body').width() / 120).toFixed() / 1 + 1;

    context.current_user = current_user;

    context.calendar = ko.observableArray([]);

    context.addCalendarRetroDates = function(start, dates) {
      if(dates > 0) {
        context.calendar.push(start);
        start.active = ko.observable(false);
        Entry.fetch({ author: current_user._id(), created_at: start.format('YYYY-MM-DD') }, function(entries) {
          if(entries.length > 0) {
            start.active(true);
          }
        });

        context.addCalendarRetroDates(moment(start).subtract('days', 1), dates - 1);
      }
    }

    context.calendarScrollHandler = function(self, e) {
      var threshold, items;

      threshold = $(e.target).find('ul').width() - $(e.target).width(),
      items = context.calendar().length;

      context.showBackToTodayButton(e.target.scrollLeft != 0);

      if(e.target.scrollLeft === threshold) {
        context.addCalendarRetroDates(moment().subtract('days', items), calendarSize);
      }
    };

    context.backToToday = function() {
      $('div.calendar').animate({scrollLeft: 0}, 200);
    };

    context.showBackToTodayButton = ko.observable(false);

    context.addCalendarRetroDates(moment(), calendarSize);

    app.render('home');
  });

  app.map('#/calendar/:date', function(context) {

    context.selectedDate = ko.observable(moment(app.params.date, 'YYYY-MM-DD'));

    context.entries = ko.observableArray([]);

    context.newEntry = ko.observable(new Entry());

    context.toggleNewEntryForm = function(self, e) {
      context.newEntryFormState(context.newEntryFormState() ? false : true);
    };

    context.newEntryFormState = ko.observable(false);

    context.addEntry = function() {
      var entry = context.newEntry();

      entry.author(current_user._id());
      entry.created_at(app.params.date);
      entry.save();

      context.entries.push(entry);
      context.toggleNewEntryForm();

      context.newEntry(new Entry());
    };

    context.removeEntry = function(entry) {
      context.entries.remove(entry);
      entry.destroy();
    };

    Entry.fetch({ author: current_user._id(), created_at: app.params.date }, function(entries) {
      context.entries(entries);
    });

    app.render('entries');
  });

  app.map('#/login', function(context) {
    var params;

    params = [
      'client_id=' + '455121904520277',
      'redirect_uri=' + location.href.split('#')[0],
      'scope=' + 'email',
      'response_type=token'
    ];

    context.url = 'https://www.facebook.com/dialog/oauth?' + params.join('&');

    app.render('login');
  });

  app.map('#/logout', function() {
    current_user = undefined;
    app.session('current_user', null);
    app.redirect('#/login');
  });

  app.map('#access_token=*', function() {
    var token = app.params.splat;

    $.getJSON('https://graph.facebook.com/me?access_token=' + token, function(facebook) {
      User.fetch({
        facebook_id: facebook.id
      }, function(users) {
        if(users.length > 0) {
          current_user = users[0];
        } else {
          current_user = new User({
            facebook_id: facebook.id,
            name: facebook.name,
            email: facebook.email
          });

          current_user.save();
        }

        app.session('current_user', current_user._id());
        app.redirect('#/');
      });
    });

    app.render('loading');
  });

  app.root = '#/';

  app.run();
});
