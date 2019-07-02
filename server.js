let WebSocker = require('ws');
// redis的客户端
let redis = require('redis');
let client = redis.createClient();

let wss = new WebSocker.Server({
  port: 3000
});
let clientsArr = [];
// 原生的websocket就两个常用方法 on('message') send()
wss.on('connection', function (ws) {
  // 连接即获取数据
  clientsArr.push(ws);
  client.lrange('barrages', 0, -1, function (err, applies) {
    applies = applies.map(item => JSON.parse(item));
    ws.send(JSON.stringify({
      type: 'INIT',
      data: applies
    }))
  })

  // 添加弹幕
  ws.on('message', function (data) {
    client.rpush('barrages', data, redis.print);
    clientsArr.forEach(w => {
      w.send(JSON.stringify({
        type: 'ADD',
        data: JSON.parse(data)
      }));
    });
  })

  // 删除关闭连接客户
  ws.on('close', function () {
    clientsArr = clientsArr.filter(client => client != ws);
  })


})