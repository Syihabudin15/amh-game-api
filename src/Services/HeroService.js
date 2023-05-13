import Hero from '../Entities/Markets/Hero.js';
import MyHero from '../Entities/Users/MyHero.js';
import { DB, Op } from '../Configs/DbConfig.js';
import { Jwt, secret } from '../Configs/JwtConfigs.js';
import Market from '../Entities/Markets/Market.js';
import HeroTransaction from '../Entities/Transactions/HeroTransaction.js';
import Wallet from '../Entities/Users/Wallet.js';
import User from '../Entities/Users/User.js';
import Credential from '../Entities/Users/Credential.js';
import Collection from '../Entities/Markets/Collection.js';


export async function CreateHero(req, res){
    let {level, supply, power, max_point, default_price, collection_id} = req.body;
    let img = req.file? req.file.filename : '';
    const t = await DB.transaction();

    if(level === null || power < 1 || max_point < 100 || default_price === null || img === ''){
        return res.status(400).json({msg: 'Bad request. level, supply, power, max_point, default_price', statusCode: 400});
    }
    try{
        let result = await Hero.create(
            {level: level, supply: supply, power: power, max_point: max_point, img: img, stock: supply, 
            default_price: default_price, mCollectionId: collection_id}, {t}
        );
        t.commit();
        res.status(201).json({msg: 'create Hero suceess', statusCode: 201, data: result});
    }catch(err){
        t.rollback();
        return res.status(500).json({msg: err.message, statusCode: 500});
    }
};

export async function GetHeroById(req, res){
    try{
        let result = await Hero.findOne({where: {id: req.params.id}, include: [{model: Collection}]});
        if(result == null) return res.status(404).json({msg: 'Hero not found', statusCode: 404});
        res.status(200).json({msg: 'get Hero success', statusCode: 200, data: result});
    }catch(err){
        return res.status(500).json({msg: err.message, statusCode: 500});
    }
};

export async function GetAllHero(req, res){
    let page = req.query.page || 1;
    let size = req.query.size || 10;
    try{
        let skip = parseInt(parseInt(page) -1) * parseInt(size);
        let result = await Hero.findAndCountAll({
            limit: parseInt(size),
            offset: skip
        });
        res.status(200).json({msg: 'get all Hero success', statusCode: 200, data: result});
    }catch(err){
        return res.status(500).json({msg: err.message, statusCode: 500});
    }
};

export async function GetAllMarketplace(req, res){
    let page = req.query.page || 1;
    let size = req.query.size || 10;
    try{
        let skip = parseInt(parseInt(page) -1) * parseInt(size);
        let result = await Market.findAndCountAll({
            where: {is_sold: false},
            limit: parseInt(size),
            offset: skip,
            include:[{
                model: MyHero,
                include: [{
                    model: Hero
                }]
            }]
        });
        res.status(200).json({msg: 'get all Hero success', statusCode: 200, data: result});
    }catch(err){
        return res.status(500).json({msg: err.message, statusCode: 500});
    }
};

export async function SearchByLevel(req, res){
    let level = req.query.level || 0;
    let page = req.query.page || 1;
    let size = req.query.size || 10;
    try{
        let skip = parseInt(parseInt(page) -1) * parseInt(size);
        let result = await Market.findAndCountAll({
            where: {
                is_sold: false
            },
            limit: parseInt(size),
            offset: skip,
            include: [{
                model: MyHero,
                include: [{
                    model: Hero,
                    where: {level: parseInt(level)}
                }]
            }]
        });
        res.status(200).json({msg: 'get all Hero success', statusCode: 200, data: result});
    }catch(err){
        return res.status(500).json({msg: err.message, statusCode: 500});
    }
};

export async function SearchByPrice(req, res){
    let min = req.query.min || 0;
    let max = req.query.max || 100000000;
    let page = req.query.page || 1;
    let size = req.query.size || 10;
    try{
        let skip = parseInt(parseInt(page) -1) * parseInt(size);
        let result = await Market.findAndCountAll({
            where: {
                price: {
                    [Op.between]: [parseInt(min), parseInt(max)]
                },
                is_sold: false
            },
            limit: parseInt(size),
            offset: skip,
            include:[{model: MyHero}]
        });
        res.status(200).json({msg: 'get all Hero success', statusCode: 200, data: result});
    }catch(err){
        return res.status(500).json({msg: err.message, statusCode: 500});
    }
};

export async function SeachHeroesByCollectionName(req, res){
    let page = req.query.page || 1;
    let size = req.query.size || 10;
    let name = req.query.name;
    try{
        let skip = parseInt(parseInt(page) -1) * parseInt(size);
        let result = await Market.findAndCountAll({
            where: {is_sold: false},
            limit: parseInt(size),
            offset: skip,
            include: [{
                model: MyHero,
                include: [{
                    model: Hero,
                    include: [{
                        model: Collection,
                        where: {
                            name: {
                                [Op.substring]: name
                            }
                        }
                    }]
                }]
            }]
        });
        res.status(200).json({msg: 'get all Hero success', statusCode: 200, data: result});
    }catch(err){
        return res.status(500).json({msg: err.message, statusCode: 500});
    }
};

export async function SendHero(req, res){
    let token = Jwt.decode(req.header('auth-token'), secret);
    let {myHeroId, receiver} = req.body;
    const t = await DB.transaction();

    try{
        let myHero = await MyHero.findOne({where: {id: myHeroId}});
        let target = await User.findOne({
            include: [{
                model: Credential,
                where: {email: receiver}
            }]
        });
        if(myHero === null) return res.status(404).json({msg: 'Youre hero not found', statusCode: 404});
        if(target === null) return res.status(404).json({msg: 'Email target is not found', statusCode: 404});
        if(myHero.is_trade === true) return res.status(403).json({msg: 'Sorry. Your Hero is in listing', statusCode: 403});
        if(myHero.mUserId !== token.id) return res.status(403).json({msg: 'Youre not allowed to send this Hero', statusCode: 403});
        if(target.id === token.id) return res.status(400).json({msg: 'Sorry youre input your email', statusCode: 400});
        
        let trans = await HeroTransaction.create({type: 'send', receiver: target.id, mMyHeroId: myHeroId, mUserId: token.id}, {t});
        myHero.mUserId = target.id;
        
        await myHero.save();
        t.commit();
        res.status(200).json({msg: 'Send success', statusCode: 200, data: trans});
    }catch(err){
        t.rollback();
        return res.status(500).json({msg: err.message, statusCode: 500});
    }
};

export async function SellHero(req, res){
    let token = Jwt.decode(req.header('auth-token'), secret);
    let {my_hero_id, price} = req.body;
    const t = await DB.transaction();

    try{
        let findMyHero = await MyHero.findOne(
            {
                where: {id: my_hero_id},
                include: [{model: Hero}]
            }
        );
        if(findMyHero === null) return res.status(404).json({msg: 'My Hero not found', statusCode: 404});
        if(findMyHero.mUserId !== token.id) return res.status(403).json({msg: 'Youre not allowed to send this Hero', statusCode: 403});
        if(findMyHero.m_hero.level === 0) return res.status(400).json({msg: 'Hero level 0 cant sell', statusCode: 400});

        let minPrice = parseInt(findMyHero.m_hero.default_price - (findMyHero.m_hero.level * 5000));
        if(price < minPrice) return res.status(400).json({msg: `price cannot lower than ${minPrice}`, statusCode: 400});

        findMyHero.is_trade = true;
        let listing = await Market.create({mMyHeroId: findMyHero.id, price: price},{t});

        await findMyHero.save();
        t.commit();
        res.status(201).json({msg: 'Listing Success', statusCode: 201, data: listing});
    }catch(err){
        t.rollback();
        return res.status(500).json({msg: err.message, statusCode: 500});
    }
};

export async function BuyHero(req, res){
    let token = Jwt.decode(req.header('auth-token'), secret);
    let marketId = req.params.marketId;
    const t = await DB.transaction();

    try{
        let buyer = await Wallet.findOne({where: {mUserId: token.id}});
        let findMarket = await Market.findOne({where: {id: marketId}, include: [{model: MyHero,include:[{model: Hero}]}]});
        let seller = await Wallet.findOne({where: {mUserId: findMarket.m_my_heros.mUserId}});

        if(findMarket === null) return res.status(404).json({msg: 'Market not found', statusCode: 404});
        if(findMarket.is_sold === true) return res.status(403).json({msg: 'Hero has sold out', statusCode: 403});
        if(buyer.balance < findMarket.price) return res.status(400).json({msg: 'Balance not enough', statusCode: 400});
        if(buyer.mUserId === seller.mUserId) return res.status(403).json({msg: 'Cannot buy youre hero'});
        
        findMarket.is_sold = true;
        buyer.balance -= findMarket.price;
        seller.balance += parseInt(findMarket.price - 2000);
        let result = await MyHero.update({
            mUserId: token.id,
            is_trade: false
        },{where: {id: findMarket.mMyHeroId}});

        if(result[0] == 1){
            
            await findMarket.save();
            await buyer.save();
            await seller.save();
            await transHero.save();
            t.commit();
            res.status(200).json({msg: 'Buy success', statusCode: 200, data: findMarket.m_my_heros});
        }else if(result[0] == 0){
            return res.status(404).json({msg: 'My Hero not found', statusCode: 404});
        }else{
            return res.status(400).json({msg: 'Bad Requeest. your input data is same with before', statusCode: 400});
        }
    }catch(err){
        t.rollback();
        return res.status(500).json({msg: err.message, statusCode: 500});
    }
};

export async function CancelSell(req, res){
    let token = Jwt.decode(req.header('auth-token'), secret);
    let myHeroId = req.params.myHeroId;
    const t = await DB.transaction();

    try{
        let myHero = await MyHero.findOne({where: {id: myHeroId}});

        if(myHero === null) return res.status(404).json({msg: 'My Hero not found', statusCode: 404});
        if(token.id !== myHero.mUserId) return res.status(403).json({msg: 'sorry its not youre Hero', statusCode: 403});

        myHero.is_trade = false;
        await Market.destroy({where: {mHeroId: myHeroId}},{t});
        await myHero.save();

        t.commit();
        res.status(200).json({msg: 'Cancel sell Success', statusCode: 200, data: myHero});
    }catch(err){
        t.rollback();
        return res.status(500).json({msg: err.message, statusCode: 500});
    }
};

export async function BuyFromAdmin(req, res){
    let token = Jwt.decode(req.header('auth-token'), secret);
    let {heroId, quantity} = req.body ;
    const t = await DB.transaction();

    try{
        let hero = await Hero.findOne({where: {id: heroId}});
        let wallet = await Wallet.findOne({where: {mUserId: token.id}});
        let total = parseInt(hero.default_price*parseInt(quantity));

        if(hero === null) return res.status(404).json({msg: 'Hero not found', statusCode: 404});
        if(hero.level === 0) return res.status(403).json({msg: 'Hero not for sale', statusCode: 403});
        if(wallet === null) return res.status(404).json({msg: 'Wallet not found', statusCode: 404});
        if(hero.stock === 0) return res.status(400).json({msg: 'no more Stock', statusCode: 400});
        if(wallet.balance < total) return res.status(400).json({msg: 'Balance not enough', statusCode: 400});
        
        let newHeros = [];
        for(let i = 0; i < quantity; i++){
            newHeros.push({
                mUserId: token.id,
                mHeroId: hero.id
            });
        };

        let send = await MyHero.bulkCreate(newHeros,{t});
        wallet.balance -= total;
        hero.stock -= parseInt(quantity);
        await hero.save();
        await wallet.save();
        t.commit();
        
        res.status(201).json({msg: 'Buy Success', statusCode: 201, data: send});
    }catch(err){
        t.rollback();
        return res.status(500).json({msg: err.message, statusCode: 500});
    }
};