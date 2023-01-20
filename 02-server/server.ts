import { Application, Context, Router, send } from "https://deno.land/x/oak@v10.5.1/mod.ts";

/***********************
 * COORDINATION DATA   *
 ***********************/
const coordinations = new Map<string, [number, number]>();

/***********************
 * ROUTE               *
 ***********************/
const router = new Router();
router
  .redirect("/", "/public")
  .put("/coord", (context: Context) => {
    //url에서 query "name", "x", "y"에 대한 문자열을 추출합니다.
    const userName = context.request.url.searchParams.get("name");
    const coord_x  = context.request.url.searchParams.get("x");
    const coord_y  = context.request.url.searchParams.get("y");

    if (userName === 'undefined') throw "";
    if (userName === null || coord_x === null || coord_y === null) throw "";

    //server에 좌표 정보를 저장 합니다.
    coordinations.set(userName, [ +coord_x, +coord_y ]);

    //정상적으로 변경된 좌표 정보를 응답 합니다.
    context.response.body = {
      updated: {
        userName: userName,
        coordinations: [ +coord_x, +coord_y ]
      }
    }
  })
  .get("/coord", (context: Context) => {
    //server에 저장되어 있는 좌표 정보를 응답 합니다.
    const res: any[] = [];
    coordinations.forEach((coordinations, userName) => {
      res.push({ userName: userName, coordinations: coordinations });
    });

    context.response.body = res;
  });

/***********************
 * FILE SERVICE        *
 ***********************/
const staticFileServices = async (context: Context, next: Function) => {
  const urlPath = context.request.url.pathname.substring(0, "/public".length);
  if (urlPath === "/public") {
    await send(context, "./02-server/public/index.html", { root : Deno.cwd() });
  } else {
    await next();
  }
}

/***********************
 * LOCAL SERVER        *
 ***********************/
const app = new Application();
app.use(staticFileServices);
app.use(router.routes());
app.use(router.allowedMethods());
await app.listen({ port: 8000 });