const managerPort = 7211;
const coonPort = 7210;
const remote = "0.0.0.0";

const local = "0.0.0.0";
const port = 3000;

if (import.meta.main) {
  const service = await Deno.connect({ hostname: remote, port: managerPort });
  while (true) {
    try {
      const pong = new Uint8Array(1);
      await service.read(pong);
      console.log("pong", service.remoteAddr.transport);
      const port = await Deno.connect({ hostname: remote, port: coonPort });
      const reverse = await Deno.connect({ hostname: "0.0.0.0", port: 3000 });
      await Promise.all([
        port.readable.pipeTo(reverse.writable),
        reverse.readable.pipeTo(port.writable),
        service.write(new Uint8Array([1])),
      ]);
    } catch (error) {
      console.error(error);
    }
  }
}
