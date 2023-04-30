import Wallet from '../Entities/Users/Wallet.js';
import { Jwt, secret } from '../Configs/JwtConfigs.js';
import WalletTransaction from '../Entities/Transactions/WalletTransaction.js';
import { DB } from '../Configs/DbConfig.js';

const t = await DB.transaction();

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

export async function SendBalance(req, res){
    let token = Jwt.decode(req.header('auth-token'), secret);
    let {to, amount} = req.body;

    try{
        let walletTarget = await Wallet.findOne({where: {mUserId: to}});
        let myWallet = await Wallet.findOne({where: {mUserId: token.id}});
        
        if(myWallet === null) return res.status(404).json({msg: 'Youre Wallet is not found', statusCode: 404});
        if(walletTarget === null) return res.status(404).json({msg: 'Wallet target is not found', statusCode: 404});

        walletTarget.balance += parseInt(amount);
        myWallet.balance -+ parseInt(amount);
        let send = await WalletTransaction.create({to: to, type: 'send', amount: amount, is_paid: true, mUserId: token.id}, {t});
        await walletTarget.save();
        await myWallet.save();

        t.commit();
        res.status(201).json({msg: 'Transaction success', statusCode: 201, data: send});
    }catch(err){
        t.rollback();
        return res.status(500).json({msg: err.message, statusCode: 500});
    }
};