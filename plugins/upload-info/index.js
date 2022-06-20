const utils = require("../utils");
const childProcess = require("child_process");
const constants = require("../constants");
const fs = require("fs");
const path = require("path");

function uploadQuorumNodeInfo(config) {
    const {sharedRepoPath, tmpDir} = utils.cloneSharedRepo(config);
    console.log("Shared repo path", sharedRepoPath);

    let enode = `enode://${config.enode}@${config.deployment.enode_address}:${config.deployment.enode_address_port}?discport=0`;
    const validator = config.nodeKeyPublic;
    const commonPath = path.join(sharedRepoPath, "editable", config.deployment.company);
    const enodePath = path.join(commonPath, "enode");
    const validatorPath = path.join(commonPath, "validator");
    fs.writeFileSync(enodePath, enode);
    fs.writeFileSync(validatorPath, validator);

    childProcess.execSync(`cd ${sharedRepoPath} && git config user.name ${config.git_upload.user}`);
    childProcess.execSync(`cd ${sharedRepoPath} && git config user.email ${config.git_upload.email}`);
    let remotes = childProcess.execSync(`cd ${sharedRepoPath} && git remote -v`);

    if (remotes.length === 0) {
        childProcess.execSync(`cd ${sharedRepoPath} && git remote add origin ${config.git_upload.git_repo_with_access_token}`);
    }

    childProcess.execSync(`cd ${sharedRepoPath} && git add .`);
    childProcess.execSync(`cd ${sharedRepoPath} && git commit -m "${constants.COMMIT_MESSAGES.SMART_CONTRACT_UPDATE}"`);
    childProcess.execSync(`cd ${sharedRepoPath} && git push origin master`);
    fs.rmSync(tmpDir, {recursive: true})
    console.log("Smart contract info was stored successfully");
}

module.exports = {
    uploadQuorumNodeInfo
}