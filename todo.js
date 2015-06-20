$(function() {
  var auth = btoa(JSON.stringify({auth:'<your-auth>', token: '<your-token>'}));
  var machine = Machinary('<your-trymachines-api-url>', auth, ['raw', 'user', 'user.login', 'user.register']);

  $('body').on('submit', '#register-form', function() { //on register form submit call this function
    var _name = $("#register-form [name=name]").val(); //Get name form form
    var _username = $("#register-form [name=username]").val(); //Get username from form
    var _password = $("#register-form [name=password]").val(); //Get password from form
    var machine_object = { //this object will register the user with tryMachine's api.
        body:  {
          user: {
              username: _username, //save username
              password: _password, //save password
              info: {
                name: _name //save name
              }
          }
      }
    };
    machine.once('user.register', 'post', machine_object, function(result) { //this function will call tryMachine's api and register user
      //result object will be returned, if the user's has registered it will retun the auth method.
      if(!result.error) { //check if user has successfully registered.
        user_logged();
        localStorage.setItem('user.token', JSON.stringify(result.user.token));
        //machine.cookies('user.token', result.user.token); //save on cookes user's auth to the server.
      } else {
        alert('Ooops. Something went wrong...');
      }
    });
    return false;
  });
  $('body').on('submit', '#login-form', function() {
    console.log('submitted');
    var _username = $("#login-form [name=username]").val(); //Get username from form
    var _password = $("#login-form [name=password]").val(); //Get password from form
    machine.once('user.login', 'post', {
        body:  {
            user: {
                username: _username,
                password: _password
            }
        }
    }, function(result) {
      console.log(result);
      if(!result.error) {
        localStorage.setItem('user.token', JSON.stringify(result.user.token)); //Save user's token
        user_logged(); //Call user_logged function
      } else {
        alert('Username and/or Password wrong!');
      }
    });
    return false;
  });
  $('body').on('submit', '#add-task', function() {
      //e.preventDefault();
      var _task = $("#add-task [name=task]").val(); //Get task from form
      $("#add-task [name=task]").val(''); //Clean Task Input
      var machine_object = {
                        query: {
                            enableUser: true, //save user id on post data;
                            user: JSON.parse(localStorage.getItem('user.token')) //Get user's token and send to the API
                        },
                        body:  {
                            task: _task, //save on raw module a task name
                            done: false //save on raw module if the task it's done or not
                        }
                    };
      machine.once('user/raw', 'post',  machine_object, function(result) { //calls user and raw module.
        $("#task-list").prepend('<li data-id="'+result.generated_keys[0]+'">'+
                                '<input type="checkbox" class="done" value="'+result.generated_keys[0]+'">'+
                                _task+
                                '</li>'); //Display a task when inserted on database (raw module).
      });
      return false;
  });
  $('body').on('change', '.done', function() {
  var machine_object = {
                    query: {
                        id: $(this).val() //select an entry from server
                    },
                    body: {} //this object is where we set the data that should be updated or added
                };
    if($(this).is(":checked")) {
      $('[data-id='+$(this).val()+']').addClass('checked');
      machine_object.body.done = true; //set task done
      machine.update('user/raw', machine_object);
    } else {
      $('[data-id='+$(this).val()+']').removeClass('checked');
      machine_object.body.done = false; //set the task undone
      machine.update('user/raw', machine_object); //send to API machine_object and update object;
    }
  });
  var user_logged = function() { //this function will be called when a user is logged
    $('#register, #login').hide();
    $('#tasks').show();

    var machine_object = {
                      query: {
                          enableUser: true, //save user id on post data;
                          user: JSON.parse(localStorage.getItem('user.token')) //Get user's token and send to the API
                      }
                  };
    machine.once('user/raw', 'get', machine_object, function(result) {
      console.log('result', result);
      for(var key in result) {
        var done = result[key].done ? 'checked': '';
        $("#task-list").append('<li data-id="'+result[key].id+'" class="'+done+'">'+
                               '<input type="checkbox" class="done" '+done+' value="'+result[key].id+'">'+
                                result[key].task+
                                '</li>');
      }
    });
  }
  var user_not_logged = function() { //this function will be called when a user is not logged
    $('#register, #login').show();
    $('#tasks').hide();
  }
  if(localStorage.getItem('user.token') != null) //check if user is logged
    user_logged();
  else //when user is not logged call user_not_logged function
    user_not_logged();
});
