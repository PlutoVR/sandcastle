const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");
const inquirer = require("inquirer");

let revisedJSON;

(async () => {
  console.log("----------------\ninitalizing XRPK\n----------------");
  execSync("cd dist && xrpk init", {
    stdio: "inherit",
  });

  fs.readFile("./dist/manifest.json", "utf8", (err, str) => {
    if (err) {
      console.error("manifest read failed:", err);
      return;
    }
    const jsonManifest = JSON.parse(str);
    console.log("----------------");

    inquirer
      .prompt([
        {
          type: "input",
          name: "name",
          message: "XR Package name: ",
          default: function () {
            return path.basename(process.cwd());
          },
          validate: function (value) {
            const pass = value.match(/^[a-zA-Z]+$/i);
            if (pass) {
              return true;
            }

            return "XR Package name must consist of letters only";
          },
          filter: function (val) {
            return val.toLowerCase();
          },
        },
        {
          type: "input",
          name: "description",
          message: "XR Package Description: ",
          default: function () {
            return "XR Package";
          },
        },
        {
          type: "list",
          name: "xr_type",
          message: "Package Type - hit ENTER if unsure",
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
          message: "URL entry point - hit ENTER if unsure",
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
        console.log("-------------------\nupdating manifest");
        try {
          await fs.promises.writeFile("./dist/manifest.json", revisedJSON);
          console.log("Manifest revised successfully");
        } catch (error) {
          console.error("Error writing file", error);
          fs.unlinkSync("./dist/manifest.json");
          console.log("Manifest deleted");
        }
        console.log("-------------------\nbuilding XR Package");
        execSync('cd dist && xrpk build . "' + jsonManifest.name + '.wbn"', {
          stdio: "inherit",
        });
        console.log(
          "-------------------\nXR Package " +
            jsonManifest.name +
            ".wbn created in ./dist!"
        );
      });
  });
})();
