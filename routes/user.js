var express = require('express');
var router = express.Router();
var connection = require('./db');
var http = require('http');
var qs = require('querystring');

//获取短信验证码
var registerMobile='';
var registerCheckCode='';
router.post('/get_check_msg',(request,response)=>{
    let user=request.body;
    console.log('短信验证码');
    console.log(user.mobile);
    registerMobile=user.mobile;
    //生成短信验证码
    var code = "";
    var codeLength = 6;//验证码的长度
    var random = new Array(0,1,2,3,4,5,6,7,8,9);//随机数
    for(var i = 0; i < codeLength; i++) {//循环操作
        var index = Math.floor(Math.random()*10);//取得随机数的索引（0~35）
        code += random[index];//根据索引取得随机数加到code上
    }
    console.log('生成的随机验证码是：'+code);
    registerCheckCode=code;

    //发送手机验证码
    // var checkData = qs.stringify({
    //     phone: user.mobile,
    //     sign: 1,
    //     content: '您的注册验证码是'+code
    // });
    // var checkOptions={
    //     host: 'http://dashboard.mob.com',
    //     port: 80,
    //     path: '/user/register',
    //     method: 'post',
    //     headers: {
    //         'Content-Type': 'application/x-www-form-urlencoded'
    //     }
    // };
    // var req = http.request(checkOptions,function(res){
    //     console.log('短信api发送')
    //     res.setEncoding('utf8');
    //     res.on('data',function(data){
    //         console.log('接收数据：')
    //         console.log(data);
    //     })
    //     res.on('end',function(){
    //
    //     })
    // });
    // req.write(checkData);
    // req.end();
    //短信验证码结束

    response.send({
        code: 0,
        result:code,
        msg:''
    });
});

//注册
router.post('/register',(req,res)=>{
    let user=req.body;
    console.log('注册');
    console.log(user.name);
    console.log(user.pass);
    console.log(user.checkNum);
    console.log(user.mobile);
    if(registerCheckCode!=user.checkNum){
        res.send({
            code: 1,
            result:'',
            msg:'验证码不正确！'
        });
        return false;
    }else if(registerMobile!=user.mobile){
        res.send({
            code: 1,
            result:'',
            msg:'手机号不一致！'
        });
        return false;
    }
    connection.query('select * from user where username="'+user.name+'"', function (error, result) {
        if (error) throw error
        else{
            if(result.length>0){
                res.send({
                    code:1,
                    result:'',
                    msg:'您输入的用户名已存在！'
                })
            }else{
                let sql='insert into user(username,userpass,mobile)  value(?,?,?)';
                let sqlData=[user.name,user.pass,user.mobile];
                connection.query(sql,sqlData, function (error, result) {
                    if (error) {throw error}
                    else{
                        res.send({
                            code:0,
                            result: 'success',
                            msg:''
                        })
                    }
                });
            }
        }
    });
});

//登录
router.post('/login',(req,res)=>{
    let user=req.body;
    console.log('登录');
    console.log(user.name);
    console.log(user.pass);
    connection.query('select * from user', function (error, result) {
        if (error) throw error
        else{
            let loginRes=0;
            for(let item of result){
                if(user.name==item.username && user.pass==item.userpass){
                    loginRes++;
                }
            }
            req.session = user.name;
            res.send({
                code:0,
                result: loginRes,
                msg:''
            })
        }
    });
});

//用户列表
router.use('/userlist',(req,res)=>{
    console.log('用户列表');
    connection.query('select * from user', function (error, result) {
        if (error) throw error
        else{
            res.send({
                code:0,
                result:result,
                msg:''
            })
        }
    });
});

//删除用户
router.use('/del_user',(req,res)=>{
    let user=req.query;
    console.log('删除');
    console.log(user.name);
    let sql='delete from user where username="'+user.name+'"';
    connection.query(sql, function (error, result) {
        if (error) {throw error}
        else{
            res.send({
                code:0,
                result: 'success',
                msg:''
            })
        }
        console.log(result);
    });
});

//修改密码
router.use('/change_pass',(req,res)=>{
    let user=req.query;
    console.log('修改密码');
    console.log('姓名：'+user.name);
    console.log('新密码：'+user.newpass);
    let sql='update user set userpass="'+user.newpass+'" where username="'+user.name+'"';
    connection.query(sql, function (error, result) {
        if (error) {throw error}
        else{
            res.send({
                code:0,
                result: 'success',
                msg:''
            })
        }
    });
});


module.exports = router;
