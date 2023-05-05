import {} from 'dotenv/config';
import WalletTransaction from '../Entities/Transactions/WalletTransaction.js';
import Wallet from '../Entities/Users/Wallet.js';
import User from '../Entities/Users/User.js';
import Credential from '../Entities/Users/Credential.js';
import { DB } from '../Configs/DbConfig.js';
import { SendEmail } from '../Configs/Mailer.js';

const x_token = process.env.XENDIT_CALL;

//  =========> Deposit
export async function DepositSuccessCallback(req, res){
    let data = req.body;
    let token = req.header('x-callback-token') || '';
    const t = await DB.transaction();
    if(token !== x_token) return res.status(403).json({msg: 'Invalid token', statusCode: 403});

    try{

        let user = await User.findOne({where: {id: data.data.metadata.user_id}, include:[{model: Credential}]});
        let wallet = await Wallet.findOne({where: {mUserId: user.id}});

        let result = await WalletTransaction.create({
            trans_id: data.data.id,
            to: wallet.no_wallet,
            type: 'deposit',
            payment_method: data.data.payment_method.type,
            code_bank: data.data.metadata.code_bank,
            amount: data.data.amount,
            status: 'success',
            is_paid: true,
            mWalletId: wallet.id
        },{t});
        wallet.balance += result.amount;
        await SendEmail(user.m_credential.email, 'Deposit Success', `
        <p>Deposit Successfully</p>
        <p>Amount: ${result.amount}<span></span></p>

        has been added to your wallet.
        `);

        await wallet.save();
        t.commit();
        res.status(201).json({msg: "Deposit Success", statusCode: 201, data: { data: data.data, result}});
    }catch(err){
        t.rollback();
        return res.status(500).json({msg: err.message, statusCode: 500});
    }
};

export async function DepositFailureCallback(req, res){
    let data = req.body;
    let token = req.header('x-callback-token') || '';
    
    if(token !== x_token) return res.status(403).json({msg: 'Invalid token', statusCode: 403});

    try{
        res.status(400).json({msg: 'error while Deposit', statusCode: 400, data: data.data});
    }catch(err){
        return res.status(500).json({msg: err.message, statusCode: 500});
    }
}


//  =========> Withdraw
export async function WithdrawSuccessCallback(req, res){
    let data = req.body;
    let token = req.header('x-callback-token') || '';
    const t = await DB.transaction();
    if(token !== x_token) return res.status(403).json({msg: 'Invalid token', statusCode: 403});

    try{

        let user = await User.findOne({where: {id: data.data.metadata.user_id}, include: [{model: Credential}]});
        let wallet = await Wallet.findOne({where: {mUserId: user.id}});
        let trans = WalletTransaction.findOne({where: {trans_id: data.data.id}});
        wallet.balance -= trans.amount;
        trans.is_paid = true;
        trans.status = "success";

        await wallet.save();
        await trans.save();

        await SendEmail(user.m_credential.email, 'Withdraw Success', `
        <p>Withdraw Successfully</p>
        <p>Amount: ${result.amount}<span></span></p>
        `);

        t.commit();
        res.status(201).json({msg: 'Withdraw success', statusCode: 201, data: {data: data.data, trans}});
    }catch(err){
        t.rollback();
        return res.status(500).json({msg: err.message, statusCode: 500});
    }
};

export async function WithdrawFailureCallback(req, res){
    let data = req.body;
    let token = req.header('x-callback-token') || '';
    if(token !== x_token) return res.status(403).json({msg: 'Invalid token', statusCode: 403}); 

    try{
        let user = await User.findOne({where: {id: data.data.metadata.user_id}});
        let trans = await WalletTransaction.findOne({where: {trans_id: data.data.id}});
        trans.status = "failed";
        await trans.save();

        await SendEmail(user.m_credential.email, 'Withdraw Failed', `
        <p>Sorry we have a Problem, you can make Withdraw again tomorrow</p>
        `);
        res.status(400).json({msg: 'Withdraw Failure', statusCode: 400, data: {data: data.data, trans}});
    }catch(err){
        return res.status(500).json({msg: err.message, statusCode: 500});
    }
};