import Card from '../Entities/Users/Card.js';
import { DB, Op } from '../Configs/DbConfig.js';
import { Jwt, secret } from '../Configs/JwtConfigs.js';

export async function CreateCard(req, res){
    let token = Jwt.decode(req.header('auth-token'), secret);
    let {name, no_card} = req.body;
    const t = await DB.transaction();

    if(name === null || no_card === null){
        return res.status(400).json({msg: 'Bad request. name, no_card', statusCode: 400});
    }
    try{
        let find = await Card.findOne({
            where: {name: name, no_card: no_card}
        });
        if(find) return res.status(400).json({msg: 'You are alredy have that Card', statusCode: 400});
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
        let result = await Card.findAll({where: {mUserId: token.id}});
        res.status(200).json({msg: 'get my card success', statusCode: 200, data: result});
    }catch(err){
        return res.status(500).json({msg: err.message, statusCode: 500});
    }
};

export async function DeleteCard(req, res){
    let id = req.params.id;
    if(id === null) return res.status(400).json({msg: 'Bad request', statusCode: 400});
    try{
        await Card.destroy({where: {id: id}});
        res.status(200).json({msg: 'Delete Card Success', statusCode: 200});
    }catch(err){
        return res.status(500).json({msg: err.message, statusCode: 500});
    }
}