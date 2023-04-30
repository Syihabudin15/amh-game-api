import User from "../Entities/Users/User.js";
import Credential from "../Entities/Users/Credential.js";
import { Jwt, secret } from "../Configs/JwtConfigs.js";

export async function CreateUser(user){
    let result = await User.create(user);
    return result;
};

export async function UpdateUser(req, res){
    let token = Jwt.decode(req.header('auth-token'), secret);
    try{
        let result = await User.update(req.body, {where: {id: token.id}});
        let findUser = await User.findOne({
            where: {id: token.id},
            attributes: ['id','firstName', 'lastName', 'phone'],
            include: [{
                model: Credential,
                attributes: ['id', 'email', 'role']
                }]
        });
        if(result[0] == 1){
            res.status(200).json({msg: 'Update success', statusCode: 200, data: findUser});
        }else if(result[0] == 0){
            return res.status(404).json({msg: 'User not found', statusCode: 404});
        }else{
            return res.status(400).json({msg: 'Bad Requeest. your input data is same with before', statusCode: 400});
        }
    }catch(err){
        return res.status(500).json({msg: err.message, statusCode: 500});
    }
};

export async function GetUserById(req, res){
    let userId = req.params.userId;
    try{
        let find = await User.findOne({
            where: {id: userId},
            include: [{
                model: Credential,
                attributes: ['id', 'email', 'role']
                }]
        });
        if(find === null) return res.status(404).json({msg: 'User not found', statusCode: 404});

        res.status(200).json({msg: 'Get User by email success', statusCode: 200, data: find});
    }catch(err){
        return res.status(500).json({msg: err.message, statusCode: 500});
    }
};

export async function GetMySelf(req, res){
    let token = Jwt.decode(req.header('auth-token'), secret);
    try{
        let find = await User.findOne({
            include: [{
                model: Credential,
                where: {email: token.email},
                attributes: ['id', 'email', 'role']
                }]
        });
        if(find === null) return res.status(404).json({msg: 'User not found', statusCode: 404});

        res.status(200).json({msg: 'Get User by email success', statusCode: 200, data: find});
    }catch(err){
        return res.status(500).json({msg: err.message, statusCode: 500});
    }
};