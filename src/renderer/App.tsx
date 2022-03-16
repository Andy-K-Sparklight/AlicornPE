import {
  AccountCircle,
  AllInbox,
  ArrowBack,
  FlightTakeoff,
  GetApp,
  Handyman,
  Home,
  ImportContacts,
  Info,
  ManageAccounts,
  Menu,
  PowerSettingsNew,
  Settings,
  ViewModule,
} from "@mui/icons-material";
import {
  Alert,
  AppBar,
  Box,
  Chip,
  Container,
  Drawer,
  Fab,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Snackbar,
  Toolbar,
  Tooltip,
  Typography,
} from "@mui/material";
import { makeStyles } from "@mui/styles";
import React, { useEffect, useRef, useState } from "react";
import { Route } from "react-router-dom";
import { expose } from "../modules/boticorn/FTable";
import { safeGet } from "../modules/commons/Null";
import { getString, saveConfig } from "../modules/config/ConfigSupport";
import { saveGDT } from "../modules/container/ContainerUtil";
import { saveVF } from "../modules/container/ValidateRecord";
import { saveJDT } from "../modules/java/JavaInfo";
import { ContainerManager } from "./ContainerManager";
import { CrashReportDisplay } from "./CrashReportDisplay";
import {
  canGoBack,
  CHANGE_PAGE_WARN,
  goBack,
  jumpTo,
  setChangePageWarn,
  triggerSetPage,
} from "./GoTo";
import { InstallCore } from "./InstallCore";
import { JavaSelector } from "./JavaSelector";
import { LaunchPad } from "./LaunchPad";
import { YNDialog2 } from "./OperatingHint";
import { OptionsPage } from "./Options";
import { PffFront } from "./PffFront";
import { ReadyToLaunch } from "./ReadyToLaunch";
import { AlicornTheme } from "./Stylex";
import { TheEndingOfTheEnd } from "./TheEndingOfTheEnd";
import { tr } from "./Translator";
import { PffVisual } from "./utilities/PffVisual";
import { UtilitiesIndex } from "./utilities/UtilitiesIndex";
import { VersionView } from "./VersionView";
import { Welcome } from "./Welcome";
import { YggdrasilAccountManager } from "./YggdrasilAccountManager";

expose({ exitApp });

const useStyles = makeStyles((theme: AlicornTheme) => ({
  root: {
    flexGrow: 1,
    width: "100%",
    backgroundColor: theme.palette.secondary.light,
  },
  content: {
    marginTop: theme.spacing(3),
  },
  buttonText: {
    marginRight: theme.spacing(1),
  },
  exitButton: {
    marginRight: 0,
  },
  floatMore: {
    marginRight: 0,
    marginLeft: theme.spacing(0.8),
  },
  floatButton: {
    marginRight: 0,
  },
  title: {
    flexGrow: 1,
  },
}));

export function App(): JSX.Element {
  const classes = useStyles();
  const [page, setPage] = useState(getString("startup-page.name", "Tutor"));
  const [openNotice, setNoticeOpen] = useState(false);
  const [openWarn, setWarnOpen] = useState(false);
  const [openChangePageWarn, setOpenChangePageWarn] = useState(false);
  const [pageTarget, setPageTarget] = useState("");
  const [jumpPageTarget, setJumpPageTarget] = useState("");
  const [haveHistory, setHaveHistory] = useState(false);
  const [err, setErr] = useState("");
  const [warn, setWarn] = useState("");
  const [info, setInfo] = useState("");
  const [openInfo, setInfoOpen] = useState(false);
  const [openSucc, setSuccOpen] = useState(false);
  const [succ, setSucc] = useState("");
  const [refreshBit, setRefreshBit] = useState(false);
  const [openDrawer, setOpenDrawer] = useState(false);
  const sessionID = useRef(0);
  const clearSnacks = () => {
    setInfoOpen(false);
    setSuccOpen(false);
    setWarnOpen(false);
    setNoticeOpen(false);
    sessionID.current++;
  };
  useEffect(() => {
    if (window.location.hash === "#/") {
      jumpTo(getString("startup-page.url", "/Welcome"));
      triggerSetPage(getString("startup-page.name", "Welcome"));
    }
  }, [window.location.hash]);
  useEffect(() => {
    const fun = (_e: Event) => {
      setRefreshBit(!refreshBit);
    };
    window.addEventListener("refreshApp", fun);
    return () => {
      window.removeEventListener("refreshApp", fun);
    };
  });
  useEffect(() => {
    const f1 = (e: Event) => {
      setOpenChangePageWarn(true);
      const s = safeGet(e, ["detail"], {});
      // @ts-ignore
      const target = String(s.target || "");
      // @ts-ignore
      const history = !!s.history;
      setHaveHistory(history);
      setJumpPageTarget(target);
    };
    window.addEventListener("changePageWarn", f1);
    const f = (e: Event) => {
      setPageTarget(String(safeGet(e, ["detail"], "Welcome")));
    };
    window.addEventListener("changePageWarnTitle", f);
    return () => {
      window.removeEventListener("changePageWarn", f1);
      window.removeEventListener("changePageWarnTitle", f);
    };
  }, []);
  useEffect(() => {
    const f = (e: Event) => {
      // @ts-ignore
      if (window[CHANGE_PAGE_WARN]) {
        setPageTarget(String(safeGet(e, ["detail"], "Welcome")));
        return;
      }
      setPage(String(safeGet(e, ["detail"], "Welcome")));
    };
    document.addEventListener("setPage", f);
    return () => {
      document.removeEventListener("setPage", f);
    };
  }, []);
  useEffect(() => {
    const id = setInterval(async () => {
      await intervalSaveData();
    }, 300000);
    return () => {
      clearInterval(id);
    };
  }, []);
  useEffect(() => {
    const f3 = (e: Event) => {
      setErr(String(safeGet(e, ["detail"], "Unknown Error")));
      clearSnacks();
      setNoticeOpen(true);
    };
    window.addEventListener("sysError", f3);
    const f1 = (e: Event) => {
      setWarn(String(safeGet(e, ["detail"], "Unknown Warning")));
      clearSnacks();
      setWarnOpen(true);
    };
    window.addEventListener("sysWarn", f1);

    const f0 = (e: Event) => {
      setInfo(String(safeGet(e, ["detail"], "")));
      clearSnacks();
      setInfoOpen(true);
    };
    window.addEventListener("sysInfo", f0);

    const f = (e: Event) => {
      setSucc(String(safeGet(e, ["detail"], "")));
      clearSnacks();
      setSuccOpen(true);
    };
    window.addEventListener("sysSucc", f);
    return () => {
      window.removeEventListener("sysError", f3);
      window.removeEventListener("sysSucc", f);
      window.removeEventListener("sysInfo", f0);
      window.removeEventListener("sysWarn", f1);
    };
  }, []);

  return (
    <Box
      className={classes.root}
      onDrop={(e) => {
        e.preventDefault();
        const data = e.dataTransfer.getData("text/plain");
        if (data.toString().includes("authlib-injector")) {
          const server = data
            .toString()
            .split("authlib-injector:yggdrasil-server:")[1];

          jumpTo("/AccountManager/1/" + encodeURIComponent(server));
          triggerSetPage("AccountManager");

          window.dispatchEvent(
            new CustomEvent("YggdrasilAccountInfoDropped", {
              detail: decodeURIComponent(server),
            })
          );
          return;
        }
      }}
      onDragOver={(e) => {
        e.preventDefault();
      }}
      onDragEnter={(e) => {
        e.dataTransfer.dropEffect = "copy";
      }}
    >
      <AppBar enableColorOnDark>
        <Toolbar>
          <IconButton
            sx={{
              marginRight: "0.3rem",
            }}
            color={"inherit"}
            onClick={() => {
              setOpenDrawer(true);
            }}
          >
            <Menu />
          </IconButton>
          <Box className={classes.title}>
            <Typography variant={"h6"}>{tr(page)}</Typography>
          </Box>
          <Box
            style={
              window.location.hash.includes("QuickSetup")
                ? { display: "none" }
                : {}
            }
          >
            {canGoBack() ? (
              <Tooltip
                title={
                  <Typography className={"smtxt"}>
                    {tr("MainMenu.GoBack")}
                  </Typography>
                }
              >
                <IconButton
                  color={"inherit"}
                  className={classes.floatButton}
                  onClick={() => {
                    goBack();
                  }}
                >
                  <ArrowBack />
                </IconButton>
              </Tooltip>
            ) : (
              ""
            )}

            <Tooltip
              title={
                <Typography className={"smtxt"}>
                  {tr("MainMenu.UtilitiesIndex")}
                </Typography>
              }
            >
              <IconButton
                color={"inherit"}
                className={classes.floatButton}
                onClick={() => {
                  jumpTo("/UtilitiesIndex");
                  triggerSetPage("UtilitiesIndex");
                }}
              >
                <Handyman />
              </IconButton>
            </Tooltip>
            <Tooltip
              title={
                <Typography className={"smtxt"}>
                  {tr("MainMenu.QuickManageAccount")}
                </Typography>
              }
            >
              <IconButton
                className={classes.floatButton}
                onClick={() => {
                  jumpTo("/AccountManager");
                  triggerSetPage("AccountManager");
                }}
                color={"inherit"}
              >
                <ManageAccounts />
              </IconButton>
            </Tooltip>
            <Tooltip
              title={
                <Typography className={"smtxt"}>
                  {tr("MainMenu.QuickManageContainer")}
                </Typography>
              }
            >
              <IconButton
                className={classes.floatButton}
                onClick={() => {
                  jumpTo("/ContainerManager");
                  triggerSetPage("ContainerManager");
                }}
                color={"inherit"}
              >
                <AllInbox />
              </IconButton>
            </Tooltip>
            <Tooltip
              title={
                <Typography className={"smtxt"}>
                  {tr("MainMenu.QuickInstallCore")}
                </Typography>
              }
            >
              <IconButton
                className={classes.floatButton}
                onClick={() => {
                  jumpTo("/InstallCore");
                  triggerSetPage("InstallCore");
                }}
                color={"inherit"}
              >
                <GetApp />
              </IconButton>
            </Tooltip>
            <Fab
              color={"secondary"}
              variant={"extended"}
              size={"medium"}
              className={classes.floatMore}
              onClick={() => {
                jumpTo("/LaunchPad");
                triggerSetPage("LaunchPad");
              }}
            >
              <FlightTakeoff className={classes.buttonText} />
              {tr("LaunchPad")}
            </Fab>
            <Tooltip
              title={
                <Typography className={"smtxt"}>
                  {tr("MainMenu.Exit")}
                </Typography>
              }
            >
              <IconButton
                id={"hotbar_exit"}
                className={classes.exitButton}
                onClick={exitApp}
                color={"inherit"}
              >
                <PowerSettingsNew />
              </IconButton>
            </Tooltip>
          </Box>
        </Toolbar>
      </AppBar>
      <Box className={classes.content + " yggdrasil_droppable"} id={"app_main"}>
        {(() => {
          const bs = document.getElementById("boot_stages");
          if (bs) {
            bs.style.display = "none";
          }
          // @ts-ignore
          window.clearLogScreen();
        })()}
        <Container>
          <Route path={"/LaunchPad/:server?"} component={LaunchPad} />
          <Route path={"/InstallCore"} component={InstallCore} />
          <Route
            path={"/ReadyToLaunch/:container/:id/:server?"}
            component={ReadyToLaunch}
          />
          <Route path={"/Version"} component={VersionView} />
          <Route
            path={"/ContainerManager/:modpack?/:togo?"}
            component={ContainerManager}
          />
          <Route
            path={"/AccountManager/:adding?/:server?"}
            component={YggdrasilAccountManager}
          />
          <Route path={"/JavaSelector"} component={JavaSelector} />
          <Route path={"/Options"} component={OptionsPage} />
          <Route path={"/CrashReportDisplay"} component={CrashReportDisplay} />
          <Route
            path={
              "/PffFront/:container/:version/:loader/:root/:name?/:autostart?" // root: Ask Pff to Re-Assign mods root as this. Pass core id will be fine. Only for some ancient isolated cores. 0 to disable.
            }
            component={PffFront}
          />
          <Route path={"/Welcome"} component={Welcome} />
          <Route path={"/UtilitiesIndex"} component={UtilitiesIndex} />
          <Route path={"/Utilities/PffVisual"} component={PffVisual} />
          <Route path={"/TheEndingOfTheEnd"} component={TheEndingOfTheEnd} />
        </Container>
      </Box>
      <PagesDrawer
        open={openDrawer}
        onClose={() => {
          setOpenDrawer(false);
        }}
      />
      <YNDialog2
        onClose={() => {
          setOpenChangePageWarn(false);
        }}
        open={openChangePageWarn}
        onAccept={() => {
          setChangePageWarn(false);
          jumpTo(jumpPageTarget, haveHistory);
          triggerSetPage(pageTarget, haveHistory);
        }}
        title={tr("System.JumpPageWarn.Title")}
        content={tr("System.JumpPageWarn.Description")}
        yes={tr("System.JumpPageWarn.Yes")}
        no={tr("System.JumpPageWarn.No")}
      />
      <Snackbar
        open={openNotice}
        sx={{
          width: "90%",
        }}
        autoHideDuration={5000}
        onClose={(() => {
          const s = sessionID.current;
          return () => {
            if (sessionID.current === s) {
              setNoticeOpen(false);
            }
          };
        })()}
      >
        <Alert severity={"error"}>{err}</Alert>
      </Snackbar>
      <Snackbar
        open={openSucc}
        sx={{
          width: "90%",
          zIndex: 999,
        }}
        autoHideDuration={5000}
        onClose={(() => {
          const s = sessionID.current;
          return () => {
            if (sessionID.current === s) {
              setSuccOpen(false);
            }
          };
        })()}
      >
        <Alert severity={"success"}>{succ}</Alert>
      </Snackbar>
      <Snackbar
        open={openWarn}
        sx={{
          width: "90%",
          zIndex: 999,
        }}
        autoHideDuration={5000}
        onClose={(() => {
          const s = sessionID.current;
          return () => {
            if (sessionID.current === s) {
              setWarnOpen(false);
            }
          };
        })()}
      >
        <Alert severity={"warning"}>{warn}</Alert>
      </Snackbar>
      <Snackbar
        open={openInfo}
        sx={{
          width: "90%",
          zIndex: 999,
        }}
        autoHideDuration={5000}
        onClose={(() => {
          const s = sessionID.current;
          return () => {
            if (sessionID.current === s) {
              setInfoOpen(false);
            }
          };
        })()}
      >
        <Alert severity={"info"}>{info}</Alert>
      </Snackbar>
    </Box>
  );
}

function exitApp(): void {
  remoteCloseWindow();
}

const PAGES_ICONS_MAP: Record<string, JSX.Element> = {
  LaunchPad: <FlightTakeoff />,
  Welcome: <Home />,
  InstallCore: <GetApp />,
  ContainerManager: <AllInbox />,
  JavaSelector: <ViewModule />,
  AccountManager: <AccountCircle />,
  UtilitiesIndex: <Handyman />,
  Options: <Settings />,
  Version: <Info />,
  TheEndingOfTheEnd: <ImportContacts />,
};

const BETAS: string[] = [];

function PagesDrawer(props: {
  open: boolean;
  onClose: () => unknown;
}): JSX.Element {
  return (
    <Drawer
      anchor={"left"}
      open={props.open}
      className={"window-no-drag"}
      onClose={props.onClose}
    >
      <List>
        {Object.entries(PAGES_ICONS_MAP).map(([p, i]) => {
          return (
            <ListItem
              key={p}
              onClick={() => {
                props.onClose();
                jumpTo("/" + p);
                triggerSetPage(p);
              }}
              button
            >
              <ListItemIcon>{i}</ListItemIcon>
              <ListItemText>
                {tr(p)}
                {BETAS.includes(p) ? <BetaTag /> : ""}
              </ListItemText>
            </ListItem>
          );
        })}
      </List>
    </Drawer>
  );
}

function remoteCloseWindow(): void {
  console.log("Closing!");
  intervalSaveData()
    .then(() => {
      // @ts-ignore
      window._closeWindow();
    })
    .catch((e) => {
      console.log(e);
    });
}

export async function intervalSaveData(): Promise<void> {
  await saveConfig();
  await saveGDT();
  await saveJDT();
  await saveVF();
}

function BetaTag(): JSX.Element {
  return (
    <>
      &nbsp;
      <Chip
        label={tr("Beta")}
        size={"small"}
        color={"warning"}
        variant={"outlined"}
      />
    </>
  );
}
