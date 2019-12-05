import portastic from "portastic";

export async function getAvailablePort(): Promise<number> {
  const ports = await portastic.find({ min: 29170, max: 29998 });

  if (ports.length < 1) {
    throw new Error("no free ports available in range 29170 - 29998");
  }

  return ports[0];
}