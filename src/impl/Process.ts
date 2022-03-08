export function waitProcessEnd(pc: number): Promise<[string[], number]> {
  return new Promise<[string[], number]>((res) => {
    const ss: string[] = [];
    const fun = (e: Event) => {
      const l = Buffer.from((e as CustomEvent).detail, "base64").toString();
      if (l) {
        ss.push(l);
      }
    };
    const kil = (e: Event) => {
      res([ss, (e as CustomEvent).detail || -1]);
      window.removeEventListener(`ProcOutput-${pc}`, fun);
      window.removeEventListener(`ProcExit-${pc}`, kil);
    };
    window.addEventListener(`ProcOutput-${pc}`, fun);
    window.addEventListener(`ProcExit-${pc}`, kil);
  });
}
