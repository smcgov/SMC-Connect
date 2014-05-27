// Manages behavior of feedback form
define(['util/util','trim','jquery'],function(util,trim,$) {
  'use strict';

  // PRIVATE PROPERTIES
  var _sendBtn;
  var _feedbackStatus;

  var _commentInput;
  var _emailInput;

  // PUBLIC METHODS
  function init()
  {
    _sendBtn = document.getElementById('feedback-form-btn');
    _sendBtn.addEventListener("click",_sendBtnClicked,false);

    _feedbackStatus = document.getElementById('feedback-status');

    _commentInput = document.querySelector('#feedback-box #comment');
    _emailInput = document.querySelector('#feedback-box #email');

    if (util.isEventSupported('input'))
    {
      _commentInput.addEventListener('input', _onFeedbackFormInput);
      _emailInput.addEventListener('input', _onFeedbackFormInput);
    }
    else
    {
      _sendBtn.disabled = '';
    }
  }

  // the form is being hidden, hide the feedback status
  function hide()
  {
    _feedbackStatus.classList.add('hide');
    _updateFeedbackForm();
  }

  // PRIVATE PROPERTIES
  function _sendBtnClicked(evt)
  {
    evt.preventDefault(); // stop the form from submitting
    var emailCheck = new RegExp('.+@.+\..+','i'); // jshint ignore:line
    var match = emailCheck.exec(_emailInput.value);
    if (match || _emailInput.value === '')
      _feedbackFormSend();
    else
      _incorrectEmailAddress();
    return false;
  }

  function _onFeedbackFormInput(evt)
  {
    _updateFeedbackForm();
  }

  function _isFeedbackFormMessagePresent() {
    var message = _commentInput.value;
    message = message.trim();

    if (util.isEventSupported('input'))
    {
      return message.length > 0;
    }
    else
    {
      return true;
    }
  }

  function _updateFeedbackForm() {
    if (_isFeedbackFormMessagePresent()) {
      _sendBtn.disabled = false;
    } else {
      _sendBtn.disabled = true;
    }
  }

  function _feedbackFormSend()
  {
    var agent = '\nUser agent: ' + navigator.userAgent;

    var transmission = {
      message: _commentInput.value,
      from: _emailInput.value,
      agent: agent
    };

    $.ajax({
        url     : '/feedback',
        type    : 'POST',
        dataType: 'json',
        data    : JSON.stringify(transmission),
        contentType: 'application/json',
        success : _onSuccess,
        error   : _onError
      });

  }

  // on submitting success, clear out values and post success message.
  function _onSuccess(data)
  {
    _feedbackStatus.innerHTML = "Thanks for the feedback!";
    _feedbackStatus.classList.remove('hide');
    _commentInput.value = '';
    _updateFeedbackForm();
  }

  // on submitting error, clear out values and post failure message.
  function _onError(xhr, err)
  {
    _feedbackStatus.innerHTML = "Error sending feedback, please <a href='/'>reload</a> and try again!";
    _feedbackStatus.classList.remove('hide');
    _commentInput.value = '';
    _emailInput.value = '';
    _updateFeedbackForm();
  }

  // incorrect email address. Show error message.
  function _incorrectEmailAddress()
  {
    _feedbackStatus.innerHTML = "Your email address appears to be formatted incorrectly, please try again!";
    _feedbackStatus.classList.remove('hide');
    _emailInput.value = '';
  }

  return {
    init:init,
    hide:hide
  };
});