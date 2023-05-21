import { DB } from '../Configs/DbConfig.js';
import Event from '../Entities/Event/Event.js';
import EventTask from '../Entities/Event/EventTask.js';
import Hero from '../Entities/Markets/Hero.js';
import { secret, Jwt } from '../Configs/JwtConfigs.js';
import UserEvent from '../Entities/Event/UserEvent.js';
import ProgressEvent from '../Entities/Event/ProgresEvent.js';

export async function CreateEvent(req, res){
    let {name, description, total_reward, reward, tasks} = req.body;
    let img_event = req.file.filename || '';
    const t = await DB.transaction();
    if(img_event === '') return res.status(400).json({msg: 'Image is Required', statusCode: 400});
    if(name === null || description === null || total_reward === null ||
        reward === null) return res.status(400).json({msg: 'Bad request. name, description, total reward, reward'});
    try{
        let hero = await Hero.findOne({where: {id: reward}});
        if(hero === null) return res.status(404).json({msg: 'Hero Rewaed not found', statusCode: 404});

        let result = await Event.create({name, description, total_reward, mHeroId: hero.id}, {t});
        for(let i = 0; i < tasks.length; i++){
            await EventTask.findOne({title: tasks[i].title, total: tasks[i].total, code_title: tasks[i].code_title, mEventId: result.id}, {t});
        }

        t.commit();
        res.status(201).json({msg: 'Create Event Success', statusCode: 201, data: result});
    }catch(err){
        t.rollback();
        return res.status(500).json({msg: err.message, statusCode: 500});
    }
};

export async function GetAllActiveEvent(req, res){
    let page = req.query.page || 1;
    let size = req.query.size || 3;
    try{
        let skip = parseInt(parseInt(page) -1) * parseInt(size);
        let result = await Event.findAll({
            where: {is_active: true},
            limit: parseInt(size),
            offset: skip,
            include: [
                {model: Hero},
                {model: EventTask}]
        });
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
            },{
                model: EventTask
            }],
        });
        res.status(200).json({msg: 'Get all Event Success', statusCode: 200, data: result});
    }catch(err){
        return res.status(500).json({msg: err.message, statusCode: 500});
    }
};

export async function JoinEvent(req, res){
    let token = Jwt.decode(req.header('auth-token'), secret);
    let eventId = req.params.eventId;
    const t = await DB.transaction();
    try{
        let event = await Event.findOne({where: {id: eventId}});
        if(event === null) return res.status(404).json({msg: 'Event Not Found', statusCode: 404});
        let getOrSave = await  UserEvent.findOne({where: {mEventId: eventId}});
        if(getOrSave !== null) return res.status(400).json({msg: 'You are alredy joined this Event', statusCode: 400});

        let myEvent = await UserEvent.create({mUserId: token.id, mEventId: event.id},{t});
        let task = await EventTask.findAll({where: {mEventId: eventId}});

        for(let i = o; i < task.length; i++){
            await ProgressEvent.create({mUserEventId: myEvent.id, mEventTaskId: task[i].id}, {t});
        }

        t.commit();
        res.status(201).json({msg: 'Join Event Success', statusCode: 201});
    }catch(err){
        t.rollback();
        return res.status(500).json({msg: err.message, statusCode: 500});
    }
};

export async function GetMyEvent(req, res){
    let token = Jwt.decode(req.header('auth-token'), secret);
    let size = req.query.size || 3;
    let page = req.query.page || 1;
    try{
        let skip = parseInt(parseInt(page) -1) * parseInt(size);
        let myEvent = UserEvent.findAndCountAll({
            where: {mUserId: token.id},
            limit: parseInt(size),
            offset: skip,
            include: [{
                model: Event
            },{
                model: ProgressEvent,
                include: [{model: EventTask}]
            }]
        });
        res.status(200).json({msg: 'get My Event Success', statusCode: 200, data: myEvent});
    }catch(err){
        return res.status(500).json({msg: err.message, statusCode: 500});
    }
};

export async function GetMyEventById(req, res){
    let id = req.params.id;
    try{
        let result = await UserEvent.findOne({
            where: {id: id},
            include: [{
                    model: Event,
                    include: [{model: Hero}]
                },{
                    model: ProgressEvent,
                    include: [{model: EventTask}]
                }]
        });
        res.status(200).json({msg: 'get My Event by Id Success', statusCode: 200, data: result});
    }catch(err){
        return res.status(500).json({msg: err.message, statusCode: 500});
    }
};