$(function(){
    function generateRandomNumber(min, max) {
        // 使用 Math.random() 生成一个介于 0 和 1 之间的随机浮点数
        const randomFloat = Math.random();
        // 使用映射将随机浮点数转换为整数
        const randomNumber = Math.floor(randomFloat * (max - min + 1)) + min;
        return randomNumber;
    }
    window.topic = [];
    function genTopics(){
        // 11-2 18-9
        for(var i = 11; i <= 18; i++){
            for (var j = i - 9; j<= 9; j++){
                topic.push(`${i} - ${j} =`);
            }
        }
        // 20-1 20-9
        for(var i = 1; i <= 9; i++){
            topic.push(`20 - ${i} =`);
        }
        // // 100-1 100-9 100-11 100-99
        // for(var i = 1; i <= 9; i++){
        //     topic.push(`20 - ${i} =`);
        // }
    }
    genTopics();
    $('.btn-gen').on('click', function(){
        var content = '';
        for(var i = 0; i < 50; i++){
            var index = generateRandomNumber(0, topic.length - 1)
            content += `<div class="cell">${topic[index]}</div>`;
        }
        $('#table').html(content);
    });
    $('.btn-print').on('click', function(){
        $('.btn').hide();
        window.print();
        $('.btn').show();
    });
})