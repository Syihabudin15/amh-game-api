import User from "../Entities/Users/User.js";
import HeroTransaction from '../Entities/Transactions/HeroTransaction.js';
import WalletTransaction from '../Entities/Transactions/WalletTransaction.js';
import Hero from "../Entities/Markets/Hero.js";
import Collection from "../Entities/Markets/Collection.js";


export async function GetAllUserHeroWallet(req, res){
    try{
        let user = await User.findAll();
        let heroTrans = await HeroTransaction.findAll();
        let walletTrans = await WalletTransaction.findAll();
        let hero = await Hero.findAll();
        let collection = await Collection.findAll();

        return res.status(200).json({msg: 'Success', statusCode: 200, data: {
            user: user.length,
            hero: hero.length,
            collection: collection.length,
            walletTrans: walletTrans.length,
            heroTrans: heroTrans.length
        }});
    }catch(err){
        return res.status(500).json({msg: err.message, statusCode: 500});
    }
};