/**
 * Created by HP on 2017/3/5.
 */
require.config({
    baseUrl: "/src/js",
    paths: {
        'jquery':'empty:',
        'jquery-mousewheel':'../../vendor/jquery.mousewheel'
    },
    shim:{
        'jquery-mousewheel':["jquery"]
    }
});