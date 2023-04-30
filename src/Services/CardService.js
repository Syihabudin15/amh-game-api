import Card from '../Entities/Users/Card.js';
import { DB } from '../Configs/DbConfig.js';
import { Jwt, secret } from '../Configs/JwtConfigs.js';

const t = await DB.transaction();

export async function CreateCard(req, res){
    let token = Jwt.decode(req.header('auth-token'), secret);
    let {name, no_card} = req.body;
    if(name === null || no_card === null) return res.status(400).json({msg: 'Bad request. name, no_card', statusCode: 400});
    try{
        let result = await Card.create({name: name, no_card: no_card, mUserId: token.id}, {t});
        t.commit();
        res.status(201).json({msg: 'Create Card success', statusCode: 201, data: result});
    }catch(err){
        t.rollback();
        return res.status(500).json({msg: err.message, statusCode: 500});
    }
};

export async function GetMyCard(req, res){
    let token = Jwt.decode(req.header('auth-token'), secret);
    
    try{
        let result = await Card.findOne({where: {mUserId: token.id}});
        if(result === null) return res.status(404).json({msg: 'Card not found', statusCode: 404});
        res.status(200).json({msg: 'get my card success', statusCode: 200, data: result});
    }catch(err){
        return res.status(500).json({msg: err.message, statusCode: 500});
    }
};