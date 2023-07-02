import {
  configureSettings,
  DEFAULT_GUIDEPUP_VOICEOVER_SETTINGS,
  storeOriginalSettings,
} from "./configureSettings";
import {
  ERR_VOICE_OVER_ALREADY_RUNNING,
  ERR_VOICE_OVER_NOT_RUNNING,
  ERR_VOICE_OVER_NOT_SUPPORTED,
} from "../errors";
import { ClickOptions } from "../../ClickOptions";
import { CommanderCommands } from "./CommanderCommands";
import type { CommandOptions } from "../../CommandOptions";
import { forceQuit } from "./forceQuit";
import { isKeyboard } from "../../isKeyboard";
import { isMacOS } from "../isMacOS";
import { KeyboardCommand } from "../KeyboardCommand";
import { KeyboardOptions } from "../../KeyboardOptions";
import { LogStore } from "./LogStore";
import type { ScreenReader } from "../../ScreenReader";
import { start } from "./start";
import { supportsAppleScriptControl } from "./supportsAppleScriptControl";
import { VoiceOverCaption } from "./VoiceOverCaption";
import { VoiceOverCommander } from "./VoiceOverCommander";
import { VoiceOverCursor } from "./VoiceOverCursor";
import { VoiceOverKeyboard } from "./VoiceOverKeyboard";
import { VoiceOverMouse } from "./VoiceOverMouse";
import { waitForNotRunning } from "./waitForNotRunning";
import { waitForRunning } from "./waitForRunning";

/**
 * Class for controlling the VoiceOver screen reader on MacOS.
 */
export class VoiceOver implements ScreenReader {
  #resetSettings: () => Promise<void>;
  #started = false;

  /**
   * VoiceOver caption APIs.
   */
  #caption!: VoiceOverCaption;

  /**
   * VoiceOver commander APIs.
   */
  #commander!: VoiceOverCommander;

  /**
   * VoiceOver cursor APIs.
   */
  #cursor!: VoiceOverCursor;

  /**
   * VoiceOver keyboard APIs.
   */
  #keyboard!: VoiceOverKeyboard;

  /**
   * VoiceOver mouse APIs.
   */
  #mouse!: VoiceOverMouse;

  /**
   * VoiceOver keyboard commands.
   */
  get keyboardCommands() {
    return this.#keyboard.commands;
  }

  /**
   * VoiceOver commander commands.
   *
   * Getter specific to the VoiceOver screen reader.
   */
  get commanderCommands() {
    return this.#commander.commands;
  }

  /**
   * Detect whether VoiceOver is supported for the current OS.
   *
   * @returns {Promise<boolean>}
   */
  async detect(): Promise<boolean> {
    return isMacOS() && (await supportsAppleScriptControl());
  }

  /**
   * Detect whether VoiceOver is the default screen reader for the current OS.
   *
   * @returns {Promise<boolean>}
   */
  async default(): Promise<boolean> {
    return Promise.resolve(isMacOS());
  }

  /**
   * Turn VoiceOver on.
   *
   * @param {object} [options] Additional options.
   */
  async start(options?: CommandOptions): Promise<void> {
    if (!(await this.detect())) {
      throw new Error(ERR_VOICE_OVER_NOT_SUPPORTED);
    }

    if (this.#started) {
      throw new Error(ERR_VOICE_OVER_ALREADY_RUNNING);
    }

    const logStore = new LogStore(options);
    this.#caption = new VoiceOverCaption(logStore);
    this.#commander = new VoiceOverCommander(logStore);
    this.#cursor = new VoiceOverCursor(logStore);
    this.#keyboard = new VoiceOverKeyboard(logStore);
    this.#mouse = new VoiceOverMouse(logStore);

    this.#resetSettings = await storeOriginalSettings();

    await configureSettings(DEFAULT_GUIDEPUP_VOICEOVER_SETTINGS);
    await start();
    await waitForRunning(options);

    this.#started = true;
  }

  /**
   * Turn VoiceOver off.
   *
   * @param {object} [options] Additional options.
   */
  async stop(options?: Omit<CommandOptions, "capture">): Promise<void> {
    if (!this.#started) {
      throw new Error(ERR_VOICE_OVER_NOT_RUNNING);
    }

    await forceQuit();
    await waitForNotRunning(options);

    this.#caption = null;
    this.#commander = null;
    this.#cursor = null;
    this.#keyboard = null;
    this.#mouse = null;

    if (this.#resetSettings) {
      await this.#resetSettings();
      this.#resetSettings = null;
    }

    this.#started = false;
  }

  /**
   * Move the VoiceOver cursor to the previous location.
   *
   * Equivalent of executing VO-Left Arrow.
   *
   * @param {object} [options] Additional options.
   */
  async previous(options?: CommandOptions): Promise<void> {
    if (!this.#started) {
      throw new Error(ERR_VOICE_OVER_NOT_RUNNING);
    }

    return await this.#cursor.previous(options);
  }

  /**
   * Move the VoiceOver cursor to the next location.
   *
   * Equivalent of executing VO-Right Arrow.
   *
   * @param {object} [options] Additional options.
   */
  async next(options?: CommandOptions): Promise<void> {
    if (!this.#started) {
      throw new Error(ERR_VOICE_OVER_NOT_RUNNING);
    }

    return await this.#cursor.next(options);
  }

  /**
   * Perform the default action for the item in the VoiceOver cursor.
   *
   * @param {object} [options] Additional options.
   */
  async act(options?: CommandOptions): Promise<void> {
    if (!this.#started) {
      throw new Error(ERR_VOICE_OVER_NOT_RUNNING);
    }

    return await this.#cursor.act(options);
  }

  /**
   * Interact with the item under the VoiceOver cursor.
   *
   * Equivalent of executing VO-Shift-Down Arrow.
   *
   * @param {object} [options] Additional options.
   */
  async interact(options?: CommandOptions): Promise<void> {
    if (!this.#started) {
      throw new Error(ERR_VOICE_OVER_NOT_RUNNING);
    }

    return await this.#cursor.interact(options);
  }

  /**
   * Stop interacting with the current item.
   *
   * Equivalent of executing VO-Shift-Up Arrow.
   *
   * @param {object} [options] Additional options.
   */
  async stopInteracting(options?: CommandOptions): Promise<void> {
    if (!this.#started) {
      throw new Error(ERR_VOICE_OVER_NOT_RUNNING);
    }

    return await this.#cursor.stopInteracting(options);
  }

  /**
   * Takes a screenshot of the VoiceOver cursor and returns the path to screenshot file.
   *
   * Command specific to the VoiceOver screen reader.
   *
   * @param {object} [options] Additional options.
   * @returns {Promise<string>} The path to the screenshot file.
   */
  async takeCursorScreenshot(options?: CommandOptions): Promise<string> {
    if (!this.#started) {
      throw new Error(ERR_VOICE_OVER_NOT_RUNNING);
    }

    return await this.#cursor.takeScreenshot(options);
  }

  /**
   * Press a key on the focused item.
   *
   * `key` can specify the intended [keyboardEvent.key](https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/key)
   * value or a single character to generate the text for. A superset of the `key` values can be found
   * [on the MDN key values page](https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/key/Key_Values). Examples of the keys are:
   *
   * `F1` - `F20`, `Digit0` - `Digit9`, `KeyA` - `KeyZ`, `Backquote`, `Minus`, `Equal`, `Backslash`, `Backspace`, `Tab`,
   * `Delete`, `Escape`, `ArrowDown`, `End`, `Enter`, `Home`, `Insert`, `PageDown`, `PageUp`, `ArrowRight`, `ArrowUp`, etc.
   *
   * Following modification shortcuts are also supported: `Shift`, `Control`, `Alt`, `Meta`, `Command`.
   *
   * Holding down `Shift` will type the text that corresponds to the `key` in the upper case.
   *
   * If `key` is a single character, it is case-sensitive, so the values `a` and `A` will generate different respective
   * texts.
   *
   * Shortcuts such as `key: "Control+f"` or `key: "Control+Shift+f"` are supported as well. When specified with the
   * modifier, modifier is pressed and being held while the subsequent key is being pressed.
   *
   * ```ts
   * await voiceOver.press("Control+f");
   * ```
   *
   * @param {string} key Name of the key to press or a character to generate, such as `ArrowLeft` or `a`.
   * @param {object} [options] Additional options.
   */
  async press(key: string, options?: KeyboardOptions): Promise<void> {
    if (!this.#started) {
      throw new Error(ERR_VOICE_OVER_NOT_RUNNING);
    }

    return await this.#keyboard.press(key, options);
  }

  /**
   * Type text into the focused item.
   *
   * To press a special key, like `Control` or `ArrowDown`, use `voiceOver.press(key[, options])`.
   *
   * ```ts
   * await voiceOver.type("my-username");
   * await voiceOver.press("Enter");
   * ```
   *
   * @param {string} text Text to type into the focused item.
   * @param {object} [options] Additional options.
   */
  async type(text: string, options?: KeyboardOptions): Promise<void> {
    if (!this.#started) {
      throw new Error(ERR_VOICE_OVER_NOT_RUNNING);
    }

    return await this.#keyboard.type(text, options);
  }

  /**
   * Perform a VoiceOver command.
   *
   * @param {any} command VoiceOver keyboard command or commander command to execute.
   * @param {object} [options] Additional options.
   */
  async perform(
    command: KeyboardCommand | CommanderCommands,
    options?: CommandOptions
  ): Promise<void> {
    if (!this.#started) {
      throw new Error(ERR_VOICE_OVER_NOT_RUNNING);
    }

    if (isKeyboard(command)) {
      return await this.#keyboard.perform(command, options);
    }

    return this.#commander.perform(command, options);
  }

  /**
   * Click the mouse.
   *
   * @param {object} [options] Click options.
   */
  async click(options?: ClickOptions): Promise<void> {
    if (!this.#started) {
      throw new Error(ERR_VOICE_OVER_NOT_RUNNING);
    }

    return await this.#mouse.click(options);
  }

  /**
   * Copy the last spoken phrase to the Clipboard (also called the
   * "Pasteboard").
   *
   * Command specific to the VoiceOver screen reader.
   *
   * @param {object} [options] Additional options.
   */
  async copyLastSpokenPhrase(options?: CommandOptions): Promise<void> {
    if (!this.#started) {
      throw new Error(ERR_VOICE_OVER_NOT_RUNNING);
    }

    return await this.#caption.copyLastSpokenPhrase(options);
  }

  /**
   * Save the last spoken phrase and the crash log to a file on the desktop for
   * troubleshooting.
   *
   * Command specific to the VoiceOver screen reader.
   *
   * @param {object} [options] Additional options.
   */
  async saveLastSpokenPhrase(options?: CommandOptions): Promise<void> {
    if (!this.#started) {
      throw new Error(ERR_VOICE_OVER_NOT_RUNNING);
    }

    return await this.#caption.saveLastSpokenPhrase(options);
  }

  /**
   * Get the last spoken phrase.
   *
   * @returns {Promise<string>} The last spoken phrase.
   */
  async lastSpokenPhrase(): Promise<string> {
    if (!this.#started) {
      throw new Error(ERR_VOICE_OVER_NOT_RUNNING);
    }

    return await this.#caption.lastSpokenPhrase();
  }

  /**
   * Get the text of the item in the VoiceOver cursor.
   *
   * For VoiceOver this is distinct from `lastSpokenPhrase`.
   *
   * @returns {Promise<string>} The item's text.
   */
  async itemText(): Promise<string> {
    if (!this.#started) {
      throw new Error(ERR_VOICE_OVER_NOT_RUNNING);
    }

    return await this.#caption.itemText();
  }

  /**
   * Get the log of all spoken phrases for this VoiceOver instance.
   *
   * @returns {Promise<string[]>} The spoken phrase log.
   */
  async spokenPhraseLog(): Promise<string[]> {
    if (!this.#started) {
      throw new Error(ERR_VOICE_OVER_NOT_RUNNING);
    }

    return await this.#caption.spokenPhraseLog();
  }

  /**
   * Get the log of all visited item text for this VoiceOver instance.
   *
   * For VoiceOver this is distinct from `spokenPhraseLog`.
   *
   * @returns {Promise<string[]>} The item text log.
   */
  async itemTextLog(): Promise<string[]> {
    if (!this.#started) {
      throw new Error(ERR_VOICE_OVER_NOT_RUNNING);
    }

    return await this.#caption.itemTextLog();
  }
}
