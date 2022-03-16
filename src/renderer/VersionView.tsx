import { Box, Typography } from "@mui/material";
import { makeStyles } from "@mui/styles";
import React, { useState } from "react";
import pkg from "../../package.json";
import { cSessionStorage } from "../impl/BrowserFix";
import { AlicornTheme } from "./Stylex";
import { tr } from "./Translator";
const modeList = ["Copyright", "Privacy", "Credit"];
export function VersionView(): JSX.Element {
  const [displayMode, setDisplayMode] = useState(0);
  const classes = makeStyles((theme: AlicornTheme) => ({
    root: {},
    title: {
      fontSize: "larger",
      color: theme.palette.primary.main,
    },
    text: {
      fontSize: cSessionStorage.getItem("smallFontSize") || "1rem",
    },
  }))();
  return (
    <Box className={classes.root}>
      <Typography className={classes.title} gutterBottom>
        {tr(
          "VersionView.Name",
          `AppVersion=${pkg.appVersion}`,
          `UpdatorVersion=${pkg.updatorVersion}`
        )}
      </Typography>
      <Typography className={classes.text} color={"secondary"} gutterBottom>
        {tr("VersionView.Description")}
      </Typography>
      <br />
      <Typography className={classes.text} color={"secondary"}>
        {tr(
          "VersionView.Modules",
          `List=${buildDepList()
            .map((x) => x.join(" "))
            .join(", ")}`
        )}
      </Typography>
      <br />
      <Typography className={classes.text} color={"secondary"} gutterBottom>
        {tr("VersionView.FreeSoftwareClaim")}
      </Typography>
      <Box
        onClick={() => {
          setDisplayMode((v) => {
            let r = v + 1;
            if (r >= modeList.length) {
              r = 0;
            }
            return r;
          });
        }}
      >
        <Typography className={classes.text} color={"secondary"} gutterBottom>
          {tr("VersionView." + modeList[displayMode])}
        </Typography>
        <Typography className={classes.text} color={"secondary"} gutterBottom>
          {tr("VersionView.ClickToSeeNext")}
        </Typography>
      </Box>
      <Typography
        className={classes.text}
        color={"primary"}
        sx={{
          float: "right",
          marginRight: "2%",
        }}
      >
        {tr("VersionView.SuperCowPower")}
      </Typography>
    </Box>
  );
}

function buildDepList(): [string, string][] {
  const o: [string, string][] = [];
  o.push(["React", pkg.dependencies.react.slice(1)]);
  o.push(["Material UI", pkg.dependencies["@mui/material"].slice(1)]);
  return o;
}
