// Callback for after Google signin
function onSignIn(googleUser) {
  var profile = googleUser.getBasicProfile();
  // Fill form with Google user data
  $("input[name='name']").val(profile.getName());
  $("input[name='email']").val(profile.getEmail());
  $('.g-signin2').hide();
  $('#nova-form').fadeIn();
}

// After application is complete, hide form and show Nova message
function showResult(message) {
  $('#nova-form').fadeOut('slow', function() {
    $('#helper-message').html(message);
  });
}

// Make call to Nova servers to process user application
function processForm(event){
  $('#submit-button').html('Loading...');
  $.ajax({
    url: '/api/submit',
    dataType: 'text json',
    type: 'post',
    contentType: 'application/x-www-form-urlencoded',
    data: $(this).serialize(),
      success: function(data, textStatus, jQxhr){
        setTimeout(function() {
          // Communicate application result to lender's DOM
          parent.postMessage(data['status'], 'https://nova-lender-server.herokuapp.com');
          showResult(data['message']);
        }, 1000);
      },
      error: function(jqXhr, textStatus, errorThrown){
        // Server error fallback
        var submitButton = $('#nova-form button');
        submitButton.addClass('btn-info');
        submitButton.html('Server Error. Please try')
      }
  });
  event.preventDefault();
}

$('#nova-form').submit(processForm);
