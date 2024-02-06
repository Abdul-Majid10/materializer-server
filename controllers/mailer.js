import nodemailer from 'nodemailer';
import Mailgen from 'mailgen';
import dotenv from "dotenv";

dotenv.config();

//Node Mailer sender config
let mailConfig = {
    host: "smtp.gmail.com",
    service : 'gmail',
    port: 587,
    secure: false,
    auth : {
        "user": process.env.SENDER_EMAIL,
        "pass": process.env.SENDER_EMAIL_PASSWORD
    }
}

let transporter = nodemailer.createTransport(mailConfig);

let mailGenerator = new Mailgen({
    theme: "default",
    product : {
        name: "Materializer",
        link: 'https://materializer/'
    },
})

/** POST: http://localhost:8080/api/registration/registerMail 
 * @param: {
  "username" : "admin",
  "userEmail" : "fa19-bse-014@cuilahore.edu.pk",
  "text" : "",
  "subject" : "",
}
*/
export const registerMail = async (req, res) => {
    const { username, userEmail, text, subject } = req.body;

    // body of the email
    var email = {
        body : {
            name: username,
            intro : text || 'Welcom to Materializer Your accout is register successfully.'
        }
    }

    var emailBody = mailGenerator.generate(email);

    let message = {
        from : process.env.SENDER_EMAIL,
        to: userEmail,
        subject : subject || "Signup Successful",
        html : emailBody
    }

    // send mail
    transporter.sendMail(message)
        .then(() => {
            return res.status(200).send({ msg: "You should receive an email from us."})
        })
        .catch(error => res.status(500).send({ error }))

}
