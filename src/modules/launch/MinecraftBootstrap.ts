import { spawnProc } from "../../impl/ClicornAPI";
import { EventEmitter } from "../../impl/EventEmitter";
import { PROCESS_END_GATE, PROCESS_LOG_GATE } from "../commons/Constants";
import { MinecraftContainer } from "../container/MinecraftContainer";

const POOL = new Map<number, RunningMinecraft>();
const REV_POOL = new Map<RunningMinecraft, number>();

class RunningMinecraft {
  readonly args: string[];
  readonly executable: string;
  readonly container: MinecraftContainer;
  readonly isolateRoot: string;
  status: RunningStatus = RunningStatus.STARTING;
  emitter: EventEmitter | null = null;
  exitCode = "";
  private process = -1;
  onMessage: (e: Event) => unknown = () => {};
  onExit: (e: Event) => unknown = () => {};

  constructor(
    args: string[],
    exec: string,
    container: MinecraftContainer,
    isolateRoot: string,
    emitter: EventEmitter | null = null
  ) {
    this.args = args;
    this.container = container;
    this.executable = exec;
    this.emitter = emitter;
    this.isolateRoot = isolateRoot;
  }
  async run(): Promise<number> {
    try {
      this.process = await spawnProc(
        `"${this.executable}" ${escapeArgs(this.args).join(" ")}`
      );
    } catch (e) {
      console.log(e);
      return -1;
    }
    this.onMessage = (e: Event) => {
      const l = Buffer.from((e as CustomEvent).detail, "base64").toString();
      this.emitter?.emit(PROCESS_LOG_GATE, l, false);
    };
    this.onExit = (e: Event) => {
      this.emitter?.emit(PROCESS_END_GATE, (e as CustomEvent).detail);
      window.removeEventListener(`ProcOutput-${this.process}`, this.onMessage);
      window.removeEventListener(`ProcExit-${this.process}`, this.onExit);
    };
    window.addEventListener(`ProcOutput-${this.process}`, this.onMessage);
    window.addEventListener(`ProcExit-${this.process}`, this.onExit);

    const id = this.process;
    POOL.set(id, this);
    REV_POOL.set(this, id);
    this.status = RunningStatus.RUNNING;
    return id;
  }

  async kill(): Promise<void> {
    // Nothing will actually happen
  }

  async disconnect(): Promise<void> {
    await this.kill(); // Alias
  }

  onEnd(fn: (exitCode: string) => unknown): void {
    this.emitter?.on(PROCESS_END_GATE, (c) => {
      fn(c);
    });
  }

  onLog(fnLog: (s: string) => unknown, fnErr: (s: string) => unknown): void {
    this.emitter?.on(PROCESS_LOG_GATE, (s, isErr) => {
      if (isErr) {
        fnErr(s);
      } else {
        fnLog(s);
      }
    });
  }
}

enum RunningStatus {
  STARTING,
  RUNNING,
  STOPPING,
  UNKNOWN,
}

export function runMinecraft(
  args: string[],
  javaExecutable: string,
  container: MinecraftContainer,
  isolateRoot: string,
  emitter?: EventEmitter
): Promise<number> {
  const runningArtifact = new RunningMinecraft(
    args,
    javaExecutable,
    container,
    isolateRoot,
    emitter
  );
  return runningArtifact.run();
}

export function escapeArgs(a: string[]): string[] {
  const o: string[] = [];
  for (let x of a) {
    if (x.includes(" ")) {
      x = `"${x.replaceAll('"', '\\"')}"`;
    }
    o.push(x);
  }
  return o;
}
