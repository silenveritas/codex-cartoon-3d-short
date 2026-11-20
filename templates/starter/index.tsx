import React from "react";
import {Composition, registerRoot} from "remotion";
import {BridgeShort, BRIDGE_FRAMES} from "./bridge/Bridge";
const Root = () => <Composition id="BridgeShort" component={BridgeShort} durationInFrames={BRIDGE_FRAMES} fps={30} width={1080} height={1920} />;
registerRoot(Root);
