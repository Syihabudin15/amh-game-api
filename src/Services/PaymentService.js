import {} from 'dotenv/config';
import { Jwt, secret } from '../Configs/JwtConfigs.js';
import { DB } from '../Configs/DbConfig.js';
import User from '../Entities/Users/User.js';
import Credential from '../Entities/Users/Credential.js';
import axios from 'axios';
import Wallet from '../Entities/Users/Wallet.js';
import WalletTransaction from '../Entities/Transactions/WalletTransaction.js';

const x_base = process.env.XENDIT_BASE;
const x_basic = process.env.XENDIT_BASIC;

//      ======> Deposit
export async function DepositViaEwallet(req, res){
    let token = Jwt.decode(req.header('auth-token'), secret);
    let {amount, codeBank} = req.body;

    if(codeBank === null) return res.status(400).json({msg: 'Bank is required', statusCode: 400});
    if(amount < 20000) return res.status(400).json({msg: 'Minimum of deposit is 20000', statusCode: 400});
    
    try{
        let user = await User.findOne({where: {id: token.id}});
        if(user === null) return res.status(403).json({msg: 'Forbiden, you must Login to your account for make deposit', statusCode: 403});

        let request = await axios.request({
            method: 'POST',
            url: `${x_base}/payment_requests`,
            headers: {
                accept: 'application/json',
                'content-type': 'application/json',
                authorization: `${x_basic}`
            },
            data: {
                amount: amount,
                currency: 'IDR',
                country: 'ID',
                payment_method: {
                    type: 'EWALLET',
                    ewallet: {
                        channel_code: codeBank,
                        channel_properties: {
                            success_return_url: `https://amh-coin.netlify.app/user/deposit/success`,
                            failure_return_url: 'https://amh-coin.netlify.app/user/deposit/failure',
                            mobile_number: user.phone
                        }
                    },
                    reusability: 'ONE_TIME_USE'
                },
                metadata: {
                    user_id: user.id,
                    name: `${user.firstName} ${user.lastName}`,
                    code_bank: codeBank
                }
            }
        });

        res.status(201).json({msg: 'Create deposit success', statusCode: 201, data: request.data});
    }catch(err){
        return res.status(err.status).json({msg: err.message, statusCode: err.status});
    }
};

export async function DepositViaVirtualAccount(req, res){

};


//      ======> Withdraw
let otp = parseInt(Math.floor(Math.random() * 1000000));

export async function WithdrawRequest(req, res){
    let token = Jwt.decode(req.header('auth-token'), secret);
    let {amount, noBank, paymentMethod, codeBank} = req.body;
    let fee = 5000;

    try{
        let user = await User.findOne({where: {id: token.id}, include: [{model: Credential}]});
        let wallet = await Wallet.findOne({where: {mUserId: user.id}});

        if(amount < 20000) return res.status(400).json({msg: 'Minimum for Withfraw is 20000', statusCode: 400});
        if(wallet.balance < amount) return res.status(400).json({msg: 'Balance not enough', statusCode: 400});
        if(wallet.balance < 20000) return res.status(400).json({msg: 'Minimum for Withdraw is 20000', statusCode: 400});
        if(amount >= 100000 && amount < 200000 ) fee = 20000;
        if(amount >= 200000 && amount < 500000 ) fee = 30000;
        if(amount >= 500000 && amount < 1000000 ) fee = 50000;
        if(amount >= 1000000 && amount < 2000000 ) fee = 80000;
        if(amount >= 2000000) fee = 100000;

        await SendEmail(
            user.m_credential.email,
            'Withdrawal requestt OTP',
            `
            <p>We have received youre Withdraw Request. OTP code : </p><br>
            <h2>${otp}</h2><br><br>
            `
        );

        res.status(200).json({msg: 'Request Withdraw success, Otp Sent', statusCode: 200, data: {
            amount, noBank, paymentMethod, codeBank, fee
        }});
    }catch(err){
        return res.status(500).json({msg: err.message, statusCode: 500});
    }
};

export async function WithdrawVerify(req, res){
    let token = Jwt.decode(req.header('auth-token'), secret);
    let {amount, fee, paymentMethod, codeBank, noBank, otpUser} = req.body;
    let exId = Math.floor(Math.random() * 10000000);
    const t = await DB.transaction();

    try{
        let user = await User.findOne({where: {id: token.id}});
        let wallet = await Wallet.findOne({where: {mUserId: user.id}});
        if(otp !== otpUser) return res.status(400).json({msg: 'Otp not match', statusCode: 400});

        let request = await axios.request({
            method: 'POST',
            url: `${x_base}/disbursements`,
            headers: {
                accept: 'application/json',
                'content-type': 'application/json',
                authorization: `${x_basic}`
            },
            data: {
                external_id: `amh-${exId}`,
                amount: amount-fee,
                bank_code: codeBank,
                account_holder_name: `${user.firstName} ${user.lastName}`,
                account_number: noBank,
                description: `Withdraw ${user.id} to ${codeBank}, amount: ${amount}`,
                metadata: {
                    user_id: user.id,
                    code_bank: codeBank
                }
            }
        });

        let trans = await WalletTransaction.create({
            type: 'withdraw', to: noBank, payment_method: paymentMethod, trans_id: request.data.id,
            amount: amount, code_bank: codeBank, mWalletId: wallet.id, is_pais: false, status: 'pending'
        }, {t});

        t.commit();
        res.status(201).json({msg: 'Withdraw success', statusCode: 201, data: trans});
    }catch(err){
        t.rollback();
        return res.status(500).json({msg: err.message, statusCode: 500});
    }
};

export async function GetWithdrawPaymentMethod(req, res){
    try{
        let list = await axios.request({
            method: 'GET',
            url: `${x_base}/available_disbursements_banks`,
            headers: {
                accept: 'application/json',
                'content-type': 'application/json',
                authorization: `${x_basic}`
            }
        });

        res.status(200).json({msg: 'Success get all payment method', statusCode: 200, data: list.data});
    }catch(err){
        return res.status(500).json({msg: err.message, statusCode: 500});
    }
};