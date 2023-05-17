import { DB, Op } from "../Configs/DbConfig.js";
import Collection from "../Entities/Markets/Collection.js";
import Hero from "../Entities/Markets/Hero.js";

export async function CreateCollection(req, res){
    let {name, description} = req.body;
    let img = req.file? req.file.filename : '';
    const t = await DB.transaction();
    if(name === null || description === null || img === '') return res.status(400).json({msg: 'Bad Request. name, description, img', statusCode: 400});

    try{
        let result = await Collection.create({img: img, name: name, description: description},{t});
        t.commit();
        res.status(201).json({msg: 'Create Collection success', statusCode: 201, data: result});
    }catch(err){
        t.rollback();
        return res.status(500).json({msg: err.message, statusCode: 500});
    }
};

export async function GetAllCollection(req, res){
    let page = req.query.page || 1;
    let size = req.query.size || 10;
    try{
        let skip = parseInt(parseInt(page) -1) * parseInt(size);
        let result = await Collection.findAndCountAll({
            limit: parseInt(size),
            offset: skip,
            include: [{
                model: Hero,
                as: 'm_heros'
            }]
        });
        res.status(200).json({msg: 'get all Collection success', statusCode: 200, data: result});
    }catch(err){
        return res.status(500).json({msg: err.message, statusCode: 500});
    }
};

export async function GetAllCollectionHero(req, res){
    let page = req.query.page || 1;
    let size = req.query.size || 10;
    let id = req.query.id;
    try{
        let skip = parseInt(parseInt(page) -1) * parseInt(size);
        let result = await Hero.findAndCountAll({
            limit: parseInt(size),
            offset: skip,
            include: [{
                model: Collection,
                where: {id: id}
            }]
        });
        res.status(200).json({msg: 'get collection hero success', statusCode: 200, data: result});
    }catch(err){
        return res.status(500).json({msg: err.message, statusCode: 500});
    }
};

export async function SearchByName(req, res){
    let page = req.query.page || 1;
    let size = req.query.size || 10;
    let name = req.query.name;
    try{
        let skip = parseInt(parseInt(page) -1) * parseInt(size);
        let result = await Collection.findAndCountAll({
            where: {name: {
                [Op.like]: `%${name}%`
            }},
            limit: parseInt(size),
            offset: skip,
            include: [{
                model: Hero,
                as: 'm_heros'
            }]
        });
        res.status(200).json({msg: 'search by name success', statusCode: 200, data: result});
    }catch(err){
        return res.status(500).json({msg: err.message, statusCode: 500});
    }
};