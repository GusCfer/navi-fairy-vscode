<p align="center">
  <img src="icon.png" width="96" alt="Navi">
</p>
<br>
<h1 align="center">✷*.✶ Navi VS Code Pet ✶.*✷</h1>

<p>
  Navi is a little pixel-art fairy that lives in the VS Code Explorer, right below your files. She reacts to changes you make to your code in real time - providing useful comments and insights. Read below the other things she can do!
</p>

> This repository was forked from [the Portuguese (Brazil) version created by GusCfer](https://github.com/GusCfer/navi-fairy-vscode). Navi's dialogue and setting headers were translated to English (UK), with a few added features. To see exactly what changed, please view the commit history.

<br>

<div style="text-align: center">

  ![Demo: Navi flying, talking, and reacting to an error, portuguese (BR) version](https://raw.githubusercontent.com/GusCfer/navi-fairy-vscode/main/docs/navi.gif)
</div>

<br>

## What Navi gets up to as you code!
| Feature | Description |
|---|---|
| **Flies around** | Wanders around the panel with animated flapping wings, a pulsing glow and a trail of sparkles |
| **Interacts with the mouse** | Orbits your cursor; click on her to hear what she has to say; click elsewhere and she flies over to it |
| **Celebrates when you save** | Does a little spin and lets you know the file has been saved successfully |
| **Warns you about errors in the file** | Turns orange when the open file has errors, and celebrates when you fix them |
| **Reacts to runtime errors\*** | Turns red and moves around rapidly when a terminal command, task or debug session ends with an error |
| **Chats with you** | Navi will say random phrases to you at set time intervals. Sometimes helpful, sometimes cheeky! |
| **Sleeps** | After 2 minutes of inactivity, she lands and goes to sleep. Type or click to wake her up |

<br>

## *Detection of runtime errors
Navi turns red when she detects the following:

- **Integrated terminal:** commands that exit with a non-zero exit code (requires VS Code’s *shell integration*, which is enabled by default for bash, zsh, and fish). Keyboard interrupts (`Ctrl + C`) are ignored.
- **Tasks:** any task that fails.
- **Debug:** exceptions and programs that terminate with an error code.

> Do you use Code Runner? Enable `code-runner.runInTerminal` so that Navi can detect errors.

<br>

### Recent Feature: Legend of Zelda songs!
As well as providing helpful comments and reminders, Navi 'hums' familiar tunes from the Legend of Zelda franchise (denoted by Unicode musical notes). How many do you recognise?
- ♬♩ ♬♩ ~
- ♬♩♬♩ ♬♬♩♬ ♬♩.♪ ♬♩ ~
- ♩♩ ♩♬ ♩♩ ♩. ~
- ♬♬ ♬♬ ♬♬ ♬♬ ~

> Answers are in the source code `media/fairy.js` if you're curious :)

<br>

## Installation - English Version

### Manual Installation

Currently, the best way to install the English extension is to directly clone the source code from your computer terminal, then install it into VS Code:
> prerequisite: node.js (for npx), which you can install [here](https://nodejs.org/en/download).

```bash
git clone https://github.com/melon-juice/navi-fairy-vscode-english
cd navi-fairy-vscode-english
npx @vscode/vsce package
code --install-extension .\navi-pet-1.0.1.vsix
```

Once installed successfully, open VS Code's **Explorer** tab and expand the **Navi** section. You may need to refresh VS Code to see the changes (`Ctrl + Shift + P` > 'Developer: Reload Window').

You can [contact me](elkhatib.hajar.y@gmail.com) for troubleshooting help.

<br>

## Commands
Below are two commands you can execute by pressing `Ctrl + Shift + P` within VS Code and typing into the bar at the top of the page.

| Command | Description |
|---|---|
| `Navi: Call the fairy` | Opens the panel, Navi greets you |
| `Navi: Change colour` | Select Navi's glow colour |

<br>

## Settings
Customise Navi's settings by navigating to VS Code Settings (`Ctrl + ,` > Extensions > Navi).

| Setting | Default | Description |
|---|---|---|
| `navi_the_fairy.colour` | `blue` | Glow colour options: `blue`, `green`, `pink`, `yellow`, `purple` |
| `navi_the_fairy.size` | `3` | Pixel art scale (2 to 5) |
| `navi_the_fairy.phrase` | `Hey! Listen!` | What Navi says when clicked |
| `navi_the_fairy.reactToErrors` | `true` | Navi alerts you if the open file contains errors |
| `navi_the_fairy.tips` | `true` | Navi speaks spontaneously every 2~3 minutes |

<br>

## Developers: Customisation for Forks, Branches and Clones
***Hey! Listen!*** If you're interested in customising the phrases that Navi says, or perhaps add an extra colour combination, edit the source code and make the extension your own! Below is how to refreshing the code to view changes.
Navigate to the `navi-fairy-vscode-english` folder (not `media`) in your CLI.
#### Powershell (Windows):
```powershell
Remove-Item *.vsix
npx @vscode/vsce package # produces new .vsix file
Get-Item navi-pet-*.vsix | ForEach-Object { code --install-extension $_.Name --force }
```
#### Bash (Linux/macOS):
``` Bash
rm *.vsix
npx @vscode/vsce package # produces new .vsix file
for file in navi-pet-*.vsix; do code --install-extension "$file" --force; done   
```
I'd love to see what features you add!

<br>

## License

[MIT](LICENSE)
