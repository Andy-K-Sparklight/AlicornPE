import {
  AccessTime,
  AlignHorizontalLeft,
  AltRoute,
  AutoFixOff,
  Bolt,
  Book,
  CameraEnhance,
  CloudDone,
  Code,
  DataArray,
  DataSaverOff,
  DataSaverOn,
  Download,
  EmojiEmotions,
  FirstPage,
  Home,
  Inbox,
  InsertPhoto,
  Inventory2,
  Iso,
  Memory,
  MonitorHeart,
  Numbers,
  Palette,
  PermContactCalendar,
  Replay,
  RestartAlt,
  SavedSearch,
  Settings,
  SnippetFolder,
  SwitchAccessShortcut,
  SyncAlt,
  TextFormat,
  ViewInAr,
  WebAsset,
  YoutubeSearchedFor,
} from "@mui/icons-material";
import {
  Box,
  Container,
  FormControlLabel,
  Grid,
  Radio,
  RadioGroup,
  Slider,
  Switch,
  Tab,
  Tabs,
  TextField,
  ThemeProvider,
  Typography,
} from "@mui/material";
import { makeStyles } from "@mui/styles";
import React, { useRef, useState } from "react";
import { cLocalStorage, cSessionStorage } from "../impl/BrowserFix";
import { getOsType } from "../impl/ClicornAPI";
import {
  get,
  getBoolean,
  getNumber,
  getString,
  parseNum,
  set,
} from "../modules/config/ConfigSupport";
import { loadMirror } from "../modules/download/Mirror";
import {
  ALICORN_DEFAULT_THEME_DARK,
  ALICORN_DEFAULT_THEME_LIGHT,
  isBgDark,
} from "./Renderer";
import { AlicornTheme } from "./Stylex";
import { AL_THEMES } from "./ThemeColors";
import { ALL_ASSISTANTS, tr } from "./Translator";

enum ConfigType {
  BOOL,
  NUM,
  STR,
  RADIO,
  SLIDE,
}

export function OptionsPage(): JSX.Element {
  const [tabValue, setTabValue] = useState(0);
  const classes = makeStyles((theme: AlicornTheme) => ({
    head: {
      fontSize: cSessionStorage.getItem("smallFontSize") || "1rem",
      color: theme.palette.secondary.main,
    },
  }))();

  return (
    <Container>
      <ThemeProvider
        theme={
          isBgDark() ? ALICORN_DEFAULT_THEME_DARK : ALICORN_DEFAULT_THEME_LIGHT
        }
      >
        <Typography className={classes.head}>
          {tr("Options.AutoSave")}
        </Typography>
        <Typography className={classes.head}>{tr("Options.Hint")}</Typography>
        {/* Tabs */}
        <Tabs
          variant={"fullWidth"}
          value={tabValue}
          onChange={(_e, v) => {
            setTabValue(v);
          }}
        >
          <Tab
            label={
              <Typography color={"primary"}>
                {tr("Options.Page.IAndAL")}
              </Typography>
            }
          />
          <Tab
            label={
              <Typography color={"primary"}>
                {tr("Options.Page.FeaturesConfigure")}
              </Typography>
            }
          />
          <Tab
            label={
              <Typography color={"primary"}>
                {tr("Options.Page.Features")}
              </Typography>
            }
          />
          <Tab
            label={
              <Typography color={"primary"}>
                {tr("Options.Page.Game")}
              </Typography>
            }
          />
          <Tab
            label={
              <Typography color={"primary"}>
                {tr("Options.Page.Network")}
              </Typography>
            }
          />
          <Tab
            label={
              <Typography color={"primary"}>
                {tr("Options.Page.Advanced")}
              </Typography>
            }
          />
        </Tabs>
        <TabPanel index={0} value={tabValue}>
          <InputItem
            icon={<PermContactCalendar />}
            type={ConfigType.STR}
            bindConfig={"user.name"}
          />
          <InputItem
            reload
            icon={<Inventory2 />}
            type={ConfigType.RADIO}
            bindConfig={"theme"}
            choices={["Default"].concat(Object.keys(AL_THEMES))}
          />
          <InputItem
            icon={<InsertPhoto />}
            type={ConfigType.RADIO}
            bindConfig={"theme.background"}
            choices={["ACG", "Bing", "Disabled"]}
          />
          <InputItem
            icon={<EmojiEmotions />}
            type={ConfigType.RADIO}
            bindConfig={"assistant"}
            reload
            choices={ALL_ASSISTANTS}
          />
          <InputItem
            icon={<CloudDone />}
            type={ConfigType.BOOL}
            bindConfig={"alicorn-ping"}
          />
          <InputItem
            icon={<CameraEnhance />}
            type={ConfigType.STR}
            save
            bindConfig={"theme.background.custom"}
          />
          <InputItem
            icon={<Iso />}
            type={ConfigType.NUM}
            bindConfig={"theme.background.opacity"}
          />
          <InputItem
            reload
            icon={<Palette />}
            type={ConfigType.STR}
            bindConfig={"theme.primary.main"}
          />
          <InputItem
            reload
            icon={<Palette />}
            type={ConfigType.STR}
            bindConfig={"theme.primary.light"}
          />
          <InputItem
            icon={<Palette />}
            type={ConfigType.STR}
            reload
            bindConfig={"theme.secondary.main"}
          />
          <InputItem
            type={ConfigType.STR}
            icon={<Palette />}
            reload
            bindConfig={"theme.secondary.light"}
          />
          <InputItem
            icon={<SwitchAccessShortcut />}
            type={ConfigType.BOOL}
            bindConfig={"goto.animate"}
          />
          <InputItem
            icon={<Home />}
            type={ConfigType.STR}
            bindConfig={"startup-page.name"}
          />
          <InputItem
            icon={<Home />}
            type={ConfigType.STR}
            bindConfig={"startup-page.url"}
          />
        </TabPanel>
        <TabPanel index={1} value={tabValue}>
          <InputItem
            icon={<TextFormat />}
            type={ConfigType.BOOL}
            bindConfig={"features.saying"}
          />
          <InputItem
            icon={<ViewInAr />}
            type={ConfigType.BOOL}
            bindConfig={"features.skin-view-3d"}
          />
          <InputItem
            icon={<Book />}
            type={ConfigType.BOOL}
            bindConfig={"features.miniwiki"}
          />
        </TabPanel>
        <TabPanel index={2} value={tabValue}>
          {/* AL Features */}
          <InputItem
            icon={<Bolt />}
            type={ConfigType.BOOL}
            bindConfig={"readyboom"}
          />
          <InputItem
            icon={<Numbers />}
            type={ConfigType.NUM}
            bindConfig={"readyboom.cores"}
          />
          <InputItem
            icon={<SnippetFolder />}
            type={ConfigType.STR}
            bindConfig={"cx.shared-root"}
          />
          <InputItem
            icon={<RestartAlt />}
            type={ConfigType.BOOL}
            bindConfig={"launch.fast-reboot"}
          />
          <InputItem
            experimental
            type={ConfigType.BOOL}
            bindConfig={"cmc.disable-log4j-config"}
          />
          <InputItem
            icon={<SavedSearch />}
            type={ConfigType.BOOL}
            bindConfig={"java.simple-search"}
          />
          <InputItem
            icon={<YoutubeSearchedFor />}
            type={ConfigType.NUM}
            bindConfig={"java.search-depth"}
          />
        </TabPanel>
        <TabPanel index={3} value={tabValue}>
          <InputItem
            icon={<Memory />}
            type={ConfigType.NUM}
            bindConfig={"memory"}
          />
          <InputItem
            icon={<DataArray />}
            type={ConfigType.STR}
            bindConfig={"jvm.extra-args"}
          />
          <InputItem
            icon={<DataSaverOn />}
            type={ConfigType.RADIO}
            bindConfig={"main-gc"}
            choices={["pure", "g1", "z", "aggressive", "sd"]}
          />
          <InputItem
            icon={<DataSaverOff />}
            type={ConfigType.RADIO}
            bindConfig={"para-gc"}
            choices={["pure", "g1", "z", "aggressive", "sd"]}
          />
          <InputItem
            icon={<WebAsset />}
            type={ConfigType.STR}
            bindConfig={"gw-size"}
          />
        </TabPanel>
        <TabPanel index={4} value={tabValue}>
          <InputItem
            icon={<Download />}
            type={ConfigType.RADIO}
            choices={[
              "none",
              "alicorn",
              "alicorn-mcbbs-nonfree",
              "alicorn-bmclapi-nonfree",
            ]}
            bindConfig={"download.mirror"}
            onChange={() => {
              void loadMirror();
            }}
          />
          <InputItem
            icon={<AltRoute />}
            type={ConfigType.NUM}
            bindConfig={"download.mirror-tries"}
          />
          <InputItem
            icon={<MonitorHeart />}
            type={ConfigType.BOOL}
            bindConfig={"show-downloading-item"}
          />
          <InputItem
            type={ConfigType.BOOL}
            icon={<AutoFixOff />}
            bindConfig={"download.skip-validate"}
          />
          <InputItem
            type={ConfigType.NUM}
            icon={<AccessTime />}
            bindConfig={"download.concurrent.timeout"}
          />
          <InputItem
            type={ConfigType.NUM}
            icon={<AccessTime />}
            bindConfig={"download.pff.timeout"}
          />
          <InputItem
            icon={<Replay />}
            type={ConfigType.NUM}
            bindConfig={"download.concurrent.tries-per-chunk"}
          />
          <InputItem
            icon={<AlignHorizontalLeft />}
            type={ConfigType.NUM}
            bindConfig={"download.concurrent.max-tasks"}
          />
          <InputItem
            icon={<SyncAlt />}
            type={ConfigType.RADIO}
            bindConfig={"pff.upgrade-mode"}
            choices={["Override", "Keep"]}
          />
          <InputItem
            type={ConfigType.STR}
            icon={<Inbox />}
            bindConfig={"pff.cache-root"}
          />
          <InputItem
            icon={<Inbox />}
            type={ConfigType.NUM}
            bindConfig={"pff.page-size"}
          />
        </TabPanel>
        <TabPanel index={5} value={tabValue}>
          <InputItem
            type={ConfigType.BOOL}
            icon={<Code />}
            bindConfig={"dev"}
          />
          <InputItem
            icon={<FirstPage />}
            type={ConfigType.BOOL}
            bindConfig={"first-run?"}
          />
        </TabPanel>
      </ThemeProvider>
    </Container>
  );
}

export function hasEdited(conf: string): boolean {
  return cLocalStorage.getItem("Edited." + conf) === "1";
}

function markEdited(conf: string): void {
  cLocalStorage.setItem("Edited." + conf, "1");
}

function InputItem(props: {
  type: ConfigType;
  bindConfig: string;
  icon?: React.ReactNode;
  choices?: string[];
  onlyOn?: NodeJS.Platform;
  notOn?: NodeJS.Platform;
  onChange?: () => unknown;
  experimental?: boolean;
  reload?: boolean;
  save?: boolean; // Path selector
  sliderMax?: number;
  sliderMin?: number;
  sliderStep?: number;
}): JSX.Element {
  const originVal = useRef(get(props.bindConfig, undefined));
  const callChange = () => {
    if (
      get(props.bindConfig, undefined) !== originVal.current &&
      props.reload
    ) {
      cSessionStorage.setItem("Options.Reload", "1");
    }
    if (props.onChange) {
      props.onChange();
    }
  };
  const [refreshBit, forceRefresh] = useState<boolean>(true);
  const [cSelect, setSelect] = useState<string>(
    getString(props.bindConfig, (props.choices || [""])[0] || "")
  );
  let disabled = false;
  if (props.onlyOn) {
    if (getOsType() !== props.onlyOn) {
      disabled = true;
    }
  }
  if (props.notOn) {
    if (getOsType() === props.notOn) {
      disabled = true;
    }
  }
  const classes = makeStyles((theme: AlicornTheme) => ({
    desc: {
      color: theme.palette.secondary.main,
    },
    switch: {
      color: theme.palette.primary.main,
      marginLeft: theme.spacing(0.5),
    },

    textField: {
      borderColor: theme.palette.primary.main,
      color: theme.palette.primary.main,
    },
    title: {
      color: theme.palette.primary.main,
      fontSize: "large",
    },
  }))();
  if (props.experimental) {
    if (!getBoolean("dev.experimental")) {
      return <></>;
    }
  }
  return (
    <Container>
      <Grid container direction="row" alignItems="center">
        <Grid item sx={{ color: "primary.main" }}>
          {props.icon || <Settings />}
        </Grid>
        <Grid item>
          <Typography
            color={"primary"}
            variant={"h6"}
            sx={{ marginLeft: "0.25rem" }}
            className={classes.title}
          >
            {tr(`Options.${props.bindConfig}.title`)}
          </Typography>
        </Grid>
      </Grid>
      <Typography color={"secondary"} className={classes.desc} gutterBottom>
        {disabled
          ? tr("Options.NotOn")
          : tr(`Options.${props.bindConfig}.desc`)}
      </Typography>
      {(() => {
        switch (props.type) {
          case ConfigType.BOOL:
            return (
              <FormControlLabel
                label={
                  <Typography color={"primary"}>
                    {getBoolean(props.bindConfig)
                      ? tr("Options.Enabled")
                      : tr("Options.Disabled")}
                  </Typography>
                }
                control={
                  <Switch
                    size={"small"}
                    disabled={disabled}
                    checked={getBoolean(props.bindConfig)}
                    className={classes.switch}
                    onChange={(e) => {
                      markEdited(props.bindConfig);
                      set(props.bindConfig, e.target.checked);
                      forceRefresh(!refreshBit);
                      callChange();
                    }}
                    name={
                      getBoolean(props.bindConfig)
                        ? tr("Options.Enabled")
                        : tr("Options.Disabled")
                    }
                  />
                }
              />
            );
          case ConfigType.NUM:
            return (
              <TextField
                disabled={disabled}
                spellCheck={false}
                fullWidth
                variant={"outlined"}
                type={"number"}
                color={"primary"}
                value={getNumber(props.bindConfig)}
                onChange={(e) => {
                  markEdited(props.bindConfig);
                  set(props.bindConfig, parseNum(e.target.value, 0));
                  forceRefresh(!refreshBit);
                  callChange();
                }}
              />
            );
          case ConfigType.RADIO:
            return (
              <RadioGroup
                row
                onChange={(e) => {
                  markEdited(props.bindConfig);
                  set(props.bindConfig, String(e.target.value));
                  setSelect(String(e.target.value));
                  callChange();
                }}
              >
                {(props.choices || []).map((c) => {
                  return (
                    <FormControlLabel
                      key={c}
                      value={c}
                      control={
                        <Radio disabled={disabled} checked={cSelect === c} />
                      }
                      label={
                        <Typography color={"secondary"} className={"smtxt"}>
                          {tr(`Options.${props.bindConfig}.${c}`)}
                        </Typography>
                      }
                    />
                  );
                })}
              </RadioGroup>
            );
          case ConfigType.SLIDE:
            return (
              <Slider
                size={"small"}
                min={props.sliderMin}
                max={props.sliderMax}
                value={getNumber(props.bindConfig)}
                valueLabelDisplay={"auto"}
                step={props.sliderStep}
                onChange={(_e, v) => {
                  markEdited(props.bindConfig);
                  set(props.bindConfig, v);
                  forceRefresh(!refreshBit);
                  callChange();
                }}
              />
            );
          case ConfigType.STR:
          default:
            return (
              <TextField
                disabled={disabled}
                fullWidth
                variant={"outlined"}
                spellCheck={false}
                color={"primary"}
                value={getString(props.bindConfig)}
                onChange={(e) => {
                  markEdited(props.bindConfig);
                  set(props.bindConfig, String(e.target.value || ""));
                  forceRefresh(!refreshBit);
                  callChange();
                }}
              />
            );
        }
      })()}
      <br />
      <br />
    </Container>
  );
}
function TabPanel(props: {
  children?: React.ReactNode;
  index: string | number;
  value: string | number;
}): JSX.Element {
  const { children, value, index } = props;
  return (
    <Box hidden={value !== index}>
      {value === index ? <Box>{children}</Box> : ""}
    </Box>
  );
}
