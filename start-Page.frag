﻿(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
         define(['jquery'], factory);
    } else {
       root.uut=factory(root.jQuery);
    }
}(window, function () {