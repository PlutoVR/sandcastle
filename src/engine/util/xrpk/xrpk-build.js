const fs = require("fs");
const { execSync } = require("child_process");
const inquirer = require("inquirer");

let revisedJSON;

(async () => {
  console.log("------------\ninitalizing XRPK\n------------");
  execSync("cd dist && xrpk init", {
    stdio: "inherit",
  });

  fs.readFile("./dist/manifest.json", "utf8", (err, str) => {
    if (err) {
      console.error("manifest read failed:", err);
      return;
    }
    const jsonManifest = JSON.parse(str);
    console.log("------------------------");

    inquirer
      .prompt([
        {
          type: "input",
          name: "name",
          message: "What is the package name?",
          default: function () {
            return "sandcastle";
          },
          validate: function (value) {
            const pass = value.match(/^[a-zA-Z]+$/i);
            if (pass) {
              return true;
            }

            return "package name must consist of letters only";
          },
          filter: function (val) {
            return val.toLowerCase();
          },
        },
        {
          type: "input",
          name: "description",
          message: "Describe your WebXR application",
          default: function () {
            return "XR Package";
          },
        },
        {
          type: "list",
          name: "xr_type",
          message: "Package Type (hit ENTER if unsure)",
          choices: [
            "webxr-site@0.0.1",
            new inquirer.Separator(),
            "gltf@0.0.1",
            new inquirer.Separator(),
            "vrm@0.0.1",
            new inquirer.Separator(),
            "vox@0.0.1",
          ],
          default: function () {
            return "webxr-site@0.0.1";
          },
        },
        {
          type: "input",
          name: "start_url",
          message: "URL entry point (hit ENTER if unsure)",
          default: function () {
            return "index.html";
          },
        },
      ])
      .then(answers => {
        jsonManifest.name = answers.name;
        jsonManifest.description = answers.description;
        jsonManifest.xr_type = answers.xr_type;
        jsonManifest.start_url = answers.start_url;
        revisedJSON = JSON.stringify(jsonManifest);
      })
      .then(async () => {
        await fs.promises.writeFile(
          "./dist/manifest.json",
          revisedJSON,
          err => {
            if (err) {
              console.error("Error writing file", err);
            } else {
              console.log("Manifest revised successfully");
            }
          }
        );
        execSync('cd dist && xrpk build . "' + jsonManifest.name + '.wbn"', {
          stdio: "inherit",
        });
        console.log("XR Package " + jsonManifest.name + ".wbn created!");
      });
  });
})();
