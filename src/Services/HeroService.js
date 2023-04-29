import Hero from '../Entities/Markets/Hero.js';

export async function CreateHero(req, res){
    let {level, supply, power, max_point, default_price} = req.body;
    let img = req.file.filename;

    if(level == null || power < 1 || max_point < 100 || default_price == null){
        return res.status(400).json({msg: 'Bad request. level, supply, power, max_point, default_price', statusCode: 400});
    }
    try{
        let result = await Hero.create(
            {level: level, supply: supply, power: power, max_point: max_point, img: img, stock: supply, default_price: default_price}
        );
        res.status(201).json({msg: 'create Hero suceess', statusCode: 201, data: result});
    }catch(err){
        return res.status(500).json({msg: err.message, statusCode: 500});
    }
};

export async function GetHero(req, res){
    try{
        let result = await Hero.findOne({where: {id: req.params.id}});
        if(result == null) return res.status(404).json({msg: 'Hero not found', statusCode: 404});
        res.status(200).json({msg: 'get Hero success', statusCode: 200, data: result});
    }catch(err){
        return res.status(500).json({msg: err.message, statusCode: 500});
    }
};

export async function GetAllHero(req, res){
    try{
        let result = await Hero.findAndCountAll({
            limit: 1
        });
        res.status(200).json({msg: 'get all Hero success', statusCode: 200, data: result});
    }catch(err){
        return res.status(500).json({msg: err.message, statusCode: 500});
    }
};