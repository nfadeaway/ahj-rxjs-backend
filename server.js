const http = require('http');
const Koa = require('koa');
const cors = require('@koa/cors');
const koaBody = require('koa-body').default;
const Router = require('koa-router');
const { faker } = require('@faker-js/faker');

const app = new Koa();
const router = new Router();

let messages = [];
let unreadMessages = [];
let lastTimestamp = 0;

setInterval(() => {
  messages.push(
    {
      "id": faker.string.uuid(),
      "from": faker.internet.email(),
      "subject": faker.lorem.words(3),
      "body": faker.lorem.text() ,
      "received": new Date().getTime()
    }
  )
}, 5000)

router.get('/messages/unread', ctx => {
  unreadMessages = messages.filter((message) => {
    return message.received > lastTimestamp;
  });
  const timestamp = new Date().getTime();
  lastTimestamp = timestamp;
  ctx.body = {
    "status": "ok",
    "timestamp": lastTimestamp,
    "messages": unreadMessages
  };
})

app
  .use(koaBody())
  .use(cors())
  .use(router.allowedMethods())
  .use(router.routes())
  .use((ctx, next) => {
    if (ctx.request.method !== 'OPTIONS') {
      next();
      return;
    }
    ctx.response.set('Access-Control-Allow-Origin', '*');
    ctx.response.set('Access-Control-Allow-Methods', 'DELETE, PUT, PATCH, GET, POST');
    ctx.response.status = 204;
  });

const server = http.createServer(app.callback());
const port = 7071;

server.listen(port, (err) => {
  if (err) {
    console.log(err);
    return;
  }
  console.log('Server is listening to '+ port);
})
