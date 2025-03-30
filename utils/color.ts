const PATTERN = /^#[0-9a-fA-F]{6}$/;

export class Color {

    /**
     * Utility that makes VSCode show the inline color picker. (see extension `AntiAntiSepticeye.vscode-color-picker`)
     *
     * Otherwise I constantly have to browse to some site to give me a color picker, and do annoying copy-pastes :(
     */
    public static fromHex(colorHex: string): number {
        if (!colorHex.match(PATTERN)) {
            throw new Error(`Input string '${colorHex}' was not a valid hex color code!`);
        }

        return Number(`0x${colorHex.substring(1, 7)}`);
    }
}