// 后台模块

var express = require('express');
var router = express.Router();

// 引入用户的模型
var User = require('../models/User');

router.use(function(req,res,next){// 这里虽然没有写路由，表示的是任意路由，如 “/admin” "admin/user" etc,这里表示一进来url就初始化
    if(!req.userInfo.isAdmin){
        // 如果当前的用户是非管理员
        res.send('sorry,you are not an administer');
        return;
    }
    next();
});

/**
 * 首页
 */
router.get('/index.html',function(req,res,next){
    res.render('admin/index.html',{});
});

// 导出路由
module.exports = router;