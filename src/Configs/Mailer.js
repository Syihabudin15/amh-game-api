import nodemailer from 'nodemailer';
import {} from 'dotenv/config';

const myEmail = process.env.GMAIL;
const password = process.env.PASS;
const transport = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    auth: {user: myEmail, pass: password}
});

export async function SendEmail(to, subject, message){
    let option = {
        from: 'AMH Dev "<amhgame97@gmail.com>"',
        to: to,
        subject: subject,
        html: message
    };

    try{
        let send = await transport.sendMail(option);
        return send;
    }catch(err){
        throw new Error(err.message);
    }
};