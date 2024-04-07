let reverseConn: Deno.Conn | null = null;
let emptyConn: Deno.Conn | null = null;

// 初始化管理 rpc
const initManagerRPC = async () => {
  const reverse = Deno.listen({ port: 7211 });
  const coonPool = Deno.listen({ port: 7210 });
  reverseConn = await reverse.accept();
  // 等待内网端链接
  for await (const coon of coonPool) {
    emptyConn = coon;
  }
};

const listenService = async () => {
  const servicePort = 8080;
  const service = Deno.listen({ port: servicePort });
  for await (const coon of service) {
    try {
      console.log("new coon", coon.remoteAddr.transport);
      if (reverseConn) {
        reverseConn.write(new Uint8Array([1]));
        const pong = new Uint8Array(1);
        await reverseConn.read(pong);
        console.log("creating coon");
        if (emptyConn) {
          console.log("will pipe", pong);
          (emptyConn as Deno.Conn).readable.pipeTo(coon.writable).catch(console.error);
          (coon as Deno.Conn).readable.pipeTo(emptyConn.writable).catch(console.error);
        }
      }
    } catch (error) {
      console.error(error);
    }
  }
};

if (import.meta.main) {
  initManagerRPC().catch(console.error);
  listenService().catch(console.error);
}
