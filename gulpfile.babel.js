import gulp from 'gulp'; //引入gulp http://www.gulpjs.com.cn/
import plumber from 'gulp-plumber';// https://www.npmjs.com/package/gulp-plumber/
import babel from 'gulp-babel'; // https://www.npmjs.com/package/gulp-babel/
import uglify from 'gulp-uglify'; // https://www.npmjs.com/package/gulp-uglify/
import rename from 'gulp-rename'; // https://www.npmjs.com/package/gulp-rename/ rename files
import cleanCSS from 'gulp-clean-css'; // https://www.npmjs.com/package/gulp-clean-css
import gulpif from 'gulp-if'; // https://www.npmjs.com/package/gulp-if
import imagemin from 'gulp-imagemin'; // 开发环境不需要做，避免页面加载慢 // https://www.npmjs.com/package/gulp-imagemin
import less from 'gulp-less'; // https://www.npmjs.com/package/gulp-less
import htmlmin from 'gulp-htmlmin'; // http://www.ydcss.com/archives/20 https://github.com/jonschlinkert/gulp-htmlmin
import replace from 'gulp-replace'; // https://www.npmjs.com/package/gulp-replace
import nodemon from 'gulp-nodemon'; // https://www.npmjs.com/package/gulp-nodemon
import browserSync from 'browser-sync';// http://www.browsersync.cn/
import watch from 'gulp-watch'; // https://www.npmjs.com/package/gulp-watch

var config = require('./config');
// 创建服务
var bs = browserSync.create();

// 判断条件,需要提前定义
const minCondition = function(f){
    if(f.path.endsWith('.min.js')||f.path.endsWith('.min.css')){
        return false;
    }
    return true;
}

const lessCondition = function(f){
    if(f.path.endsWith('.less')){
        return true;
    }
    return false;
}

// 相关的路径
const PATHS ={
    src:'public/',
    dest:'dist/'
};



/**
 * 开发环境
 * 执行 npm run dev 
 */
gulp.task('dev',['nodemon'],()=>{
    bs.init({ 
        proxy: 'http://localhost:'+config.port+'/index.html', //服务代理
        files: ["public/**/*.*", "views/**", "routes/**"],
        notify:false, // 移除自带的消息栏
        port: 9000 // 实际上访问的端口好
    });
    console.log('开发环境');
    // 监听资源的变化并且刷新
    gulp.watch(`${ PATHS.src }/less/**/*.less`, ['tocss']).on("change",bs.reload);
    gulp.watch(`${ PATHS.src }es6/**/*.js`, ['toes5']).on("change",bs.reload);
});

// 开启服务器
gulp.task('nodemon',['tocss','toes5'],()=>{
    return nodemon({
            script: 'app.js'
        });
});

// less 文件转换成css文件
gulp.task('tocss',()=>{
    return gulp.src(`${ PATHS.src }/less/**/*.less`)
        .pipe(plumber()) // 防止流遇到错误时候中断（跳过错误）
        .pipe(gulpif(lessCondition,less())) // less转换成css
        .pipe(cleanCSS()) // 压缩css
        .pipe(gulp.dest(`${ PATHS.src }/css/`));
});

// 将es6的语法转换成es5
gulp.task('toes5',()=>{
    return gulp.src(`${ PATHS.src }es6/**/*.js`)
        .pipe(plumber()) // 防止流遇到错误时候中断（跳过错误）
        .pipe(babel()) // 转换es6语法
        .pipe(gulp.dest(`${ PATHS.src }js/`));
});



/**
 * 生产环境
 * 执行 gulp prod 或者 npm run build
 */
gulp.task('prod',['minimg','mincss','minjs','rn'],()=>{
    console.log('生产环境');
});

// 压缩images
gulp.task('minimg',()=>{
    return gulp.src(`${ PATHS.src }imgs/**/*`)
        .pipe(plumber()) // 防止流遇到错误时候中断（跳过错误）
        .pipe(imagemin())
        .pipe(gulp.dest(`${ PATHS.dest }imgs/`));
});

// 压缩css 
gulp.task('mincss',()=>{
    return gulp.src([`${ PATHS.src }css/**/*.css`])
        .pipe(plumber()) // 防止流遇到错误时候中断（跳过错误）
        .pipe(gulpif(minCondition,cleanCSS())) // 压缩过的css文件
        .pipe(gulpif(minCondition,rename({extname:'.min.css'}))) // 后缀名为非.min.css的进行重命名
        .pipe(gulp.dest(`${ PATHS.dest }css/`));
});

// 压缩 js
gulp.task('minjs',()=>{
    return gulp.src(`${ PATHS.src }js/**/*.js`)
        .pipe(plumber()) // 防止流遇到错误时候中断（跳过错误）
        .pipe(gulpif(minCondition,uglify())) // 没有压缩过的js进行压缩,在压缩前要进行'babel()'将es6语法转换成es5，因为gulp-uglify不识别es6语法
        .pipe(gulpif(minCondition,rename({extname:'.min.js'}))) //  后缀名为非.min.js的进行重命名
        .pipe(gulp.dest(`${ PATHS.dest }js/`));
 });

 // 替换html文件中.css和.js的引用为压缩版本 gulp rn
gulp.task("rn",['minhtml'],()=>{
    return gulp.src('dist/views/**/*.html')
        .pipe(plumber()) // 防止流遇到错误时候中断（跳过错误）
        .pipe(replace('.min',''))
        .pipe(replace('.css','.min.css'))
        .pipe(replace('.js','.min.js'))
        .pipe(gulp.dest('dist/views/'));
});

// 压缩html
gulp.task('minhtml',()=>{
    let options = {
        collapseWhitespace: true,//压缩html
        removeComments: true,//清除htmlL注释
        collapseBooleanAttributes: true,//省略布尔属性的值 <input checked="true"/> ==> <input />
        removeEmptyAttributes: true,//删除所有空格作属性值 <input id="" /> ==> <input />
        removeScriptTypeAttributes: true,//删除<script>的type="text/javascript"
        removeStyleLinkTypeAttributes: true,//删除<style>和<link>的type="text/css"
        minifyJS: true,//压缩页面js
        minifyCSS: true//压缩页面css
    };
    return gulp.src('views/**/*.html')
        .pipe(plumber()) // 防止流遇到错误时候中断（跳过错误）
        .pipe(htmlmin(options))
        .pipe(gulp.dest(`${ PATHS.dest }views/`));
});


// reference 
// http://www.cnblogs.com/QRL909109/p/5620824.html