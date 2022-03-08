import { getUserHome } from "../../impl/ClicornAPI";
import { pathJoin } from "../../impl/Path";

const ALICORN_PE_BASE_PATH_NAME = ".alicornpe";

export function getBasePath(): string {
  return pathJoin(getUserHome(), ALICORN_PE_BASE_PATH_NAME);
}
