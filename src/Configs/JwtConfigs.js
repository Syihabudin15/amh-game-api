import Jwt from "jsonwebtoken";
import {} from "dotenv/config";

const secret = process.env.SECRET;

export function JwtSign(value){
    let token = Jwt.sign(value, secret, {expiresIn: '48h'});
    return token;
};

export function JwtVerifyUser(req, res, next){
    let token = req.header('auth-token');
    if(!token) return res.status(401).json({msg: 'UnAuthorize', statusCode: 401});
    
    let claim = Jwt.decode(token, secret);
    if(claim.role != 'player') return res.status(401).json({msg: 'UnAuthorize', statusCode: 401});

    try{
        let verify = Jwt.verify(token, secret);
        if(!verify) return res.status(401).json({msg: 'UnAuthorize', statusCode: 401});

        next();
    }catch(err){
        return res.status(500).json({msg: err.message, statusCode: 500});
    }
};

export function JwtVerifyAdmin(req, res, next){
    let token = req.header('auth-token');
    if(!token) return res.status(401).json({msg: 'UnAuthorize', statusCode: 401});
    
    let claim = Jwt.decode(token, secret);
    if(claim.role != 'admin') return res.status(401).json({msg: 'UnAuthorize', statusCode: 401});

    try{
        let verify = Jwt.verify(token, secret);
        if(!verify) return res.status(401).json({msg: 'UnAuthorize', statusCode: 401});

        next();
    }catch(err){
        return res.status(500).json({msg: err.message, statusCode: 500});
    }
};

export { Jwt, secret };