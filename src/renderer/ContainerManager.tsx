import { Add, Eject, Input, LinkOff } from "@mui/icons-material";
import {
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Fade,
  FormControlLabel,
  Grid,
  IconButton,
  Radio,
  RadioGroup,
  Switch,
  TextField,
  ThemeProvider,
  Tooltip,
  Typography,
} from "@mui/material";
import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router";
import { throttle } from "throttle-debounce";
import { getUserHome, isFileExist, readDirectory } from "../impl/ClicornAPI";
import {
  pathBasename,
  pathDirname,
  pathJoin,
  pathNormalize,
} from "../impl/Path";
import { basicHash } from "../modules/commons/BasicHash";
import { chkPermissions } from "../modules/commons/FileUtil";
import { scanCoresIn } from "../modules/container/ContainerScanner";
import {
  getAllContainerPaths,
  getAllContainers,
  getAllMounted,
  getAllNotMounted,
  getContainer,
  isMounted,
  mount,
  unmount,
} from "../modules/container/ContainerUtil";
import {
  createNewContainer,
  unlinkContainer,
} from "../modules/container/ContainerWrapper";
import { MinecraftContainer } from "../modules/container/MinecraftContainer";
import { isSharedContainer } from "../modules/container/SharedFiles";
import {
  getDoing,
  subscribeDoing,
  unsubscribeDoing,
} from "../modules/download/DownloadWrapper";
import { Icons } from "./Icons";
import { submitSucc } from "./Message";
import { FailedHint, OperatingHintCustom } from "./OperatingHint";
import { hasEdited } from "./Options";
import {
  ALICORN_DEFAULT_THEME_DARK,
  ALICORN_DEFAULT_THEME_LIGHT,
  isBgDark,
} from "./Renderer";
import { useCardStyles, useInputStyles, usePadStyles } from "./Stylex";
import { tr } from "./Translator";

export function setContainerListDirty(): void {
  window.dispatchEvent(new CustomEvent("setContainerListDirty"));
}

export function ContainerManager(): JSX.Element {
  // eslint-disable-next-line prefer-const
  let { modpack, togo } = useParams<{ modpack?: string; togo?: string }>();
  modpack = modpack ? decodeURIComponent(modpack) : undefined;
  const hasToGo = togo === "1";
  const isEleMounted = useRef<boolean>();
  const [refreshTrigger, triggerRefresh] = useState(true);
  const [operating, setOpen] = useState(false);
  const classes2 = usePadStyles();
  const [doing, setDoing] = useState(getDoing());
  const [failedOpen, setFailedOpen] = useState(false);
  const [reason, setReason] = useState("Untracked Error");
  const [opening, setCreating] = useState(!!modpack);
  useEffect(() => {
    isEleMounted.current = true;
    const fun = () => {
      if (isEleMounted.current) {
        triggerRefresh(!refreshTrigger);
      }
    };
    window.addEventListener("setContainerListDirty", fun);
    return () => {
      window.removeEventListener("setContainerListDirty", fun);
      isEleMounted.current = false;
    };
  });
  useEffect(() => {
    subscribeDoing(
      "ContainerManager",
      throttle(250, (d) => {
        setDoing(d);
      })
    );
    return () => {
      unsubscribeDoing("ContainerManager");
    };
  }, []);
  const allContainers = getAllMounted().concat(getAllNotMounted());
  return (
    <Box className={classes2.para}>
      <ThemeProvider
        theme={
          isBgDark() ? ALICORN_DEFAULT_THEME_DARK : ALICORN_DEFAULT_THEME_LIGHT
        }
      >
        <OperatingHintCustom open={operating} msg={doing} />
        <FailedHint
          closeFunc={() => {
            setFailedOpen(false);
          }}
          open={failedOpen}
          reason={reason}
        />
      </ThemeProvider>
      <AddNewContainer
        autoStart={hasToGo}
        modpack={modpack}
        setOperate={(s) => {
          setOpen(s);
        }}
        refresh={() => {
          triggerRefresh(!refreshTrigger);
        }}
        open={opening}
        setFailed={(e) => {
          setFailedOpen(true);
          setReason(e);
        }}
        closeFunc={() => {
          setCreating(false);
        }}
      />
      <Box sx={{ textAlign: "right" }}>
        <Tooltip
          title={
            <Typography className={"smtxt"}>
              {tr("ContainerManager.Add")}
            </Typography>
          }
        >
          <IconButton
            color={"inherit"}
            onClick={() => {
              if (isEleMounted.current) {
                setCreating(true);
              }
            }}
          >
            <Add />
          </IconButton>
        </Tooltip>
      </Box>
      {allContainers.map((c) => {
        const im = isMounted(c);
        return (
          <SingleContainerDisplay
            key={c}
            container={getContainer(c)}
            isMounted={im}
          />
        );
      })}
    </Box>
  );
}

function SingleContainerDisplay(props: {
  container: MinecraftContainer;
  isMounted: boolean;
}): JSX.Element {
  const classes = useCardStyles();
  const mounted = useRef<boolean>(false);
  const [deleteAskOpen, setOpen] = useState(false);
  const [coreCount, setCount] = useState(-1);
  const [isASC, setASCBit] = useState<boolean | null>(null);
  const [refresh, setRefresh] = useState(false);
  const [showBtn, setShowBtn] = useState(false);
  useEffect(() => {
    mounted.current = true;
    if (props.isMounted) {
      void (async () => {
        if (await isSharedContainer(props.container)) {
          if (mounted.current) {
            setASCBit(true);
          }
        } else {
          if (mounted.current) {
            setASCBit(false);
          }
        }
        const cores = (await scanCoresIn(props.container)).length;
        if (mounted.current) {
          setCount(cores);
        }
      })();
    } else {
      setASCBit(null);
    }
    return () => {
      mounted.current = false;
    };
  }, [refresh]);
  return (
    <>
      <Card
        sx={{
          backgroundColor: props.isMounted ? "primary.main" : "primary.light",
        }}
        raised={true}
        color={"primary"}
        className={props.isMounted ? classes.card : classes.uCard}
        onMouseOver={() => {
          setShowBtn(true);
        }}
        onMouseLeave={() => {
          setShowBtn(false);
        }}
        onClick={() => {
          if (props.isMounted) {
            unmount(props.container.id);
            setContainerListDirty();
            setRefresh(!refresh);
          } else {
            mount(props.container.id);
            setContainerListDirty();
            setRefresh(!refresh);
          }
        }}
      >
        <CardContent>
          <Box sx={{ float: "right" }}>
            <Fade in={showBtn}>
              <Grid container direction={"row"}>
                <Grid container direction={"column"} sx={{ width: "auto" }}>
                  <Grid container direction={"row"}>
                    <Tooltip
                      title={
                        <Typography className={"smtxt"}>
                          {tr("ContainerManager.Remove")}
                        </Typography>
                      }
                    >
                      <IconButton
                        color={"inherit"}
                        className={classes.operateButton}
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpen(true);
                        }}
                      >
                        <LinkOff />
                      </IconButton>
                    </Tooltip>
                  </Grid>
                  <Grid container direction={"row"}>
                    {props.isMounted ? (
                      <Tooltip
                        title={
                          <Typography className={"smtxt"}>
                            {tr("ContainerManager.Unmount")}
                          </Typography>
                        }
                      >
                        <IconButton
                          color={"inherit"}
                          className={classes.operateButton}
                          // This has the same effect with just click the card
                        >
                          <Eject />
                        </IconButton>
                      </Tooltip>
                    ) : (
                      <Tooltip
                        title={
                          <Typography className={"smtxt"}>
                            {tr("ContainerManager.Mount")}
                          </Typography>
                        }
                      >
                        <IconButton
                          color={"inherit"}
                          className={classes.operateButton}
                        >
                          <Input />
                        </IconButton>
                      </Tooltip>
                    )}
                  </Grid>
                </Grid>
                <Grid item>
                  {!props.isMounted || isASC === null ? (
                    ""
                  ) : (
                    <img
                      src={isASC ? Icons.CONTAINER_ASC : Icons.CONTAINER_MCX}
                      width={80}
                    />
                  )}
                </Grid>
              </Grid>
            </Fade>
          </Box>

          <ThemeProvider
            theme={
              isBgDark()
                ? ALICORN_DEFAULT_THEME_DARK
                : ALICORN_DEFAULT_THEME_LIGHT
            }
          >
            <Dialog
              open={deleteAskOpen}
              onClose={() => {
                setOpen(false);
              }}
            >
              <DialogTitle>{tr("ContainerManager.AskRemove")}</DialogTitle>
              <DialogContent>
                <DialogContentText>
                  {tr(
                    "ContainerManager.AskRemoveDetail",
                    `ID=${props.container}`
                  )}
                </DialogContentText>
                <DialogActions>
                  <Button
                    onClick={() => {
                      setOpen(false);
                      unlinkContainer(props.container.id);
                      setContainerListDirty();
                    }}
                  >
                    {tr("ContainerManager.Yes")}
                  </Button>
                  <Button
                    onClick={() => {
                      setOpen(false);
                    }}
                  >
                    {tr("ContainerManager.No")}
                  </Button>
                </DialogActions>
              </DialogContent>
            </Dialog>
          </ThemeProvider>
          <Typography
            variant={"h6"}
            sx={{ color: isBgDark() ? "secondary.light" : undefined }}
            gutterBottom
          >
            {props.container.id}
          </Typography>
          <Typography
            sx={{ color: isBgDark() ? "secondary.light" : undefined }}
            className={classes.text}
            gutterBottom
          >
            {tr("ContainerManager.RootDir") + " " + props.container.rootDir}
          </Typography>
          {props.isMounted ? (
            <>
              <Typography
                sx={{ color: isBgDark() ? "secondary.light" : undefined }}
                className={classes.text}
                gutterBottom
              >
                {(coreCount >= 0
                  ? tr("ContainerManager.Cores", `Count=${coreCount}`)
                  : tr("ContainerManager.CoresLoading")) +
                  " - " +
                  tr(
                    isASC
                      ? "ContainerManager.Type.Shared"
                      : "ContainerManager.Type.Physical"
                  )}
              </Typography>
            </>
          ) : (
            ""
          )}
        </CardContent>
      </Card>
      <br />
    </>
  );
}

function validateName(n: string): boolean {
  n = n.trim();
  if (n.length <= 0) {
    return true;
  }
  return !getAllContainers().includes(n);
}

async function validateDir(n: string): Promise<boolean> {
  n = n.trim();
  if (n.length <= 0) {
    return true;
  }
  n = pathNormalize(n);
  if (getAllContainerPaths().includes(n)) {
    return false;
  }
  if (!(await chkPermissions(n))) {
    return false;
  }
  if (!(await isFileExist(n))) {
    return true;
  }
  try {
    await readDirectory(n);
    return true;
  } catch {
    return false;
  }
}

function genContainerName(s: string): string {
  const s2 = pathBasename(s).split(".");
  if (s2.length >= 2) {
    s2.pop();
  }
  const s3 = s2.join(".").replace(/^\S/, (s) => s.toUpperCase());
  return s3 || "Container" + Math.floor(Math.random() * 10000);
}

function isURL(u: string): boolean {
  try {
    new URL(u);
    return true;
  } catch {
    return false;
  }
}

function AddNewContainer(props: {
  open: boolean;
  closeFunc: () => unknown;
  setOperate: (s: boolean) => unknown;
  setFailed: (s: string) => unknown;
  refresh: () => unknown;
  modpack?: string;
  autoStart?: boolean;
}): JSX.Element {
  const [selectedDir, setSelected] = useState(
    props.modpack
      ? !isURL(props.modpack)
        ? pathJoin(
            pathDirname(props.modpack),
            "Modpack-" + basicHash(props.modpack).slice(0, 6)
          )
        : pathJoin(
            getUserHome(),
            "OnlineModpack-" + basicHash(props.modpack).slice(0, 6)
          )
      : ""
  );
  const [usedName, setName] = useState(
    props.modpack ? genContainerName(props.modpack) : ""
  );
  const [nameError, setNameError] = useState(false);
  const [dirError, setDirError] = useState(false);
  const [modpackError, setModpackError] = useState(false);
  const [createASC, setCreateASC] = useState(true);
  const [allowModpack, setAllowModpack] = useState(!!props.modpack);
  const [modpackPath, setModpackPath] = useState(props.modpack || "");
  const classes = useInputStyles();
  useEffect(() => {
    if (props.autoStart) {
      props.closeFunc();
      void start(props);
    }
  }, []);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const start = async (props: any) => {
    props.closeFunc();
    props.setOperate(true);
    try {
      await createContainer(usedName, selectedDir, createASC);
    } catch (e) {
      props.setFailed(String(e));
    }
    setName("");
    setSelected("");
    setAllowModpack(false);
    setCreateASC(hasEdited("cx.shared-root"));
    setModpackPath("");
    props.setOperate(false);
    props.refresh();
    submitSucc(tr("ContainerManager.InstallOK"));
  };
  return (
    <ThemeProvider
      theme={
        isBgDark() ? ALICORN_DEFAULT_THEME_DARK : ALICORN_DEFAULT_THEME_LIGHT
      }
    >
      <Dialog
        open={props.open && !props.autoStart}
        onClose={() => {
          setName("");
          setSelected("");
        }}
      >
        <DialogTitle>{tr("ContainerManager.Add")}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {tr("ContainerManager.AddDescription")}
          </DialogContentText>
          <TextField
            error={nameError}
            autoFocus
            className={classes.input}
            margin={"dense"}
            color={"secondary"}
            onChange={(e) => {
              const v = e.target.value;
              setNameError(!validateName(v));
              setName(v);
            }}
            label={
              nameError
                ? tr("ContainerManager.InvalidName")
                : tr("ContainerManager.EnterName")
            }
            type={"text"}
            spellCheck={false}
            fullWidth
            variant={"outlined"}
            value={usedName}
          />
          {/* Choose Dir */}

          <TextField
            error={dirError}
            className={classes.input}
            color={"secondary"}
            margin={"dense"}
            onChange={(e) => {
              setSelected(e.target.value);
              void validateDir(e.target.value).then((b) => {
                setDirError(!b);
              });
            }}
            label={
              dirError
                ? tr("ContainerManager.InvalidDir")
                : tr("ContainerManager.Dir")
            }
            type={"text"}
            spellCheck={false}
            fullWidth
            variant={"outlined"}
            value={selectedDir}
          />
          <RadioGroup
            row
            onChange={(e) => {
              switch (e.target.value) {
                case "Physical":
                  setCreateASC(false);
                  break;
                case "Shared":
                  setCreateASC(true);
              }
            }}
          >
            <FormControlLabel
              value={"Physical"}
              control={<Radio checked={!createASC} />}
              label={tr("ContainerManager.Type.Physical")}
            />
            <Tooltip
              title={
                <Typography className={"smtxt"}>
                  {tr("ContainerManager.ASCCacheNotSet")}
                </Typography>
              }
              disableHoverListener={hasEdited("cx.shared-root")}
              disableFocusListener={hasEdited("cx.shared-root")}
              disableTouchListener={hasEdited("cx.shared-root")}
            >
              <FormControlLabel
                value={"Shared"}
                control={
                  hasEdited("cx.shared-root") ? (
                    <Radio checked={createASC} />
                  ) : (
                    <Radio disabled checked={false} />
                  )
                }
                label={tr("ContainerManager.Type.Shared")}
              />
            </Tooltip>
          </RadioGroup>
          <FormControlLabel
            control={
              <Switch
                checked={allowModpack}
                onChange={(e) => {
                  setAllowModpack(e.target.checked);
                }}
              />
            }
            label={tr("ContainerManager.CreateModpack")}
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              props.closeFunc();
              setName("");
              setSelected("");
              setAllowModpack(false);
              setCreateASC(hasEdited("cx.shared-root"));
              setModpackPath("");
              setDirError(false);
              setModpackError(false);
            }}
          >
            {tr("ContainerManager.Cancel")}
          </Button>
          <Button
            disabled={
              nameError ||
              dirError ||
              modpackError ||
              usedName.trim().length <= 0 ||
              selectedDir.trim().length <= 0 ||
              (allowModpack && modpackPath.trim().length <= 0)
            }
            onClick={() => {
              void start(props);
            }}
          >
            {tr("ContainerManager.Continue")}
          </Button>
        </DialogActions>
      </Dialog>
    </ThemeProvider>
  );
}

async function createContainer(
  id: string,
  dir: string,
  asc = false
): Promise<void> {
  await createNewContainer(dir, id, asc);
}
