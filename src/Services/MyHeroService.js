import Hero from "../Entities/Markets/Hero.js";
import MyHero from "../Entities/Users/MyHero.js";
import User from "../Entities/Users/User.js";
import Wallet from '../Entities/Users/Wallet.js';
import { Jwt, secret } from '../Configs/JwtConfigs.js';
import { DB, Op } from "../Configs/DbConfig.js";

const t = await DB.transaction();
export async function BonusSignUp(user){
    try{
        let heroFree = await Hero.findOne({where: {level: 0}});
        await MyHero.create({mUserId: user, mHeroId: heroFree.id});
    }catch(err){
        throw new Error(err.message);
    }
};

export async function GetMyHero(req, res){
    let token = Jwt.decode(req.header('auth-token'), secret);
    
    try{
        let result = await MyHero.findAll({
            where: {mUserId: token.id},
            include: [{model: Hero}]
        });
        res.status(200).json({msg: 'get all My Hero success', statusCode: 200, data: result});
    }catch(err){
        return res.status(500).json({msg: err.message, statusCode: 500});
    }
};

export async function CombineHero(req, res){
    let {my_hero_id_1, my_hero_id_2} = req.body;
    let token = Jwt.decode(req.header('auth-token'), secret);
    
    try{
        let user = await User.findOne({
            where: {id: token.id},
            include: [{model: MyHero}]
        });
        if(user === null) return res.status(404).json({msg: 'User not found', statusCode: 404});

        let hero1 = user.m_my_heros.filter(e => e.id == my_hero_id_1);
        let hero2 = user.m_my_heros.filter(e => e.id == my_hero_id_2);

        let findHero = await Hero.findOne({where: {id: hero1[0].mHeroId}});
        let nextHero = await Hero.findOne({where: {level: parseInt(findHero.level +1)}});

        if(hero1.length == 0 || hero2.length == 0) {
            return res.status(404).json({msg: 'Youre hero is not found', statusCode: 404});
        }
        if(hero1[0].my_point != findHero.max_point && hero2[0].my_point != findHero.max_point){
            return res.status(403).json({msg: 'Youre point heroes not Max', statusCode: 403});
        }

        await MyHero.destroy({
            where: {
                id: {
                    [Op.or]: [hero1[0].id, hero2[0].id]
                }
            }
        }, {transaction: t});

        let result = await MyHero.create({mUserId: user.id, mHeroId: nextHero.id},{transaction: t});
        

        await t.commit();
        res.status(200).json({msg: 'Combine Success', statusCode: 200, data: result});
    }catch(err){
        await t.rollback();
        return res.status(500).json({msg: err.message, statusCode: 500});
    }
};

export async function PlayGame(req, res){
    let myHeroId = req.params.myHeroId;
    try{
        let myHero = await MyHero.findOne({where: {id: myHeroId}});
        let wallet = await Wallet.findOne({where: {mUserId: myHero.mUserId}});
        let hero = await Hero.findOne({where: {id: myHero.mHeroId}});

        if(hero == null || wallet == null || myHero == null) return res.status(404).json({msg: 'invalid data. user_id, my_hero_id', statusCode: 404});
        if(myHero.my_point < hero.max_point){
            myHero.my_point += 1;
            await myHero.save();
        };
        wallet.balance += hero.power;
        await wallet.save();

        res.status(200).json({msg: 'Balance changed', statusCode: 200, data: {
            my_point: myHero.my_point
        }});
    }catch(err){
        return res.status(500).json({msg: err.message, statusCode: 500});
    }
};