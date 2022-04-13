function portForward() {
    const childProcess = require("child_process");

    const getPodsCmd = "kubectl get pods";
    const pods = childProcess.execSync(getPodsCmd).toString();
    let lines = pods.trim().split("\n");
    lines.shift();
    const podName = lines[0].trim().split(" ")[0];

    const portForwardCommand = `kubectl port-forward ${podName} 8545:8545`;
    return childProcess.exec(portForwardCommand);
}

module.exports = {
    portForward
}