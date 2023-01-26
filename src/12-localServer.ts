import { Application, Router, send } from "https://deno.land/x/oak@v10.5.1/mod.ts";

//좌표를 저장 할 Container 추가 User String - x, y
const coords = new Map<string, [number, number]>();

//Application 생성
const app = new Application();

//미들웨어 교체 - Router로!
const router = new Router();
router
  .put("/coord", (context) => {
    //추출 - url에서 query "name", "x", "y"에 대한 문자열을 추출합니다.
    const userName = context.request.url.searchParams.get("name");
    const coord_x  = context.request.url.searchParams.get("x");
    const coord_y  = context.request.url.searchParams.get("y");

    if (userName === 'undefined') throw "";
    if (userName === null || coord_x === null || coord_y === null) throw "";

    //저장 - server에 좌표 정보를 저장 합니다.
    coords.set(userName, [ +coord_x, +coord_y ]);

    //반환 - 정상적으로 변경된 좌표 정보를 응답 합니다.
    context.response.body = {
      updated: {
        userName: userName,
        coordinations: [ +coord_x, +coord_y ]
      }
    }
  })
  .get("/coord", (context) => {
    //반환 - server에 저장되어 있는 좌표 정보를 응답 합니다.
    const res: any[] = [];
    coords.forEach((coordinations, userName) => {
      res.push({ userName: userName, coordinations: coordinations });
    });

    context.response.body = res;
  })
  .get("/", async (context) => {
    await send(context, "./test.html", { root : Deno.cwd() });
  })

//Application에 새로운 미들웨어(router) 추가
//모든 Method를 허용하겠다 선언
app.use(router.routes());
app.use(router.allowedMethods());

//로그에 새로운 힘을 부여 + 저장기능 + 가져오기기능
const startLog = `
%cHello Deno!
    + 저장기능       __
    + 가져오기기능  / _)
          _.----._/ /
          /         /
      __/ (  | (  |
      /__.-'|_|--|_|

로컬 서버가 시작 되었습니다.
`
console.log(startLog, 'color:green');
await app.listen({ port: 8000 });