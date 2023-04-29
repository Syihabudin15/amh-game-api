import Wallet from '../Entities/Users/Wallet.js';
import { Jwt, secret } from '../Configs/JwtConfigs.js';

export async function CreateWallet(data){
    let result = await Wallet.create(data);
    return result;
};

export async function GetMyWallet(req, res){
    let token = Jwt.decode(req.header('auth-token'), secret);
    try{
        let result = await Wallet.findOne({where: {mUserId: token.id}});
        if(result === null) return res.status(404).json({msg: 'Wallet not found', statusCode: 404});
        res.status(200).json({msg: 'get my wallet success', statusCode: 200, data: result});
    }catch(err){
        return res.status(500).json({msg: err.message, statusCode: 500});
    }
}

export async function DepositWallet(req, res){

};

export async function WithdrawalWallet(req, res){

};