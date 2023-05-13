import Express from "express";
import Upload from "../Configs/MulterConfig.js";
import { BuyFromAdmin, BuyHero, CancelSell, CreateHero, 
        SearchByLevel, GetAllHero, GetHeroById, 
        SellHero, SendHero, SearchByPrice, SeachHeroesByCollectionName, GetAllMarketplace } from '../Services/HeroService.js';
import { SignUpUser, SignIn, SignUpAdmin } from '../Services/AuthService.js';
import { UpdateUser, GetMySelf } from '../Services/UserService.js';
import { GetAllDeposit, GetAllReceiveBalance, GetAllSendBalance, GetAllWithdraw, GetMyWallet, SendBalance } from "../Services/WalletService.js";
import { CombineHero, GetMyHero, MyHeroInListing, PlayGame } from "../Services/MyHeroService.js";
import { CreateCard, DeleteCard, GetMyCard } from "../Services/CardService.js";
import { JwtVerifyUser, JwtVerifyAdmin } from "../Configs/JwtConfigs.js";
import { RequestOtp, VerifyOtp } from "../Services/VerifyService.js";
import { DepositViaEwallet, GetWithdrawPaymentMethod, WithdrawRequest, WithdrawVerify } from "../Services/PaymentService.js";
import { DepositAwaitingCapture, DepositCaptureFailure, DepositCaptureSuccess, DepositFailureCallback, DepositPendingCallback, 
        DepositSuccessCallback, WithdrawCallback } from "../Services/HandleCallback.js";
import { CreateCollection, GetAllCollection, GetAllCollectionHero, SearchByName } from "../Services/CollectionService.js";
import { GetAllHistoryMyHero } from "../Services/MyHeroService.js";

const Routers = Express.Router();

// Auth Router
Routers.post('/sign-up', SignUpUser);
Routers.post('/sign-in', SignIn);

// User Router
Routers.put('/user/update', JwtVerifyUser, UpdateUser);
Routers.get('/user', JwtVerifyUser, GetMySelf);

// Verification
Routers.post('/user/req-verify', JwtVerifyUser, RequestOtp);
Routers.post('/user/verify', JwtVerifyUser, VerifyOtp);

// Wallet Router
Routers.get('/user/wallet', JwtVerifyUser, GetMyWallet);
Routers.get('/user/wallet/history-send', JwtVerifyUser, GetAllSendBalance);
Routers.get('/user/wallet/history-receive', JwtVerifyUser, GetAllReceiveBalance);
Routers.get('/user/wallet/history-withdraw', JwtVerifyUser, GetAllWithdraw);
Routers.get('/user/wallet/history-deposit', JwtVerifyUser, GetAllDeposit);
Routers.post('/user/wallet/send', JwtVerifyUser, SendBalance);

//Payment Router
Routers.post('/user/deposit/ewallet', JwtVerifyUser, DepositViaEwallet);
Routers.post('/user/withdraw-req', JwtVerifyUser, WithdrawRequest);
Routers.post('/user/withdraw-verify', JwtVerifyUser, WithdrawVerify);
Routers.get('/withdraw/payment-method', GetWithdrawPaymentMethod);

// Callback Payment
Routers.post('/deposit/callback/success', DepositSuccessCallback);
Routers.post('/deposit/callback/failure', DepositFailureCallback);
Routers.post('/deposit/callback/pending', DepositPendingCallback);
Routers.post('/deposit/callback/capture-awaiting', DepositAwaitingCapture);
Routers.post('/deposit/callback/capture-faiure', DepositCaptureFailure);
Routers.post('/deposit/callback/capture-success', DepositCaptureSuccess);
Routers.post('/withdraw/callback', WithdrawCallback);

// My Hero Router
Routers.get('/user/my-hero/all', JwtVerifyUser, GetMyHero);
Routers.get('/user/my-hero/listing', JwtVerifyUser, MyHeroInListing);
Routers.get('/user/my-hero/history', JwtVerifyUser, GetAllHistoryMyHero);
Routers.post('/user/my-hero/send', JwtVerifyUser, SendHero);
Routers.get('/user/my-hero/combine', JwtVerifyUser, CombineHero);
Routers.post('/user/play/:myHeroId', JwtVerifyUser, PlayGame);

// Card Router
Routers.post('/user/card', JwtVerifyUser, CreateCard);
Routers.get('/user/card', JwtVerifyUser, GetMyCard);
Routers.delete('/user/card/:id', JwtVerifyUser, DeleteCard);

// Collection Router
Routers.get('/collection', GetAllCollection);
Routers.get('/collection/heroes', GetAllCollectionHero);
Routers.get('/collection/find', SearchByName);

// Hero Router
Routers.get('/hero-detail/:id', GetHeroById);
Routers.get('/heroes', GetAllHero);


// Market Route
Routers.post('/market/buy', JwtVerifyUser, BuyFromAdmin);
Routers.post('/marketplace/sell', JwtVerifyUser, SellHero);
Routers.post('/marketplace/buy/:marketId', JwtVerifyUser, BuyHero);
Routers.post('/marketplace/sell/cancel/:myHeroId', JwtVerifyUser, CancelSell);
Routers.get('/marketplace/heroes/collection', SeachHeroesByCollectionName);
Routers.get('/marketplace/heroes/level', SearchByLevel);
Routers.get('/marketplace/heroes/price', SearchByPrice);
Routers.get('/marketplace/heroes', GetAllMarketplace);

// Admin Router
Routers.post('/admin/create-hero', JwtVerifyAdmin, Upload.single('img'), CreateHero);
Routers.post('/admin/collection', JwtVerifyAdmin, Upload.single('img'), CreateCollection);
Routers.post('/admin/sign-up', SignUpAdmin);
Routers.post('/admin/sign-in', SignIn);


export default Routers;