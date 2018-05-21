// default settings. fis3 release
var DEFAULT_SETTINGS = {
  // project的属性也可以通过 fis.set('project.charset', 'utf8') 来设置，其它的类似
  project: {
    charset: 'utf8',    //字符编码，@param: string
    md5Length: 7,    //md5长度， @param: number
    md5Connector: '_',    //设置md5与文件的连接字符，@param: string
    files: ['**'],    //设置项目源码文件过滤器，@param:
    ignore: ['node_modules/!**', '.git/!**', '.idea/!**', 'fis-conf.js'],   //排除某些不处理的文件
    fileType: {
      text: ['html', 'js', 'json', 'scss', 'css', 'ftl'],    //文本文件后缀列表，@param: array | string
      image: ['png', 'jpg', 'gif']    //图片类二进制文件后缀列表，@param: array | string
    }
  }
};

// 设置图片合并的最小间隔  
fis.config.set('settings.spriter.csssprites.margin', 20);  

// Global start
fis.match('*.{js,css}', {
  useHash: true
});
// 所有被标注为图片的文件添加 hash
fis.match('::image', {
  useHash: true
});

fis.match('*.js', {
  optimizer: fis.plugin('uglify-js'),
  // release:'/static/js/$0'
});

fis.match('*.css', {
  optimizer: fis.plugin('clean-css'),
  // release:'/static/css/$0'
});

fis.match('*.png', {
  optimizer: fis.plugin('png-compressor'),
  // release:'/static/img/$0'
});

//所有html页面自动引入jq文件
fis.match('*.html', {
      requires: [
          'static/lib/jquery.js',
          'static/js/mod.js'
      ]
  });

//调用组件开始

fis.hook('commonjs', {
    extList: ['.js', '.jsx', '.es', '.ts', '.tsx']
})
// fis.hook('node_modules')

// fis.match('/{node_modules}/**.js', {
//     isMod: true,
//     useSameNameRequire: true,
// });



fis.match('::package', {
    // npm install [-g] fis3-postpackager-loader
    // 分析 __RESOURCE_MAP__ 结构，来解决资源加载问题
    postpackager: fis.plugin('loader', {
        resourceType: 'commonJs',
        useInlineMap: true // 资源映射表内嵌
    })
})


// fis3 release prod 产品发布，进行合并
// fis.media('prod')
//     .match('*.js', {
//         packTo: '/static/aio.js'
//     });
// 调用组件结束

// Global end

// default media is `dev`
fis.media('dev')
  .match('*', {
    useHash: false,
    optimizer: null
  });

// extends GLOBAL config
fis.media('production');