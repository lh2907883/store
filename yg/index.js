/**
 * 时间格式化
 */
Date.prototype.format = function(fmt) {
    var o = {
        "M+": this.getMonth() + 1, //月份
        "d+": this.getDate(), //日
        "H+": this.getHours(), //小时
        "m+": this.getMinutes(), //分
        "s+": this.getSeconds(), //秒
        "q+": Math.floor((this.getMonth() + 3) / 3), //季度
        "S": this.getMilliseconds() //毫秒
    };
    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
        if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
}
$.fn.datetimepicker.dates['zh-CN'] = {
    days: ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六", "星期日"],
    daysShort: ["周日", "周一", "周二", "周三", "周四", "周五", "周六", "周日"],
    daysMin:  ["日", "一", "二", "三", "四", "五", "六", "日"],
    months: ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"],
    monthsShort: ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"],
    today: "今天",
    suffix: [],
    meridiem: ["上午", "下午"]
};


var Report = function(){};
Report.prototype = {
    /**
     * {
            date: //日期,
            cost: //本金,
            benefit: //收益,
            cash: //可提现额度
        }
     */
    piece: [],
    //操作记录
    records: [],
    /**
     * 投入资金
     * 
     * @param {any} date 年月
     * @param {any} money 金额
     */
    touru: function(date, money){
        var res = [{
            date: date,
            //本金
            cost: money,
            //收益
            benefit: 0,
            //可提现额度
            cash: 0
        }]
        var times = this.genYearMonth(date);
        this.piece = this.piece.concat(res).concat(times.map(function(item, index){
            return {
                date: item,
                cost: 0,
                benefit: index < 6 ? (money / 6) : (money / 12),
                cash: index < 6 ? (money / 6) : (money / 12)
            }
        }));
        this.records.push(`<p class="text-danger">${date}投入金额<strong>${money}</strong>元<p>`);
    },
    /**
     * 提现
     * 
     * @param {any} date 年月
     * @param {any} money 金额
     */
    tixian: function(date, money){
        var res = [{
            date: date,
            //本金
            cost: 0,
            //收益
            benefit: 0,
            //可提现额度
            cash: -money
        }]
        this.piece = this.piece.concat(res);
        this.records.push(`<p class="text-success">${date}提取金额<strong>${money}</strong>元<p>`);
    },
    /**
     * 复投
     * 
     * @param {any} date 年月
     * @param {any} money 金额
     */
    futou: function(date, money){
        this.tixian(date, money);
        this.touru(date, money);
    },
    //获取date之后一年的每个月
    genYearMonth: function(date){
        var regex = /^([\d]+)年([\d]+)月$/;
        var match = date.match(regex);
        if(match){
            var res = [];
            var sy = +match[1],
                sm = +match[2];
            for(var i=1; i<=12; i++){
                var m = sm + i,
                    y = sy;
                if(m > 12){
                    y += 1;
                    m -= 12;
                }
                res.push(`${y}年${m < 10 ? ('0' + m) : m}月`);
            }
            return res;
        }
    },
    data: [],
    /**
     * 生成报表
     * 
     */
    generate: function(){
        if(this.piece.length > 0){
            var arr = this.piece.sort(function(item1, item2){
                if(item1.date === item2.date){
                    return item2.cash - item1.cash;
                }
                else{
                    return item1.date < item2.date ? -1 : 1;
                }
            });
            var sumCost = 0,
                sumBenefit = 0,
                sumCash = 0;
            var data = [], cur;
            for(var i=0; i<arr.length; i++){
                var item = arr[i];
                sumCost += item.cost;
                sumBenefit += item.benefit;
                sumCash += item.cash;
                if(cur && cur.date !== item.date){
                    data.push(cur)
                }
                cur = {
                    date: item.date,
                    sumCost: sumCost,
                    sumBenefit: Math.round(sumBenefit),
                    sumCash: Math.round(sumCash)
                };
                //提现过后,还要把之前月份的可提现金额减掉
                if(item.cash < 0){
                    var cash = cur.sumCash;
                    var n = 0;
                    for(var j=data.length-1; j>=0; j--){
                        if(data[j].sumCash > cash){
                            data[j].sumCash = cash;
                        }
                        else{
                            break;
                        }
                    }
                }
            }
            data.push(cur);
            // console.log(data);
            this.data = data;

            if(this.chart){
                this.chart.destroy();
            }
            $('#chart').css('height', `${data.length * 80}px`);
            this.chart = Highcharts.chart('chart', {
                chart: {
                    type: 'bar'
                },
                credits: {
                    enabled: false
                },
                title: {
                    text: null
                },
                xAxis: {
                    categories: this.data.map(function(item){
                        return item.date;
                    })
                },
                yAxis: {
                    min: 0,
                    title: {
                        text: null
                    }
                },
                legend: {
                    align: 'center',
                    verticalAlign: 'top',
                },
                plotOptions: {
                    bar: {
                        dataLabels: {
                            enabled: true,
                            allowOverlap: true
                        }
                    }
                },
                series: [{
                    name: '累计投入',
                    color: '#3d68cf',
                    data: this.data.map(function(item){
                        return item.sumCost;
                    })
                }, {
                    name: '累计收益',
                    color: '#db413c',
                    data: this.data.map(function(item){
                        return +(item.sumBenefit.toFixed(0));
                    })
                }, {
                    name: '可提现金额',
                    color: '#a6ea8a',
                    data: this.data.map(function(item){
                        return +(item.sumCash.toFixed(0));
                    })
                }]
            });
        }
    },
    /**
     * 返回指定年月的可提现金额
     * 
     * @param {any} date 年月
     */
    getCash: function(date){
        var res = this.data.filter(function(item){
            return item.date === date;
        });
        if(res.length > 0){
            return res[0].sumCash;
            // return Math.floor(sumCash / 1000) * 1000;
        }
    },
    reset: function(){
        this.piece = [];
        this.data = [];
        this.records = [];
        if(this.chart){
            this.chart.destroy();
        }
        this.chart = null;
    }
}
var rep = new Report();

var form = document.getElementById('form');
var check = function(){
    var date = form.date.value;
    var type = form.type.value;
    switch(type){
        case '1':
        $(form.money).attr('placeHolder', '金额(请输入1000的整数倍)');
            break;
        case '2':
            var cash = rep.getCash(date);
            if(cash){
                //用于复投的最大金额
                cash = Math.floor(cash / 1000) * 1000;
                $(form.money).attr('placeHolder', `最多可复投${cash}元`).data('cash', cash);
            }
            else{
                $(form.money).attr('placeHolder', '复投金额为0').data('cash', 0);
            }
            break;
        case '3':
            var cash = rep.getCash(date);
            if(cash){
                $(form.money).attr('placeHolder', `最多可提现${cash}元`).data('cash', cash);
            }
            else{
                $(form.money).attr('placeHolder', '提现金额为0').data('cash', 0);
            }
            break;
    }
}
$('.form_datetime').datetimepicker({
    format: 'yyyy年mm月',  
    weekStart: 1,  
    autoclose: true,  
    startView: 3,  
    minView: 3,  
    forceParse: false,  
    language: 'zh-CN'  
}).on('change', check);

$(form.type).on('change', check);
$('#build').on('click', function(){
    var date = form.date.value;
    var money = +form.money.value;
    var type = form.type.value;
    if(date && money){
        if(type !== '3' && !Number.isInteger(money / 1000.0)){
            alert('金额必须是1000的整数倍');
            form.money.value = '';
            form.money.focus();
            return;
        }
        switch(type){
            case '1':
                rep.touru(date, money);
                break;
            case '2':
                var cash = $(form.money).data('cash');
                if(cash < money){
                    alert(`最多只能投入${cash}元`);
                    return;
                }
                rep.futou(date, money);
                break;
            case '3':
                var cash = $(form.money).data('cash');
                if(cash < money){
                    alert(`最多只能提现${cash}元`);
                    return;  
                }
                rep.tixian(date, money);
                break;
        }
        rep.generate();
        $(form.date).val('');
        $(form.money).val('');
        var html = rep.records.join('');
        $('#records').html(html);
    }
});
$('#reset').on('click', function(){
    rep.reset();
    $(form.money).attr('placeHolder', '金额(请输入1000的整数倍)');
    form.type.value = '1';
    $('#records').empty();
})