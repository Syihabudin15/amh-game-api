import Wallet from '../Entities/Users/Wallet.js';
import { Jwt, secret } from '../Configs/JwtConfigs.js';
import WalletTransaction from '../Entities/Transactions/WalletTransaction.js';
import { DB, Op } from '../Configs/DbConfig.js';
import {} from 'dotenv/config';

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
};

export async function SendBalance(req, res){
    let token = Jwt.decode(req.header('auth-token'), secret);
    let {wallet_target, amount} = req.body;
    const t = await DB.transaction();

    try{
        let walletTarget = await Wallet.findOne({where: {no_wallet: wallet_target}});
        let myWallet = await Wallet.findOne({where: {mUserId: token.id}});
        
        if(myWallet === null) return res.status(404).json({msg: 'Youre Wallet is not found', statusCode: 404});
        if(walletTarget === null) return res.status(404).json({msg: 'Wallet target is not found', statusCode: 404});
        if(myWallet.balance <= parseInt(parseInt(amount)+200)) return res.status(400).json({msg: 'Balance not enough', statusCode: 400});
        if(myWallet.mUserId === walletTarget.mUserId) return res.status(403).json({msg: 'Cannot send to your wallet', statusCode: 403});

        walletTarget.balance += parseInt(amount);
        myWallet.balance -+ parseInt(parseInt(amount)+200);
        let send = await WalletTransaction.create({
            to: walletTarget.no_wallet, type: 'send', amount: parseInt(amount), is_paid: true, mWalletId: myWallet.id, status: 'SUCCEEDED'
        }, {t});
        await walletTarget.save();
        await myWallet.save();

        t.commit();
        res.status(201).json({msg: 'Transaction success', statusCode: 201, data: {send, fee: 200}});
    }catch(err){
        t.rollback();
        return res.status(500).json({msg: err.message, statusCode: 500});
    }
};

export async function GetAllSendBalance(req, res){
    let token = Jwt.decode(req.header('auth-token'), secret);
    try{
        let wallet = await Wallet.findOne({where: {mUserId: token.id}});
        let send = await WalletTransaction.findAll({where: {[Op.and]: [{mWalletId : wallet.id}, {type: 'send'}]}});

        res.status(200).json({msg: 'Success get all Send Balance', statusCode: 200, data: send});
    }catch(err){
        return res.status(500).json({msg: err.message, statusCode: 500});
    }
};

export async function GetAllReceiveBalance(req, res){
    let token = Jwt.decode(req.header('auth-token'), secret);
    try{
        let wallet = await Wallet.findOne({where: {mUserId: token.id}});
        let receive = await WalletTransaction.findAll({where: {[Op.and]: [{to: wallet.no_wallet}, {type: 'send'}]}});

        res.status(200).json({msg: 'Success get all Send Balance', statusCode: 200, data: receive});
    }catch(err){
        return res.status(500).json({msg: err.message, statusCode: 500});
    }
}

export async function GetAllDeposit(req, res){
    let token = Jwt.decode(req.header('auth-token'), secret);
    try{
        let wallet = await Wallet.findOne({where: {mUserId: token.id}});
        let trans = await WalletTransaction.findAll({where: {[Op.and]: [{mWalletId: wallet.id}, {type: 'deposit'}]}});

        res.status(200).json({msg: 'Success get all Deposit', statusCode: 200, data: trans});
    }catch(err){
        return res.status(500).json({msg: err.message, statusCode: 500});
    }
};

export async function GetAllWithdraw(req, res){
    let token = Jwt.decode(req.header('auth-token'), secret);
    try{
        let wallet = await Wallet.findOne({where: {mUserId: token.id}});
        let trans = await WalletTransaction.findAll({where: {[Op.and]: [{mWalletId: wallet.id}, {type: 'withdraw'}]}});

        res.status(200).json({msg: 'Success Get all Withdraw', statusCode: 200, data: trans});
    }catch(err){
        res.status(500).json({msg: err.message, statusCode: 500});
    }
};