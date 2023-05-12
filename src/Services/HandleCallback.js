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
        let wallet = await Wallet.findOne({where: {mUserId: data.data.metadata.user_id}});
        let result = await WalletTransaction.create({
            trans_id: data.data.id,
            to: wallet.no_wallet,
            type: 'deposit',
            payment_method: data.data.payment_method.type,
            code_bank: data.data.metadata.code_bank,
            amount: data.data.amount,
            status: data.data.status,
            is_paid: true,
            mWalletId: wallet.id
        },{t});
        wallet.balance += data.data.amount;
        await wallet.save();

        t.commit();
        res.status(201).json({msg: "Deposit Success", statusCode: 201, data: result});
    }catch(err){
        t.rollback();
        return res.status(500).json({msg: err.message, statusCode: 500});
    }
};

export async function DepositPendingCallback(req, res){
    let data = req.body;
    let token = req.header('x-callback-token') || '';
    
    if(token !== x_token) return res.status(403).json({msg: 'Invalid token', statusCode: 403});

    try{
        let trans = await WalletTransaction.findOne({where: {trans_id: data.data.id}});
        if(trans === null) return res.status(404).json({msg: 'Data Found', statusCode: 404});
        trans.status = data.data.status;
        trans.is_paid = false;

        await trans.save();
        res.status(200).json({msg: 'error while Deposit', statusCode: 200, data: trans});
    }catch(err){
        return res.status(500).json({msg: err.message, statusCode: 500});
    }
};

export async function DepositFailureCallback(req, res){
    let data = req.body;
    let token = req.header('x-callback-token') || '';
    
    if(token !== x_token) return res.status(403).json({msg: 'Invalid token', statusCode: 403});

    try{
        let trans = await WalletTransaction.findOne({where: {trans_id: data.data.id}});
        if(trans === null) return res.status(404).json({msg: 'Not Found', statusCode: 404});
        trans.status = data.data.status;
        trans.is_paid = false;

        await trans.save();
        res.status(200).json({msg: 'error while Deposit', statusCode: 200, data: trans});
    }catch(err){
        return res.status(500).json({msg: err.message, statusCode: 500});
    }
};

export async function DepositAwaitingCapture(req, res){
    let data = req.body;
    let token = req.header('x-callback-token') || '';
    if(token !== x_token) return res.status(403).json({msg: 'Invalid token', statusCode: 403});

    try{
        let trans = await WalletTransaction.findOne({where: {trans_id: data.data.id}});
        if(trans === null) return res.status(404).json({msg: 'Not Found', statusCode: 404});

        trans.status = data.data.status;
        trans.is_paid = false;
        await trans.save();

        res.status(200).json({msg: 'success capture', statusCode: 200, data: trans});
    }catch(err){
        return res.status(500).json({msg: err.message, statusCode: 500});
    }
};

export async function DepositCaptureSuccess(req, res){
    let data = req.body;
    let token = req.header('x-callback-token') || '';
    const t = await DB.transaction();

    if(token !== x_token) return res.status(403).json({msg: 'Invalid token', statusCode: 403});

    try{
        let user = await User.findOne({where: {id: data.data.metadata.user_id}, include: [{model: Credential}]});
        let trans = await WalletTransaction.findOne({where: {trans_id: data.data.id}});
        let wallet = await Wallet.findOne({where: {mUserId: data.data.metadata.user_id}});
        if(trans === null || wallet === null || user ===  null) return res.status(404).json({msg: 'Not Found', statusCode: 404});
        wallet.balance += trans.amount;
        trans.status = data.data.status;
        trans.is_paid = true;

        await wallet.save();
        await trans.save();
        await SendEmail(user.m_credential.email, 'Deposit Success', `
        <div>
            <p>Congrats youre deposit has been Success. </p>
            <div style="margin: 20px auto; font-style: italic;">
                <p>Amount : <span>${trans.amount}</span></p>
                <p>Payment Method : <span>${trans.payment_method}</span></p>
                <p>Code Bank : <span>${trans.code_bank}</span></p>
            </div>
            <p>Balance has been changed. Lets check your Wallet</p>
        </div>
        `);

        t.commit();
        res.status(200).json({msg: 'Deposit Confirmed', statusCode: 200, data: trans});
    }catch(err){
        t.rollback();
        return res.status(500).json({msg: err.message, statusCode: 500});
    }
};

export async function DepositCaptureFailure(req, res){
    let data = req.body;
    let token = req.header('x-callback-token') || '';
    const t = await DB.transaction();
    if(token !== x_token) return res.status(403).json({msg: 'Invalid token', statusCode: 403});

    try{
        await WalletTransaction.destroy({where: {trans_id: data.data.id}}, {t});

        t.commit();
        res.status(200).json({msg: 'Deposit Failure', statusCode: 200, data: data.data});
    }catch(err){
        t.rollback();
        return res.status(500).json({msg: err.message, statusCode: 500});
    }
};


//  =========> Withdraw
export async function WithdrawCallback(req, res){
    let data = req.body;
    let token = req.header('x-callback-token') || '';
    const t = await DB.transaction();
    if(token !== x_token) return res.status(403).json({msg: 'Invalid token', statusCode: 403});

    try{

        let user = await User.findOne({where: {id: data.data.metadata.user_id}, include: [{model: Credential}]});
        let wallet = await Wallet.findOne({where: {mUserId: user.id}});
        let trans = WalletTransaction.findOne({where: {trans_id: data.data.id}});
        if(trans === null || wallet === null || user === null) return res.status(404).json({msg: 'Not Found', statusCode: 404});

        if(data.data.status === "FAILED"){
            await SendEmail(user.m_credential.email, 'Withdraw Success', `
                <p>Withdraw Successfully</p>
                <p>Amount: ${result.amount}<span></span></p>
            `);
            trans.status = data.data.status;
            await trans.save();
            return res.status(200).json({msg: 'Withdraw Failed', statusCode: 200});
        }
        if(data.data.status === "PENDING"){
            trans.status = data.data.status;
            await trans.save();
            return res.status(200).json({msg: 'Withdraw Failed', statusCode: 200});
        }

        trans.status = data.data.status;
        trans.is_paid = true;
        wallet.balance -+ trans.amount;
        await SendEmail(user.m_credential.email, 'Withdraw Success', `
            <p>Withdraw Successfully</p>
            <p>Amount: ${result.amount}<span></span></p>
        `);

        await wallet.save();
        await trans.save();
        t.commit();
        res.status(201).json({msg: 'Withdraw success', statusCode: 201, data: {data: data.data, trans}});
    }catch(err){
        t.rollback();
        return res.status(500).json({msg: err.message, statusCode: 500});
    }
};