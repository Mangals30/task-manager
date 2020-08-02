const sgMail = require('@sendgrid/mail')
sgMail.setApiKey(process.env.SENDGRID_API_KEY)
const sendWelcomeMail  = (email,name) => {
  sgMail.send({
    to : email,
    from : 'mangalamshigoto@gmail.com',
    subject : 'Welcome to Our App',
    text : `Hi ${name}. Welcome to our App. Lets know how its going`
  
  })
}
const sendCancelMail = (email,name) => {
  sgMail.send({
    to : email,
    from : 'mangalamshigoto@gmail.com',
    subject : 'Cancellation Mail',
    text : `Hi ${name}. Please signup to get into Mail`
  
  })
}
module.exports = {
  sendWelcomeMail,
  sendCancelMail
}
