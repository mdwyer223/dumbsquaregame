var nodemailer = require('nodemailer');
var config = require('../config');

var mail = {};

mail.sendmail = function(subject, message) {
  let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: config.email.user,
      pass: config.email.pass
    }
  });

  let mailOptions = {
    from: config.email.user,
    to: config.email.user,
    subject: subject,
    text: message
  };

  transporter.sendMail(mailOptions, function(err, info) {
    if (err) {
      console.log(err);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });
};

module.exports = mail;