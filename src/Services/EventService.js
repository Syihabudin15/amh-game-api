import { DB, Op } from '../Configs/DbConfig.js';
import Event from '../Entities/Event.js';
import Hero from '../Entities/Markets/Hero.js';

export async function CreateEvent(req, res){
    let {name, description, total_reward, reward} = req.body;
    let img_event = req.file.filename || '';
    const t = await DB.transaction();
    if(img_event === '') return res.status(400).json({msg: 'Image is Required', statusCode: 400});
    if(name === null || description === null || total_reward === null ||
        reward === null) return res.status(400).json({msg: 'Bad request. name, description, total reward, reward'});
    try{
        let hero = await Hero.findOne({where: {id: reward}});
        if(hero === null) return res.status(404).json({msg: 'Hero Rewaed not found', statusCode: 404});

        let result = await Event.create({name, description, total_reward, mHeroId: hero.id});
        t.commit();
        res.status(201).json({msg: 'Create Event Success', statusCode: 201, data: result});
    }catch(err){
        t.rollback();
        return res.status(500).json({msg: err.message, statusCode: 500});
    }
};

export async function GetAllActioveEvent(req, res){
    try{
        let result = await Event.findAll({where: {is_active: true}, include: [{model: Hero}]});
        res.status(200).json({msg: 'Get all active Event Success', statusCode: 200, data: result});
    }catch(err){
        return res.status(500).json({msg: err.message, statusCode: 500});
    }
};

export async function GetAllEvent(req, res){
    let page = req.query.page || 1;
    let size = req.query.size || 10;
    try{
        let skip = parseInt(parseInt(page) -1) * parseInt(size);
        let result = await Event.findAndCountAll({
            limit: parseInt(size),
            offset: skip,
            include: [{
                model: Hero
            }]
        });
        res.status(200).json({msg: 'Get all Event Success', statusCode: 200, data: result});
    }catch(err){
        return res.status(500).json({msg: err.message, statusCode: 500});
    }
};

export async function JoinEvent(req, res){

};

export async function GetMyEvent(req, res){

};