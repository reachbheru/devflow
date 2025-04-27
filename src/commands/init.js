import prompts from "prompts";
import { ConfigService } from "../modules/config/configService.js";

function init() {
  console.log("init started ...");

  const questions = [
    {
      type: "text",
      name: "repo_name",
      message: "what is your repository name?",
    },
    {
      type: "text",
      name: "main_branch",
      message: "what is your main branch",
    },
    {
      type: "text",
      name: "base_branch",
      message: "what is your base branch",
    },
  ];
  (async () => {
    const response = await prompts(questions);
    const configService = new ConfigService();
    configService.saveGlobalConfig(response);
    configService.readGlobalConfig();
  })();
}

export { init };
