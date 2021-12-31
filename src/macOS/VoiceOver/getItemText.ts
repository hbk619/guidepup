import { run } from "@jxa/run";
import { Applications } from "../Applications";
import type { VoiceOver } from "@jxa/types";
import "@jxa/global-type";

export async function getItemText(): Promise<string> {
  return await run<string, Applications.VOICE_OVER>((name) => {
    const app = Application<VoiceOver.VoiceOver>(name);
    const voCursor =
      app.voCursor as unknown as VoiceOver.VoiceOver.VoCursorObject;

    return voCursor.textUnderCursor();
  }, Applications.VOICE_OVER);
}
