import User from "../Entities/Users/User.js";
import HeroTransaction from '../Entities/Transactions/HeroTransaction.js';
import WalletTransaction from '../Entities/Transactions/WalletTransaction.js';


export async function GetAllUserHeroWallet(req, res){
    try{
        let user = await User.findAll();
        let hero = await HeroTransaction.findAll();
        let wallet = await WalletTransaction.findAll();

        return res.status(200).json({msg: 'Success', statusCode: 200, data: {user: user.length, hero: hero.length, wallet: wallet.length}});
    }catch(err){
        return res.status(500).json({msg: err.message, statusCode: 500});
    }
};