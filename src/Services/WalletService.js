import Wallet from '../Entities/Users/Wallet.js';
import { Jwt, secret } from '../Configs/JwtConfigs.js';
import WalletTransaction from '../Entities/Transactions/WalletTransaction.js';
import { DB } from '../Configs/DbConfig.js';
import {} from 'dotenv/config';
import { SendEmail } from '../Configs/Mailer.js';
import User from '../Entities/Users/User.js';
import Xendit from 'xendit-node';
import axios from 'axios';

const t = await DB.transaction();
const XENDIT_KEY = process.env.XENDIT_KEY;
const XENDIT_CALL = process.env.XENDIT_CALL;
const x = new Xendit({secretKey: XENDIT_KEY});
const {EWallet} = x;
const x_ew = new EWallet({});

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

export async function RequestWithdraw(req, res){
    let token = Jwt.decode(req.header('auth-token'), secret);
    let {amount, bank} = req.body;
    let otp = parseInt(Math.floor(Math.random() * 1000000)); // OTP for make Withdrawal
    let fee = 5000;

    try{
        let user = await User.findOne({
            where: {id: token.id},
            include: [{
                model: Credential
            }]
        });
        let myWallet = await Wallet.findOne({where: {mUserId: token.id}});

        if(myWallet === null || user === null) return res.status(404).json({msg: 'User or Wallet not found', statusCode: 404});
        if(myWallet.balance < 10000) return res.status(403).json({msg: 'Minimum Withraw is 10000', statusCode: 403});
        if(myWallet.balance <= parseInt(amount)) return res.status(400).json({msg: 'Balance not enough', statusCode: 400});
        if(parseInt(amount) <= 500000 && parseInt(amount) >= 300000){
            fee = 10000;
        }else if(parseInt(amount) <= 1000000 && parseInt(amount) >= 500000){
            fee = 20000;
        }else if(parseInt(amount) <= 1000000){
            fee = 50000;
        }

        let result = await WalletTransaction.create({
            bank: bank, mWalletId: myWallet.id, amount: parseInt(amount), type: 'withdraw', is_paid: false
        },{t});
        await SendEmail(
            user.m_credentials.email,
            'Withdrawal requestt OTP',
            `
            <div>
                <p>We have received youre Withdraw Request. </p><br>
                <div style="margin: 20px 50px; text-align: justify;">
                    <p>Amount : <span> ${amount}</span></p>
                    <p>Bank : <span> ${bank}</span></p>
                </div><br>
                <h2 style="text-align: center;">${otp}</h2><br>
                <h4 style="font-style: italic">Please Your Attention</h4>
                <p>if this is not you, you can Change your Credential info like email or password for security reason.</p>
                <i>You can following this link : </i> <a>https://amh-coin.netlify.com/user/setting</a>
            </div>
            `
        );
        t.commit();
        res.status(201).json({msg: 'Request Withdraw success', statusCode: 201, data: {result, fee, otp}});
    }catch(err){
        t.rollback();
        return res.status(500).json({msg: err.message, statusCode: 500});
    }

};

export async function VerifyWithdraw(req, res){
    let token = Jwt.decode(req.header('auth-token'), secret);
    let {otp_code, otp_user, transaction_id, fee} = req.body;
    if(otp_code != otp_user) return res.status(400).json({msg: 'OTP code does not Match', statusCode: 400});

    try{
        let findTrans = await WalletTransaction.findOne({where: {id: transaction_id}});
        if(findTrans === null) return res.status(404).json({msg: 'Transaction not found', statusCode: 404});
        let myWallet = await Wallet.findOne({where: {id: findTrans.mWalletId}});
        if(myWallet.mUserId != token.id) return res.status(403).json({msg: 'error, your not have permission', statusCode: 403});
        if(findTrans.amount <= myWallet.balance) return res.status(400).json({msg: 'Balance not enough', statusCode: 400});
        
        let total = parseInt(findTrans.amount + fee);
        myWallet.balance -= total;
        findTrans.is_paid = true;

        await myWallet.save();
        await findTrans.save();
        t.commit();
        res.status(201).json({msg: 'Withdraw Success', statusCode: 201});
    }catch(err){
        t.rollback();
        return res.status(500).json({msg: err.message, statusCode: 500});
    }
};

export async function CancelWithdraw(req, res){
    let transaction_id = req.params.transaction_id;
    try{
        let findTrans = await WalletTransaction.findOne({where: {id: transaction_id}});
        if(findTrans === null) return res.status(404).json({msg: 'Transaction not found', statusCode: 404});
        if(findTrans.is_paid === true) return res.status(403).json({msg: 'sorry payment alredy sent', statusCode: 403});

        findTrans.type = 'cancel';
        await findTrans.save();
    }catch(err){
        return res.status(500).json({msg: err.message, statusCode: 500});
    }
};

export async function SendBalance(req, res){
    let token = Jwt.decode(req.header('auth-token'), secret);
    let {wallet_target, amount} = req.body;

    try{
        let walletTarget = await Wallet.findOne({where: {no_wallet: wallet_target}});
        let myWallet = await Wallet.findOne({where: {mUserId: token.id}});
        
        if(myWallet === null) return res.status(404).json({msg: 'Youre Wallet is not found', statusCode: 404});
        if(walletTarget === null) return res.status(404).json({msg: 'Wallet target is not found', statusCode: 404});
        if(myWallet.balance <= parseInt(amount)) return res.status(400).json({msg: 'Balance not enough', statusCode: 400});

        walletTarget.balance += parseInt(amount);
        myWallet.balance -+ parseInt(parseInt(amount)+200);
        let send = await WalletTransaction.create({to: walletTarget, type: 'send', amount: parseInt(amount), is_paid: true, mWalletId: myWallet.id}, {t});
        await walletTarget.save();
        await myWallet.save();

        t.commit();
        res.status(201).json({msg: 'Transaction success', statusCode: 201, data: {send, fee: 200}});
    }catch(err){
        t.rollback();
        return res.status(500).json({msg: err.message, statusCode: 500});
    }
};

export async function DepositViaEwallet(req, res){
    let token = Jwt.decode(req.header('auth-token'), secret);
    let {amount, bank} = req.body;
    if(bank !== "DANA") return res.status(400).json({msg: 'For now we only support DANA transaction', statusCode: 400});
    if(amount < 10000) return res.status(400).json({msg: 'Minimum of deposit is 10000', statusCode: 400});
    
    try{
        let user = await User.findOne({
            where: {id: token.id},
            include: [{
                model: Wallet
            }]
        });
        if(user === null) return res.status(404).json({msg: "User not found", statusCode: 404});

        const charge = await axios.request({
            method: 'POST',
            url: 'https://api.xendit.co/payment_requests',
            headers: {
                accept: 'application/json',
                'content-type': 'application/json',
                authorization: `Basic eG5kX2RldmVsb3BtZW50X0M3R1dHbnQxRWNuMXRVNEZzaE5BbkZ3SXVibkYxR1dWang4cnduR0hBV0pkVGNVZVlsUm01NEV0NXRndkk6`
            },
            data: {
                amount: parseInt(amount),
                currency: 'IDR',
                country: "ID",
                payment_method: {
                    type: 'EWALLET',
                    ewallet: {
                        channel_code: bank,
                        channel_properties: {
                            success_return_url: `http://localhost:5000/user/wallet/deposit/callback`,
                            mobile_number: user.phone.toString()
                        }
                    },
                    reusability: 'ONE_TIME_USE'
                }
            }
        });
        let saveTrans = await WalletTransaction.create({
            type: 'deposit', amount: amount, bank: bank, trans_id: charge.data.id, to: user.m_wallet.no_wallet, mWalletId: user.m_wallet.id
        },{t});
        t.commit();
        res.status(201).json({msg: 'success', statusCode: 201, data: charge.data});
    }catch(err){
        t.rollback();
        return res.status(500).json({msg: err.message, statusCode: 500});
    }
};

export async function CheckDepositStatus(req, res){
    let id = req.params.id;
    try{
        let status = await x_ew.getEWalletChargeStatus({chargeID: id});
        let findTrans = await WalletTransaction.findOne({where: {trans_id: id}});
        let wallet = await Wallet.findOne({where: {id: findTrans.mWalletId}});
        if(status.status === 'SUCCEEDED'){
            findTrans.is_paid = true;
            wallet.balance += findTrans.amount;
        }

        await findTrans.save();
        await wallet.save();

        res.status(200).json({msg: "success", statusCode: 200, data: status});
    }catch(err){
        return res.status(500).json({msg: err.message, statusCode: 500});
    }
};

export async function PaymentCallback(req, res){
    let data = req.body;
    let x_token = req.header('x-callback-token') ? req.header('x-callback-token') : '';
    let isSuccess = 'failed';
    try{
        if(XENDIT_CALL === x_token) isSuccess = 'success';
        res.status(200).json({msg: 'Callback succeess', statusCode: 200, data: {data, isSuccess}});
    }catch(err){
        return res.status(500).json({msg: err.message, statusCode: 500});
    }
};