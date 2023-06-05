import Hero from "../Entities/Markets/Hero.js";
import MyHero from "../Entities/Users/MyHero.js";
import User from "../Entities/Users/User.js";
import Wallet from '../Entities/Users/Wallet.js';
import { Jwt, secret } from '../Configs/JwtConfigs.js';
import { DB, Op } from "../Configs/DbConfig.js";
import HeroTransaction from '../Entities/Transactions/HeroTransaction.js';
import Collection from "../Entities/Markets/Collection.js";
import Credential from "../Entities/Users/Credential.js";
import ProgressEvent from "../Entities/Event/ProgresEvent.js";
import EventTask from "../Entities/Event/EventTask.js";
import UserEvent from "../Entities/Event/UserEvent.js";


export async function BonusSignUp(user){
    try{
        let heroFree = await Hero.findOne({where: {
            [Op.and]: [
                {level: 0},{stock : 0}
            ]
        }});
        await MyHero.create({mUserId: user, mHeroId: heroFree.id});
    }catch(err){
        throw new Error(err.message);
    }
};

export async function GetMyHero(req, res){
    let token = Jwt.decode(req.header('auth-token'), secret);
    let page = req.query.page || 1;
    let size = req.query.size || 10;

    let skip = parseInt(parseInt(page) -1) * parseInt(size);
    try{
        let result = await MyHero.findAndCountAll({
            where: {
                [Op.and]: [
                    {mUserId: token.id}, {is_trade: false}
                ]
            },
            limit: parseInt(size),
            offset: skip,
            include: [{model: Hero, include:[{model: Collection}]}]
        });
        res.status(200).json({msg: 'get all My Hero success', statusCode: 200, data: result});
    }catch(err){
        return res.status(500).json({msg: err.message, statusCode: 500});
    }
};

export async function MyHeroInListing(req, res){
    let token = Jwt.decode(req.header('auth-token'), secret);
    let page = req.query.page || 1;
    let size = req.query.size || 10;

    let skip = parseInt(parseInt(page) -1) * parseInt(size);
    try{
        let result = await MyHero.findAndCountAll({
            where: {
                [Op.and]: [
                    {mUserId: token.id},{is_trade: true}
                ]
            },
            limit: parseInt(size),
            offset: skip,
            include: [{model: Hero,include:[{model: Collection}]}]
        });
        res.status(200).json({msg: 'get all My Hero success', statusCode: 200, data: result});
    }catch(err){
        return res.status(500).json({msg: err.message, statusCode: 500});
    }
};

export async function GetAllHistoryMyHero(req, res){
    let token = Jwt.decode(req.header('auth-token'), secret);
    let page = req.query.page || 1;
    let size = req.query.size || 10;
    let skip = parseInt(parseInt(page) -1) * parseInt(size);
    try{
        let user = await User.findOne({
            where: {id: token.id},
            include: [{model: Credential}]
        })
        let result = await HeroTransaction.findAndCountAll({
            where: {
                [Op.or]: [
                    {mUserId: token.id},
                    {receiver: user.m_credential.email}
                ]
            },
            limit: parseInt(size),
            offset: skip,
            include: [{
                model: MyHero,
                include: [{
                    model: Hero
                }]
            }]
        })
        res.status(200).json({msg: 'get all history my wallet success', statusCode: 200, data: result});
    }catch(err){
        return res.status(500).json({msg: err.message, statusCode: 500});
    }
};

export async function CombineHero(req, res){
    let {my_hero_id_1, my_hero_id_2} = req.body;
    let token = Jwt.decode(req.header('auth-token'), secret);
    const t = await DB.transaction();
    
    try{
        let user = await User.findOne({
            where: {id: token.id},
            include: [{model: MyHero}]
        });
        let wallet = await Wallet.findOne({where: {mUserId: token.id}});
        if(user === null) return res.status(404).json({msg: 'User not found', statusCode: 404});

        let hero1 = user.m_my_heros.filter(e => e.id == my_hero_id_1);
        let hero2 = user.m_my_heros.filter(e => e.id == my_hero_id_2);

        let findHero = await Hero.findOne({where: {id: hero1[0].mHeroId}});
        let nextHero = await Hero.findOne({where: {level: findHero.level +1}});

        if(hero1.length == 0 || hero2.length == 0) {
            return res.status(404).json({msg: 'you need 2 hero with same level to combine', statusCode: 404});
        }
        if(hero1[0].my_point != findHero.max_point || hero2[0].my_point != findHero.max_point){
            return res.status(403).json({msg: 'Youre point heroes not Max', statusCode: 403});
        }
        if(nextHero === null) return res.status(404).json({msg: 'Sorry for now we not have more higher hero level', statusCode: 404});

        await MyHero.destroy({where: {id: my_hero_id_1}}, {t});
        await MyHero.destroy({where: {id: my_hero_id_2}}, {t});
        findHero.stock += 2;
        nextHero.stock -= 1;
        wallet.balance -= parseInt(findHero.level *500);

        let result = await MyHero.create({mUserId: user.id, mHeroId: nextHero.id},{t});
        await findHero.save();
        await wallet.save();
        await nextHero.save();

        t.commit();
        res.status(201).json({msg: 'Congrats Combine Success, you get new Hero', statusCode: 201, data: result});
    }catch(err){
        t.rollback();
        return res.status(500).json({msg: err.message, statusCode: 500});
    }
};

export async function PlayGame(req, res){
    let myHeroId = req.params.myHeroId;
    
    try{
        let myHero = await MyHero.findOne({where: {id: myHeroId}});
        let wallet = await Wallet.findOne({where: {mUserId: myHero.mUserId}});
        let hero = await Hero.findOne({where: {id: myHero.mHeroId}});

        if(hero === null || wallet === null || myHero === null) return res.status(404).json({msg: 'invalid data. user_id, my_hero_id', statusCode: 404});
        if(myHero.my_point < hero.max_point){
            myHero.my_point += 1;
        };
        let tasks = await ProgressEvent.findAll({
            where: {
                [Op.and]: [
                    {"$m_user_event.mUserId$": myHero.mUserId},
                    {"$m_event_task.code_title$": 'play-game'}
                ]
            },
            include: [
                {model: EventTask},
                {model: UserEvent}
            ]
        });
        if(tasks !== null){
            for(let i = 0; i < tasks.length; i++){
                if(tasks[i].progress < tasks[i].m_event_task.total){
                    await ProgressEvent.update({progress: tasks[i].progress+1}, {where: {id: tasks[i].id}});
                }
            }
        }

        wallet.balance += parseInt(hero.power);
        await wallet.save();
        await myHero.save();

        res.status(200).json({msg: 'Balance changed', statusCode: 200, data: {
            my_point: myHero.my_point,
            my_balance: wallet.balance
        }});
    }catch(err){
        return res.status(500).json({msg: err.message, statusCode: 500});
    }
};