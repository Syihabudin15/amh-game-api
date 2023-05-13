import { CreateUser } from "./UserService.js";
import Credential from "../Entities/Users/Credential.js";
import bcrypt from 'bcryptjs';
import { JwtSign } from "../Configs/JwtConfigs.js";
import { CreateWallet } from "./WalletService.js";
import { BonusSignUp } from "./MyHeroService.js";
import User from "../Entities/Users/User.js";
import { DB } from "../Configs/DbConfig.js";


export async function SignUpUser(req, res){
    let {email, password, phone} = req.body;
    const t = await DB.transaction();
    if(email === null || password === null || phone === null || phone.length > 14) 
        return res.status(400).json({msg: 'Bad Request. email, password, phone', statusCode: 400});
    try{
        let hash = await bcrypt.hash(password, 10);
        let saveCred = await Credential.create({email: email.toLowerCase(), password: hash, role: 'player'},{t});
        let saveUser = await CreateUser({phone: phone, mCredentialId: saveCred.id});
        let saveWallet = await CreateWallet({no_wallet: `1138${saveUser.phone}`, mUserId: saveUser.id});

        await BonusSignUp(saveUser.id);
        t.commit();
        res.status(201).json({msg: 'User created', statusCode: 201, data: {id: saveCred.id, email: email, phone: saveUser.phone, role: saveCred.role}});
    }catch(err){
        t.rollback();
        return res.status(500).json({msg: err.message, statusCode: 500});
    }
};

export async function SignUpAdmin(req, res){
    let {email, password, phone} = req.body;
    const t = await DB.transaction();
    if(email === null || password === null || phone === null || phone.length > 14) 
        return res.status(400).json({msg: 'Bad Request. email, password, phone', statusCode: 400});
    try{
        let hash = await bcrypt.hash(password, 10);
        let saveCred = await Credential.create({email: email.toLowerCase(), password: hash, role: 'admin'});
        let saveUser = await CreateUser({phone: phone, mCredentialId: saveCred.id});
        let saveWallet = await CreateWallet({no_wallet: `1138${saveUser.phone}`, mUserId: saveUser.id});
        t.commit();
        res.status(201).json({msg: 'User created', statusCode: 201, data: {id: saveCred.id, email: email, phone: saveUser.phone, role: saveCred.role}});
    }catch(err){
        t.rollback();
        return res.status(500).json({msg: err.message, statusCode: 500});
    }
};

export async function SignIn(req, res){
    let {email, password} = req.body;
    if(email == null || password == null) return res.status(400).json({msg: 'Bad Request. email, password', statusCode: 400});
    try{
        let findCred = await Credential.findOne({
            where: {email: email.toLowerCase()},
            include: [{
                model: User
            }]
        });
        if(findCred === null) return res.status(404).json({msg: 'Email is not Registered', statusCode: 404});
        let verifyPass = await bcrypt.compare(password, findCred.password);
        if(!verifyPass) return res.status(401).json({msg: 'UnAuthorize', statusCode: 401});
        let data = {id: findCred.m_user.id, email: findCred.email, role: findCred.role};
        let token = JwtSign(data);

        res.status(200).json({msg: 'Sign in success', statusCode: 200, data: {data, token: token}});
    }catch(err){
        return res.status(500).json({msg: err.message, statusCode: 500});
    }
};