import { SendEmail } from "../Configs/Mailer.js";
import User from "../Entities/Users/User.js";
import Credential from "../Entities/Users/Credential.js";
import { Jwt, secret } from "../Configs/JwtConfigs.js";


let otp = parseInt(Math.floor(Math.random() * 1000000));

export async function RequestOtp(req, res){
    let token = Jwt.decode(req.header('auth-token'), secret);
    try{
        let user = await User.findOne({
            where: {id: token.id},
            include: [{
                model: Credential,
            }]
        });
        if(user === null) return res.status(404).json({msg: 'User not found', statusCode: 404});

        await SendEmail(
            user.m_credential.email,
            'OTP Code from AMH GAME',
            `<p>Thanks for your Registration. your OTP Code is :<p/>
            <h2>${otp}</h2>`
        );
        
        res.status(200).json({msg: 'OTP has sent', statusCode: 200});
    }catch(err){
        return res.status(500).json({msg: err.message, statusCode: 500});
    }
};


export async function VerifyOtp(req, res){
    let token = Jwt.decode(req.header('auth-token'), secret);
    let {otpCode} = req.body;

    try{
        let user = await User.findOne({where: {id: token.id}});
        if(user === null) return res.status(404).json({msg: 'User not Found', statusCode: 404});
        if(otpCode != otp) return res.status(400).json({msg: 'OTP code doest not match', statusCode: 400});
        
        user.verified = true;
        await user.save();

        res.status(200).json({msg: 'success user has verified', statusCode: 200});
    }catch(err){
        return res.status(500).json({msg: err.message, statusCode: 500});
    }
};