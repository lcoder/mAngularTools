var hrjiaWeiXinApp = angular.module("base", [], function($httpProvider) {
    $httpProvider.defaults.headers.post["Content-Type"] = "application/x-www-form-urlencoded;charset=utf-8";
    var param = function(obj) {
        var query = "",
            name, value, fullSubName, subName, subValue, innerObj, i;
        for (name in obj) {
            value = obj[name];
            if (value instanceof Array) {
                for (i = 0; i < value.length; ++i) {
                    subValue = value[i];
                    fullSubName = name + "[" + i + "]";
                    innerObj = {};
                    innerObj[fullSubName] = subValue;
                    query += param(innerObj) + "&"
                }
            } else {
                if (value instanceof Object) {
                    for (subName in value) {
                        subValue = value[subName];
                        fullSubName = name + "[" + subName + "]";
                        innerObj = {};
                        innerObj[fullSubName] = subValue;
                        query += param(innerObj) + "&"
                    }
                } else {
                    if (value !== undefined && value !== null) {
                        query += encodeURIComponent(name) + "=" + encodeURIComponent(value) + "&"
                    }
                }
            }
        }
        return query.length ? query.substr(0, query.length - 1) : query
    };
    $httpProvider.defaults.transformRequest = [function(data) {
        return angular.isObject(data) && String(data) !== "[object File]" ? param(data) : data
    }]
}).config(['$compileProvider', function( $compileProvider ){
    var extensionReg = /^\s*(https?|ftp|mailto|data|wxLocalResource):/i ;
    $compileProvider.imgSrcSanitizationWhitelist( extensionReg );
    $compileProvider.aHrefSanitizationWhitelist( extensionReg );
}]).config(["$interpolateProvider", function($interpolateProvider) {
    $interpolateProvider.startSymbol("{[");
    $interpolateProvider.endSymbol("]}")
}]).factory("interceptors",[function(){
    return {
            // if beforeSend is defined call it
            'request': function(request) {
                if ( request.beforeSend ) request.beforeSend() ;
                return request ;
            } ,
            // if complete is defined call it
            'response': function(response) {
                if (response.config.complete) response.config.complete(response) ;
                return response;
            }
        } ;
} ] ).config([ "$httpProvider" , function( $httpProvider ){
    $httpProvider.interceptors.push( "interceptors" ) ;
} ] ).directive('ngEnter', function () {
    return function (scope, element, attrs) {
        element.bind("keydown keypress", function (event) {
            if(event.which === 13) {
                scope.$apply(function (){
                    scope.$eval(attrs.ngEnter);
                });
                event.preventDefault();
            }
        });
    };
}).filter( "readableDate" , function(){
    function warn( txt ){
        if( console && console.warn ){ console.warn( 'mRecentDayForm:' + txt ) ; }
        return '' ;
    }
    function monthDiff(d1, d2) {
        var months;
        months = ( d2.getFullYear() - d1.getFullYear() ) * 12;
        months -= d1.getMonth() + 1 ;
        months += d2.getMonth() + 1 ;
        return months <= 0 ? 0 : months ;
    }
    function calculateFormat( str , options ){
        var holder = ( options && options.holder ) || '共享' ;
        str = str.replace( /-/g , '/' ) ;
        if( str ) {
            var now = null ,
                date = null ,
                create_date_format = null ,
                html = '' ,
                timestamp = Date.parse( str ) ,
                timestamp_now = 0 ;
            if( !isNaN( timestamp ) ){
                timestamp /= 1000 ;
                now = new Date() ;
                date = new Date( str ) ;
                create_date_format = str.replace( /\s.*/g , '').replace( /\//g , '-' ) ;  // 简陋的日期格式化
                timestamp_now = now.getTime() / 1000 ;

                var diff_seconds = Math.floor( timestamp_now - timestamp ) ,
                    diff_minutes = Math.floor( diff_seconds / 60 ) ,
                    diff_hours = Math.floor( diff_seconds / 60 / 60 ) ,
                    diff_days = Math.floor( diff_seconds / 60 / 60 / 24 ) ;
                if( diff_seconds < 0 ){
                    return warn( '日期不能大于当前时间' ) ;
                }else if( diff_seconds == 0 ){
                    html = '<span title="0秒前**">刚刚**</span>' ;
                }else if( diff_seconds < 60 ){
                    html = '<span title="' + create_date_format + '**">' + diff_seconds + '秒前**</span>' ;
                }else if( diff_minutes < 60 ){
                    html = '<span title="' + create_date_format + '**">' + diff_minutes + '分钟前**</span>' ;
                }else if( diff_hours < 24 ){
                    html = '<span title="' + create_date_format + '**">' + diff_hours + '小时前**</span>';
                }else{  // 显示日期
                    var tmpl_now = now ,
                        tmpl_create_time = date ;
                    tmpl_now.setMilliseconds( 0 ) ;
                    tmpl_now.setSeconds( 0 ) ;
                    tmpl_now.setMinutes( 0 ) ;
                    tmpl_now.setHours( 0 ) ;

                    tmpl_create_time.setMilliseconds( 0 ) ;
                    tmpl_create_time.setSeconds( 0 ) ;
                    tmpl_create_time.setMinutes( 0 ) ;
                    tmpl_create_time.setHours( 0 ) ;

                    var _diff = ( tmpl_now.getTime() - tmpl_create_time.getTime() ) / 1000 ,
                        diff_tranditional_days = Math.floor( _diff / 60 / 60 / 24 ) ;
                    if( diff_tranditional_days < 1 ){
                        return warn( '卧槽,什么鬼,竟然能跑到这一步,理论上有漏洞啊' ) ;
                    }else if( diff_tranditional_days >= 1 && diff_tranditional_days <= 7 ){
                        html = '<span title="' + create_date_format + '**">' + diff_tranditional_days + '天前**</span>' ;
                    }else{
                        var diff_tranditional_months = monthDiff( tmpl_create_time , tmpl_now ) ;
                        if( diff_tranditional_months < 1 ){
                            html = '<span title="' + create_date_format + '**">' + diff_tranditional_days + '天前**</span>' ;
                        }else if( diff_tranditional_months < 12 ){
                            html = '<span title="' + diff_tranditional_months + '月前**">'+ create_date_format + '**</span>' ;
                        }else{
                            var diff_tranditional_years = tmpl_now.getFullYear() - tmpl_create_time.getFullYear() ;
                            html = '<span title="' + diff_tranditional_years + '年前**">'+ create_date_format + '**</span>' ;
                        }
                    }
                }
                return html.replace( /\*\*/g , holder ) ;
            }else{
                return warn( '日期转换失败' ) ;
            }
        }else{
            return warn( '请输入参数' ) ;
        }
    }
    var readableDate = function( input ){
        return calculateFormat( input , { holder: '发布' } );
    }
    return readableDate ;
} ).filter("dateformat",function(){
    // 格式化2016-07-14 00:00:00 为 2016-07-14
    try{
        var format = function( input ){
            return input.slice( 0 , -9 ) ;
        }
        return format ;
    }catch(e){
        console.warn( 'dateformat过滤器出错' ) ;
        return '' ;
    }
}).filter("to_trusted", ["$sce", function($sce) {
    return function(text) {
        return $sce.trustAsHtml(text)
    }
}]).directive("ngTap", function() {
    return function(scope, element, attrs) {
        element.bind("touchstart", function(ev) {
            scope.$apply(attrs["ngTap"]);
            ev.preventDefault()
        })
    }
}).factory("infiniteScroll",function(){
    function infiniteScroll( config ){
        this.init( config ) ;
    }
    angular.extend( infiniteScroll.prototype , {
        init: function( config ){
            var body = document.body ,
                html = document.documentElement ,
                $body = angular.element( document.body ) ,
                $window = angular.element( window ) ;
                // body高度
            var getBodyHeight = function(){
                    return Math.max( body.scrollHeight , body.offsetHeight , html.clientHeight , html.scrollHeight , html.offsetHeight ) ;
                } ,
                // 是否滚动到底部
                checkIsToBottom = function(){
                    var bodyHeight = getBodyHeight() ,
                        screenHeight = screen.height ,
                        scrollTop = ( window.pageYOffset || document.scrollTop || 0 ) - ( document.clientTop || 0 ) ,
                        page = Math.ceil( bodyHeight / screenHeight ) ;     // 第几屏
                    if( scrollTop + screenHeight >= bodyHeight ){
                        config.scrollBottom && config.scrollBottom() ;
                    }
                }
            $window.on( 'scroll' , checkIsToBottom.throttle( 200 )  ) ;
        }
    } );
    return infiniteScroll ;
}).factory("Mask",function(){
    function mask( id ){
        var $ = angular.element ,
            $mask_html = $( '<div class="mask"></div>' ) ;
        $( document.body ).append( $mask_html ) ;
        this.mask = $mask_html ;
    }
    angular.extend( mask.prototype , {
        show: function(){
            var _mask = this.mask ;
            _mask.addClass('show_block') ;
            setTimeout(function(){
                _mask.addClass('show_opacity') ;
            },10);
            return this ;
        } ,
        hide: function(){
            var _mask = this.mask ;
            _mask.removeClass('show_opacity') ;
            setTimeout(function(){
                _mask.removeClass('show_block') ;
            },200);
            return this ;
        }
    } ) ;
    return mask ;
}).factory("cookie",function(){
    var cookie = function(name, value, options) {

        if (typeof value != 'undefined') {
            // 有value值, 设置cookie
            options = options || {};
            if (value === null) {
                value = '';
                options.expires = -1;
            }
            var expires = '';
            if (options.expires && (typeof options.expires == 'number' || options.expires.toUTCString)) {
                var date;
                if (typeof options.expires == 'number') {
                    //options.expires以小时为单位
                    date = new Date();
                    date.setTime(date.getTime() + (options.expires * 60 * 60 * 1000));
                } else {
                    date = options.expires;
                }
                expires = '; expires=' + date.toUTCString();
            }
            var path = options.path ? '; path=' + options.path : '; path=/';
            var domain = options.domain ? '; domain=' + options.domain : '';
            var secure = options.secure ? '; secure' : '';
            document.cookie = [name, '=', encodeURIComponent(value), expires, path, domain, secure].join('');
        } else {
            // 只有name值, 获取cookie
            var cookieValue = null;
            if (document.cookie && document.cookie != '') {
                var cookies = document.cookie.split(';');
                for (var i = 0; i < cookies.length; i++) {
                    var cookie = jQuery.trim(cookies[i]);
                    if (cookie.substring(0, name.length + 1) == (name + '=')) {
                        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                        break;
                    }
                }
            }
            return cookieValue;
        }
    };
    return cookie ;
}).factory("dialog", function() {
    var $ = angular.element;
    var pageScroll = {
        event: function(e) {
            e.preventDefault()
        },
        stop: function() {
            var fn = this.event;
            document.body.addEventListener("touchmove", fn, false)
        },
        allow: function() {
            var fn = this.event;
            document.body.removeEventListener("touchmove", fn, false)
        }
    };
    var dialog = {
        _pageScroll: pageScroll,
        $confirm: null,
        confirm: function(html, callback, initFn) {
            var that = this,
                $confirm = null;
            if (this.$confirm !== null || $("#dg-tip").length > 0) {
                return
            } else {
                $confirm = $('<div id="dg-confirm"><div class="dg_body"><div class="dg_box"><i class="iconfont blue">&#xe649;</i>' + html + '</div><div class="btm"><a href="javascript:void(0);" class="graybtn cancel">取消</a><a href="javascript:void(0);" class="btn">确定</a></div></div></div>')
            }
            $confirm.appendTo("body").addClass("pop_in");
            this.$confirm = $confirm;
            pageScroll.stop();
            $confirm.on("click", "a.btn", function() {
                setTimeout(function() {
                    callback && callback()
                }, 50);
                return false
            }).on("click", ".cancel", function() {
                that.close()
            });
            initFn && initFn()
        },
        close: function() {
            var that = this,
                $confirm = that.$confirm;
            if ($confirm === null) {
                return
            } else {
                $confirm.addClass("pop_out");
                setTimeout(function() {
                    $confirm.off().remove();
                    that.$confirm = null;
                    pageScroll.allow()
                }, 350)
            }
        },
        tip: function(html) {
            var $Tip = null;
            if ($(document.getElementById("dg-tip")).length > 0) {
                return
            } else {
                $Tip = $('<div id="dg-tip">' + html + "</div>")
            }
            $(document.getElementsByTagName("body")[0]).append($Tip.addClass("pop_in"));
            setTimeout(function() {
                $Tip.removeClass("pop_in").addClass("pop_out");
                setTimeout(function() {
                    $Tip.remove()
                }, 300)
            }, 2500)
        },
        bubble: function(html) {
            var $Tip = null;
            if ($(document.getElementById("dg-bubble")).length > 0) {
                return
            } else {
                $Tip = $('<div id="dg-bubble" class="flex"><div class="dg-bubble-inner"><span>' + html + "</span></div></div>")
            }
            $(document.getElementsByTagName("body")[0]).append($Tip);
            setTimeout(function() {
                $Tip.addClass("pop_x_out");
                setTimeout(function() {
                    $Tip.remove()
                }, 300)
            }, 2500)
        },
        go2Register: function(callback, html) {
            var that = this,
                $confirm = null;
            agent = getUrlParams("agent");
            if (this.$confirm !== null || $("#dg-tip").length > 0) {
                return
            } else {
                $confirm = $('<div id="dg-register"><div class="dg_body"><div class="dg_box"><a class="close" href="javascript:void(0);"><i class="icon icon_close"></i></a>' + html + '</div><div class="btm"><a href="/bro/share/register?agent=' + agent + '" class="yellow_btn close"><i class="icon icon_post"></i>立即注册</a></div></div></div>')
            }
            $confirm.appendTo("body").addClass("pop_in");
            this.$confirm = $confirm;
            pageScroll.stop();
            $confirm.on("click", "a.btn", function() {
                setTimeout(function() {
                    var calc = callback && callback();
                    if (calc === true) {
                        that.close()
                    }
                }, 50);
                return false
            }).on("click", ".close,.cancel", function() {
                that.close()
            })
        }
    };
    return dialog
}).factory("aniEvent", function() {
    var WN = {},
        body = document.body || document.documentElement,
        style = body.style,
        transition = "transition",
        transitionEnd, animationEnd, vendorPrefix;
    transition = transition.charAt(0).toUpperCase() + transition.substr(1);
    vendorPrefix = (function() {
        var i = 0,
            vendor = ["Moz", "Webkit", "Khtml", "O", "ms"];
        while (i < vendor.length) {
            if (typeof style[vendor[i] + transition] === "string") {
                return vendor[i]
            }
            i++
        }
        return false
    })();
    transitionEnd = (function() {
        var transEndEventNames = {
            WebkitTransition: "webkitTransitionEnd",
            MozTransition: "transitionend",
            OTransition: "oTransitionEnd otransitionend",
            transition: "transitionend"
        };
        for (var name in transEndEventNames) {
            if (typeof style[name] === "string") {
                return transEndEventNames[name]
            }
        }
    })();
    animationEnd = (function() {
        var animEndEventNames = {
            WebkitAnimation: "webkitAnimationEnd",
            animation: "animationend"
        };
        for (var name in animEndEventNames) {
            if (typeof style[name] === "string") {
                return animEndEventNames[name]
            }
        }
    })();
    WN.addTranEvent = function(elem, fn, duration) {
        var called = false;
        var fncallback = function() {
            if (!called) {
                fn();
                called = true
            }
        };

        function hand() {
            elem.addEventListener(transitionEnd, function() {
                elem.removeEventListener(transitionEnd, arguments.callee, false);
                fncallback()
            }, false)
        }
        setTimeout(hand, duration)
    };
    WN.addAnimEvent = function(elem, fn) {
        elem.addEventListener(animationEnd, fn, false)
    };
    WN.removeAnimEvent = function(elem, fn) {
        elem.removeEventListener(animationEnd, fn, false)
    };
    WN.setStyleAttribute = function(elem, val) {
        if (Object.prototype.toString.call(val) === "[object Object]") {
            for (var name in val) {
                if (/^transition|animation|transform/.test(name)) {
                    var styleName = name.charAt(0).toUpperCase() + name.substr(1);
                    elem.style[vendorPrefix + styleName] = val[name]
                } else {
                    elem.style[name] = val[name]
                }
            }
        }
    };
    WN.transitionEnd = transitionEnd;
    WN.vendorPrefix = vendorPrefix;
    WN.animationEnd = animationEnd;
    return WN
}).factory("countDown", function() {
    function countDown(config) {
        this.ele = config.ele;
        this.time = config.time;
        this.isDelay = config.isDelay;
        this.start = config.start;
        this.finish = config.finish;
        this.countIngTxt = config.countIngTxt ? config.countIngTxt : "秒后重新发送";
        this.originalTxt = this.ele.text();
        this.timer = null;
        this._init()
    }
    countDown.prototype._init = function() {
        var that = this,
            time = that.time;
        that.start && that.start.call(that.ele);
        that.isDelay ? that.ele.text(prefixInteger(time, 2) + that.countIngTxt) : "";
        that.timer = setInterval(function() {
            time--;
            that.ele.text(prefixInteger(time, 2) + that.countIngTxt);
            if (time == 0) {
                clearInterval(that.timer);
                that.ele.text(that.originalTxt);
                that.finish && that.finish.call(that.ele);
                return false
            }
        }, 1000)
    };
    countDown.prototype.destory = function() {
        if (this.timer) {
            clearInterval(this.timer);
            this.ele.text(this.originalTxt);
            this.timer = null
        }
    };
    countDown.prototype.isEnd = function() {
        if (this.timer) {
            return false
        }
        return true
    };

    function prefixInteger(num, length) {
        return (num / Math.pow(10, length)).toFixed(length).substr(2)
    }
    return countDown
}).controller( 'shareFriendsController' , [ '$scope' , function( $scope ){
    $scope.shareFriends = function(){
        var $ = angular.element ,
            $body = $( document.body ) ,
            $html = $( '<div id="dg-friends-share" class=""><div class="bg_share"></div></div>' ) ;
        var fn = function( ev ){
            ev.preventDefault() ;
        } ;
        $body.append( $html ).on( 'touchmove' , fn ) ;
        $html.on( 'touchend' , function(){
            $html.remove() ;
            $body.off( 'touchmove' , fn ) ;
        } ) ;
        setTimeout(function(){
            $html.addClass('show') ;
        },100);
    }
} ] ) ;